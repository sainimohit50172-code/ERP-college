import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const backendRoot = path.resolve(repoRoot, 'backend');
const frontendPort = 5173;
let frontendUrl = `http://127.0.0.1:${frontendPort}`;
const backendUrl = 'http://127.0.0.1:8000';
const backendHealthUrl = `${backendUrl}/health`;
const frontendHealthUrl = `${frontendUrl}`;

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      cwd: repoRoot,
      shell: true,
      stdio: 'inherit',
      ...options,
    });

    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(' ')} failed with exit code ${code}`));
      }
    });
  });
}

function startProcess(command, args, options = {}) {
  const proc = spawn(command, args, {
    cwd: repoRoot,
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  });

  proc.stdout?.on('data', (chunk) => {
    process.stdout.write(chunk);
  });
  proc.stderr?.on('data', (chunk) => {
    process.stderr.write(chunk);
  });

  proc.on('error', (error) => {
    console.error(`Process failed: ${command} ${args.join(' ')}`);
    console.error(error);
  });

  return proc;
}

async function waitForUrl(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (response.ok || response.status === 405) {
        return;
      }
    } catch {
      // ignore until the service is ready
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function parseVitePortFromOutput(chunk) {
  const text = chunk.toString();
  const localMatches = [...text.matchAll(/^\s*➜\s+Local:\s+http:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0|\[[^\]]+\]):(\d{2,5})/gmi)];
  if (localMatches.length > 0) {
    return Number(localMatches[localMatches.length - 1][1]);
  }

  const networkMatches = [...text.matchAll(/^\s*➜\s+Network:\s+http:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0|\[[^\]]+\]):(\d{2,5})/gmi)];
  if (networkMatches.length > 0) {
    return Number(networkMatches[networkMatches.length - 1][1]);
  }

  const genericMatches = [...text.matchAll(/http:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0|\[[^\]]+\]):(\d{2,5})/gi)];
  if (genericMatches.length > 0) {
    return Number(genericMatches[genericMatches.length - 1][1]);
  }

  return null;
}

async function waitForVitePort(proc, defaultPort, timeoutMs = 30000) {
  return new Promise((resolve) => {
    const start = Date.now();
    let resolved = false;
    let outputBuffer = '';

    const tryResolve = (port) => {
      if (!resolved && port) {
        resolved = true;
        cleanup();
        resolve(port);
      }
    };

    const cleanup = () => {
      proc.stdout?.off('data', stdoutListener);
      proc.stderr?.off('data', stderrListener);
    };

    const extractPort = (chunk) => {
      const text = chunk.toString();
      outputBuffer += text;
      return parseVitePortFromOutput(outputBuffer);
    };

    const stdoutListener = (chunk) => {
      const port = extractPort(chunk);
      tryResolve(port);
    };
    const stderrListener = (chunk) => {
      const port = extractPort(chunk);
      tryResolve(port);
    };

    proc.stdout?.on('data', stdoutListener);
    proc.stderr?.on('data', stderrListener);

    const interval = setInterval(() => {
      if (Date.now() - start >= timeoutMs) {
        if (!resolved) {
          resolved = true;
          cleanup();
          clearInterval(interval);
          const port = parseVitePortFromOutput(outputBuffer);
          if (port) {
            resolve(port);
          } else {
            resolve(defaultPort);
          }
        }
      }
    }, 250);
  });
}

async function probeFrontendUrl(defaultPort, maxPort = 5185, timeoutMs = 1000) {
  for (let port = defaultPort; port <= maxPort; port += 1) {
    try {
      const url = `http://127.0.0.1:${port}`;
      const response = await fetch(url, { cache: 'no-store' });
      if (response.ok || response.status === 404) {
        return port;
      }
    } catch {
      // continue searching
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return defaultPort;
}

async function extractRoutePaths() {
  const routesFile = path.resolve(repoRoot, 'src', 'routes', 'appRoutes.jsx');
  const source = await fs.readFile(routesFile, 'utf8');
  const routePaths = [];
  const regex = /path\s*:\s*['"]([^'"]+)['"]/g;
  let match;
  while ((match = regex.exec(source)) !== null) {
    const route = match[1];
    if (route === '*' || route.includes(':') || route.startsWith('/auth')) continue;
    routePaths.push(route);
  }
  return Array.from(new Set(routePaths));
}

async function verifyBrowserFlow(routePaths) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors = [];
  const networkFailures = [];
  const apiApiRequests = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  page.on('pageerror', (error) => {
    consoleErrors.push(`Page error: ${error.message}`);
  });

  page.on('response', (response) => {
    const status = response.status();
    const url = response.url();
    if (status === 500 || status === 502) {
      networkFailures.push(`${status} ${url}`);
    }
    if (url.includes('/api/api')) {
      apiApiRequests.push(url);
    }
  });

  page.on('requestfailed', (request) => {
    const failure = request.failure();
    networkFailures.push(`FAILED ${request.url()} ${failure?.errorText || 'unknown'}`);
  });

  page.on('dialog', async (dialog) => {
    await dialog.accept();
  });

  try {
    console.log('Verifying browser login flow and route navigation...');
    await page.goto(`${frontendUrl}/auth/login`, { waitUntil: 'networkidle' });

    await page.fill('input[placeholder*="username"]', 'admin');
    await page.fill('input[placeholder*="password"]', 'Admin@123');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }),
      page.click('button[type="submit"]'),
    ]);

    const currentUrl = page.url();
    if (currentUrl.includes('/auth/login')) {
      throw new Error('Login did not complete successfully; still on login page');
    }

    const routeFailures = [];
    for (const route of routePaths) {
      const url = `${frontendUrl}${route}`;
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
        if (page.url().includes('/auth/login')) {
          routeFailures.push(`${route} redirected to login`);
        }
      } catch (error) {
        routeFailures.push(`${route} -> ${error.message}`);
      }
    }

    if (routeFailures.length > 0) {
      throw new Error(`Route navigation failures:\n${routeFailures.join('\n')}`);
    }

    console.log('Verifying frontend CRUD on /transport/routes...');
    await page.goto(`${frontendUrl}/transport/routes`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForSelector('button:has-text("Add route")', { timeout: 10000 });

    const routeName = `Regression Route ${Date.now()}`;
    await page.click('button:has-text("Add route")');
    await page.waitForSelector('input[name="name"]', { timeout: 10000 });
    await page.fill('input[name="name"]', routeName);
    await page.fill('input[name="startPoint"]', 'A Block');
    await page.fill('input[name="endPoint"]', 'Library');
    await page.selectOption('select[name="status"]', 'Active');

    const createResponsePromise = page.waitForResponse((response) => response.url().includes('/transport-routes') && response.request().method() === 'POST', { timeout: 15000 });
    await page.click('button:has-text("Save route")');
    const createResponse = await createResponsePromise;
    const responseStatus = createResponse.status();
    const responseUrl = createResponse.url();
    const responseText = await createResponse.text().catch(() => 'Unable to read response body');
    console.log(`Transport route create response: ${responseStatus} ${responseUrl}`);
    if (responseStatus >= 400) {
      throw new Error(`Transport route create request failed: ${responseStatus} ${responseUrl}\nResponse body: ${responseText}`);
    }

    await page.waitForTimeout(1000);
    const createdRows = await page.locator(`tr:has-text("${routeName}")`);
    if ((await createdRows.count()) === 0) {
      const visibleText = await page.locator('body').innerText();
      throw new Error(`Created transport route not found in page after create: ${routeName}\nCreate response: ${responseStatus} ${responseUrl}\nResponse body: ${responseText}\nPage text snapshot:\n${visibleText.slice(0, 2000)}`);
    }
    const createdRow = createdRows.first();
    if (!(await createdRow.isVisible())) {
      console.log(`Created route row exists but is not visible yet: ${routeName}`);
    }

    await createdRow.locator('button[title="Delete"]').first().click();
    await page.waitForTimeout(1000);

    const deleteButton = await page.locator(`tr:has-text("${routeName}") button[title="Delete"]`).first();
    if (await deleteButton.count() > 0) {
      throw new Error(`Failed to remove regression transport route: ${routeName}`);
    }

    if (consoleErrors.length > 0) {
      throw new Error(`Browser console errors found:\n${consoleErrors.join('\n')}`);
    }
    if (networkFailures.length > 0) {
      throw new Error(`Browser network failures found:\n${networkFailures.join('\n')}`);
    }
    if (apiApiRequests.length > 0) {
      throw new Error(`Detected /api/api requests:\n${apiApiRequests.join('\n')}`);
    }
  } finally {
    await browser.close();
  }
}

async function main() {
  let backendProc;
  let frontendProc;

  try {
    console.log('Step 1: Building frontend...');
    await runCommand('npm', ['run', 'build']);

    console.log('Step 2: Starting backend...');
    backendProc = startProcess('python', ['backend/app/main.py'], {
      env: {
        ...process.env,
        PYTHONPATH: `${backendRoot}${path.delimiter}${process.env.PYTHONPATH || ''}`,
      },
    });
    await waitForUrl(backendHealthUrl, 30000);

    console.log('Step 3: Running backend verification scripts...');
    await runCommand('python', ['backend/verify_routes.py']);
    await runCommand('python', ['backend/ensure_db.py']);
    await runCommand('python', ['backend/test_endpoints.py']);

    const routePaths = await extractRoutePaths();
    console.log('Step 4: Starting frontend dev server for browser verification...');
    frontendProc = startProcess('npm', ['run', 'dev', '--', '--host', '0.0.0.0', '--port', String(frontendPort), '--strictPort', 'true'], { env: { ...process.env, VITE_API_PROXY_TARGET: backendUrl } });
    const vitePort = await waitForVitePort(frontendProc, frontendPort);
    if (vitePort) {
      frontendUrl = `http://127.0.0.1:${vitePort}`;
      console.log(`Resolved Vite port: ${vitePort}`);
    }

    try {
      await waitForUrl(frontendUrl, 5000);
    } catch (firstError) {
      console.log(`Could not reach frontend at ${frontendUrl}; probing candidate ports`);
      const discoveredPort = await probeFrontendUrl(frontendPort, frontendPort + 15);
      if (discoveredPort && discoveredPort !== frontendPort) {
        frontendUrl = `http://127.0.0.1:${discoveredPort}`;
      }
      await waitForUrl(frontendUrl, 30000);
    }

    console.log('Resolved frontend URL:', frontendUrl);
    console.log('Extracted route paths for browser verification:', routePaths);
    await verifyBrowserFlow(routePaths);
  } catch (error) {
    console.error('Regression verification failed:', error);
    process.exitCode = 1;
  } finally {
    if (frontendProc) {
      frontendProc.kill('SIGINT');
    }
    if (backendProc) {
      backendProc.kill('SIGINT');
    }
  }
}

main();

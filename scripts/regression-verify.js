import fs from 'fs/promises';
import path from 'path';
import net from 'net';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const backendRoot = path.resolve(repoRoot, 'backend');
const frontendPort = 5173;
let frontendUrl = `http://127.0.0.1:${frontendPort}`;
let backendUrl = `http://127.0.0.1:8000`;
let backendHealthUrl = `${backendUrl}/health`;
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
    shell: options.shell !== undefined ? options.shell : true,
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

  const localMatches = [...text.matchAll(/^\s*➜\s+Local:\s+https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0|\[[^\]]+\]):(\d{2,5})/gmi)];
  if (localMatches.length > 0) {
    return Number(localMatches[localMatches.length - 1][1]);
  }

  const networkMatches = [...text.matchAll(/^\s*➜\s+Network:\s+https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0|\[[^\]]+\]):(\d{2,5})/gmi)];
  if (networkMatches.length > 0) {
    return Number(networkMatches[networkMatches.length - 1][1]);
  }

  const portInUseMatch = text.match(/Port\s+\d{2,5}\s+is\s+in\s+use/i);
  if (portInUseMatch) {
    return null;
  }

  const genericMatches = [...text.matchAll(/https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0|\[[^\]]+\]):(\d{2,5})/gi)];
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
      clearInterval(interval);
    };

    const extractPort = (chunk) => {
      const text = chunk.toString();
      outputBuffer += text;
      return parseVitePortFromOutput(outputBuffer);
    };

    const stdoutListener = (chunk) => {
      const port = extractPort(chunk);
      if (port) tryResolve(port);
    };
    const stderrListener = (chunk) => {
      const port = extractPort(chunk);
      if (port) tryResolve(port);
    };

    proc.stdout?.on('data', stdoutListener);
    proc.stderr?.on('data', stderrListener);

    const interval = setInterval(() => {
      if (Date.now() - start >= timeoutMs) {
        if (!resolved) {
          resolved = true;
          cleanup();
          const port = parseVitePortFromOutput(outputBuffer);
          resolve(port || defaultPort);
        }
      }
    }, 250);
  });
}

async function probeFrontendUrl(defaultPort, maxPort = 5185, timeoutMs = 1000) {
  for (let port = defaultPort; port <= maxPort; port += 1) {
    const candidates = [`http://localhost:${port}`, `http://127.0.0.1:${port}`];
    for (const url of candidates) {
      try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeoutMs);
        const response = await fetch(url, { cache: 'no-store', signal: controller.signal });
        clearTimeout(id);
        if (response.ok || response.status === 404) {
          return port;
        }
      } catch {
        // try next host/port
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return null;
}

function isPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => {
      resolve(false);
    });
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, '127.0.0.1');
  });
}

async function findAvailablePort(startPort = 8000, maxPort = 8020) {
  for (let port = startPort; port <= maxPort; port += 1) {
    if (await isPortFree(port)) {
      return port;
    }
  }
  throw new Error(`No available backend ports between ${startPort} and ${maxPort}`);
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
    try {
      const pathname = new URL(url).pathname;
      if (pathname.startsWith('/api/api')) {
        apiApiRequests.push(url);
      }
    } catch (e) {
      // Ignore malformed or non-HTTP URLs; do not fallback to substring matching
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
    console.log('BEGIN REGRESSION');
    console.log('STEP 1: Building frontend...');
    await runCommand('npm', ['run', 'build']);

    console.log('STEP 2: Checking for existing backend on port 8000...');
    try {
      await waitForUrl('http://127.0.0.1:8000/health', 5000);
      backendUrl = 'http://127.0.0.1:8000';
      backendHealthUrl = `${backendUrl}/health`;
      console.log('STEP 2A: Reusing existing backend at', backendUrl);
    } catch (backendProbeError) {
      console.log('STEP 2A: No existing backend found on port 8000; starting new backend...');
      const backendPort = await findAvailablePort(8000, 8020);
      backendUrl = `http://127.0.0.1:${backendPort}`;
      backendHealthUrl = `${backendUrl}/health`;
      backendProc = startProcess('python', ['-m', 'uvicorn', 'backend.app.main:app', '--host', '127.0.0.1', '--port', String(backendPort), '--log-level', 'info'], {
        env: {
          ...process.env,
          PYTHONPATH: `${backendRoot}${path.delimiter}${process.env.PYTHONPATH || ''}`,
        },
      });
      await waitForUrl(backendHealthUrl, 30000);
      console.log('STEP 2B: Started backend on', backendUrl);
    }

    console.log('STEP 3: Running backend verification scripts...');
    await runCommand('python', ['backend/verify_routes.py']);
    await runCommand('python', ['backend/ensure_db.py']);
    await runCommand('python', ['backend/test_endpoints.py']);

    const routePaths = await extractRoutePaths();
    console.log('STEP 4: Checking for existing frontend dev server...');
    const existingFrontendPort = await probeFrontendUrl(frontendPort, frontendPort + 50);
    if (existingFrontendPort) {
      frontendUrl = `http://127.0.0.1:${existingFrontendPort}`;
      console.log('STEP 4A: Reusing existing frontend dev server at', frontendUrl);
    } else {
      console.log('STEP 4A: No existing frontend dev server found; starting new Vite server...');
      console.log('STEP 4B: Starting frontend dev server for browser verification...');
      const viteBin = path.resolve(repoRoot, 'node_modules', '.bin', process.platform === 'win32' ? 'vite.cmd' : 'vite');
      if (process.platform === 'win32') {
        // On Windows, run the .cmd via cmd.exe /c to avoid EINVAL when spawning .cmd directly
        frontendProc = startProcess('cmd.exe', ['/c', viteBin, '--host', '0.0.0.0', '--port', String(frontendPort), '--strictPort', 'false'], {
          shell: false,
          env: {
            ...process.env,
            VITE_API_PROXY_TARGET: backendUrl,
          },
        });
      } else {
        frontendProc = startProcess(viteBin, ['--host', '0.0.0.0', '--port', String(frontendPort), '--strictPort', 'false'], {
          shell: false,
          env: {
            ...process.env,
            VITE_API_PROXY_TARGET: backendUrl,
          },
        });
      }
      // Capture complete Vite stdout/stderr to a temporary log for diagnostics
      const viteLogPath = path.resolve(repoRoot, 'regression-vite.log');
      let viteBuffer = '';
      const startTime = Date.now();

      const appendToBuffer = (chunk) => {
        const text = chunk.toString();
        viteBuffer += text;
      };
      frontendProc.stdout?.on('data', appendToBuffer);
      frontendProc.stderr?.on('data', appendToBuffer);

      // Wait until Vite reports ready or timeout
      const readiness = await new Promise((resolve) => {
        let resolved = false;
        const onData = (chunk) => {
          appendToBuffer(chunk);
          const text = viteBuffer.toLowerCase();
          if (text.includes('ready in') || text.includes('ready') || text.includes('local:')) {
            if (!resolved) {
              resolved = true;
              resolve({ ok: true, buffer: viteBuffer, time: Date.now() - startTime });
            }
          }
        };
        frontendProc.stdout?.on('data', onData);
        frontendProc.stderr?.on('data', onData);
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            resolve({ ok: false, buffer: viteBuffer, time: Date.now() - startTime });
          }
        }, 15000);
      });

      // Strip ANSI escape sequences and control characters for reliable parsing
      const stripAnsi = (s) => s.replace(/\x1b\[[0-9;?;#]*[A-Za-z]/g, '').replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');

      // After Vite reports ready, wait a short window for Local/Network lines to be emitted (they can come after "ready")
      const extraWaitMs = 3000;
      const extraStart = Date.now();
      while (Date.now() - extraStart < extraWaitMs) {
        // check cleaned buffer for Local/Network
        const cleanedCheck = stripAnsi(viteBuffer);
        if (/\blocal\s*:/i.test(cleanedCheck) || /\bnetwork\s*:/i.test(cleanedCheck)) break;
        // short sleep
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 150));
      }
      const cleaned = stripAnsi(viteBuffer);

      // Parse the Vite log for Local/Network/port (accept any formatting)
      let discoveredHost = null;
      let discoveredPort = null;
      const lines = cleaned.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      const localLine = lines.find((l) => /local\s*:/i.test(l));
      const networkLine = lines.find((l) => /network\s*:/i.test(l));

      const extractHostPort = (line) => {
        if (!line) return null;
        const m = line.match(/https?:\/\/(?:\[([^\]]+)\]|(localhost|127\.0\.0\.1|0\.0\.0\.0|[^:\s\/]+)):(\d{2,5})/i);
        if (m) return { host: m[1] || m[2], port: Number(m[3]) };
        return null;
      };

      const localHp = extractHostPort(localLine);
      if (localHp) {
        discoveredHost = localHp.host;
        discoveredPort = localHp.port;
      }

      if (!discoveredPort) {
        const networkHp = extractHostPort(networkLine);
        if (networkHp) {
          discoveredHost = networkHp.host;
          discoveredPort = networkHp.port;
        }
      }

      // If still not found, extract all localhost/127.0.0.1 URLs and prefer highest/latest port
      if (!discoveredPort) {
        const regex = /https?:\/\/(localhost|127\.0\.0\.1):(\d{2,5})/gmi;
        const matches = [];
        let m;
        while ((m = regex.exec(cleaned)) !== null) {
          matches.push({ host: m[1], port: Number(m[2]), index: m.index });
        }
        if (matches.length > 0) {
          // prefer highest port; if tie, prefer latest occurrence (highest index)
          matches.sort((a, b) => (a.port === b.port ? a.index - b.index : a.port - b.port));
          const chosen = matches[matches.length - 1];
          discoveredHost = chosen.host;
          discoveredPort = chosen.port;
        }
      }

      // Extract warnings/errors from log
      const warnings = lines.filter((l) => /\bwarning\b|\bwarn\b/i.test(l));
      const errors = lines.filter((l) => /\berror\b|\berr\b/i.test(l));

      // Verify parsed host/port by probing; never accept 5173 unless explicitly reported or probe confirms
      let probeResult = null;
      if (discoveredPort) {
        const candidateHost = discoveredHost || '127.0.0.1';
        const candidateUrl = `http://${candidateHost}:${discoveredPort}`;
        try {
          await waitForUrl(candidateUrl, 5000);
          probeResult = { ok: true, url: candidateUrl };
          frontendUrl = candidateUrl;
        } catch (e) {
          probeResult = { ok: false, url: candidateUrl, error: e.message };
          // If the parsed port failed, attempt a probe search but do not default to 5173
          const probed = await probeFrontendUrl(frontendPort, frontendPort + 50);
          if (probed) {
            frontendUrl = `http://127.0.0.1:${probed}`;
            discoveredPort = probed;
            discoveredHost = '127.0.0.1';
            probeResult = { ok: true, url: frontendUrl, probed: true };
          } else {
            probeResult = { ok: false, url: candidateUrl, error: 'Parsed port did not respond and probe failed' };
          }
        }
      } else {
        // No parsed port; probe to find a running dev server (do not accept 5173 without confirmation)
        const probed = await probeFrontendUrl(frontendPort, frontendPort + 50);
        if (probed) {
          discoveredPort = probed;
          discoveredHost = '127.0.0.1';
          frontendUrl = `http://${discoveredHost}:${discoveredPort}`;
          probeResult = { ok: true, url: frontendUrl, probed: true };
        } else {
          probeResult = { ok: false, error: 'No responsive dev server found in probe range' };
        }
      }

      // Compose extended log content and overwrite the log
      const diagnostics = [];
      diagnostics.push('--- VITE DIAGNOSTICS ---');
      diagnostics.push(`startupTimeMs: ${readiness.time}`);
      diagnostics.push(`localLine: ${localLine || '<none>'}`);
      diagnostics.push(`networkLine: ${networkLine || '<none>'}`);
      diagnostics.push(`parsedHost: ${discoveredHost || '<none>'}`);
      diagnostics.push(`parsedPort: ${discoveredPort || '<none>'}`);
      diagnostics.push(`parserFound: ${discoveredPort ? 'yes' : 'no'}`);
      diagnostics.push(`probeResult: ${JSON.stringify(probeResult)}`);
      diagnostics.push(`warningsCount: ${warnings.length}`);
      diagnostics.push(`errorsCount: ${errors.length}`);
      diagnostics.push('\n--- RAW VITE OUTPUT ---\n');
      const composed = diagnostics.join('\n') + '\n\n' + viteBuffer;
      try {
        await fs.writeFile(viteLogPath, composed, 'utf8');
      } catch (e) {
        console.error('Failed to write Vite diagnostics log:', e);
      }

      console.log('Vite startup diagnostics:');
      console.log(`- Startup time (ms): ${readiness.time}`);
      console.log(`- Local line: ${localLine || '<none>'}`);
      console.log(`- Network line: ${networkLine || '<none>'}`);
      console.log(`- Parsed host: ${discoveredHost || '<none>'}`);
      console.log(`- Parsed port: ${discoveredPort || '<none>'}`);
      console.log(`- Warnings: ${warnings.length}`);
      console.log(`- Errors: ${errors.length}`);
      console.log(`- Probe result: ${probeResult && probeResult.ok ? 'ok' : 'failed'}`);

      if (!probeResult || !probeResult.ok) {
        throw new Error(`Could not determine a responsive Vite dev server. Probe result: ${JSON.stringify(probeResult)}`);
      }
    }

    console.log('Resolved frontend URL:', frontendUrl);
    console.log('Extracted route paths for browser verification:', routePaths);
    console.log('STEP 5: Starting browser verification...');
    await verifyBrowserFlow(routePaths);
    console.log('STEP 6: Browser verification complete');
  } catch (error) {
    console.error('Regression verification failed:', error);
    console.error(error.stack);
    process.exitCode = 1;
  } finally {
    if (frontendProc) {
      console.log('STEP 7: Cleaning up frontend process...');
      frontendProc.kill('SIGINT');
    }
    if (backendProc) {
      console.log('STEP 8: Cleaning up backend process...');
      backendProc.kill('SIGINT');
    }
    console.log('END REGRESSION');
  }
}

main();

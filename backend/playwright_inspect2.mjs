import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.addInitScript(() => { try { localStorage.setItem('erp_demo_mode','true'); } catch(e){} });
  const page = await context.newPage();
  page.on('console', (msg) => { try { console.log('PAGE_CONSOLE', msg.type(), msg.text()); } catch (e) {} });
  page.on('requestfailed', (req) => { try { console.log('REQUEST_FAILED', req.url(), req.failure()?.errorText || 'failed'); } catch (e) {} });
  page.on('request', (req) => { try { console.log('REQUEST', req.method(), req.url()); } catch(e){} });

  const APP_URL = process.env.APP_URL || 'http://127.0.0.1:5174';
  await page.goto(`${APP_URL}/settings/fee-structure/payment-mode`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  const html = await page.content();
  fs.writeFileSync('backend/page_snapshot2.html', html);
  console.log('Wrote backend/page_snapshot2.html');
  await page.screenshot({ path: 'backend/page_snapshot2.png', fullPage: true });
  console.log('Wrote backend/page_snapshot2.png');
  await browser.close();
})();

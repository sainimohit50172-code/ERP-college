import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.addInitScript(() => { try { localStorage.setItem('erp_demo_mode','true'); } catch(e){} });
  const page = await context.newPage();
  const APP_URL = process.env.APP_URL || 'http://127.0.0.1:5174';
  await page.goto(`${APP_URL}/settings/fee-structure/payment-mode`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  const html = await page.content();
  fs.writeFileSync('backend/page_snapshot.html', html);
  console.log('Wrote backend/page_snapshot.html');
  await page.screenshot({ path: 'backend/page_snapshot.png', fullPage: true });
  console.log('Wrote backend/page_snapshot.png');
  await browser.close();
})();

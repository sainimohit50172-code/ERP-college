import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.addInitScript(() => {
    try {
      localStorage.setItem('erp_demo_mode', 'true');
    } catch (e) {
      // ignore
    }
  });
  const page = await context.newPage();

  const APP_URL = process.env.APP_URL || 'http://127.0.0.1:5174';
  // Navigate to the app (assumes server and frontend running on default ports)
  await page.goto(`${APP_URL}/settings/fee-structure/payment-mode`, { waitUntil: 'networkidle' });

  // Wait for toggles to render
  await page.waitForSelector('button[role="switch"]');

  // Find toggles by label text (mode labels appear in the card)
  const findToggle = async (labelText) => {
    const card = await page.locator(`text=${labelText}`).first();
    const parent = card.locator('xpath=..');
    const toggle = parent.locator('button[role="switch"]');
    await toggle.waitFor({ timeout: 5000 });
    return toggle;
  };

  const cashToggle = await findToggle('Cash');
  const onlineToggle = await findToggle('Online');
  const bankToggle = await findToggle('Bank Transfer');

  // Turn ON
  await cashToggle.evaluate((el) => el.click());
  await onlineToggle.evaluate((el) => el.click());
  await bankToggle.evaluate((el) => el.click());

  // Verify toggles visually set to ON via aria-checked
  const cashChecked = await cashToggle.getAttribute('aria-checked');
  const onlineChecked = await onlineToggle.getAttribute('aria-checked');
  const bankChecked = await bankToggle.getAttribute('aria-checked');
  console.log('TOGGLES', cashChecked, onlineChecked, bankChecked);

  // Click Save (button text 'Save' assumed)
  await page.locator('text=Save').click();

  // Wait for network requests to complete
  await page.waitForTimeout(1000);

  // Verify Active Payment Modes table has entries
  const tableText = await page.locator('text=Active Payment Methods').innerText();
  console.log('TABLE TEXT', tableText);

  await browser.close();
})();

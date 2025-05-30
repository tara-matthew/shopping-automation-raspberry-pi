// automate_shopping.js

const { chromium } = require('playwright');
const fs = require('fs');

// Read JSON arguments from the CLI
const args = JSON.parse(process.argv[2]);

(async () => {
    const browser = await chromium.launch({ headless: false, slowMo: 800 });
    const page = await browser.newPage();

    try {
        await page.goto('https://groceries.morrisons.com/');

        // Accept cookies if needed
        try {
            await page.click('button:has-text("Reject All")', { timeout: 3000 });
        } catch (e) {
            console.log('No cookies banner found.');
        }

        // Sign in
        await page.click('text=Log In');
        await page.waitForSelector('[data-test="login-button"]');

        // 3. Click the real "Log in" link in the dropdown
        await page.click('[data-test="login-button"]');
        await page.fill('input[id="login-input"]', args.email);
        await page.fill('input[name="password"]', args.password);
        await page.click('[id="login-submit-button"]');

        await page.waitForLoadState('networkidle');
        console.log('Logged in successfully.');

        for (const item of args.shopping_list) {
            await page.fill('input[placeholder="Find a product"]', item);
            await page.press('button[type="submit"]', 'Enter');

            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(3000);
            const productCards = await page.$$('.product-card-container');
            console.log(productCards.length)

            const cards = page.locator('.product-card-container');
            const count = await cards.count();
            console.log(`${count} product cards found.`);

            for (let i = 0; i < count; i++) {
                const card = cards.nth(i);

                // Check if card is sponsored
                const spanTexts = await card.locator('span').allTextContents();
                const isSponsored = spanTexts.some(text => text.toLowerCase().includes('sponsored'));

                if (isSponsored) {
                    console.log('Skipping sponsored item');
                    continue;
                }

                await card.scrollIntoViewIfNeeded();

                const addButton = card.locator('[data-test="counter-button"]');

                try {
                    await addButton.waitFor({ timeout: 3000 });
                    await addButton.click();
                    console.log(`Added ${item} to basket`);
                    break;
                } catch (e) {
                    console.log('Add button not found or not clickable in this card');
                }
            }

            await page.waitForTimeout(2000);
        }

    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        await browser.close();
    }
})();

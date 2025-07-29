const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Read JSON arguments from the CLI
const args = JSON.parse(process.argv[2]);
const results = [];

(async () => {
    const browser = await chromium.launch({ headless: true, slowMo: 800 });
    const context = await browser.newContext();
    const page = await context.newPage();

    const cookiesPath = path.join(__dirname, 'cookies.json');
    if (fs.existsSync(cookiesPath)) {
        const cookies = JSON.parse(fs.readFileSync(cookiesPath, 'utf8'));
        await context.addCookies(cookies);
        console.log('Loaded saved cookies');
    }

    try {
        await page.goto('https://groceries.morrisons.com/');

        try {
            await page.click('button:has-text("Reject All")', { timeout: 3000 });
        } catch (e) {
            console.log('No cookies banner found.');
        }

        const isLoggedOut = await page.locator('text=Log in').first().isVisible();

        console.log(isLoggedOut)
        if (isLoggedOut) {

            await page.click('text=Log In');
            await page.waitForSelector('[data-test="login-button"]');

            await page.click('[data-test="login-button"]');
            await page.fill('input[id="login-input"]', args.email);
            await page.fill('input[name="password"]', args.password);
            await page.click('[id="login-submit-button"]');

            await page.waitForLoadState('networkidle');
            console.log('Logged in successfully.');

            const context = page.context();
            const cookies = await context.cookies();
            fs.writeFileSync(path.join(__dirname, 'cookies.json'), JSON.stringify(cookies, null, 2));
            console.log('Saved session cookies.');
        } else {
            console.log('Already logged in')
        }


        for (const item of args.scrape_list) {
            await page.fill('input[placeholder="Find a product"]', item);
            await page.press('button[type="submit"]', 'Enter');

            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(3000);
            const productCards = await page.$$('.product-card-container');

            const cards = page.locator('.product-card-container');
            const count = await cards.count();
            console.log(`${count} product cards found.`);

            for (let i = 0; i < count; i++) {
                const card = cards.nth(i);

                // Check if sponsored
                const spanTexts = await card.locator('span').allTextContents();
                const isSponsored = spanTexts.some(text => text.toLowerCase().includes('sponsored'));

                if (isSponsored) {
                    console.log('Skipping sponsored item');
                    continue;
                }

                await card.scrollIntoViewIfNeeded();

                const addButton = card.locator('[data-test="counter-button"]');

                const link = card.locator('a[href]').first();
                const href = await link.getAttribute('href');
                if (href) {
                    // const fullUrl = new URL(href, page.url()).toString();
                    results.push({ search_term: item, link: `https://groceries.morrisons.com${href}` });
                    console.log(`Found: ${href}`);
                    break;
                }

            }

            await page.waitForTimeout(2000);
        }

        console.log(results)

    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        fs.writeFileSync(path.join(__dirname, 'products.json'), JSON.stringify(results, null, 2));
        console.log('Saved products to products.json');
        await browser.close();
    }
})();

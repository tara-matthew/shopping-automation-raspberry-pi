const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Read JSON arguments from the CLI
// const args = JSON.parse(process.argv[2]);
const results = [];

(async () => {
    const browser = await chromium.launch({ headless: false, slowMo: 800 });
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

        await page.goto('https://groceries.morrisons.com/favorites');
        const cards = page.locator('.product-card-container');
        const count = await cards.count();
        console.log(`${count} product cards found.`);

        let previousCount = 0;

        while (true) {
            const cards = page.locator('.product-card-container');
            const count = await cards.count();

            if (count === previousCount) break;

            const lastCard = cards.nth(count - 1);
            await lastCard.scrollIntoViewIfNeeded();
            await page.waitForTimeout(800);

            previousCount = count;
        }

        console.log(`Total cards found: ${previousCount}`);


        for (let i = 0; i < previousCount; i++) {
            const card = cards.nth(i);

            await card.scrollIntoViewIfNeeded();

            const link = await card.locator('[data-test="fop-product-link"]').first().getAttribute('href');
            console.log('Product link:', link);
            const nameIndex = 2
            const productName = link.split('/')[nameIndex]
            results.push({ search_term: productName, link: `https://groceries.morrisons.com${link}` });
        }
    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        fs.writeFileSync(path.join(__dirname, 'favorites.json'), JSON.stringify(results, null, 2));
        console.log('Saved favourites to favourites.json');
        await browser.close();
    }
})();

import fs from "fs";
import dotenv from "dotenv";
import { login } from "./auth.js";
import { addToBasket } from "./basket.js";
import { HOME_URL, COOKIES_PATH } from "./constants.js";
import { dismissCookieBanner, loadCookies, saveCookies } from "./cookies.js";
import { createContext } from "./context.js";
import { chromium } from "playwright";

dotenv.config();

const args = JSON.parse(process.argv[2]);

(async () => {
    const browser = await chromium.launch({ headless: false, slowMo: 300 });
    const context = await createContext(browser)

    if (fs.existsSync(COOKIES_PATH)) {
        await loadCookies(context)
    }

    const page = await context.newPage();
    const pageContext = page.context()

    try {
        await page.goto(HOME_URL);
        await dismissCookieBanner(page)

        const isLoggedOut = await page.locator("text=Log in").first().isVisible();
        if (isLoggedOut) {
            await login(page)
        } else {
            console.log("Already logged in");
        }

        await saveCookies(pageContext)
        await addToBasket(page, args.urls)
    } catch (error) {
        console.error("An error occurred:", error);
    } finally {
        await browser.close();
        // led.unexport()
    }
})();

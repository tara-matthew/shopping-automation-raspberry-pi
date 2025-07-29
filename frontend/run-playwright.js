import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { login } from "./auth.js";
import { addToBasket } from "./basket.js";
import { HOME_URL, COOKIES_PATH } from "./constants.js";
import {dismissCookieBanner, loadCookies, saveCookies} from "./cookies.js";

dotenv.config();

const args = JSON.parse(process.argv[2]);

(async () => {
    const browser = await chromium.launch({ headless: false, slowMo: 300 });
    const context = await browser.newContext({
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
        viewport: { width: 1280, height: 720 },
        locale: "en-UK",
        timezoneId: "Europe/London",
    });

    const page = await context.newPage();
    const pageContext = page.context()

    if (fs.existsSync(COOKIES_PATH)) {
        await loadCookies(context)
    }

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

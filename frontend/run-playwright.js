import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { login } from "./auth.js";
import { addToBasket } from "./basket.js";
import { HOME_URL, COOKIES_PATH } from "./constants.js";
import {dismissCookieBanner, loadCookies} from "./cookies.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

        const context = page.context();
        const cookies = await context.cookies();
        fs.writeFileSync(path.join(__dirname, "cookies.json"), JSON.stringify(cookies, null, 2));

        await addToBasket(page, args.urls)
    } catch (error) {
        console.error("An error occurred:", error);
    } finally {
        console.log("All products added to basket");
        await browser.close();
        // led.unexport()
    }
})();

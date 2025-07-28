const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
require('dotenv').config()
// const Gpio = require('onoff').Gpio;
// const led = new Gpio(589, 'out');

const args = JSON.parse(process.argv[2]);

(async () => {
    console.log(process.env.PASSWORD)
    const browser = await chromium.launch({ headless: false, slowMo: 300 });
    const context = await browser.newContext({
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
        viewport: { width: 1280, height: 720 },
        locale: "en-UK",
        timezoneId: "Europe/London",
    });

    const page = await context.newPage();

    const cookiesPath = path.join(__dirname, "cookies.json");
    if (fs.existsSync(cookiesPath)) {
        const cookies = JSON.parse(fs.readFileSync(cookiesPath, "utf8"));
        await context.addCookies(cookies);
        console.log("Loaded saved cookies");
    }

    try {
        await page.goto("https://groceries.morrisons.com/");

        try {
            await page.click("button:has-text(\"Reject All\")", { timeout: 3000 });
        } catch (e) {
            console.log("No cookies banner found.");
        }

        const isLoggedOut = await page.locator("text=Log in").first().isVisible();

        if (isLoggedOut) {
            await login(page)

        } else {
            console.log("Already logged in");
        }

        const context = page.context();
        const cookies = await context.cookies();
        fs.writeFileSync(path.join(__dirname, "cookies.json"), JSON.stringify(cookies, null, 2));

        const urls = args.urls;
        console.log(urls)

        for (const link of urls) {
            console.log(link);
            await page.goto(link, { waitUntil: "networkidle" });
            await page.screenshot({ path: "debug.png" });

            const addButton = page.locator("[data-test=\"counter-button\"]").first();
            await addButton.scrollIntoViewIfNeeded();

            try {
                await addButton.click();
                // await flashLed(1)
                console.log(`Added ${link} to basket`);

            } catch (e) {
                console.log("Add button not found or not clickable in this card");
            }
        }
    } catch (error) {
        console.error("An error occurred:", error);
    } finally {
        console.log("All products added to basket");
        await browser.close();
        led.unexport()
    }
})();

async function flashLed(times = 1, interval = 1000) {
    for (let i = 0; i < times; i++) {
        led.writeSync(1);
        await new Promise(res => setTimeout(res, interval));
        led.writeSync(0);
        await new Promise(res => setTimeout(res, interval));
    }
}

async function login(page) {
    await page.click("text=Log In", { timeout: 3000 });
    await page.waitForSelector("[data-test=\"login-button\"]");
    await page.click("[data-test=\"login-button\"]");

    await page.type("input[id=\"login-input\"]", process.env.EMAIL, { delay: 200 });
    await page.type("input[name=\"password\"]", process.env.PASSWORD, { delay: 200 });

    await page.click("[id=\"login-submit-button\"]");

    await page.waitForLoadState("networkidle");

    console.log("waiting for captcha");

    await solveRecaptcha(page)
}

async function solveRecaptcha(page) {
    const iframeSelector = "iframe[src*=\"recaptcha/api2/bframe\"]"

    try {
        const frameHandle = await page.waitForSelector(iframeSelector, {timeout: 10000});

        if (frameHandle) {
            console.log("? reCAPTCHA challenge iframe is visible.");
            await page.waitForSelector(iframeSelector, {state: "detached", timeout: 300000});
            console.log("Captcha solved!");
            try {
                await page.waitForNavigation({timeout: 10000, waitUntil: "networkidle"});
                console.log("Navigation after captcha complete");
            } catch {
                console.log("No navigation happened after captcha.");
            }
        }
    } catch (err) {
        if (err.name === "TimeoutError") {
            console.log("reCAPTCHA iframe not found, continuing without captcha.");
        }
    }
}

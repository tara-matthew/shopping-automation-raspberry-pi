export async function login(page) {
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
        const frameHandle = await page.waitForSelector(iframeSelector, { timeout: 10000 });

        if (frameHandle) {
            console.log("? reCAPTCHA challenge iframe is visible.");
            await page.waitForSelector(iframeSelector, { state: "detached", timeout: 300000 });
            console.log("Captcha solved!");
            try {
                await page.waitForNavigation({ timeout: 10000, waitUntil: "networkidle" });
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

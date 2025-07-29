import fs from "fs";
import {COOKIES_PATH} from"./constants.js";

export async function loadCookies(context) {
    const cookies = JSON.parse(fs.readFileSync(COOKIES_PATH, "utf8"));
    await context.addCookies(cookies);
    console.log("Loaded saved cookies");
}

export async function dismissCookieBanner(page) {
    const cookiesButton = 'button:has-text("Reject All")'
    const rejectButton = await page.$(cookiesButton);
    if (rejectButton) {
        await rejectButton.click();
        console.log("Cookies banner dismissed.");
    } else {
        console.log("No cookies banner found.");
    }
}

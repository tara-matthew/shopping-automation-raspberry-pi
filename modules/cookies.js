import fs from "fs";
import { COOKIES_PATH } from"../constants.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function loadCookies(context) {
    const cookies = JSON.parse(fs.readFileSync(COOKIES_PATH, "utf8"));
    await context.addCookies(cookies);
    console.log("Loaded saved cookies");
}

export async function saveCookies(context) {
    const cookies = await context.cookies();
    // TODO Fix path which cookies are written to
    fs.writeFileSync(path.join(__dirname, "cookies.json"), JSON.stringify(cookies, null, 2));
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

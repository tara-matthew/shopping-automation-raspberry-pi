import fs from "fs";
import {COOKIES_PATH} from"./constants.js";

export async function loadCookies(context) {
    const cookies = JSON.parse(fs.readFileSync(COOKIES_PATH, "utf8"));
    await context.addCookies(cookies);
    console.log("Loaded saved cookies");
}

const fs = require("fs");
const {COOKIES_PATH} = require("./constants");

async function loadCookies(context) {
    const cookies = JSON.parse(fs.readFileSync(COOKIES_PATH, "utf8"));
    await context.addCookies(cookies);
    console.log("Loaded saved cookies");
}

module.exports = {
    loadCookies
}

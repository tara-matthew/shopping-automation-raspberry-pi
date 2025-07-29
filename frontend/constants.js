const path = require("path");

const HOME_URL = "https://groceries.morrisons.com/"
const COOKIES_PATH = path.join(__dirname, "cookies.json");

module.exports = {
    HOME_URL,
    COOKIES_PATH,
};

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const HOME_URL = "https://groceries.morrisons.com/"
export const COOKIES_PATH = path.join(__dirname, "cookies.json");


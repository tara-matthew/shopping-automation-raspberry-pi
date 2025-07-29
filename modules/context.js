export async function createContext(browser) {
    return await browser.newContext({
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
        viewport: { width: 1280, height: 720 },
        locale: "en-UK",
        timezoneId: "Europe/London",
    });
}

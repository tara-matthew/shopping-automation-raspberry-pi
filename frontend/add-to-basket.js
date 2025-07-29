export async function addToBasket(page, urls) {
    for (const link of urls) {
        await page.goto(link, { waitUntil: "networkidle" });
        await page.screenshot({ path: "debug.png" });

        const addButton = page.locator("[data-test=\"counter-button\"]").first();
        await addButton.scrollIntoViewIfNeeded();

        const isVisible = await addButton.isVisible();
        if (isVisible) {
            await addButton.click();
            console.log(`Added ${link} to basket`);
        } else {
            console.log("Add button not found or not clickable in this card");
        }
    }
}

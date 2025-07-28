import fetch from 'node-fetch';
import {exec} from "node:child_process";

async function callAddToBasket() {
    const url = `${process.env.API_URL}/basket`;
    const payload = {
        email: process.env.EMAIL,
        password: process.env.PASSWORD,
        product_names: ["oatcakes", "salmon"],
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            console.error('Error:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('Details:', errorText);
            return;
        }

        const ids = await response.json();

        exec(`node ./run-playwright.js '${ids}'`, (error, stdout, stderr) => {
            if (error) {
                console.error('Error running Playwright:', error);
            } else {
                console.log('Playwright output:', stdout);
            }
        });
    } catch (err) {
        console.error('Fetch error:', err);
    }
}

await callAddToBasket();

const Gpio = require('onoff').Gpio;
const led = new Gpio(589, 'out');

export async function flashLed(times = 1, interval = 1000) {
    for (let i = 0; i < times; i++) {
        led.writeSync(1);
        await new Promise(res => setTimeout(res, interval));
        led.writeSync(0);
        await new Promise(res => setTimeout(res, interval));
    }
}

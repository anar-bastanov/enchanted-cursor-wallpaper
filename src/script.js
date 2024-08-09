const config = {
    RADIUS: 5,  // int [1, 20]
    RAINBOW_SPEED: 0.3,  // float (0, 1]
    RANDOM_BRIGHTNESS: 0.7,  // float [0, 1]
    DISTORTION: 2,  // float [0, 5]
    FADE_DECAY: 50,  // int [1, 50]
    BACKGROUND_NOISE: 0.25,  // float [0, 1]
    SYNC_NOISE_COLOR: false,  // bool
    SCREEN_SATURATION: 0.5,  // float [0, 1] 
    CHARACTERS: [..."ᔑʖᓵ↸ᒷ⎓⊣⍑╎⋮ꖌꖎᒲリ𝙹!¡ᑑ∷ᓭℸ⚍⍊∴/||⨅"],  // string [1, 64]
    FONT_SIZE: 12,  // int [8, 30]
    FONT_NAME: "Consolas, monospace",
    __AVAILABLE_FONTS: [
        "Arial, sans-serif",
        "Verdana, sans-serif",
        "Times New Roman, serif",
        "Georgia, serif",
        "Courier New, monospace",
        "Lucida Console, monospace",
        "Trebuchet MS, sans-serif",
        "Tahoma, sans-serif",
        "Palatino Linotype, serif",
        "Impact, sans-serif",
        "Comic Sans MS, cursive, sans-serif",
        "Consolas, monospace",
    ]
};

//# Setup

const canvas = document.getElementById("c");
const context = canvas.getContext("2d");

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

context.font = config.FONT_SIZE + "px " + config.FONT_NAME;  // for debugging on a browser

let hue = 0;
let mouseXOld = -1;
let mouseYOld = -1;

//# Main Functions

function alignPosition(pos) {
    const fontSize = config.FONT_SIZE;
    return Math.floor(pos / fontSize) * fontSize;
}

function getRandomCharacter() {
    const characters = config.CHARACTERS;
    return characters[Math.floor(Math.random() * characters.length)];
}

function drawCharacter(char, posX, posY, hue, alpha = 1.0) {
    const fontSize = config.FONT_SIZE;

    context.fillStyle = "rgba(10,10,10, 1.0)";
    context.fillRect(posX, posY - fontSize, fontSize, fontSize);

    const r = Math.floor(127 * Math.sin(hue + (0 / 3) * Math.PI) + 128);
    const g = Math.floor(127 * Math.sin(hue + (2 / 3) * Math.PI) + 128);
    const b = Math.floor(127 * Math.sin(hue + (4 / 3) * Math.PI) + 128);

    context.fillStyle = `rgba(${r},${g},${b}, ${alpha})`;
    context.fillText(char, posX, posY);
}

function drawCursorEffect(mouseX, mouseY) {
    const {
        RADIUS: radius,
        RAINBOW_SPEED: speed,
        RANDOM_BRIGHTNESS: brightness,
        DISTORTION: distortion,
        FONT_SIZE: fontSize
    } = config;
    const cellX = alignPosition(mouseX);
    const cellY = alignPosition(mouseY);

    for (let x = -radius + 1; x < radius; ++x) {
        for (let y = -radius + 1; y < radius; ++y) {
            if (Math.sqrt(x * x + y * y) >= radius - 0.5)
                continue;

            const distance = Math.sqrt(x * x + y * y) / radius;

            if (Math.random() > Math.pow(1 - distance, distortion))
                continue;

            const char = getRandomCharacter();
            const posX = cellX + x * fontSize;
            const posY = cellY + y * fontSize;
            const alpha = 1.0 - brightness * Math.random();

            drawCharacter(char, posX, posY, hue * speed, alpha);
        }
    }
}

function drawCursorEffectInLine(mouseXFrom, mouseYFrom, mouseXTo, mouseYTo) {
    const diffX = mouseXTo - mouseXFrom;
    const diffY = mouseYTo - mouseYFrom;
    const length = config.FONT_SIZE * config.RADIUS / 1.5;
    const distance = Math.sqrt(diffX * diffX + diffY * diffY);
    const lengthX = length * diffX / distance;
    const lengthY = length * diffY / distance;
    const maxHuePeriod = 2 * Math.PI / config.RAINBOW_SPEED;

    let i = distance;
    do {
        hue = (hue + min(length, i) / 75) % maxHuePeriod;
        drawCursorEffect(mouseXTo, mouseYTo);
        mouseXTo -= lengthX;
        mouseYTo -= lengthY;
        i -= length;
    }
    while (i > 0);
}

function drawNoiseEffect() {
    const {
        RAINBOW_SPEED: speed,
        BACKGROUND_NOISE: noise,
        SYNC_NOISE_COLOR: syncColor,
        FONT_SIZE: fontSize
    } = config;
    const count = Math.sqrt(canvas.width * canvas.height) / fontSize * (0.2 * noise);

    for (let i = 0; i < count; ++i) {
        const char = getRandomCharacter();
        const posX = alignPosition(Math.random() * canvas.width);
        const posY = alignPosition(Math.random() * canvas.height);
        const rhue = syncColor ? hue * speed : Math.random() * 2 * Math.PI;

        drawCharacter(char, posX, posY, rhue);
    }
}

function fadeScreen() {
    context.fillStyle = "rgba(10,10,10, 0.05)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "rgba(0,0,0, 0.05)";
    context.fillRect(0, 0, canvas.width, canvas.height);
}

//# Events

window.onresize = () => {
    location.reload();
}

canvas.onmouseleave = () => {
    mouseXOld = -1;
    mouseYOld = -1;
}

let fadeIntervalId = setInterval(fadeScreen, config.FADE_DECAY);

setInterval(drawNoiseEffect, 50);

document.onmousemove = (event) => {
    const mouseX = event.x;
    const mouseY = event.y;

    if (mouseXOld < 0 || mouseYOld < 0)
        drawCursorEffect(mouseX, mouseY);
    else
        drawCursorEffectInLine(mouseXOld, mouseYOld, mouseX, mouseY);

    mouseXOld = mouseX;
    mouseYOld = mouseY;
}

//# Lively API

function livelyPropertyListener(name, val) {
    switch (name) {
        case "radius":
            config.RADIUS = val;
            break;
        case "rainbowSpeed":
            config.RAINBOW_SPEED = val / 100;
            break;
        case "randomBrightness":
            config.RANDOM_BRIGHTNESS = val / 100;
            break;
        case "distortion":
            config.DISTORTION = val / 20;
            break;
        case "fadeSpeed":
            val = mapRange(val, 1, 100, 50, 1);
            config.FADE_DECAY = val;
            clearInterval(fadeIntervalId);
            fadeIntervalId = setInterval(fadeScreen, val);
            break;
        case "backgroundNoise":
            config.BACKGROUND_NOISE = val / 100;
            break;
        case "syncNoiseColor":
            config.SYNC_NOISE_COLOR = val;
            break;
        case "screenSaturation":
            config.SCREEN_SATURATION = val / 100;
            canvas.style.filter = `saturate(${val + 100}%) brightness(${val + 100}%)`;
            break;
        case "characters":
            config.CHARACTERS = val.length == 0 ? ['?'] : [...val.slice(0, 64)];
            break;
        case "fontSize":
            config.FONT_SIZE = val;
            context.font = val + "px " + config.FONT_NAME;
            break;
        case "fontName":
            val = config.__AVAILABLE_FONTS[val];
            config.FONT_NAME = val;
            context.font = config.FONT_SIZE + "px " + val;
            break;
    }
}

//# Utility Functions

function mapRange(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

function min(x, y) {
    return x < y ? x : y;
}

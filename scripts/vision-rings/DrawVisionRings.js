import {loadSettings, registerSettings, settings} from "./settings.js";

Hooks.once("init", async () => {
    registerSettings(drawFullRing, drawSecondRing, removeRing);
});

Hooks.once("setup", async () => {
    loadSettings();
});

Hooks.on('refreshToken', async (token, b, c) => {
    if (settings.enabled) {
        drawFullRing(token);

        if (settings.secondRing !== 0) {
            drawSecondRing(token);
        }
    }
})

const VISION_RING_FULL = "vision-ring-full";

function drawFullRing(token, force = false) {
    drawRing(token, VISION_RING_FULL, 1, settings.color1, force)
}

const VISION_RING_HALF = "vision-ring-half";
function drawSecondRing(token, force = false) {
    drawRing(token, VISION_RING_HALF, settings.secondRing, settings.color2, force)
}

function removeRing(token){
    let ring = token.children.find((child) => child.name === VISION_RING_FULL);
    if (ring) {
        token.removeChild(ring);
    }

    ring = token.children.find((child) => child.name === VISION_RING_HALF);
    if (ring) {
        token.removeChild(ring);
    }
}

function drawRing(token, name, radiusMultiplier, color, force = false) {
    if (token) {
        // Check if an existing ring already exists
        let ring = token.children.find((child) => child.name === name);
        const tokenRadius = token.w / 2;
        const radius = token.sightRange * radiusMultiplier;

        if (ring) {
            // If the ring exists, check if the radius needs updating
            if (!force && ring._lastRadius === radius) {
                // If the radius is unchanged, do nothing
                return;
            }

            // Otherwise, clear and redraw the ring with the new radius
            ring.clear();
        } else {
            // Create a new ring if it doesn't exist
            ring = new PIXI.Graphics();
            ring.name = name;
            token.addChild(ring);
        }

        // Set the line style (5px, orange, fully opaque)
        ring.lineStyle(5, color, 1);

        // Draw the circle using the calculated radius
        ring.drawCircle(tokenRadius, tokenRadius, radius);

        // Store the radius for future comparisons
        ring._lastRadius = radius; // Custom property to track the radius
    }
}


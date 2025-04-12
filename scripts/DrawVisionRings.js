import {
    MODULE_ID, SETTING_DRAW_VISION_RINGS_COLOR1, SETTING_DRAW_VISION_RINGS_COLOR2,
    SETTING_DRAW_VISION_RINGS_ENABLED,
    SETTING_DRAW_VISION_RINGS_SECOND_VISION_RING_MULTIPLIER
} from "./constants.js";

let settings = {
    enabled: false,
    secondRing: 0,
    color1: "#FFA500",
    color2: "#FFA500"
};

class VisionCircleSettingsForm extends FormApplication {
    constructor() {
        super();
    }

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            title: "Vision Circle Settings",
            id: "vision-circle-settings-form",
            template: `modules/${MODULE_ID}/templates/vision-circle-settings.html`, // Path to the HTML template for your settings form
            width: 400,
            closeOnSubmit: true,
            resizable: false
        });
    }

    // Load current settings and pass the data to the form
    getData() {
        return {
            enabled: game.settings.get(MODULE_ID, SETTING_DRAW_VISION_RINGS_ENABLED),
            secondRingMultiplier: game.settings.get(MODULE_ID, SETTING_DRAW_VISION_RINGS_SECOND_VISION_RING_MULTIPLIER),
            color1: game.settings.get(MODULE_ID, SETTING_DRAW_VISION_RINGS_COLOR1),
            color2: game.settings.get(MODULE_ID, SETTING_DRAW_VISION_RINGS_COLOR2)
        };
    }

    // Handle form submission and update game settings
    async _updateObject(event, formData) {
        // Save settings to Foundry
        await game.settings.set(MODULE_ID, SETTING_DRAW_VISION_RINGS_ENABLED, formData.enabled);
        await game.settings.set(MODULE_ID, SETTING_DRAW_VISION_RINGS_SECOND_VISION_RING_MULTIPLIER, parseFloat(formData.secondRingMultiplier));
        await game.settings.set(MODULE_ID, SETTING_DRAW_VISION_RINGS_COLOR1, formData.color1);
        await game.settings.set(MODULE_ID, SETTING_DRAW_VISION_RINGS_COLOR2, formData.color2);

        // Sync the `settings` object with the updated game settings
        settings.enabled = formData.enabled;
        settings.secondRing = parseFloat(formData.secondRingMultiplier);
        settings.color1 = formData.color1;
        settings.color2 = formData.color2;

        // Redraw rings after updating settings
        canvas.tokens.placeables.forEach(token => {
            drawFullRing(token, true);
            drawSecondRing(token, true);
        });
    }
}

// Register the settings menu and settings in Foundry
Hooks.once("init", async () => {
    game.settings.registerMenu(MODULE_ID, "visionCircleSettingsMenu", {
        name: "Vision Circle Settings",
        label: "Open Settings",
        hint: "Configure all settings for vision circles here.",
        icon: "fas fa-eye", // Use a Font Awesome icon
        type: VisionCircleSettingsForm, // Link to the custom form class
        restricted: false // Allow all users to configure settings; adjust as needed
    });

    // Register the individual settings
    game.settings.register(MODULE_ID, SETTING_DRAW_VISION_RINGS_ENABLED, {
        scope: "client",
        config: false,
        type: Boolean,
        default: false
    });

    game.settings.register(MODULE_ID, SETTING_DRAW_VISION_RINGS_SECOND_VISION_RING_MULTIPLIER, {
        scope: "client",
        config: false,
        type: Number,
        default: 0.5
    });

    game.settings.register(MODULE_ID, SETTING_DRAW_VISION_RINGS_COLOR1, {
        scope: "client",
        config: false,
        type: String,
        default: "#ff0000" // Default red color
    });

    game.settings.register(MODULE_ID, SETTING_DRAW_VISION_RINGS_COLOR2, {
        scope: "client",
        config: false,
        type: String,
        default: "#00ff00" // Default green color
    });
});

Hooks.once("setup", async () => {
    console.log(settings)
    settings.enabled = game.settings.get(MODULE_ID, SETTING_DRAW_VISION_RINGS_ENABLED);
    settings.secondRing = game.settings.get(MODULE_ID, SETTING_DRAW_VISION_RINGS_SECOND_VISION_RING_MULTIPLIER);
    settings.color1 = game.settings.get(MODULE_ID, SETTING_DRAW_VISION_RINGS_COLOR1);
    settings.color2 = game.settings.get(MODULE_ID, SETTING_DRAW_VISION_RINGS_COLOR2);
});


Hooks.on('refreshToken', async (token, b, c) => {
    if (settings.enabled) {
        drawFullRing(token);

        if (settings.secondRing !== 0) {
            drawSecondRing(token);
        }
    }
})

function drawFullRing(token, force = false) {
    drawRing(token, "vision-ring-full", 1, settings.color1, force)
}

function drawSecondRing(token, force = false) {
    drawRing(token, "vision-ring-half", settings.secondRing, settings.color2, force)
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
        const parsedColor = parseColor(color);
        ring.lineStyle(5, parsedColor.color, parsedColor.alpha);

        // Draw the circle using the calculated radius
        ring.drawCircle(tokenRadius, tokenRadius, radius);

        // Store the radius for future comparisons
        ring._lastRadius = radius; // Custom property to track the radius
    }
}

function parseColor(colorString) {
    // Ensure the color string is valid and starts with '#'
    if (!colorString || !colorString.startsWith('#')) {
        throw new Error("Invalid color format, must start with '#'");
    }

    // Check the length of the color string
    if (colorString.length === 7) { // Format: #RRGGBB
        return {
            color: colorString,
            alpha: 1 // Default alpha
        };
    } else if (colorString.length === 9) { // Format: #RRGGBBAA
        const rgb = colorString.slice(0, 7); // #RRGGBB
        const alphaHex = colorString.slice(7, 9); // AA
        const alphaDecimal = parseInt(alphaHex, 16) / 255; // Convert hex AA to decimal (0 to 1)
        return {
            color: rgb,
            alpha: alphaDecimal
        };
    } else {
        throw new Error("Invalid color format, must be in #RRGGBB or #RRGGBBAA format");
    }
}


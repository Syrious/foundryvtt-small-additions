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


Hooks.once("init", async () => {
    game.settings.register(MODULE_ID, SETTING_DRAW_VISION_RINGS_ENABLED, {
        name: "Enables ring",
        description: "Enables ring at the edge of an actors vision range",
        scope: "client",
        config: true,
        default: false,
        type: Boolean,
        requiresReload: false,
        onChange: value => {
            settings.enabled = value;
            canvas.tokens.placeables.forEach(token => drawFullRing(token));
        }
    });

    game.settings.register(MODULE_ID, SETTING_DRAW_VISION_RINGS_SECOND_VISION_RING_MULTIPLIER, {
        name: "Inner second",
        description: "Enables a second (smaller) ring with a radius of the given fraction of the outer ring. " +
            "For example, 0.5 means the inner ring has half the radius of the outer ring. Set to 0 to disable the second ring",
        scope: "client",
        config: true,
        default: 0,
        type: Number,
        range: {
            min: 0,
            step: 0.1,
            max: 1
        },
        requiresReload: false,
        onChange: value => {
            settings.secondRing = value;
            canvas.tokens.placeables.forEach(token => drawSecondRing(token));
        }
    });

    try {
        window.Ardittristan.ColorSetting.tester

        new window.Ardittristan.ColorSetting(MODULE_ID, SETTING_DRAW_VISION_RINGS_COLOR1, {
            name: "Outer ring color",      // The name of the setting in the settings menu
            restricted: false,             // Restrict this setting to gamemaster only?
            defaultColor: settings.color1,     // The default color of the setting
            scope: "client",               // The scope of the setting
            onChange: (value) => {
                settings.color1 = value;
                canvas.tokens.placeables.forEach(token => drawFullRing(token, true));
            }
        });

        new window.Ardittristan.ColorSetting(MODULE_ID, SETTING_DRAW_VISION_RINGS_COLOR2, {
            name: "Inner ring color",      // The name of the setting in the settings menu
            restricted: false,             // Restrict this setting to gamemaster only?
            defaultColor: settings.color2,     // The default color of the setting
            scope: "client",               // The scope of the setting
            onChange: (value) => {
                settings.color2 = value;
                canvas.tokens.placeables.forEach(token => drawSecondRing(token, true));
            }
        })
    } catch {
        game.settings.register(MODULE_ID, SETTING_DRAW_VISION_RINGS_COLOR1, {
            name: "Outer ring color",
            scope: "client",
            config: true,
            default: settings.color1,
            type: String,
            requiresReload: false,
            onChange: value => {
                settings.color1 = value;
                canvas.tokens.placeables.forEach(token => drawFullRing(token, true));
            }
        });

        game.settings.register(MODULE_ID, SETTING_DRAW_VISION_RINGS_COLOR2, {
            name: "Inner ring color",
            scope: "client",
            config: true,
            default: settings.color2,
            type: String,
            requiresReload: false,
            onChange: value => {
                settings.color2 = value;
                canvas.tokens.placeables.forEach(token => drawSecondRing(token, true));
            }
        });
    }

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
        ring.lineStyle(5, color, 1);

        // Draw the circle using the calculated radius
        ring.drawCircle(tokenRadius, tokenRadius, radius);

        // Store the radius for future comparisons
        ring._lastRadius = radius; // Custom property to track the radius
    }
}
import {
    MODULE_ID, SETTING_DRAW_VISION_RINGS_COLOR1, SETTING_DRAW_VISION_RINGS_COLOR2,
    SETTING_DRAW_VISION_RINGS_ENABLED,
    SETTING_DRAW_VISION_RINGS_SECOND_VISION_RING_MULTIPLIER
} from "../constants.js";

export let settings = {
    enabled: false,
    secondRing: 0,
    color1: "#FFA500",
    color2: "#FFA500"
};

let drawFullRingFunction;
let drawSecondRingFunction;
let removeRingFunction;

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
            if(!settings.enabled){
                removeRingFunction(token);
            }else {
                drawFullRingFunction(token, true);
                drawSecondRingFunction(token, true);
            }
        });
    }
}

export function registerSettings(_drawFullRingFunction, _drawSecondRingFunction, _removeRingFunction) {
    drawFullRingFunction = _drawFullRingFunction;
    drawSecondRingFunction = _drawSecondRingFunction;
    removeRingFunction = _removeRingFunction;

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
        default: settings.enabled
    });

    game.settings.register(MODULE_ID, SETTING_DRAW_VISION_RINGS_SECOND_VISION_RING_MULTIPLIER, {
        scope: "client",
        config: false,
        type: Number,
        default: settings.secondRing
    });

    game.settings.register(MODULE_ID, SETTING_DRAW_VISION_RINGS_COLOR1, {
        scope: "client",
        config: false,
        type: String,
        default: settings.color1 // Default red color
    });

    game.settings.register(MODULE_ID, SETTING_DRAW_VISION_RINGS_COLOR2, {
        scope: "client",
        config: false,
        type: String,
        default: settings.color2 // Default green color
    });
}

export function loadSettings() {
    settings.enabled = game.settings.get(MODULE_ID, SETTING_DRAW_VISION_RINGS_ENABLED);
    settings.secondRing = game.settings.get(MODULE_ID, SETTING_DRAW_VISION_RINGS_SECOND_VISION_RING_MULTIPLIER);
    settings.color1 = game.settings.get(MODULE_ID, SETTING_DRAW_VISION_RINGS_COLOR1);
    settings.color2 = game.settings.get(MODULE_ID, SETTING_DRAW_VISION_RINGS_COLOR2);
}
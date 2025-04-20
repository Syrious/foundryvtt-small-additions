import {MODULE_ID, SETTING_HIDDEN_DRAWING_OPACITY} from "./constants.js";

let alpha = 0.5;

export function initDrawingOpacity() {
    game.settings.register(MODULE_ID, SETTING_HIDDEN_DRAWING_OPACITY, {
        name: "Opacity of hidden drawings",
        scope: "client",
        config: libwrapperInstalled(),
        default: 0.5,
        type: Number,
        range: {
            min: 0,
            step: 0.01,
            max: 1
        },
        requiresReload: false,
        onChange: value => {
            alpha = value
        }
    });

    libWrapperSetup();
}

function libwrapperInstalled() {
    return typeof libWrapper === 'function';
}

function libWrapperSetup() {
    if (libwrapperInstalled()) {
        alpha = game.settings.get(MODULE_ID, SETTING_HIDDEN_DRAWING_OPACITY);

        // Use libWrapper to safely override the Drawing class's _refreshState method
        libWrapper.register(MODULE_ID, "Drawing.prototype._refreshState", function (wrapped, ...args) {
            // First, call the original _refreshState method
            wrapped.apply(this, args);

            // Now, override the alpha logic for the drawing
            if(this.shape.hidden) {
                this.shape.alpha = alpha; // Your custom logic here
            }

        }, "WRAPPER"); // Wrapper allows you to wrap the original implementation
    }
}

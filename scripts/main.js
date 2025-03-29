import {initDrawingOpacity} from "./DrawingOpacity.js";
// CONFIG.debug.hooks = false;

Hooks.once("init", async () => {
    initDrawingOpacity();
});
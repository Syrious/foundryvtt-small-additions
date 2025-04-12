import {initDrawingOpacity} from "./DrawingOpacity.js";
// CONFIG.debug.hooks = true;

Hooks.once("init", async () => {
    initDrawingOpacity();
});
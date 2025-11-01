declare const L: typeof import("leaflet");

export const Layer = {
    addTo(layer: any, map: any): void {
        layer.addTo(map);
    },

    remove(layer: any): void {
        layer.remove();
    }
};

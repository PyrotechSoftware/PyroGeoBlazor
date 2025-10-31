declare const L: typeof import("leaflet");

import { maps } from './map';

export function addLayerControl(elementId: string): void {
    const mapObj = maps[elementId];
    if (!mapObj) return;

    const baseLayers = {
        "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
    };

    const overlays = mapObj.layers;

    L.control.layers(baseLayers, overlays).addTo(mapObj.map);
}
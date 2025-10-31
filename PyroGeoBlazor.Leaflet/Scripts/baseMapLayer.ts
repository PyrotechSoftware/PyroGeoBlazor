declare const L: typeof import("leaflet");

import { maps } from './map';

export function setBasemap(elementId: string, urlTemplate: string, attribution: string): void {
    const mapObj = maps[elementId];
    if (!mapObj) return;

    // Remove existing basemap if present
    if (mapObj.layers["__basemap__"]) {
        mapObj.map.removeLayer(mapObj.layers["__basemap__"]);
        delete mapObj.layers["__basemap__"];
    }

    const basemap = L.tileLayer(urlTemplate, { attribution });
    basemap.addTo(mapObj.map);
    mapObj.layers["__basemap__"] = basemap;
}
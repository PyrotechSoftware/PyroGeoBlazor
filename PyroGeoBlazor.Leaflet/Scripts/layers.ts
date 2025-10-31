declare const L: typeof import("leaflet");

import { maps } from './map';

export function addGeoJsonLayer(elementId: string, layerId: string, geoJson: any): void {
    const mapObj = maps[elementId];
    if (!mapObj) return;

    const layer = L.geoJSON(geoJson);
    layer.addTo(mapObj.map);
    mapObj.layers[layerId] = layer;
}

export function removeLayer(elementId: string, layerId: string): void {
    const mapObj = maps[elementId];
    if (!mapObj?.layers[layerId]) return;

    mapObj.map.removeLayer(mapObj.layers[layerId]);
    delete mapObj.layers[layerId];
}

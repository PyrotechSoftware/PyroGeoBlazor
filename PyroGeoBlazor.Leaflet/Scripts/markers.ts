declare const L: typeof import("leaflet");

import { maps } from './map';

export function addMarker(elementId: string, lat: number, lng: number, popupText?: string): void {
    const mapObj = maps[elementId];
    if (!mapObj) return;

    const marker = L.marker([lat, lng]);
    if (popupText) {
        marker.bindPopup(popupText);
    }
    marker.addTo(mapObj.markerGroup);
}

export function clearMarkers(elementId: string): void {
    const mapObj = maps[elementId];
    if (!mapObj) return;

    mapObj.markerGroup.clearLayers();
}
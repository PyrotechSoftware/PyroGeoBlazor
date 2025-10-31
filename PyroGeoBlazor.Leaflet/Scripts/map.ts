declare const L: typeof import("leaflet");

export const maps: Record<string, { map: L.Map, layers: Record<string, L.Layer>, markerGroup: L.LayerGroup }> = {};

export function createMap(elementId: string): L.Map | undefined {
    if (typeof L === "undefined") {
        console.error("Leaflet (L) is not loaded. Please ensure leaflet.js is included before leafletInterop.js.");
        return;
    }

    const map = L.map(elementId).setView([0, 0], 2);
    const markerGroup = L.layerGroup().addTo(map);

    maps[elementId] = {
        map,
        layers: {},
        markerGroup
    };

    return map;
}

// Accept only a map instance. Call setView on that instance directly.
export function setView(map: L.Map, lat: number, lng: number, zoom: number): void {
    if (!map) {
        console.error("No map instance provided to setView.");
        return;
    }

    map.setView([lat, lng], zoom);
}
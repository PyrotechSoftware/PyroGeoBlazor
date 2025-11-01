declare const L: typeof import("leaflet");

export const Map = {
    setView(map: L.Map, center: L.LatLng | any, zoom: number, options: L.ZoomPanOptions | undefined): void {
        map.setView(center, zoom);
    },

    panTo(map: L.Map, center: L.LatLng, options: L.PanOptions | undefined): void {
        map.panTo(center, options);
    },

    setMaxBounds(map: L.Map, bounds: L.LatLngBounds): void {
        map.setMaxBounds(bounds);
    },

    flyTo(map: L.Map, center: L.LatLng | any, zoom: number, options: L.ZoomPanOptions | undefined): void {
        map.flyTo(center, zoom, options);
    },

    locate(map: L.Map, options: L.LocateOptions | undefined): void {
        map.locate(options);
    }
};

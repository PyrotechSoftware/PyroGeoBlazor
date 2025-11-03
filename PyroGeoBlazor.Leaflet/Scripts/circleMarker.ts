declare const L: typeof import('leaflet');

export const CircleMarker = {
    setLatLng(marker: L.CircleMarker, latLng: L.LatLng): void {
        marker.setLatLng(latLng);
    },
    setRadius(marker: L.CircleMarker, radius: number): void {
        marker.setRadius(radius);
    }
};

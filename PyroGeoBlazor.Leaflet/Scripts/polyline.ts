declare const L: typeof import("leaflet");

export const Polyline = {
    addLatLng(polyline: L.Polyline, latlng: L.LatLng, latlngs?: L.LatLng[]): void {
        polyline.addLatLng(latlng, latlngs);
    },
    setLatLngs(polyline: L.Polyline, latlngs: L.LatLng[]): void {
        polyline.setLatLngs(latlngs);
    },
    closestLayerPoint(polyline: L.Polyline, point: L.Point): L.Point {
        return polyline.closestLayerPoint(point);
    }
};

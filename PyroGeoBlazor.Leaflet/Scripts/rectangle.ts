declare const L: typeof import('leaflet');

export const Rectangle = {
    setBounds(rectangle: L.Rectangle, bounds: L.LatLngBounds): void {
        rectangle.setBounds(bounds);
    }
};

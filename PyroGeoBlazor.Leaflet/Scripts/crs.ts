declare const L: typeof import('leaflet');

/** Get an existing CRS instance by name, e.g., "EPSG3857", "EPSG4326", "Simple". */
export function getCrs(name: string): L.CRS {
    const crs = L.CRS?.[name];
    if (!crs) {
        const keys = Object.keys(L.CRS || {});
        throw new Error(
            `Unknown CRS '${name}'. Available CRS keys: ${keys.join(", ")}`
        );
    }
    // Return the *existing* object; Blazor will receive an object reference.
    return crs;
}

// The next parts are not currently used.
// Overrides to build a custom CRS as a plain object (no `new`).
export interface CrsOverrides {
    code?: string;
    wrapLng?: [number, number];
    wrapLat?: [number, number];
    infinite?: boolean;
    // Function overrides
    scale?(zoom: number): number;
    zoom?(scale: number): number;
    project?(latlng: any): any;
    unproject?(point: any): any;
    // You can extend this with additional members if you need them.
}

// Minimal shape for a CRS-like object. We keep it permissive because CRS are plain objects.
export type CrsLike = {
    scale(zoom: number): number;
    zoom(scale: number): number;
    latLngToPoint(latLng: any, zoom: number): any;
    pointToLatLng(point: any, zoom: number): any;
    // Optionally other members exist (project/unproject, transformation, etc.)
};

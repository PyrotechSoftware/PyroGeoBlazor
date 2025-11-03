import { Map } from './map';
import { Layer } from './layer';
import { Polyline } from './polyline';
import { Polygon } from './polygon';
import { Rectangle } from './rectangle';
import { CircleMarker } from './circleMarker';
import { Popup } from './popup';

export const LeafletMap = { Map, Layer, Polyline, Polygon, Rectangle, CircleMarker, Popup };

// For consumers that expect a default export or a global on window
export default LeafletMap;

// Attach to window for direct script usage in non-module contexts
if (typeof window !== 'undefined') {
    (window as any).LeafletMap = LeafletMap;
}

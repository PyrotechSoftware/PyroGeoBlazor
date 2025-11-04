import { Map } from './map';
import { Layer } from './layer';
import { Polyline } from './polyline';
import { Polygon } from './polygon';
import { Rectangle } from './rectangle';
import { Marker } from './marker';
import { CircleMarker } from './circleMarker';
import { Popup } from './popup';
import { Tooltip } from './tooltip';

export const LeafletMap = { Map, Layer, Polyline, Polygon, Rectangle, Marker, CircleMarker, Popup, Tooltip };

// For consumers that expect a default export or a global on window
export default LeafletMap;

// Attach to window for direct script usage in non-module contexts
if (typeof window !== 'undefined') {
    (window as any).LeafletMap = LeafletMap;
}

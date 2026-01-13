import { Map } from './map';
import { Layer } from './layer';
import { GridLayer } from './gridLayer';
import { TileLayer } from './tileLayer';
import { WmsTileLayer } from './wmsTileLayer';
import { ProtobufVectorTileLayer } from './protobufVectorTileLayer';
import { SlicerVectorTileLayer } from './slicerVectorTileLayer';
import { LayerGroup } from './layerGroup';
import { FeatureGroup } from './featureGroup';
import { GeoJsonLayer } from './geoJsonLayer';
import { EditableGeoJsonLayer } from './editableGeoJsonLayer';
import { Polyline } from './polyline';
import { Polygon } from './polygon';
import { Rectangle } from './rectangle';
import { Marker } from './marker';
import { CircleMarker } from './circleMarker';
import { Popup } from './popup';
import { Tooltip } from './tooltip';
import { getCrs } from './crs';
import { LeafletEditingControl } from './editingControl';

export const LeafletMap = {
    Map, Layer, GridLayer, TileLayer, WmsTileLayer, ProtobufVectorTileLayer, SlicerVectorTileLayer, LayerGroup, FeatureGroup, GeoJsonLayer, EditableGeoJsonLayer, Polyline, Polygon, Rectangle, Marker, CircleMarker, Popup, Tooltip, getCrs, LeafletEditingControl
};

// For consumers that expect a default export or a global on window
export default LeafletMap;

// Attach to window for direct script usage in non-module contexts
if (typeof window !== 'undefined') {
    (window as any).LeafletMap = LeafletMap;
}

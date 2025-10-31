import { createMap, maps, setView } from './map';
import { ensureLeafletLoaded } from './loader';
import { addGeoJsonLayer, removeLayer } from './layers';
import { addMarker, clearMarkers } from './markers';
import { addLayerControl } from './controls';
import { setBasemap } from './baseMapLayer';

declare global {
    interface Window {
        leafletMap: {
            initMap: (elementId: string, geoJson?: any) => any;
            addLayer: (elementId: string, layerId: string, geoJson: any) => any;
            removeLayer: (elementId: string, layerId: string) => any;
            addMarker: (elementId: string, lat: number, lng: number, popupText?: string) => any;
            clearMarkers: (elementId: string) => any;
            addLayerControl: (elementId: string) => any;
            setBasemap: (elementId: string, urlTemplate: string, attribution: string) => any;
            setView: (map: L.Map, lat: number, lng: number, zoom: number) => any;
        };
    }
}

window.leafletMap = {
    initMap: async (elementId, geoJson) => {
        await ensureLeafletLoaded();
        const map = createMap(elementId);
        if (geoJson) {
            addGeoJsonLayer(elementId, "default", geoJson);
        }
        return map;
    },
    addLayer: addGeoJsonLayer,
    removeLayer: removeLayer,
    addMarker: addMarker,
    clearMarkers: clearMarkers,
    addLayerControl: addLayerControl,
    setBasemap: setBasemap,
    setView: setView
};
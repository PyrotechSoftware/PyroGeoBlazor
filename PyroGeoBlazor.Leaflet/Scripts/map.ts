import { EventHandlerMapping } from './eventHandling';

declare const L: typeof import('leaflet');

export const Map = {
    createMap(
        elementId: string,
        options: L.MapOptions | undefined,
        handlerMappings?: EventHandlerMapping
    ): L.Map {
        const map = L.map(elementId, options);

        if (handlerMappings && handlerMappings.dotNetRef && handlerMappings.events) {
            const keys = Object.keys(handlerMappings.events);
            map.on('click', function (ev: L.LeafletMouseEvent) {
                var methodName = handlerMappings.events['click'];
                if (methodName) {
                    let payload = new L.LatLng(ev.latlng.lat, ev.latlng.lng);
                    handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                }
            })
        }

        return map;
    },

    setView(
        map: L.Map,
        center: L.LatLng | any,
        zoom: number,
        options: L.ZoomPanOptions | undefined
    ): void {
        map.setView(center, zoom);
    },

    panTo(map: L.Map, center: L.LatLng, options: L.PanOptions | undefined): void {
        map.panTo(center, options);
    },

    setMaxBounds(map: L.Map, bounds: L.LatLngBounds): void {
        map.setMaxBounds(bounds);
    },

    flyTo(
        map: L.Map,
        center: L.LatLng | any,
        zoom: number,
        options: L.ZoomPanOptions | undefined
    ): void {
        map.flyTo(center, zoom, options);
    },

    locate(map: L.Map, options: L.LocateOptions | undefined): void {
        map.locate(options);
    }
};

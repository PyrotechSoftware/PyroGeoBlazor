import { EventHandlerMapping } from './eventHandling';
import { LeafletEvents } from './events';

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
            if (keys.indexOf('resize') > -1) {
                map.on('resize', function (ev: L.ResizeEvent) {
                    var methodName = handlerMappings.events['resize'];
                    let payload = LeafletEvents.LeafletResizeEventArgs.fromLeaflet(ev).toDto();
                    handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                });
            }
            if (keys.indexOf('viewreset') > -1) {
                map.on('viewreset', function (ev: any) {
                    var methodName = handlerMappings.events['viewreset'];
                    let payload = LeafletEvents.LeafletEventArgs.fromLeaflet(ev).toDto();
                    handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                });
            }
            if (keys.indexOf('zoomlevelschange') > -1) {
                map.on('zoomlevelschange', function (ev: any) {
                    var methodName = handlerMappings.events['zoomlevelschange'];
                    let payload = LeafletEvents.LeafletEventArgs.fromLeaflet(ev).toDto();
                    handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                });
            }
            if (keys.indexOf('click') > -1) {
                map.on('click', function (ev: L.LeafletMouseEvent) {
                    var methodName = handlerMappings.events['click'];
                    let payload = LeafletEvents.LeafletMouseEventArgs.fromLeaflet(ev).toDto();
                    handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                });
            }
            if (keys.indexOf('dblclick') > -1) {
                map.on('dblclick', function (ev: L.LeafletMouseEvent) {
                    var methodName = handlerMappings.events['dblclick'];
                    let payload = LeafletEvents.LeafletMouseEventArgs.fromLeaflet(ev).toDto();
                    handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                });
            }
            if (keys.indexOf('contextmenu') > -1)
            {
                map.on('contextmenu', function (ev: L.LeafletMouseEvent) {
                    var methodName = handlerMappings.events['contextmenu'];
                    let payload = LeafletEvents.LeafletMouseEventArgs.fromLeaflet(ev).toDto();
                    handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                });
            }
            if (keys.indexOf('popupopen') > -1) {
                map.on('popupopen', function (ev: L.PopupEvent) {
                    var methodName = handlerMappings.events['popupopen'];
                    let payload = LeafletEvents.LeafletPopupEventArgs.fromLeaflet(ev).toDto();
                    handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                });
            }
            if (keys.indexOf('popupclose') > -1) {
                map.on('popupclose', function (ev: L.PopupEvent) {
                    var methodName = handlerMappings.events['popupclose'];
                    let payload = LeafletEvents.LeafletPopupEventArgs.fromLeaflet(ev).toDto();
                    handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                });
            }
            if (keys.indexOf('locationerror') > -1) {
                map.on('locationerror', function (ev: L.ErrorEvent) {
                    var methodName = handlerMappings.events['locationerror'];
                    let payload = LeafletEvents.LeafletErrorEventArgs.fromLeaflet(ev).toDto();
                    handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                });
            }
            if (keys.indexOf('locationfound') > -1) {
                map.on('locationfound', function (ev: L.LocationEvent) {
                    var methodName = handlerMappings.events['locationfound'];
                    let payload = LeafletEvents.LeafletLocationEventArgs.fromLeaflet(ev).toDto();
                    console.log('payload', payload);
                    console.log('json', JSON.stringify(payload));
                    handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                });
            }
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

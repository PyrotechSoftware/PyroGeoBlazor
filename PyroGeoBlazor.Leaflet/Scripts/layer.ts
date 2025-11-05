declare const L: typeof import('leaflet');

import { EventHandlerMapping } from './eventHandling';
import { LeafletEvents } from './events';

export const Layer = {
    addTo(layer: L.Layer, map: L.Map, handlerMappings?: EventHandlerMapping): void {
        if (handlerMappings && handlerMappings.dotNetRef && handlerMappings.events) {
            const keys = Object.keys(handlerMappings.events);
            if (keys.indexOf('add') > -1) {
                layer.on('add', function (ev: any) {
                    var methodName = handlerMappings.events['add'];
                    try {
                        let payload = LeafletEvents.LeafletEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error('Error invoking add handler:', e);
                    }
                });
            }
            if (keys.indexOf('remove') > -1) {
                layer.on('remove', function (ev: any) {
                    var methodName = handlerMappings.events['remove'];
                    try {
                        let payload = LeafletEvents.LeafletEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error('Error invoking remove handler:', e);
                    }
                });
            }
            if (keys.indexOf('popupopen') > -1) {
                layer.on('popupopen', function (ev: L.PopupEvent) {
                    var methodName = handlerMappings.events['popupopen'];
                    try {
                        let payload = LeafletEvents.LeafletPopupEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error('Error invoking popupopen handler:', e);
                    }
                });
            }
            if (keys.indexOf('popupclose') > -1) {
                layer.on('popupclose', function (ev: L.PopupEvent) {
                    var methodName = handlerMappings.events['popupclose'];
                    try {
                        let payload = LeafletEvents.LeafletPopupEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error('Error invoking popupclose handler:', e);
                    }
                });
            }
            if (keys.indexOf('tooltipopen') > -1) {
                layer.on('tooltipopen', function (ev: L.TooltipEvent) {
                    var methodName = handlerMappings.events['tooltipopen'];
                    try {
                        let payload = LeafletEvents.LeafletTooltipEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error('Error invoking tooltipopen handler:', e);
                    }
                });
            }
            if (keys.indexOf('tooltipclose') > -1) {
                layer.on('tooltipclose', function (ev: L.TooltipEvent) {
                    var methodName = handlerMappings.events['tooltipclose'];
                    try {
                        let payload = LeafletEvents.LeafletTooltipEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error('Error invoking tooltipclose handler:', e);
                    }
                });
            }
        }

        layer.addTo(map);
    },

    remove(layer: L.Layer): void {
        layer.remove();
    }
};

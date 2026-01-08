declare const L: typeof import('leaflet');

import { EventHandlerMapping } from './eventHandling';
import { LeafletEvents } from './events';

export const LayerGroup = {
    createLayerGroup(
        layers: L.Layer[] = [],
        options?: L.LayerOptions,
        handlerMappings?: EventHandlerMapping
    ): L.LayerGroup {
        const layerGroup = L.layerGroup(layers, options);
        // Attach event handlers if any
        if (handlerMappings && handlerMappings.dotNetRef && handlerMappings.events) {
            const keys = Object.keys(handlerMappings.events);

            // Mouse Events from Interactive Layer
            if (keys.indexOf('click') > -1) {
                layerGroup.on('click', function (ev: any) {
                    var methodName = handlerMappings.events['click'];
                    try {
                        let payload = LeafletEvents.LeafletEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error('Error invoking click handler:', e);
                    }
                });
            }
            if (keys.indexOf('dblclick') > -1) {
                layerGroup.on('dblclick', function (ev: any) {
                    var methodName = handlerMappings.events['dblclick'];
                    try {
                        let payload = LeafletEvents.LeafletEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error('Error invoking dblclick handler:', e);
                    }
                });
            }
            if (keys.indexOf('mousedown') > -1) {
                layerGroup.on('mousedown', function (ev: any) {
                    var methodName = handlerMappings.events['mousedown'];
                    try {
                        let payload = LeafletEvents.LeafletEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error('Error invoking mousedown handler:', e);
                    }
                });
            }
            if (keys.indexOf('mouseup') > -1) {
                layerGroup.on('mouseup', function (ev: any) {
                    var methodName = handlerMappings.events['mouseup'];
                    try {
                        let payload = LeafletEvents.LeafletEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error('Error invoking mouseup handler:', e);
                    }
                });
            }
            if (keys.indexOf('mouseover') > -1) {
                layerGroup.on('mouseover', function (ev: any) {
                    var methodName = handlerMappings.events['mouseover'];
                    try {
                        let payload = LeafletEvents.LeafletEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error('Error invoking mouseover handler:', e);
                    }
                });
            }
            if (keys.indexOf('mouseout') > -1) {
                layerGroup.on('mouseout', function (ev: any) {
                    var methodName = handlerMappings.events['mouseout'];
                    try {
                        let payload = LeafletEvents.LeafletEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error('Error invoking mouseout handler:', e);
                    }
                });
            }
            if (keys.indexOf('contextmenu') > -1) {
                layerGroup.on('contextmenu', function (ev: any) {
                    var methodName = handlerMappings.events['contextmenu'];
                    try {
                        let payload = LeafletEvents.LeafletEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error('Error invoking contextmenu handler:', e);
                    }
                });
            }
            // Events from Layer
            if (keys.indexOf('add') > -1) {
                layerGroup.on('add', function (ev: any) {
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
                layerGroup.on('remove', function (ev: any) {
                    var methodName = handlerMappings.events['remove'];
                    try {
                        let payload = LeafletEvents.LeafletEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error('Error invoking remove handler:', e);
                    }
                });
            }
            // Popup and Tooltip Events from Layer
            if (keys.indexOf('popupopen') > -1) {
                layerGroup.on('popupopen', function (ev: L.PopupEvent) {
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
                layerGroup.on('popupclose', function (ev: L.PopupEvent) {
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
                layerGroup.on('tooltipopen', function (ev: L.TooltipEvent) {
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
                layerGroup.on('tooltipclose', function (ev: L.TooltipEvent) {
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
        return layerGroup;
    }
};

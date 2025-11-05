declare const L: typeof import('leaflet');

import { EventHandlerMapping } from './eventHandling';
import { LeafletEvents } from './events';

export const WmsTileLayer = {
    createWmsTileLayer(
        baseUrl: string,
        options?: L.WMSOptions,
        handlerMappings?: EventHandlerMapping
    ): L.TileLayer.WMS {
        const wmsTileLayer = L.tileLayer.wms(baseUrl, options);
        // Attach event handlers if any
        if (handlerMappings && handlerMappings.dotNetRef && handlerMappings.events) {
            const keys = Object.keys(handlerMappings.events);
            if (keys.indexOf('tileabort') > -1) {
                wmsTileLayer.on('tileabort', function (ev: L.TileEvent) {
                    var methodName = handlerMappings.events['tileabort'];
                    try {
                        let payload = LeafletEvents.LeafletTileEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error('Error invoking tileabort handler:', e);
                    }
                });
            }
            if (keys.indexOf('loading') > -1) {
                wmsTileLayer.on('loading', function (ev: any) {
                    var methodName = handlerMappings.events['loading'];
                    try {
                        let payload = LeafletEvents.LeafletEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error('Error invoking loading handler:', e);
                    }
                });
            }
            if (keys.indexOf('tileunload') > -1) {
                wmsTileLayer.on('tileunload', function (ev: L.TileEvent) {
                    var methodName = handlerMappings.events['tileunload'];
                    try {
                        let payload = LeafletEvents.LeafletTileEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error('Error invoking tileunload handler:', e);
                    }
                });
            }
            if (keys.indexOf('tileloadstart') > -1) {
                wmsTileLayer.on('tileloadstart', function (ev: L.TileEvent) {
                    var methodName = handlerMappings.events['tileloadstart'];
                    try {
                        let payload = LeafletEvents.LeafletTileEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error('Error invoking tileloadstart handler:', e);
                    }
                });
            }
            if (keys.indexOf('tileerror') > -1) {
                wmsTileLayer.on('tileerror', function (ev: L.TileErrorEvent) {
                    var methodName = handlerMappings.events['tileerror'];
                    try {
                        let payload = LeafletEvents.LeafletTileErrorEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error('Error invoking tileerror handler:', e);
                    }
                });
            }
            if (keys.indexOf('tileload') > -1) {
                wmsTileLayer.on('tileload', function (ev: L.TileEvent) {
                    var methodName = handlerMappings.events['tileload'];
                    try {
                        let payload = LeafletEvents.LeafletTileEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error('Error invoking tileload handler:', e);
                    }
                });
            }
            if (keys.indexOf('load') > -1) {
                wmsTileLayer.on('load', function (ev: any) {
                    var methodName = handlerMappings.events['load'];
                    try {
                        let payload = LeafletEvents.LeafletEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error('Error invoking load handler:', e);
                    }
                });
            }
            if (keys.indexOf('add') > -1) {
                wmsTileLayer.on('add', function (ev: any) {
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
                wmsTileLayer.on('remove', function (ev: any) {
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
                wmsTileLayer.on('popupopen', function (ev: L.PopupEvent) {
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
                wmsTileLayer.on('popupclose', function (ev: L.PopupEvent) {
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
                wmsTileLayer.on('tooltipopen', function (ev: L.TooltipEvent) {
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
                wmsTileLayer.on('tooltipclose', function (ev: L.TooltipEvent) {
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

        return wmsTileLayer;
    }
};

declare const L: typeof import('leaflet');

import { EventHandlerMapping } from './eventHandling';
import { LeafletEvents } from './events';

export const GridLayer = {
    createGridLayer(
        options?: L.GridLayerOptions,
        handlerMappings?: EventHandlerMapping
    ): L.GridLayer {
        const gridLayer = L.gridLayer();
        // Attach event handlers if any
        if (handlerMappings && handlerMappings.dotNetRef && handlerMappings.events) {
            const keys = Object.keys(handlerMappings.events);

            if (keys.indexOf('loading') > -1) {
                gridLayer.on('loading', function (ev: any) {
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
                gridLayer.on('tileunload', function (ev: L.TileEvent) {
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
                gridLayer.on('tileloadstart', function (ev: L.TileEvent) {
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
                gridLayer.on('tileerror', function (ev: L.TileErrorEvent) {
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
                gridLayer.on('tileload', function (ev: L.TileEvent) {
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
                gridLayer.on('load', function (ev: any) {
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
                gridLayer.on('add', function (ev: any) {
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
                gridLayer.on('remove', function (ev: any) {
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
                gridLayer.on('popupopen', function (ev: L.PopupEvent) {
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
                gridLayer.on('popupclose', function (ev: L.PopupEvent) {
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
                gridLayer.on('tooltipopen', function (ev: L.TooltipEvent) {
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
                gridLayer.on('tooltipclose', function (ev: L.TooltipEvent) {
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

        return gridLayer;
    }
};

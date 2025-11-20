declare const L: typeof import('leaflet-vectortile-mapbox');

import { EventHandlerMapping } from './eventHandling';
import { LeafletEvents } from './events';

export const MapboxVectorTileLayer = {
    createMvtLayer(
        urlTemplate: string,
        options?: any,
        handlerMappings?: EventHandlerMapping
    ): any {
        const mvt = L.mapboxVectorTileLayer(urlTemplate, options);

        // Attach event handlers if any
        if (handlerMappings && handlerMappings.dotNetRef && handlerMappings.events) {
            const keys = Object.keys(handlerMappings.events);

            if (keys.indexOf('featureselected') > -1) {
                try {
                    mvt.on('featureselected', (e: any) => {
                        var methodName = handlerMappings.events['featureselected'];
                        let payload = LeafletEvents.LeafletFeatureMouseEventArgs.fromLeaflet(e).toDto();
                        handlerMappings.dotNetRef.invokeMethodAsync(methodName, payload);
                    });
                } catch (e) {
                    console.error('Error invoking featureselected handler:', e);
                }
            }
            if (keys.indexOf('featureunselected') > -1) {
                try {
                    mvt.on('featureunselected', (e: any) => {
                        var methodName = handlerMappings.events['featureunselected'];
                        let payload = LeafletEvents.LeafletFeatureMouseEventArgs.fromLeaflet(e).toDto();
                        handlerMappings.dotNetRef.invokeMethodAsync(methodName, payload);
                    });
                } catch (e) {
                    console.error('Error invoking featureunselected handler:', e);
                }
            }
            if (keys.indexOf('featureclick') > -1) {
                try {
                    mvt.on('featureclick', (e: any) => {
                        var methodName = handlerMappings.events['featureclick'];
                        let payload = LeafletEvents.LeafletFeatureMouseEventArgs.fromLeaflet(e).toDto();
                        handlerMappings.dotNetRef.invokeMethodAsync(methodName, payload);
                    });
                } catch (e) {
                    console.error('Error invoking featureclick handler:', e);
                }
            }
            if (keys.indexOf('featuredblclick') > -1) {
                try {
                    mvt.on('featuredblclick', (e: any) => {
                        var methodName = handlerMappings.events['featuredblclick'];
                        let payload = LeafletEvents.LeafletFeatureMouseEventArgs.fromLeaflet(e).toDto();
                        handlerMappings.dotNetRef.invokeMethodAsync(methodName, payload);
                    });
                } catch (e) {
                    console.error('Error invoking featuredblclick handler:', e);
                }
            }
            if (keys.indexOf('featurecontextmenu') > -1) {
                try {
                    mvt.on('featurecontextmenu', (e: any) => {
                        var methodName = handlerMappings.events['featurecontextmenu'];
                        let payload = LeafletEvents.LeafletFeatureMouseEventArgs.fromLeaflet(e).toDto();
                        handlerMappings.dotNetRef.invokeMethodAsync(methodName, payload);
                    });
                } catch (e) {
                    console.error('Error invoking featurecontextmenu handler:', e);
                }
            }
            if (keys.indexOf('featuremouseover') > -1) {
                try {
                    mvt.on('featuremouseover', (e: any) => {
                        var methodName = handlerMappings.events['featuremouseover'];
                        let payload = LeafletEvents.LeafletFeatureMouseEventArgs.fromLeaflet(e).toDto();
                        handlerMappings.dotNetRef.invokeMethodAsync(methodName, payload);
                    });
                } catch (e) {
                    console.error('Error invoking featuremouseover handler:', e);
                }
            }
            if (keys.indexOf('featuremouseout') > -1) {
                try {
                    mvt.on('featuremouseout', (e: any) => {
                        var methodName = handlerMappings.events['featuremouseout'];
                        let payload = LeafletEvents.LeafletFeatureMouseEventArgs.fromLeaflet(e).toDto();
                        handlerMappings.dotNetRef.invokeMethodAsync(methodName, payload);
                    });
                } catch (e) {
                    console.error('Error invoking featuremouseout handler:', e);
                }
            }
            if (keys.indexOf('tilefetcherror') > -1) {
                try {
                    mvt.on('tilefetcherror', (e: any) => {
                        var methodName = handlerMappings.events['tilefetcherror'];
                        let payload = LeafletEvents.LeafletTileFetchErrorEventArgs.fromLeaflet(e).toDto();
                        handlerMappings.dotNetRef.invokeMethodAsync(methodName, payload);
                    });
                } catch (e) {
                    console.error('Error invoking tilefetcherror handler:', e);
                }
            }

            // Events from GridLayer base class
            if (keys.indexOf('loading') > -1) {
                mvt.on('loading', function (ev: any) {
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
                mvt.on('tileunload', function (ev: L.TileEvent) {
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
                mvt.on('tileloadstart', function (ev: L.TileEvent) {
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
                mvt.on('tileerror', function (ev: L.TileErrorEvent) {
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
                mvt.on('tileload', function (ev: L.TileEvent) {
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
                mvt.on('load', function (ev: any) {
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
                mvt.on('add', function (ev: any) {
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
                mvt.on('remove', function (ev: any) {
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
                mvt.on('popupopen', function (ev: L.PopupEvent) {
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
                mvt.on('popupclose', function (ev: L.PopupEvent) {
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
                mvt.on('tooltipopen', function (ev: L.TooltipEvent) {
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
                mvt.on('tooltipclose', function (ev: L.TooltipEvent) {
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

        return mvt;
    }
};

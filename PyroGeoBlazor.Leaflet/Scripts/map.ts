import { EventHandlerMapping } from './eventHandling';
import { LeafletEvents } from './events';

declare const L: typeof import('leaflet');

export const Map = {
    createMap(
        elementId: string,
        options: L.MapOptions | undefined,
        handlerMappings?: EventHandlerMapping
    ): any {
        const map = L.map(elementId, options);

        if (handlerMappings && handlerMappings.dotNetRef && handlerMappings.events) {
            const keys = Object.keys(handlerMappings.events);
            if (keys.indexOf('layeradd') > -1) {
                map.on('layeradd', function (ev: any) {
                    var methodName = handlerMappings.events['layeradd'];
                    try {
                        let payload = LeafletEvents.LeafletLayerEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error('Error invoking layeradd handler:', e);
                    }
                });
            }
            if (keys.indexOf('layerremove') > -1) {
                map.on('layerremove', function (ev: any) {
                    var methodName = handlerMappings.events['layerremove'];
                    try {
                        let payload = LeafletEvents.LeafletLayerEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error('Error invoking layerremove handler:', e);
                    }
                });
            }
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
            if (keys.indexOf('zoomend') > -1) {
                map.on('zoomend', function (ev: any) {
                    var methodName = handlerMappings.events['zoomend'];
                    let payload = LeafletEvents.LeafletEventArgs.fromLeaflet(ev).toDto();
                    handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                });
            }
            if (keys.indexOf('moveend') > -1) {
                map.on('moveend', function (ev: any) {
                    var methodName = handlerMappings.events['moveend'];
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
                    handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                });
            }
        }

        // Create a wrapper object that properly serializes getBounds()
        const mapWrapper = Object.create(map);
        
        // Override getBounds to return a properly formatted object for C# serialization
        mapWrapper.getBounds = function() {
            const bounds = map.getBounds();
            const sw = bounds.getSouthWest();
            const ne = bounds.getNorthEast();
            
            return {
                SouthWest: {
                    Lat: sw.lat,
                    Lng: sw.lng
                },
                NorthEast: {
                    Lat: ne.lat,
                    Lng: ne.lng
                }
            };
        };
        mapWrapper.setPaneZIndex = function(mapRef: any, paneName: string, zIndex: number) {
            try {
                if (!mapRef || !paneName) return;
                const pane = mapRef.getPane ? mapRef.getPane(paneName) : null;
                if (!pane) return;
                if (pane.style) {
                    pane.style.zIndex = String(zIndex);
                }
            }
            catch (e) {
                console.error('Error setting pane zIndex:', e);
            }
        };

        mapWrapper.getLeafletId = function(layerRef: any) {
            try {
                if (!layerRef) return null;
                return (layerRef as any)._leaflet_id ?? null;
            }
            catch (e) {
                console.error('Error getting leaflet id:', e);
                return null;
            }
        };

        mapWrapper.moveLayerToIndex = function(mapRef: any, layerRef: any, index: number) {
            try {
                const map = mapRef as any;
                const target = layerRef as any;
                if (!map || !target) return;

                // Collect current layers in insertion order
                const layers: any[] = [];
                map.eachLayer(function (l: any) { layers.push(l); });

                const currentIndex = layers.indexOf(target);
                if (currentIndex === -1) return;

                // Remove target from list and insert at new index
                layers.splice(currentIndex, 1);
                const boundedIndex = Math.max(0, Math.min(index, layers.length));
                layers.splice(boundedIndex, 0, target);

                // Remove all layers from map then re-add in new order
                for (const l of layers) {
                    try { map.removeLayer(l); } catch (e) { /* ignore */ }
                }
                for (const l of layers) {
                    try { l.addTo(map); } catch (e) { /* ignore */ }
                }
            }
            catch (e) {
                console.error('Error moving layer to index:', e);
            }
        };

        // Guarded fitBounds that accepts several input formats from .NET and normalizes them
        function coerceNumber(v: any): number {
            if (typeof v === 'number') return v;
            if (typeof v === 'string') {
                // Normalize decimal separator to dot to avoid localization issues
                const normalized = v.replace(',', '.');
                const n = parseFloat(normalized);
                if (!isNaN(n)) return n;
            }
            return NaN;
        }

        function coerceLatLng(obj: any) {
            if (!obj) return null;
            if (Array.isArray(obj) && obj.length >= 2) {
                const lat = coerceNumber(obj[0]);
                const lng = coerceNumber(obj[1]);
                return !isNaN(lat) && !isNaN(lng) ? { lat, lng } : null;
            }
            // Expect object with Lat/Lng or lat/lng
            const rawLat = obj.Lat ?? obj.lat ?? obj[1];
            const rawLng = obj.Lng ?? obj.lng ?? obj[0];
            const lat = coerceNumber(rawLat);
            const lng = coerceNumber(rawLng);
            return !isNaN(lat) && !isNaN(lng) ? { lat, lng } : null;
        }

        mapWrapper.fitBounds = function(boundsArg: any, options?: any) {
            try {
                let boundsToUse: any = null;
                // Support arrays [[swLat, swLng],[neLat, neLng]]
                if (Array.isArray(boundsArg) && boundsArg.length === 2 && Array.isArray(boundsArg[0])) {
                    boundsToUse = boundsArg;
                }
                // Support object { SouthWest: {...}, NorthEast: {...} }
                else if (boundsArg && (boundsArg.SouthWest || boundsArg.southWest) && (boundsArg.NorthEast || boundsArg.northEast)) {
                    const sw = coerceLatLng(boundsArg.SouthWest || boundsArg.southWest);
                    const ne = coerceLatLng(boundsArg.NorthEast || boundsArg.northEast);
                    if (sw && ne) boundsToUse = [[sw.lat, sw.lng],[ne.lat, ne.lng]];
                }
                // Support object { south: ..., west: ..., north: ..., east: ... }
                else if (boundsArg && (boundsArg.south !== undefined || boundsArg.north !== undefined)) {
                    const sw = { lat: coerceNumber(boundsArg.south ?? boundsArg.South), lng: coerceNumber(boundsArg.west ?? boundsArg.West) };
                    const ne = { lat: coerceNumber(boundsArg.north ?? boundsArg.North), lng: coerceNumber(boundsArg.east ?? boundsArg.East) };
                    if (!isNaN(sw.lat) && !isNaN(sw.lng) && !isNaN(ne.lat) && !isNaN(ne.lng)) boundsToUse = [[sw.lat, sw.lng],[ne.lat, ne.lng]];
                }

                if (!boundsToUse) {
                    // Fallback: try passing through and let Leaflet throw a useful error
                    if (options) return (map as any).fitBounds(boundsArg, options);
                    return (map as any).fitBounds(boundsArg);
                }

                // If bounds degenerate (same point) expand slightly
                const swLat = coerceNumber(boundsToUse[0][0]);
                const swLng = coerceNumber(boundsToUse[0][1]);
                const neLat = coerceNumber(boundsToUse[1][0]);
                const neLng = coerceNumber(boundsToUse[1][1]);
                if (swLat === neLat && swLng === neLng) {
                    const delta = 0.0001; // small expansion
                    boundsToUse = [[swLat - delta, swLng - delta], [neLat + delta, neLng + delta]];
                }

                if (options) return (map as any).fitBounds(boundsToUse, options);
                return (map as any).fitBounds(boundsToUse);
            }
            catch (e) {
                // console.error suppressed in production
                throw e;
            }
        };

        // Mirror flyToBounds with same guarding
        mapWrapper.flyToBounds = function(boundsArg: any, options?: any) {
            try {
                if ((mapWrapper as any).fitBounds) {
                    // fitBounds handles normalization and expansion; flyToBounds can delegate to it then animate
                    // But to preserve native behavior call flyToBounds with normalized bounds array
                    let boundsToUse: any = null;
                    if (Array.isArray(boundsArg) && boundsArg.length === 2 && Array.isArray(boundsArg[0])) {
                        boundsToUse = boundsArg;
                    } else if (boundsArg && (boundsArg.SouthWest || boundsArg.southWest) && (boundsArg.NorthEast || boundsArg.northEast)) {
                        const sw = coerceLatLng(boundsArg.SouthWest || boundsArg.southWest);
                        const ne = coerceLatLng(boundsArg.NorthEast || boundsArg.northEast);
                        if (sw && ne) boundsToUse = [[sw.lat, sw.lng],[ne.lat, ne.lng]];
                    }

                    if (!boundsToUse) return (map as any).flyToBounds(boundsArg, options);

                    const swLat = coerceNumber(boundsToUse[0][0]);
                    const swLng = coerceNumber(boundsToUse[0][1]);
                    const neLat = coerceNumber(boundsToUse[1][0]);
                    const neLng = coerceNumber(boundsToUse[1][1]);
                    if (swLat === neLat && swLng === neLng) {
                        const delta = 0.0001;
                        boundsToUse = [[swLat - delta, swLng - delta], [neLat + delta, neLng + delta]];
                    }

                    return (map as any).flyToBounds(boundsToUse, options);
                }
                return (map as any).flyToBounds(boundsArg, options);
            }
            catch (e) {
                console.error('Error in flyToBounds guard:', e);
                throw e;
            }
        };

        return mapWrapper;
    }
    ,
    setPaneZIndex(mapRef: any, paneName: string, zIndex: number) {
        try {
            if (!mapRef || !paneName) return;
            const pane = mapRef.getPane ? mapRef.getPane(paneName) : null;
            if (!pane) return;
            if (pane.style) {
                pane.style.zIndex = String(zIndex);
            }
        }
        catch (e) {
            console.error('Error setting pane zIndex:', e);
        }
    }
};


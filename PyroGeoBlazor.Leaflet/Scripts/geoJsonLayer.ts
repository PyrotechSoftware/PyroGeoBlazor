declare const L: typeof import('leaflet');

import { EventHandlerMapping } from './eventHandling';
import { LeafletEvents } from './events';

export const GeoJsonLayer = {
    createGeoJsonLayer(
        geoJsonData: any,
        options?: any,
        handlerMappings?: EventHandlerMapping
    ): L.GeoJSON {
        // Build Leaflet GeoJSON options
        const leafletOptions: L.GeoJSONOptions = {
            markersInheritOptions: options?.markersInheritOptions ?? false
        };

        // Map onEachFeature callback (no return value)
        if (options?.interop && options.onEachFeatureEnabled) {
            leafletOptions.onEachFeature = function (feature, layer) {
                const layerInfo = LeafletEvents.minimalLayerInfo(layer);
                options.interop.invokeMethodAsync('OnEachFeature', feature, layerInfo);
            };
        }

        // Map pointToLayer callback (returns Layer/Marker)
        if (options?.interop && options.pointToLayerEnabled) {
            leafletOptions.pointToLayer = function (feature, latlng) {
                // TODO: Make this properly async and await the result
                // For now, return default marker and invoke callback
                options.interop.invokeMethodAsync('PointToLayer', feature, latlng)
                    .then((result: any) => {
                        // Result contains marker options from C#
                        // We could potentially update the marker here
                        console.log('PointToLayer result:', result);
                    });
                return L.marker(latlng);
            };
        }

        // Map style callback (returns PathOptions/Style)
        if (options?.interop && options.styleEnabled) {
            // Create a Map to store precomputed styles keyed by feature
            const styleCache = new Map<any, any>();
            
            leafletOptions.style = function (feature) {
                // Return precomputed style from cache if available
                if (styleCache.has(feature)) {
                    return styleCache.get(feature);
                }
                // Fallback to empty style if not in cache (shouldn't happen if precomputeStylesAsync ran)
                return {};
            };
            
            // Store the cache reference so precomputeStylesAsync can access it
            (leafletOptions as any).styleCache = styleCache;
        }

        // Map filter callback (returns boolean)
        // Note: Filter is handled in addData wrapper to support async callbacks
        // Leaflet's filter must be synchronous, so we pre-filter the data before passing to Leaflet
        // This is also more efficient as it avoids adding unwanted features to the layer

        // Map coordsToLatLng callback (returns LatLng)
        if (options?.interop && options.coordsToLatLngEnabled) {
            leafletOptions.coordsToLatLng = function (coords) {
                // Leaflet expects synchronous return
                // Return default and invoke async callback
                let latlng = L.latLng(coords[1], coords[0], coords[2]);
                options.interop.invokeMethodAsync('CoordsToLatLng', coords)
                    .then((result: any) => {
                        if (result) {
                            latlng = L.latLng(result.lat, result.lng, result.alt);
                        }
                    });
                return latlng;
            };
        }

        const geoJsonLayer = L.geoJSON(geoJsonData, leafletOptions);

        // Store selection state
        // For single selection mode
        let selectedLayer: any = null;
        let originalStyle: any = null;
        
        // For multiple selection mode
        const selectedLayers: Map<any, any> = new Map(); // Map of layer -> original style

        // Helper function to create a lightweight version of a feature for C# callbacks
        // This strips geometry coordinates from large features to avoid serialization issues
        // while preserving properties and metadata needed for filtering/styling
        function createCallbackFeature(feature: any, sizeThreshold: number = 50000, debug: boolean = false): any {
            if (!feature) {
                return feature;
            }
            
            try {
                const featureJson = JSON.stringify(feature);
                
                if (debug) {
                    console.log(`Feature size: ${featureJson.length} characters`);
                }
                
                // If feature is small enough, return as-is
                if (featureJson.length <= sizeThreshold) {
                    return feature;
                }
                
                // Feature is large, create lightweight version
                if (debug) {
                    console.warn(`Feature is large (${featureJson.length} chars), creating lightweight version`);
                }
                
                const lightweightFeature = {
                    type: feature.type,
                    id: feature.id,
                    properties: feature.properties,
                    geometry: feature.geometry ? {
                        type: feature.geometry.type
                        // Coordinates omitted to reduce size
                    } : undefined
                };
                
                if (debug) {
                    const lightweightSize = JSON.stringify(lightweightFeature).length;
                    console.log(`Lightweight feature size: ${lightweightSize} characters (reduced by ${featureJson.length - lightweightSize})`);
                }
                
                return lightweightFeature;
            } catch (error) {
                console.error('Error creating callback feature:', error);
                // On error, return original feature and let caller handle any issues
                return feature;
            }
        }
        
        // Expose the helper function on the layer instance for future use
        // This allows it to be called from outside (e.g., in setStyle, custom methods)
        (geoJsonLayer as any).createCallbackFeature = createCallbackFeature;

        // Wrap the addData method to handle async callbacks and filtering
        const originalAddData = geoJsonLayer.addData.bind(geoJsonLayer);
        (geoJsonLayer as any).addData = async function(data: any) {
            let processedData = data;
            
            // Handle async filtering before adding data
            if (options?.interop && options.filterEnabled) {
                try {
                    if (options.debugLogging) {
                        console.log('Starting async filtering...');
                    }
                    processedData = await filterGeoJsonAsync(data, options.interop, options.debugLogging);
                    if (options.debugLogging) {
                        console.log('Filtering complete, processed data:', processedData);
                    }
                } catch (error) {
                    console.error('Error during filtering:', error);
                    throw error;
                }
            }
            
            // Handle async styling before adding data
            if (options?.interop && options.styleEnabled) {
                try {
                    if (options.debugLogging) {
                        console.log('Starting async styling...');
                    }
                    await precomputeStylesAsync(processedData, options.interop, options.debugLogging);
                    if (options.debugLogging) {
                        console.log('Styling complete');
                    }
                } catch (error) {
                    console.error('Error during styling:', error);
                    throw error;
                }
            }
            
            const promises: Promise<any>[] = [];
            
            // Wrap onEachFeature (only this one collects promises as it's void)
            const originalOnEachFeature = (geoJsonLayer as any).options.onEachFeature;
            if (originalOnEachFeature && options?.interop && options.onEachFeatureEnabled) {
                (geoJsonLayer as any).options.onEachFeature = function(feature: any, layer: any) {
                    const layerInfo = LeafletEvents.minimalLayerInfo(layer);
                    const promise = options.interop.invokeMethodAsync('OnEachFeature', feature, layerInfo);
                    promises.push(promise);
                };
            }
            
            // Call the original addData with potentially filtered data
            if (options?.debugLogging) {
                console.log('Calling Leaflet addData with:', processedData);
            }
            originalAddData(processedData);
            
            // Restore original onEachFeature
            if (originalOnEachFeature) {
                (geoJsonLayer as any).options.onEachFeature = originalOnEachFeature;
            }
            
            // Wait for all onEachFeature callbacks to complete
            if (promises.length > 0) {
                await Promise.all(promises);
            }
            
            return geoJsonLayer;
        };
        
        // Helper function to filter GeoJSON asynchronously
        async function filterGeoJsonAsync(data: any, interop: any, debug: boolean = false): Promise<any> {
            try {
                if (!data) {
                    if (debug) {
                        console.log('Filter: data is null or undefined, returning as-is');
                    }
                    return data;
                }
                
                if (debug) {
                    console.log('Filtering GeoJSON data, type:', data.type, 'data:', JSON.stringify(data).substring(0, 200));
                }
                
                // Handle single Feature
                if (data.type === 'Feature') {
                    if (debug) {
                        console.log('Filtering single feature:', data.id || 'no-id');
                    }
                    
                    // Create lightweight version for callback if needed
                    const featureToFilter = createCallbackFeature(data, 50000, debug);
                    
                    const shouldInclude = await interop.invokeMethodAsync('Filter', featureToFilter, null);
                    if (debug) {
                        console.log('Filter result for feature:', shouldInclude);
                    }
                    
                    if (!shouldInclude) {
                        // Return an empty FeatureCollection instead of null
                        return { type: 'FeatureCollection', features: [] };
                    }
                    return data;
                }
                
                // Handle FeatureCollection
                if (data.type === 'FeatureCollection') {
                    if (!data.features) {
                        if (debug) {
                            console.log('FeatureCollection has no features property, returning empty collection');
                        }
                        return { type: 'FeatureCollection', features: [] };
                    }
                    
                    if (!Array.isArray(data.features)) {
                        console.error('FeatureCollection.features is not an array:', typeof data.features);
                        return { type: 'FeatureCollection', features: [] };
                    }
                    
                    if (debug) {
                        console.log(`Filtering FeatureCollection with ${data.features.length} features`);
                    }
                    
                    if (data.features.length === 0) {
                        if (debug) {
                            console.log('FeatureCollection is empty, returning as-is');
                        }
                        return data;
                    }
                    
                    // Call filter for each feature and collect results
                    const filterResults: boolean[] = [];
                    for (let idx = 0; idx < data.features.length; idx++) {
                        const feature = data.features[idx];
                        try {
                            if (debug) {
                                console.log(`Calling filter for feature ${idx}:`, feature?.id || feature?.properties?.id || 'no-id', 'type:', feature?.geometry?.type);
                            }
                            

                            // Create lightweight version for callback if needed
                            const featureToFilter = createCallbackFeature(feature, 50000, debug);
                            

                            const result = await interop.invokeMethodAsync('Filter', featureToFilter, null);
                            if (debug) {
                                console.log(`Filter result for feature ${idx}:`, result);
                            }
                            filterResults.push(result === true); // Ensure boolean
                        } catch (error) {
                            console.error(`Error filtering feature ${idx}:`, error);
                            console.error(`Feature ${idx} type:`, feature?.geometry?.type);
                            console.error(`Feature ${idx} id:`, feature?.id);
                            // Try to show first part of the feature
                            try {
                                const featureStr = JSON.stringify(feature);
                                console.error(`Feature ${idx} size:`, featureStr.length, 'chars');
                                console.error(`Feature ${idx} preview:`, featureStr.substring(0, 500));
                            } catch (e) {
                                console.error('Could not stringify feature');
                            }
                            // Default to true (include) if filter fails - safer than excluding
                            filterResults.push(true);
                        }
                    }
                    
                    if (debug) {
                        console.log('All filter results:', filterResults);
                    }
                    
                    const filteredFeatures = data.features.filter((_: any, index: number) => filterResults[index]);
                    if (debug) {
                        console.log(`Filtered from ${data.features.length} to ${filteredFeatures.length} features`);
                    }
                    
                    return {
                        ...data,
                        features: filteredFeatures
                    };
                }
                
                // Handle GeometryCollection or other types - return as is
                if (debug) {
                    console.log('Unknown or unsupported GeoJSON type:', data.type, 'returning as-is');
                }
                return data;
                
            } catch (error) {
                console.error('Exception in filterGeoJsonAsync:', error);
                console.error('Data that caused error:', data);
                throw error;
            }
        }
        
        // Helper function to precompute styles for all features asynchronously
        async function precomputeStylesAsync(data: any, interop: any, debug: boolean = false): Promise<void> {
            try {
                if (!data) {
                    return;
                }
                
                const styleCache = (leafletOptions as any).styleCache;
                if (!styleCache) {
                    if (debug) {
                        console.log('No style cache found, skipping style precomputation');
                    }
                    return;
                }
                
                if (debug) {
                    console.log('Precomputing styles for GeoJSON data, type:', data.type);
                }
                
                // Handle single Feature
                if (data.type === 'Feature') {
                    if (debug) {
                        console.log('Computing style for single feature:', data.id || 'no-id');
                    }
                    
                    // Create lightweight version for callback if needed
                    const featureToStyle = createCallbackFeature(data, 50000, debug);
                    
                    const style = await interop.invokeMethodAsync('Style', featureToStyle);
                    styleCache.set(data, style || {});
                    if (debug) {
                        console.log('Style computed:', style);
                    }
                    return;
                }
                
                // Handle FeatureCollection
                if (data.type === 'FeatureCollection' && Array.isArray(data.features)) {
                    if (debug) {
                        console.log(`Computing styles for ${data.features.length} features`);
                    }
                    
                    for (let idx = 0; idx < data.features.length; idx++) {
                        const feature = data.features[idx];
                        try {
                            if (debug) {
                                console.log(`Computing style for feature ${idx}:`, feature?.id || feature?.properties?.id || 'no-id');
                            }
                            
                            // Create lightweight version for callback if needed
                            const featureToStyle = createCallbackFeature(feature, 50000, debug);
                            
                            const style = await interop.invokeMethodAsync('Style', featureToStyle);
                            styleCache.set(feature, style || {});
                            
                            if (debug) {
                                console.log(`Style for feature ${idx}:`, style);
                            }
                        } catch (error) {
                            console.error(`Error computing style for feature ${idx}:`, error);
                            console.error(`Feature ${idx} type:`, feature?.geometry?.type);
                            console.error(`Feature ${idx} id:`, feature?.id);
                            // Try to show first part of the feature
                            try {
                                const featureStr = JSON.stringify(feature);
                                console.error(`Feature ${idx} size:`, featureStr.length, 'chars');
                                console.error(`Feature ${idx} preview:`, featureStr.substring(0, 500));
                            } catch (e) {
                                console.error('Could not stringify feature');
                            }
                            // Use default/empty style on error
                            styleCache.set(feature, {});
                        }
                    }
                    
                    if (debug) {
                        console.log(`Precomputed styles for ${styleCache.size} features`);
                    }
                }
            } catch (error) {
                console.error('Exception in precomputeStylesAsync:', error);
                throw error;
            }
        }

        // Attach event handlers if provided
        if (handlerMappings && handlerMappings.dotNetRef && handlerMappings.events) {
            const keys = Object.keys(handlerMappings.events);

            // Layer Events specific to geoJsonLayer
            if (keys.indexOf('layeradd') > -1) {
                geoJsonLayer.on('layeradd', function (ev: L.LayerEvent) {
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
                geoJsonLayer.on('layerremove', function (ev: L.LayerEvent) {
                    var methodName = handlerMappings.events['layerremove'];
                    try {
                        let payload = LeafletEvents.LeafletLayerEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error('Error invoking layerremove handler:', e);
                    }
                });
            }

            // Feature-specific click event
            if (keys.indexOf('featureclicked') > -1) {
                geoJsonLayer.on('click', function (ev: any) {
                    var methodName = handlerMappings.events['featureclicked'];
                    try {
                        // Extract feature and layer info from the event
                        const feature = ev.layer?.feature || ev.propagatedFrom?.feature;
                        const layer = ev.layer || ev.propagatedFrom;
                        
                        if (feature && layer) {
                            // Create lightweight feature for callback if needed
                            const featureToSend = (geoJsonLayer as any).createCallbackFeature(feature, 50000, false);
                            

                            const payload = {
                                ...LeafletEvents.LeafletEventArgs.fromLeaflet(ev).toDto(),
                                layer: LeafletEvents.minimalLayerInfo(layer),
                                feature: featureToSend
                            };
                            handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                        }
                    } catch (e) {
                        console.error('Error invoking featureclicked handler:', e);
                    }
                });
            }

            // Feature selection handling (enabled by default)
            if (options?.enableFeatureSelection !== false) {
                geoJsonLayer.on('click', function (ev: any) {
                    try {
                        const feature = ev.layer?.feature || ev.propagatedFrom?.feature;
                        const layer = ev.layer || ev.propagatedFrom;
                        
                        if (!feature || !layer) {
                            return;
                        }

                        // Create lightweight feature for callback
                        const featureToSend = (geoJsonLayer as any).createCallbackFeature(feature, 50000, false);
                        
                        const payload = {
                            ...LeafletEvents.LeafletEventArgs.fromLeaflet(ev).toDto(),
                            layer: LeafletEvents.minimalLayerInfo(layer),
                            feature: featureToSend
                        };

                        const multipleSelection = options?.multipleFeatureSelection === true;

                        if (multipleSelection) {
                            // Multiple selection mode
                            if (selectedLayers.has(layer)) {
                                // Unselect this feature
                                const originalStyle = selectedLayers.get(layer);
                                if (originalStyle && layer.setStyle) {
                                    layer.setStyle(originalStyle);
                                }
                                selectedLayers.delete(layer);
                                
                                // Notify C# of unselection
                                if (handlerMappings?.events['featureunselected']) {
                                    handlerMappings.dotNetRef!.invokeMethodAsync(
                                        handlerMappings.events['featureunselected'],
                                        payload
                                    );
                                }
                            } else {
                                // Select this feature
                                // Store original style
                                if (layer.options) {
                                    const originalStyle = {
                                        color: layer.options.color,
                                        weight: layer.options.weight,
                                        opacity: layer.options.opacity,
                                        fillColor: layer.options.fillColor,
                                        fillOpacity: layer.options.fillOpacity,
                                        dashArray: layer.options.dashArray
                                    };
                                    selectedLayers.set(layer, originalStyle);
                                }
                                
                                // Apply selected style (use provided or default)
                                if (layer.setStyle) {
                                    const selectionStyle = options?.selectedFeatureStyle || {
                                        color: '#3388ff',
                                        weight: 3,
                                        opacity: 1,
                                        fillOpacity: 0.5,
                                        fillColor: '#3388ff'
                                    };
                                    layer.setStyle(selectionStyle);
                                }
                                
                                // Notify C# of selection
                                if (handlerMappings?.events['featureselected']) {
                                    handlerMappings.dotNetRef!.invokeMethodAsync(
                                        handlerMappings.events['featureselected'],
                                        payload
                                    );
                                }
                            }
                        } else {
                            // Single selection mode
                            // Check if this is the currently selected layer
                            if (selectedLayer === layer) {
                                // Unselect
                                if (originalStyle && layer.setStyle) {
                                    layer.setStyle(originalStyle);
                                }
                                selectedLayer = null;
                                originalStyle = null;
                                
                                // Notify C# of unselection
                                if (handlerMappings?.events['featureunselected']) {
                                    handlerMappings.dotNetRef!.invokeMethodAsync(
                                        handlerMappings.events['featureunselected'],
                                        payload
                                    );
                                }
                            } else {
                                // Unselect previous selection if any
                                if (selectedLayer && originalStyle && selectedLayer.setStyle) {
                                    selectedLayer.setStyle(originalStyle);
                                }
                                
                                // Select new feature
                                selectedLayer = layer;
                                
                                // Store original style
                                if (layer.options) {
                                    originalStyle = {
                                        color: layer.options.color,
                                        weight: layer.options.weight,
                                        opacity: layer.options.opacity,
                                        fillColor: layer.options.fillColor,
                                        fillOpacity: layer.options.fillOpacity,
                                        dashArray: layer.options.dashArray
                                    };
                                }
                                
                                // Apply selected style (use provided or default)
                                if (layer.setStyle) {
                                    const selectionStyle = options?.selectedFeatureStyle || {
                                        color: '#3388ff',
                                        weight: 3,
                                        opacity: 1,
                                        fillOpacity: 0.5,
                                        fillColor: '#3388ff'
                                    };
                                    layer.setStyle(selectionStyle);
                                }
                                
                                // Notify C# of selection
                                if (handlerMappings?.events['featureselected']) {
                                    handlerMappings.dotNetRef!.invokeMethodAsync(
                                        handlerMappings.events['featureselected'],
                                        payload
                                    );
                                }
                            }
                        }
                    } catch (e) {
                        console.error('Error handling feature selection:', e);
                    }
                });
            }

            // Mouse Events from Interactive Layer
            if (keys.indexOf('click') > -1) {
                geoJsonLayer.on('click', function (ev: any) {
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
                geoJsonLayer.on('dblclick', function (ev: any) {
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
                geoJsonLayer.on('mousedown', function (ev: any) {
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
                geoJsonLayer.on('mouseup', function (ev: any) {
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
                geoJsonLayer.on('mouseover', function (ev: any) {
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
                geoJsonLayer.on('mouseout', function (ev: any) {
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
                geoJsonLayer.on('contextmenu', function (ev: any) {
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
                geoJsonLayer.on('add', function (ev: any) {
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
                geoJsonLayer.on('remove', function (ev: any) {
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
                geoJsonLayer.on('popupopen', function (ev: L.PopupEvent) {
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
                geoJsonLayer.on('popupclose', function (ev: L.PopupEvent) {
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
                geoJsonLayer.on('tooltipopen', function (ev: L.TooltipEvent) {
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
                geoJsonLayer.on('tooltipclose', function (ev: L.TooltipEvent) {
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

        // Add clearSelection method
        (geoJsonLayer as any).clearSelection = function() {
            // Clear single selection
            if (selectedLayer && originalStyle && selectedLayer.setStyle) {
                selectedLayer.setStyle(originalStyle);
            }
            selectedLayer = null;
            originalStyle = null;
            
            // Clear multiple selections
            selectedLayers.forEach((originalStyle, layer) => {
                if (originalStyle && layer.setStyle) {
                    layer.setStyle(originalStyle);
                }
            });
            selectedLayers.clear();
        };

        return geoJsonLayer;
    }
};

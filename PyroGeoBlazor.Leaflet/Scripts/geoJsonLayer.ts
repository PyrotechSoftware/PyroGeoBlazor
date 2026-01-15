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
                        // Result contains marker options from C# - ignored in current implementation
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

        const geoJsonLayer = L.geoJSON(null, leafletOptions); // Always start with null data

        // Override getBounds to return a properly formatted object for C# serialization
        const originalGetBounds = (geoJsonLayer as any).getBounds?.bind(geoJsonLayer);
        if (originalGetBounds) {
            (geoJsonLayer as any).getBounds = function() {
                try {
                    const bounds = originalGetBounds();
                    if (!bounds) return null;
                    const sw = bounds.getSouthWest();
                    const ne = bounds.getNorthEast();
                    return {
                        SouthWest: { Lat: sw.lat, Lng: sw.lng },
                        NorthEast: { Lat: ne.lat, Lng: ne.lng }
                    };
                }
                catch (e) {
                    console.error('Error getting bounds from geoJsonLayer:', e);
                    return null;
                }
            };
        }

        // Default styles (DRY - single source of truth)
        const DEFAULT_SELECTION_STYLE = {
            color: '#3388ff',
            weight: 3,
            opacity: 1,
            fillOpacity: 0.5,
            fillColor: '#3388ff'
        };

        const DEFAULT_HOVER_STYLE = {
            color: 'red',
            weight: 2,
            opacity: 1.0
        };

        // Store selection state
        // For single selection mode
        let selectedLayer: any = null;
        let originalStyle: any = null;
        // Runtime flag to enable/disable selection (can be toggled)
        let selectionEnabledFlag: boolean = options?.enableFeatureSelection !== false;
        
        // For multiple selection mode
        const selectedLayers: Map<any, any> = new Map(); // Map of layer -> original style

        // Store hover state
        const hoveredLayers: Map<any, any> = new Map(); // Map of layer -> original style (for hover)
        
        // Selection click handler shared variable (declared in outer scope so other methods can attach/detach it)
        let selectionClickHandler: ((ev: any) => void) | null = null;

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
            // (debug logging removed)
            originalAddData(processedData);
            
            // Restore original onEachFeature
            if (originalOnEachFeature) {
                (geoJsonLayer as any).options.onEachFeature = originalOnEachFeature;
            }
            
            // Wait for all onEachFeature callbacks to complete
            if (promises.length > 0) {
                await Promise.all(promises);
            }

            // Notify .NET that bounds are ready for this layer (if handler configured)
            try {
                if (handlerMappings?.events && handlerMappings.events['boundsready']) {
                    const boundsDto = (geoJsonLayer as any).getBounds ? (geoJsonLayer as any).getBounds() : null;
                    handlerMappings.dotNetRef!.invokeMethodAsync(handlerMappings.events['boundsready'], boundsDto);
                }
            } catch (e) {
                // suppressed
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
            // Assign the handler inside the mapping block (it was declared in outer scope) so it's available to other scopes
            selectionClickHandler = function (ev: any) {
                try {
                    // Respect runtime flag to disable feature selection even if handler is attached
                    if (!selectionEnabledFlag) {
                        return;
                    }

                    const feature = ev.layer?.feature || ev.propagatedFrom?.feature;
                    const layer = ev.layer || ev.propagatedFrom;

                    if (!feature || !layer) {
                        return;
                    }

                    // Don't allow selection/unselection if the layer is currently being edited
                    if ((layer as any)._editingEnabled) {
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
                                // Clear any hover state first
                                if (hoveredLayers.has(layer)) {
                                    hoveredLayers.delete(layer);
                                }
                                layer.setStyle(originalStyle);
                            }
                            selectedLayers.delete(layer);

                            // Notify of selection state change first so C# has authoritative list
                            if (handlerMappings?.events['selectionchanged']) {
                                try {
                                    const raw = (geoJsonLayer as any).SelectedFeatures || [];
                                    const dto = raw.map((f: any) => (geoJsonLayer as any).createCallbackFeature(f, 50000, false));
                                    handlerMappings.dotNetRef!.invokeMethodAsync(handlerMappings.events['selectionchanged'], dto);
                                } catch (e) {
                                    console.error('Error invoking selectionchanged after unselect:', e);
                                }
                            }
                            // Notify C# of unselection
                            if (handlerMappings?.events['featureunselected']) {
                                handlerMappings.dotNetRef!.invokeMethodAsync(
                                    handlerMappings.events['featureunselected'],
                                    payload
                                );
                            }
                        } else {
                            // Select this feature
                            // Store original style (get from hover cache if currently hovering, otherwise from layer)
                            let styleToStore;
                            if (hoveredLayers.has(layer)) {
                                // Use the original style from before hover
                                styleToStore = hoveredLayers.get(layer);
                                hoveredLayers.delete(layer);
                            } else if (layer.options) {
                                // Capture current style
                                styleToStore = {
                                    color: layer.options.color,
                                    weight: layer.options.weight,
                                    opacity: layer.options.opacity,
                                    fillColor: layer.options.fillColor,
                                    fillOpacity: layer.options.fillOpacity,
                                    dashArray: layer.options.dashArray
                                };
                            }

                            if (styleToStore) {
                                selectedLayers.set(layer, styleToStore);
                            }

                            // Bring layer to front so selection is clearly visible
                            if (layer.bringToFront) {
                                layer.bringToFront();
                            }

                            // Apply selected style (use provided or default)
                            if (layer.setStyle) {
                                const selectionStyle = options?.selectedFeatureStyle || DEFAULT_SELECTION_STYLE;
                                layer.setStyle(selectionStyle);
                            }
                            // Notify of selection state change before individual event so C# receives authoritative list first
                            if (handlerMappings?.events['selectionchanged']) {
                                try {
                                    const raw = (geoJsonLayer as any).SelectedFeatures || [];
                                    const dto = raw.map((f: any) => (geoJsonLayer as any).createCallbackFeature(f, 50000, false));
                                    handlerMappings.dotNetRef!.invokeMethodAsync(handlerMappings.events['selectionchanged'], dto);
                                } catch (e) {
                                    console.error('Error invoking selectionchanged before featureselected (single):', e);
                                }
                            }

                            // Notify C# of selection
                            if (handlerMappings?.events['featureselected']) {
                                handlerMappings.dotNetRef!.invokeMethodAsync(
                                    handlerMappings.events['featureselected'],
                                    payload
                                );
                            }
                            // Notify of selection state change (single-select)
                            if (handlerMappings?.events['selectionchanged']) {
                                try {
                                    const dto = (geoJsonLayer as any).SelectedFeatures || [];
                                    handlerMappings.dotNetRef!.invokeMethodAsync(handlerMappings.events['selectionchanged'], dto);
                                } catch (e) {
                                    console.error('Error invoking selectionchanged after select (single-final):', e);
                                }
                            }
                            // Notify of selection state change (single-select)
                            if (handlerMappings?.events['selectionchanged']) {
                                try {
                                    const raw = (geoJsonLayer as any).SelectedFeatures || [];
                                    const dto = raw.map((f: any) => (geoJsonLayer as any).createCallbackFeature(f, 50000, false));
                                    handlerMappings.dotNetRef!.invokeMethodAsync(handlerMappings.events['selectionchanged'], dto);
                                } catch (e) {
                                    console.error('Error invoking selectionchanged after select (single):', e);
                                }
                            }
                            // Always notify of selection state change
                            if (handlerMappings?.events['selectionchanged']) {
                                try {
                                    const raw = (geoJsonLayer as any).SelectedFeatures || [];
                                    const dto = raw.map((f: any) => (geoJsonLayer as any).createCallbackFeature(f, 50000, false));
                                    handlerMappings.dotNetRef!.invokeMethodAsync(handlerMappings.events['selectionchanged'], dto);
                                } catch (e) {
                                    console.error('Error invoking selectionchanged after select:', e);
                                }
                            }
                        }
                    } else {
                        // Single selection mode
                        // Check if this is the currently selected layer
                        if (selectedLayer === layer) {
                            // Unselect
                            if (originalStyle && layer.setStyle) {
                                // Clear any hover state first
                                if (hoveredLayers.has(layer)) {
                                    hoveredLayers.delete(layer);
                                }
                                layer.setStyle(originalStyle);
                            }
                            selectedLayer = null;
                            originalStyle = null;

                            // Notify of selection state change first so C# has authoritative list
                            if (handlerMappings?.events['selectionchanged']) {
                                try {
                                    const raw = (geoJsonLayer as any).SelectedFeatures || [];
                                    const dto = raw.map((f: any) => (geoJsonLayer as any).createCallbackFeature(f, 50000, false));
                                    handlerMappings.dotNetRef!.invokeMethodAsync(handlerMappings.events['selectionchanged'], dto);
                                } catch (e) {
                                    console.error('Error invoking selectionchanged after unselect (single):', e);
                                }
                            }
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
                                // Restore previous layer style
                                selectedLayer.setStyle(originalStyle);
                                // Notify .NET that the previous feature was unselected so C# can update its list
                                try {
                                    if (handlerMappings?.events['featureunselected']) {
                                        const prevFeature = (selectedLayer as any).feature;
                                        const prevPayload = {
                                            layer: LeafletEvents.minimalLayerInfo(selectedLayer),
                                            feature: (geoJsonLayer as any).createCallbackFeature(prevFeature, 50000, false)
                                        };
                                        handlerMappings.dotNetRef!.invokeMethodAsync(handlerMappings.events['featureunselected'], prevPayload);
                                    }
                                } catch (e) {
                                    console.error('Error invoking featureunselected for previous selection:', e);
                                }
                            }

                            // Select new feature
                            selectedLayer = layer;

                            // Store original style (get from hover cache if currently hovering, otherwise from layer)
                            if (hoveredLayers.has(layer)) {
                                // Use the original style from before hover
                                originalStyle = hoveredLayers.get(layer);
                                hoveredLayers.delete(layer);
                            } else if (layer.options) {
                                // Capture current style
                                originalStyle = {
                                    color: layer.options.color,
                                    weight: layer.options.weight,
                                    opacity: layer.options.opacity,
                                    fillColor: layer.options.fillColor,
                                    fillOpacity: layer.options.fillOpacity,
                                    dashArray: layer.options.dashArray
                                };
                            }

                            // Bring layer to front so selection is clearly visible
                            if (layer.bringToFront) {
                                layer.bringToFront();
                            }

                            // Apply selected style (use provided or default)
                            if (layer.setStyle) {
                                const selectionStyle = options?.selectedFeatureStyle || DEFAULT_SELECTION_STYLE;
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
            };

            // Attach initially if configured
            if (options?.enableFeatureSelection !== false && selectionClickHandler) {
                geoJsonLayer.on('click', selectionClickHandler);
            }

            // Hover styling (controlled by enableHoverStyle flag)
            // Default to true if not specified
            if (options?.enableHoverStyle !== false) {
                // hover enabled
                // Use provided hoverStyle or default to red stroke
                const hoverStyle = options?.hoverStyle || DEFAULT_HOVER_STYLE;
                
                geoJsonLayer.on('mouseover', function (ev: any) {
                    try {
                        const feature = ev.layer?.feature || ev.propagatedFrom?.feature;
                        const layer = ev.layer || ev.propagatedFrom;
                        
                        if (!feature || !layer || !layer.setStyle) {
                            return;
                        }

                        // Bring layer to front so hover stroke is visible
                        if (layer.bringToFront) {
                            layer.bringToFront();
                        }

                        // Store original style if not already hovering
                        if (!hoveredLayers.has(layer)) {
                            if (layer.options) {
                                const originalHoverStyle = {
                                    color: layer.options.color,
                                    weight: layer.options.weight,
                                    opacity: layer.options.opacity,
                                    fillColor: layer.options.fillColor,
                                    fillOpacity: layer.options.fillOpacity,
                                    dashArray: layer.options.dashArray
                                };
                                hoveredLayers.set(layer, originalHoverStyle);
                            }
                            
                            // Apply hover style (merge with current style to only override specified properties)
                            const currentStyle = {
                                color: layer.options.color,
                                weight: layer.options.weight,
                                opacity: layer.options.opacity,
                                fillColor: layer.options.fillColor,
                                fillOpacity: layer.options.fillOpacity,
                                dashArray: layer.options.dashArray
                            };
                            
                            // Merge hover style properties with current style
                            const mergedStyle = { ...currentStyle, ...hoverStyle };
                            layer.setStyle(mergedStyle);
                        }
                    } catch (e) {
                        console.error('Error applying hover style:', e);
                    }
                });

                geoJsonLayer.on('mouseout', function (ev: any) {
                    try {
                        const feature = ev.layer?.feature || ev.propagatedFrom?.feature;
                        const layer = ev.layer || ev.propagatedFrom;
                        
                        if (!feature || !layer || !layer.setStyle) {
                            return;
                        }

                        // Restore original style if we were hovering
                        if (hoveredLayers.has(layer)) {
                            const originalHoverStyle = hoveredLayers.get(layer);
                            
                            // Check if this layer is currently selected
                            const multipleSelection = options?.multipleFeatureSelection === true;
                            const isSelected = multipleSelection 
                                ? selectedLayers.has(layer) 
                                : selectedLayer === layer;
                            
                            if (isSelected) {
                                // Don't restore original style - reapply selection style instead
                                const selectionStyle = options?.selectedFeatureStyle || DEFAULT_SELECTION_STYLE;
                                layer.setStyle(selectionStyle);
                            } else if (originalHoverStyle) {
                                // Not selected - restore original style
                                layer.setStyle(originalHoverStyle);
                            }
                            
                            hoveredLayers.delete(layer);
                        }
                    } catch (e) {
                        console.error('Error restoring hover style:', e);
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

            // Clear any hover states
            hoveredLayers.forEach((originalStyle, layer) => {
                if (originalStyle && layer.setStyle) {
                    layer.setStyle(originalStyle);
                }
            });
            hoveredLayers.clear();
            // Notify .NET of cleared selection
            if (handlerMappings?.events['selectionchanged']) {
                try {
                    handlerMappings.dotNetRef!.invokeMethodAsync(handlerMappings.events['selectionchanged'], []);
                } catch (e) {
                    console.error('Error invoking selectionchanged after clearSelection:', e);
                }
            }
        };

        // Allow toggling feature selection at runtime from C#
        (geoJsonLayer as any).setEnableFeatureSelection = function(enabled: boolean) {
            try {
                selectionEnabledFlag = enabled === true;
                if (enabled) {
                    // Attach selection handler if not already attached (guard if handler isn't defined)
                    if (selectionClickHandler) {
                        geoJsonLayer.on('click', selectionClickHandler);
                    } else {
                        if (options?.debugLogging) console.warn('setEnableFeatureSelection: selectionClickHandler not defined');
                    }
                    options.enableFeatureSelection = true;
                } else {
                    // Detach selection handler and clear selection
                    if (selectionClickHandler) {
                        geoJsonLayer.off('click', selectionClickHandler);
                    } else {
                        if (options?.debugLogging) console.warn('setEnableFeatureSelection: selectionClickHandler not defined (off)');
                    }
                    options.enableFeatureSelection = false;
                    (geoJsonLayer as any).clearSelection();
                }
            } catch (e) {
                console.error('Error toggling feature selection:', e);
            }
        };

        // Allow toggling multiple selection mode at runtime from C#
        (geoJsonLayer as any).setMultipleFeatureSelection = function(enabled: boolean) {
            try {
                if (!options) return;
                const wasMultiple = options.multipleFeatureSelection === true;
                options.multipleFeatureSelection = enabled;

                if (wasMultiple && !enabled) {
                    // switching to single-select: keep last selected feature
                    if (selectedLayers.size > 0) {
                        const layers = Array.from(selectedLayers.keys());
                        const keep = layers[layers.length - 1];

                        // Restore styles for others
                        for (let i = 0; i < layers.length - 1; i++) {
                            const l = layers[i];
                            const orig = selectedLayers.get(l);
                            if (orig && l.setStyle) l.setStyle(orig);
                        }

                        // Set single selection
                        selectedLayer = keep;
                        originalStyle = selectedLayers.get(keep) || originalStyle;
                        selectedLayers.clear();
                    }
                }

                // Notify .NET of selection change
                    if (handlerMappings?.events['selectionchanged']) {
                        try {
                            const raw = (geoJsonLayer as any).SelectedFeatures || [];
                            const dto = raw.map((f: any) => (geoJsonLayer as any).createCallbackFeature(f, 50000, false));
                            handlerMappings.dotNetRef!.invokeMethodAsync(handlerMappings.events['selectionchanged'], dto);
                        } catch (e) {
                            console.error('Error invoking selectionchanged after setMultipleFeatureSelection:', e);
                        }
                    }
            } catch (e) {
                console.error('Error setting multiple selection mode:', e);
            }
        };

        // Expose selected features for editableGeoJsonLayer to access
        Object.defineProperty(geoJsonLayer, 'SelectedFeatures', {
            get: function() {
                const multipleSelection = options?.multipleFeatureSelection === true;
                if (multipleSelection) {
                    // Return array of features from selectedLayers Map
                    return Array.from(selectedLayers.keys()).map(layer => layer.feature).filter(f => f != null);
                } else {
                    // Return single selected feature or empty array
                    return selectedLayer && selectedLayer.feature ? [selectedLayer.feature] : [];
                }
            }
        });

        // If initial data was provided, add it through our custom addData method
        if (geoJsonData) {
            // Use setTimeout to ensure this happens after the layer is returned and ready
            setTimeout(() => {
                (geoJsonLayer as any).addData(geoJsonData);
            }, 0);
        }

        return geoJsonLayer;
    }
};

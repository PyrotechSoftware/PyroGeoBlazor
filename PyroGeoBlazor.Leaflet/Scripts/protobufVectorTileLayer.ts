declare const L: typeof import('leaflet');

import { EventHandlerMapping } from './eventHandling';
import { LeafletEvents } from './events';

// Common helper functions for vector tile layers
const VectorTileHelpers = {
    getRendererFactory(rendererType?: string): any {
        if (!rendererType) {
            return undefined;
        }

        const type = rendererType.toLowerCase();
        if (type === 'canvas') {
            const LCanvas = (L as any).Canvas;
            if (LCanvas && typeof LCanvas.tile === 'function') {
                return LCanvas.tile;
            }
            console.warn('L.Canvas.tile is not available. Make sure Leaflet.VectorGrid plugin is loaded correctly.');
        } else if (type === 'svg') {
            const LSVG = (L as any).SVG;
            if (LSVG && typeof LSVG.tile === 'function') {
                return LSVG.tile;
            }
            console.warn('L.SVG.tile is not available. Make sure Leaflet.VectorGrid plugin is loaded correctly.');
        }
        return undefined;
    },

    setupFeatureSelection(
        vectorTileLayer: any,
        options: any,
        handlerMappings?: EventHandlerMapping
    ): void {
        // Default styles (DRY - single source of truth)
        const DEFAULT_SELECTION_STYLE = {
            color: '#368ce1',
            weight: 3,
            fillColor: '#368ce1',
            fillOpacity: 0.3,
            opacity: 1
        };

        const DEFAULT_HOVER_STYLE = {
            color: 'red',
            weight: 2,
            opacity: 1.0
        };

        // Selection state management
        const selectedFeatures: Map<any, any> = new Map();
        const selectedLayers: Map<any, any[]> = new Map();
        
        // Hover state management
        const hoveredLayers: Map<any, any> = new Map(); // Map of layer -> original style (for hover)
        
        // Track all layers by feature ID as they're added
        const layersByFeatureId: Map<string, any[]> = new Map();

        const selectedFeatureStyle = options?.selectedFeatureStyle ?? DEFAULT_SELECTION_STYLE;

        // Helper to apply selected style
        const applySelectedStyle = (layer: any) => {
            if (layer && layer.setStyle) {
                const leafletStyle: any = {};
                
                if (selectedFeatureStyle.color) leafletStyle.color = selectedFeatureStyle.color;
                if (selectedFeatureStyle.weight !== undefined) leafletStyle.weight = selectedFeatureStyle.weight;
                if (selectedFeatureStyle.opacity !== undefined) leafletStyle.opacity = selectedFeatureStyle.opacity;
                if (selectedFeatureStyle.fillColor) leafletStyle.fillColor = selectedFeatureStyle.fillColor;
                if (selectedFeatureStyle.fillOpacity !== undefined) leafletStyle.fillOpacity = selectedFeatureStyle.fillOpacity;
                if (selectedFeatureStyle.fill !== undefined) leafletStyle.fill = selectedFeatureStyle.fill;
                if (selectedFeatureStyle.stroke !== undefined) leafletStyle.stroke = selectedFeatureStyle.stroke;
                if (selectedFeatureStyle.dashArray) leafletStyle.dashArray = selectedFeatureStyle.dashArray;
                if (selectedFeatureStyle.lineCap) leafletStyle.lineCap = selectedFeatureStyle.lineCap;
                if (selectedFeatureStyle.lineJoin) leafletStyle.lineJoin = selectedFeatureStyle.lineJoin;
                
                layer.setStyle(leafletStyle);
            }
        };

        // Helper to reset style to original
        const resetStyle = (layer: any) => {
            if (layer && layer.setStyle && layer.options?.originalStyle) {
                layer.setStyle(layer.options.originalStyle);
            }
        };

        // Helper to get feature identifier
        const getFeatureIdentifier = (properties: any): string => {
            return properties?.id ?? properties?.ID ?? properties?.fid ?? properties?.FID ??
                properties?.objectid ?? properties?.OBJECTID ?? JSON.stringify(properties);
        };

        // Track layers as they're created by VectorGrid
        vectorTileLayer.on('click', function(e: any) {
            if (e.layer && e.layer.properties) {
                const featureId = getFeatureIdentifier(e.layer.properties);
                
                // Add this layer to our tracking map
                if (!layersByFeatureId.has(featureId)) {
                    layersByFeatureId.set(featureId, []);
                }
                const layers = layersByFeatureId.get(featureId)!;
                if (!layers.includes(e.layer)) {
                    layers.push(e.layer);
                }
            }
        });

        // Helper to find and style all layers with the same feature ID
        const selectAllSegments = (featureId: string) => {
            const layers = layersByFeatureId.get(featureId) || [];
            
            layers.forEach(layer => {
                // Store original style if not already stored
                if (!layer.options.originalStyle) {
                    layer.options.originalStyle = {
                        fillColor: layer.options.fillColor,
                        color: layer.options.color,
                        weight: layer.options.weight,
                        fillOpacity: layer.options.fillOpacity,
                        fill: layer.options.fill
                    };
                }
                
                applySelectedStyle(layer);
            });
            
            return layers;
        };

        // Helper to reset all segments of a feature
        const unselectAllSegments = (featureId: string) => {
            const layers = selectedLayers.get(featureId);
            if (layers) {
                layers.forEach(layer => resetStyle(layer));
            }
        };

        // Add click handler for feature selection
        if (options?.enableFeatureSelection !== false) {
            vectorTileLayer.on('click', function (e: any) {
                if (e.layer && e.layer.properties) {
                    // Check current enableFeatureSelection state
                    const currentOptions = vectorTileLayer._pyroOptions || options;
                    if (currentOptions?.enableFeatureSelection === false) {
                        return; // Selection disabled
                    }
                    
                    const featureId = getFeatureIdentifier(e.layer.properties);
                    const feature = {
                        id: featureId,
                        type: e.layer.feature?.type ?? 'Feature',
                        geometry: e.layer.feature?.geometry,
                        properties: e.layer.properties
                    };

                    const isSelected = selectedFeatures.has(featureId);

                    if (isSelected) {
                        // Unselect all segments of this feature
                        const layers = selectedLayers.get(featureId);
                        
                        unselectAllSegments(featureId);
                        selectedFeatures.delete(featureId);
                        selectedLayers.delete(featureId);
                        
                        // Check if any segment is currently being hovered
                        // If so, reapply hover style instead of original
                        if (layers) {
                            const isCurrentlyHovered = layers.some(layer => hoveredLayers.has(layer));
                            
                            if (isCurrentlyHovered) {
                                // Reapply hover style to all segments
                                const hoverStyle = currentOptions?.hoverStyle || DEFAULT_HOVER_STYLE;
                                layers.forEach(layer => {
                                    if (layer.setStyle) {
                                        const currentStyle = {
                                            color: layer.options.originalStyle?.color || layer.options.color,
                                            weight: layer.options.originalStyle?.weight || layer.options.weight,
                                            opacity: layer.options.originalStyle?.opacity || layer.options.opacity,
                                            fillColor: layer.options.originalStyle?.fillColor || layer.options.fillColor,
                                            fillOpacity: layer.options.originalStyle?.fillOpacity || layer.options.fillOpacity
                                        };
                                        const mergedStyle = { ...currentStyle, ...hoverStyle };
                                        layer.setStyle(mergedStyle);
                                    }
                                });
                            }
                        }

                        // Notify C# of unselection
                        if (handlerMappings?.dotNetRef && handlerMappings.events['featureunselected']) {
                            handlerMappings.dotNetRef.invokeMethodAsync(
                                handlerMappings.events['featureunselected'],
                                {
                                    feature: feature,
                                    latlng: e.latlng,
                                    layerPoint: e.layerPoint,
                                    containerPoint: e.containerPoint
                                }
                            );
                        }
                    } else {
                        // Handle multiple selection based on current state
                        const allowMultiple = currentOptions?.multipleFeatureSelection === true;
                        
                        if (!allowMultiple) {
                            // Unselect all previously selected features
                            selectedFeatures.forEach((_, id) => unselectAllSegments(id));
                            selectedFeatures.clear();
                            selectedLayers.clear();
                        }

                        // Select all segments of this feature across all tiles
                        const layers = selectAllSegments(featureId);
                        
                        // Bring all selected segments to front
                        layers.forEach(layer => {
                            if (layer.bringToFront) {
                                layer.bringToFront();
                            }
                            // Note: Don't clear hover state - keep it for proper restoration
                            // The selection style will override the hover style visually
                        });
                        
                        selectedFeatures.set(featureId, feature);
                        selectedLayers.set(featureId, layers);

                        // Notify C# of selection
                        if (handlerMappings?.dotNetRef && handlerMappings.events['featureselected']) {
                            handlerMappings.dotNetRef.invokeMethodAsync(
                                handlerMappings.events['featureselected'],
                                {
                                    feature: feature,
                                    latlng: e.latlng,
                                    layerPoint: e.layerPoint,
                                    containerPoint: e.containerPoint
                                }
                            );
                        }
                    }

                    // Always fire clicked event
                    if (handlerMappings?.dotNetRef && handlerMappings.events['featureclicked']) {
                        handlerMappings.dotNetRef.invokeMethodAsync(
                            handlerMappings.events['featureclicked'],
                            {
                                feature: feature,
                                latlng: e.latlng,
                                layerPoint: e.layerPoint,
                                containerPoint: e.containerPoint
                            }
                        );
                    }
                }
            });
        }

        // Add clearSelection method
        (vectorTileLayer as any).clearSelection = function () {
            selectedFeatures.forEach((_, id) => unselectAllSegments(id));
            selectedFeatures.clear();
            selectedLayers.clear();
            
            // Clear any hover states
            hoveredLayers.forEach((originalStyle, layer) => {
                if (layer && layer.setStyle && originalStyle) {
                    layer.setStyle(originalStyle);
                }
            });
            hoveredLayers.clear();
        };

        // Hover styling (controlled by enableHoverStyle flag and interactive mode)
        if (options?.interactive === true && options?.enableHoverStyle !== false) {
            const hoverStyle = options?.hoverStyle || DEFAULT_HOVER_STYLE;
            
            vectorTileLayer.on('mouseover', function (e: any) {
                if (e.layer && e.layer.properties) {
                    const featureId = getFeatureIdentifier(e.layer.properties);
                    
                    // Track this layer for selection (even if just hovering)
                    if (!layersByFeatureId.has(featureId)) {
                        layersByFeatureId.set(featureId, []);
                    }
                    const layers = layersByFeatureId.get(featureId)!;
                    if (!layers.includes(e.layer)) {
                        layers.push(e.layer);
                    }
                    
                    // Don't apply hover if feature is selected
                    if (!selectedFeatures.has(featureId)) {
                        // Get all segments of this feature
                        const allSegments = layersByFeatureId.get(featureId) || [];
                        
                        // Apply hover to ALL segments
                        allSegments.forEach(layer => {
                            // Bring to front if possible
                            if (layer.bringToFront) {
                                layer.bringToFront();
                            }
                            
                            // Store original style if not already hovering
                            if (!hoveredLayers.has(layer)) {
                                hoveredLayers.set(layer, {
                                    color: layer.options.color,
                                    weight: layer.options.weight,
                                    opacity: layer.options.opacity,
                                    fillColor: layer.options.fillColor,
                                    fillOpacity: layer.options.fillOpacity
                                });
                                
                                // Apply hover style (merge with current to preserve fill)
                                const currentStyle = {
                                    color: layer.options.color,
                                    weight: layer.options.weight,
                                    opacity: layer.options.opacity,
                                    fillColor: layer.options.fillColor,
                                    fillOpacity: layer.options.fillOpacity
                                };
                                
                                const mergedStyle = { ...currentStyle, ...hoverStyle };
                                if (layer.setStyle) {
                                    layer.setStyle(mergedStyle);
                                }
                            }
                        });
                    }
                }
            });

            vectorTileLayer.on('mouseout', function (e: any) {
                if (e.layer && e.layer.properties) {
                    const featureId = getFeatureIdentifier(e.layer.properties);
                    
                    // Get all segments that were hovered
                    const allSegments = layersByFeatureId.get(featureId) || [];
                    
                    // Restore ALL segments
                    allSegments.forEach(layer => {
                        if (hoveredLayers.has(layer)) {
                            const originalStyle = hoveredLayers.get(layer);
                            
                            // Check if feature is selected
                            const isSelected = selectedFeatures.has(featureId);
                            
                            if (isSelected) {
                                // Don't restore - reapply selection style instead
                                applySelectedStyle(layer);
                            } else if (originalStyle && layer.setStyle) {
                                // Restore original style
                                layer.setStyle(originalStyle);
                            }
                            
                            hoveredLayers.delete(layer);
                        }
                    });
                }
            });
        }
    },

    attachGridLayerEvents(vectorTileLayer: any, handlerMappings?: EventHandlerMapping): void {
        if (!handlerMappings?.dotNetRef || !handlerMappings.events) {
            return;
        }

        const keys = Object.keys(handlerMappings.events);

        const eventMappings: { [key: string]: { eventName: string, argType: string } } = {
            'loading': { eventName: 'loading', argType: 'LeafletEventArgs' },
            'tileunload': { eventName: 'tileunload', argType: 'LeafletTileEventArgs' },
            'tileloadstart': { eventName: 'tileloadstart', argType: 'LeafletTileEventArgs' },
            'tileerror': { eventName: 'tileerror', argType: 'LeafletTileErrorEventArgs' },
            'tileload': { eventName: 'tileload', argType: 'LeafletTileEventArgs' },
            'load': { eventName: 'load', argType: 'LeafletEventArgs' },
            'add': { eventName: 'add', argType: 'LeafletEventArgs' },
            'remove': { eventName: 'remove', argType: 'LeafletEventArgs' }
        };

        for (const key of keys) {
            const mapping = eventMappings[key];
            if (mapping) {
                vectorTileLayer.on(mapping.eventName, function (ev: any) {
                    const methodName = handlerMappings.events[key];
                    try {
                        const EventClass = (LeafletEvents as any)[mapping.argType];
                        const payload = EventClass.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error(`Error invoking ${mapping.eventName} handler:`, e);
                    }
                });
            }
        }
    },

    attachInteractiveEvents(vectorTileLayer: any, options: any, handlerMappings?: EventHandlerMapping): void {
        // Only attach interactive events if the layer is set to interactive
        if (!options?.interactive || !handlerMappings?.dotNetRef || !handlerMappings.events) {
            return;
        }

        const keys = Object.keys(handlerMappings.events);

        // Mouse events on features
        const interactiveEventMappings: { [key: string]: string } = {
            'mouseover': 'mouseover',
            'mouseout': 'mouseout',
            'mousemove': 'mousemove',
            'dblclick': 'dblclick',
            'contextmenu': 'contextmenu'
        };

        for (const [eventKey, leafletEvent] of Object.entries(interactiveEventMappings)) {
            if (keys.indexOf(eventKey) > -1) {
                vectorTileLayer.on(leafletEvent, function (e: any) {
                    const methodName = handlerMappings.events[eventKey];
                    try {
                        const payload = {
                            latlng: e.latlng ? { lat: e.latlng.lat, lng: e.latlng.lng } : null,
                            layerPoint: e.layerPoint ? { x: e.layerPoint.x, y: e.layerPoint.y } : null,
                            containerPoint: e.containerPoint ? { x: e.containerPoint.x, y: e.containerPoint.y } : null,
                            feature: e.layer && e.layer.properties ? {
                                id: e.layer.properties.id ?? e.layer.properties.ID ?? e.layer.properties.fid ?? e.layer.properties.FID,
                                type: e.layer.feature?.type ?? 'Feature',
                                geometry: e.layer.feature?.geometry,
                                properties: e.layer.properties
                            } : null
                        };
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (err) {
                        console.error(`Error invoking ${eventKey} handler:`, err);
                    }
                });
            }
        }
    },

    setInteractive(vectorTileLayer: any, interactive: boolean): void {
        // Update the interactive option
        if (vectorTileLayer.options) {
            vectorTileLayer.options.interactive = interactive;
        }
        
        // VectorGrid stores interactivity at the layer level
        // We need to update the actual layer's interactive state
        if ((vectorTileLayer as any)._vectorTiles) {
            // Iterate through all loaded tiles and update their interactive state
            Object.values((vectorTileLayer as any)._vectorTiles).forEach((tile: any) => {
                if (tile && tile._features) {
                    Object.values(tile._features).forEach((feature: any) => {
                        if (feature) {
                            feature.options.interactive = interactive;
                        }
                    });
                }
            });
        }
        
        // Redraw the layer to apply changes
        if (vectorTileLayer.redraw) {
            vectorTileLayer.redraw();
        }
    },

    setEnableFeatureSelection(vectorTileLayer: any, enableFeatureSelection: boolean): void {
        // Update the enableFeatureSelection option
        if (vectorTileLayer._pyroOptions) {
            vectorTileLayer._pyroOptions.enableFeatureSelection = enableFeatureSelection;
        }
        
        // If disabling selection, clear any current selections
        if (!enableFeatureSelection && vectorTileLayer.clearSelection) {
            vectorTileLayer.clearSelection();
        }
    },

    setMultipleFeatureSelection(vectorTileLayer: any, multipleFeatureSelection: boolean): void {
        // Update the multipleFeatureSelection option
        if (vectorTileLayer._pyroOptions) {
            vectorTileLayer._pyroOptions.multipleFeatureSelection = multipleFeatureSelection;
        }
        
        // If switching from multiple to single selection and multiple features are selected,
        // keep only the most recently selected feature
        if (!multipleFeatureSelection && vectorTileLayer.clearSelection) {
            // Note: We don't clear here - the next selection will handle it
            // The selection logic checks the multipleFeatureSelection flag
        }
    }
};

export const ProtobufVectorTileLayer = {
    createProtobufVectorTileLayer(
        urlTemplate: string,
        options?: any,
        handlerMappings?: EventHandlerMapping
    ): L.Layer {
        // Check if Leaflet.VectorGrid is available
        if (!(L as any).vectorGrid || typeof (L as any).vectorGrid.protobuf !== 'function') {
            console.error('Leaflet.VectorGrid plugin is not loaded. Please include Leaflet.VectorGrid.bundled.js');
            throw new Error('Leaflet.VectorGrid plugin is required but not loaded');
        }

        // Replace {LayerName} placeholder if layerName is provided in options
        if (options?.layerName) {
            urlTemplate = urlTemplate.replace('{LayerName}', options.layerName);
        }

        // Build VectorGrid options with default fill style
        let vectorTileLayerStyles = options?.vectorTileLayerStyles;
        
        // VectorGrid expects vectorTileLayerStyles to be an object where:
        // - Keys are layer names (must match exactly what's in the MVT)
        // - Values can be objects OR functions that return style objects
        
        if (vectorTileLayerStyles && typeof vectorTileLayerStyles === 'object' && Object.keys(vectorTileLayerStyles).length > 0) {
            // Log each style and create a default catchall
            const enhancedStyles: any = {};
            
            for (const [layerName, style] of Object.entries(vectorTileLayerStyles)) {
                // Wrap each style in a function that VectorGrid will call per-feature
                enhancedStyles[layerName] = function(properties: any) {
                    return style;
                };
            }
            
            // Add a catchall for any layer name variations
            const firstStyle = Object.values(vectorTileLayerStyles)[0];
            const layerKeys = Object.keys(vectorTileLayerStyles);
            
            // Try common variations of the layer names
            for (const key of layerKeys) {
                // Add version without workspace prefix (e.g., "PlannerSpatial:Township" -> "Township")
                const simpleName = key.split(':').pop();
                if (simpleName && !enhancedStyles[simpleName]) {
                    enhancedStyles[simpleName] = function(properties: any) {
                        return firstStyle;
                    };
                }
            }
            
            vectorTileLayerStyles = enhancedStyles;
            
        } else if (!vectorTileLayerStyles || Object.keys(vectorTileLayerStyles).length === 0) {
            // Create a default style function for unspecified layers
            vectorTileLayerStyles = {
                '': function() {
                    return {
                        fill: true,
                        fillColor: '#3388ff',
                        fillOpacity: 0.2,
                        stroke: true,
                        color: '#3388ff',
                        weight: 1,
                        opacity: 1
                    };
                }
            };
        }

        const vectorGridOptions: any = {
            interactive: options?.interactive ?? false,
            getFeatureId: options?.getFeatureId,
            vectorTileLayerStyles: vectorTileLayerStyles,
            minZoom: options?.minZoom ?? 0,
            maxZoom: options?.maxZoom,
            maxNativeZoom: options?.maxNativeZoom,
            minNativeZoom: options?.minNativeZoom,
            tileSize: options?.tileSize ?? 256,
            opacity: options?.opacity ?? 1.0,
            updateWhenIdle: options?.updateWhenIdle,
            updateWhenZooming: options?.updateWhenZooming ?? true,
            updateInterval: options?.updateInterval ?? 200,
            zIndex: options?.zIndex ?? 1,
            bounds: options?.bounds,
            noWrap: options?.noWrap ?? false,
            pane: options?.pane ?? 'tilePane',
            className: options?.className ?? '',
            keepBuffer: options?.keepBuffer ?? 2,
            attribution: options?.attribution ?? ''
        };

        // Only add subdomains if provided, otherwise VectorGrid uses its default
        if (options?.subdomains !== undefined && options.subdomains !== null) {
            vectorGridOptions.subdomains = options.subdomains;
        }

        // Add renderer factory if specified
        const rendererFactory = VectorTileHelpers.getRendererFactory(options?.rendererFactory);
        if (rendererFactory !== undefined) {
            vectorGridOptions.rendererFactory = rendererFactory;
        }

        // Create the VectorGrid Protobuf layer
        const vectorTileLayer = (L as any).vectorGrid.protobuf(urlTemplate, vectorGridOptions);

        // Store options for dynamic updates
        (vectorTileLayer as any)._pyroOptions = {
            interactive: options?.interactive ?? false,
            enableFeatureSelection: options?.enableFeatureSelection !== false,
            multipleFeatureSelection: options?.multipleFeatureSelection === true,
            enableHoverStyle: options?.enableHoverStyle !== false,
            selectedFeatureStyle: options?.selectedFeatureStyle,
            hoverStyle: options?.hoverStyle
        };

        // Setup feature selection
        VectorTileHelpers.setupFeatureSelection(vectorTileLayer, options, handlerMappings);

        // Attach interactive event handlers (mouseover, mouseout, etc.)
        VectorTileHelpers.attachInteractiveEvents(vectorTileLayer, options, handlerMappings);

        // Attach standard event handlers
        VectorTileHelpers.attachGridLayerEvents(vectorTileLayer, handlerMappings);

        // Expose setInteractive method
        (vectorTileLayer as any).setInteractive = function (interactive: boolean) {
            VectorTileHelpers.setInteractive(vectorTileLayer, interactive);
        };

        // Expose setEnableFeatureSelection method
        (vectorTileLayer as any).setEnableFeatureSelection = function (enableFeatureSelection: boolean) {
            VectorTileHelpers.setEnableFeatureSelection(vectorTileLayer, enableFeatureSelection);
        };

        // Expose setMultipleFeatureSelection method
        (vectorTileLayer as any).setMultipleFeatureSelection = function (multipleFeatureSelection: boolean) {
            VectorTileHelpers.setMultipleFeatureSelection(vectorTileLayer, multipleFeatureSelection);
        };

        return vectorTileLayer;
    }
};

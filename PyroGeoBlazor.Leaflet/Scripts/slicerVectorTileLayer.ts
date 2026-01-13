declare const L: typeof import('leaflet');

import { EventHandlerMapping } from './eventHandling';
import { LeafletEvents } from './events';

// Import helpers from protobuf implementation
// Note: In a real implementation, you'd extract these to a shared module
// For now, we'll duplicate the minimal needed code

const getRendererFactory = (rendererType?: string): any => {
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
};

export const SlicerVectorTileLayer = {
    createSlicerVectorTileLayer(
        geoJsonData: any,
        options?: any,
        handlerMappings?: EventHandlerMapping
    ): L.Layer {
        // Check if Leaflet.VectorGrid is available
        if (!(L as any).vectorGrid || typeof (L as any).vectorGrid.slicer !== 'function') {
            console.error('Leaflet.VectorGrid plugin is not loaded. Please include Leaflet.VectorGrid.bundled.js');
            throw new Error('Leaflet.VectorGrid plugin is required but not loaded');
        }

        // Build VectorGrid options with default fill style
        let vectorTileLayerStyles = options?.vectorTileLayerStyles;
        
        // If no custom styles provided, use a default style with fill
        if (!vectorTileLayerStyles || Object.keys(vectorTileLayerStyles).length === 0) {
            vectorTileLayerStyles = function () {
                return {
                    fill: true,
                    fillColor: '#3388ff',
                    fillOpacity: 0.2,
                    stroke: true,
                    color: '#3388ff',
                    weight: 1,
                    opacity: 1
                };
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

        // Add renderer factory if specified
        const rendererFactory = getRendererFactory(options?.rendererFactory);
        if (rendererFactory !== undefined) {
            vectorGridOptions.rendererFactory = rendererFactory;
        }

        // Create the VectorGrid Slicer layer
        const vectorTileLayer = (L as any).vectorGrid.slicer(geoJsonData, vectorGridOptions);

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

        // Setup feature selection with multi-segment support
        const selectedFeatures: Map<any, any> = new Map();
        const selectedLayers: Map<any, any[]> = new Map();
        
        // Hover state management
        const hoveredLayers: Map<any, any> = new Map(); // Map of layer -> original style (for hover)
        
        // Track all layers by feature ID as they're added
        const layersByFeatureId: Map<string, any[]> = new Map();

        const selectedFeatureStyle = options?.selectedFeatureStyle ?? DEFAULT_SELECTION_STYLE;

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

        const resetStyle = (layer: any) => {
            if (layer && layer.setStyle && layer.options?.originalStyle) {
                layer.setStyle(layer.options.originalStyle);
            }
        };

        const getFeatureIdentifier = (properties: any): string => {
            return properties?.id ?? properties?.ID ?? properties?.fid ?? properties?.FID ??
                properties?.objectid ?? properties?.OBJECTID ?? JSON.stringify(properties);
        };

        // Track layers as they're interacted with
        const trackLayer = (layer: any) => {
            if (layer && layer.properties) {
                const featureId = getFeatureIdentifier(layer.properties);
                if (!layersByFeatureId.has(featureId)) {
                    layersByFeatureId.set(featureId, []);
                }
                const layers = layersByFeatureId.get(featureId)!;
                if (!layers.includes(layer)) {
                    layers.push(layer);
                }
            }
        };

        // Helper to find and style all segments with the same feature ID
        const selectAllSegments = (featureId: string) => {
            const layers = layersByFeatureId.get(featureId) || [];
            
            layers.forEach(layer => {
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

        const unselectAllSegments = (featureId: string) => {
            const layers = selectedLayers.get(featureId);
            if (layers) {
                layers.forEach(layer => resetStyle(layer));
            }
        };

        if (options?.enableFeatureSelection !== false) {
            vectorTileLayer.on('click', function (e: any) {
                if (e.layer && e.layer.properties) {
                    // Track this layer
                    trackLayer(e.layer);
                    
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
                                const hoverStyle = options?.hoverStyle || DEFAULT_HOVER_STYLE;
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
                        if (!options?.multipleFeatureSelection) {
                            selectedFeatures.forEach((_, id) => unselectAllSegments(id));
                            selectedFeatures.clear();
                            selectedLayers.clear();
                        }

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
                    // Track this layer
                    trackLayer(e.layer);
                    
                    const featureId = getFeatureIdentifier(e.layer.properties);
                    
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

        // Attach standard GridLayer event handlers
        if (handlerMappings?.dotNetRef && handlerMappings.events) {
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

            // Attach interactive event handlers when interactive is enabled
            if (options?.interactive) {
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
            }
        }

        // Expose setInteractive method
        (vectorTileLayer as any).setInteractive = function (interactive: boolean) {
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
        };

        return vectorTileLayer;
    }
};

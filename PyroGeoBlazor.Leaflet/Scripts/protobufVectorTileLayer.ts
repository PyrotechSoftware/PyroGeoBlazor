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
        // Selection state management
        const selectedFeatures: Map<any, any> = new Map();
        const selectedLayers: Map<any, any[]> = new Map();
        
        // Track all layers by feature ID as they're added
        const layersByFeatureId: Map<string, any[]> = new Map();

        // Default selected feature style using Leaflet Path style properties
        const defaultSelectedStyle = {
            color: '#368ce1',
            weight: 3,
            fillColor: '#368ce1',
            fillOpacity: 0.3,
            opacity: 1
        };

        const selectedFeatureStyle = options?.selectedFeatureStyle ?? defaultSelectedStyle;

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
                        unselectAllSegments(featureId);
                        selectedFeatures.delete(featureId);
                        selectedLayers.delete(featureId);

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
                        // Handle multiple selection
                        if (!options?.multipleFeatureSelection) {
                            // Unselect all previously selected features
                            selectedFeatures.forEach((_, id) => unselectAllSegments(id));
                            selectedFeatures.clear();
                            selectedLayers.clear();
                        }

                        // Select all segments of this feature across all tiles
                        const layers = selectAllSegments(featureId);
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
        };
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

        // Setup feature selection
        VectorTileHelpers.setupFeatureSelection(vectorTileLayer, options, handlerMappings);

        // Attach interactive event handlers (mouseover, mouseout, etc.)
        VectorTileHelpers.attachInteractiveEvents(vectorTileLayer, options, handlerMappings);

        // Attach standard event handlers
        VectorTileHelpers.attachGridLayerEvents(vectorTileLayer, handlerMappings);

        return vectorTileLayer;
    }
};

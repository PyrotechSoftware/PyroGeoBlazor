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

        // Setup feature selection with multi-segment support
        const selectedFeatures: Map<any, any> = new Map();
        const selectedLayers: Map<any, any[]> = new Map();
        
        // Track all layers by feature ID as they're added
        const layersByFeatureId: Map<string, any[]> = new Map();

        const defaultSelectedStyle = {
            color: '#368ce1',
            weight: 3,
            fillColor: '#368ce1',
            fillOpacity: 0.3,
            opacity: 1
        };

        const selectedFeatureStyle = options?.selectedFeatureStyle ?? defaultSelectedStyle;

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
                        unselectAllSegments(featureId);
                        selectedFeatures.delete(featureId);
                        selectedLayers.delete(featureId);

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
        };

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

        return vectorTileLayer;
    }
};

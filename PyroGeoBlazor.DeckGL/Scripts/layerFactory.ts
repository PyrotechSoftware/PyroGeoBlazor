import { Layer } from '@deck.gl/core';
import { GeoJsonLayer, ScatterplotLayer, ArcLayer, BitmapLayer } from '@deck.gl/layers';
import { TileLayer, MVTLayer } from '@deck.gl/geo-layers';
import type { LayerConfig } from './deckGLView';

/**
 * Factory function to create deck.gl layers from configuration objects
 * This allows Blazor to specify layer types and properties without knowing deck.gl internals
 */
export function createLayerFromConfig(config: LayerConfig, data: any): Layer | null {
    const { id, type, props } = config;

    console.log(`Creating layer: ${id} (${type})`);

    switch (type.toLowerCase()) {
        case 'geojson':
        case 'geojsonlayer':
            return new GeoJsonLayer({
                id,
                data,
                ...props,
                // Default properties if not specified
                pickable: props.pickable ?? true,
                stroked: props.stroked ?? true,
                filled: props.filled ?? true,
                extruded: props.extruded ?? false,
                pointType: props.pointType ?? 'circle',
                lineWidthScale: props.lineWidthScale ?? 20,
                lineWidthMinPixels: props.lineWidthMinPixels ?? 2,
                getFillColor: props.getFillColor ?? [160, 160, 180, 200],
                getLineColor: props.getLineColor ?? [0, 0, 0, 255],
                getPointRadius: props.getPointRadius ?? 100,
                getLineWidth: props.getLineWidth ?? 1,
                getElevation: props.getElevation ?? 30,
                
                // Update triggers: Tell deck.gl which properties to watch for changes
                // This prevents unnecessary recalculations when unrelated properties change
                updateTriggers: {
                    getFillColor: [props.getFillColor],
                    getLineColor: [props.getLineColor],
                    getLineWidth: [props.getLineWidth],
                    getPointRadius: [props.getPointRadius],
                    getElevation: [props.getElevation]
                }
            });

        case 'scatterplot':
        case 'scatterplotlayer':
            return new ScatterplotLayer({
                id,
                data,
                ...props,
                pickable: props.pickable ?? true,
                opacity: props.opacity ?? 0.8,
                stroked: props.stroked ?? true,
                filled: props.filled ?? true,
                radiusScale: props.radiusScale ?? 6,
                radiusMinPixels: props.radiusMinPixels ?? 1,
                radiusMaxPixels: props.radiusMaxPixels ?? 100,
                lineWidthMinPixels: props.lineWidthMinPixels ?? 1,
                getPosition: props.getPosition ?? ((d: any) => d.position || [d.longitude, d.latitude]),
                getRadius: props.getRadius ?? ((d: any) => d.radius || 5),
                getFillColor: props.getFillColor ?? ((d: any) => d.color || [255, 140, 0]),
                getLineColor: props.getLineColor ?? [0, 0, 0],
                
                // Update triggers for dynamic accessors
                updateTriggers: {
                    getPosition: [props.getPosition],
                    getRadius: [props.getRadius],
                    getFillColor: [props.getFillColor],
                    getLineColor: [props.getLineColor]
                }
            });

        case 'arc':
        case 'arclayer':
            return new ArcLayer({
                id,
                data,
                ...props,
                pickable: props.pickable ?? true,
                getWidth: props.getWidth ?? 5,
                getSourcePosition: props.getSourcePosition ?? ((d: any) => d.from.coordinates),
                getTargetPosition: props.getTargetPosition ?? ((d: any) => d.to.coordinates),
                getSourceColor: props.getSourceColor ?? [0, 128, 255],
                getTargetColor: props.getTargetColor ?? [255, 0, 128],
                
                // Update triggers for arc properties
                updateTriggers: {
                    getWidth: [props.getWidth],
                    getSourcePosition: [props.getSourcePosition],
                    getTargetPosition: [props.getTargetPosition],
                    getSourceColor: [props.getSourceColor],
                    getTargetColor: [props.getTargetColor]
                }
            });

        case 'tile':
        case 'tilelayer':
            return new TileLayer({
                id,
                // TileLayer uses the data as the tile URL template
                data: props.tileUrl || data,
                minZoom: props.minZoom ?? 0,
                maxZoom: props.maxZoom ?? 19,
                tileSize: props.tileSize ?? 256,
                zIndex: props.zIndex ?? 0,
                
                renderSubLayers: (subLayerProps: any) => {
                    const { bbox, data: tileData } = subLayerProps.tile;
                    
                    // Don't render if tile data is not loaded yet
                    if (!tileData) {
                        return null;
                    }
                    
                    return new BitmapLayer({
                        id: `${subLayerProps.id}-bitmap`,
                        image: tileData,
                        bounds: [bbox.west, bbox.south, bbox.east, bbox.north],
                        // Explicitly set these to avoid data counting issues
                        data: undefined
                    });
                },
                
                ...props
            });

        case 'mvt':
        case 'mvtlayer':
            // Determine pickable setting (default to false for performance)
            const isPickable = props.pickable === true;
            
            // CRITICAL: When pickable=true, we MUST use binary=false so features have properties
            const useBinaryMode = !isPickable;
            
            console.log(`🔧 Creating MVTLayer: ${id}`);
            console.log(`  pickable: ${isPickable}`);
            console.log(`  binary mode: ${useBinaryMode} (${useBinaryMode ? 'fast, no properties' : 'slower, has properties'})`);
            
            return new MVTLayer({
                id,
                data: props.dataUrl || data,
                minZoom: props.minZoom ?? 0,
                maxZoom: props.maxZoom ?? 22,
                
                // Styling properties
                // Default to NOT pickable for better performance (binary mode)
                pickable: isPickable,
                stroked: props.stroked ?? true,
                filled: props.filled ?? true,
                
                // Use dynamic accessors if provided (for hover/selection), otherwise use static colors
                getFillColor: props.getFillColor ?? (props.fillColor || [160, 160, 180, 200]),
                getLineColor: props.getLineColor ?? (props.lineColor || [80, 80, 80, 255]),
                getLineWidth: props.getLineWidth ?? 1,
                getRadius: props.getRadius,
                
                lineWidthScale: props.lineWidthScale ?? 1,
                lineWidthMinPixels: props.lineWidthMinPixels ?? 1,
                
                // Point styling
                pointRadiusMinPixels: props.pointRadiusMinPixels ?? 2,
                
                // PERFORMANCE OPTIMIZATION: Use binary mode by default for 5-10x faster rendering
                // Binary mode is disabled automatically when pickable=true (needed for feature selection)
                // When binary=true: Uses WebGL buffers directly (fast, but no feature access)
                // When binary=false: Parses as GeoJSON (slower, but enables picking/selection)
                binary: useBinaryMode,
                
                // Update triggers for MVT styling
                updateTriggers: {
                    getFillColor: [props.getFillColor, props.fillColor],
                    getLineColor: [props.getLineColor, props.lineColor],
                    getLineWidth: [props.getLineWidth],
                    getRadius: [props.getRadius]
                },
                
                ...props
            });

        default:
            console.warn(`Unknown layer type: ${type}`);
            return null;
    }
}

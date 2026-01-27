import { Layer } from '@deck.gl/core';
import { GeoJsonLayer, ScatterplotLayer, ArcLayer, BitmapLayer, TextLayer } from '@deck.gl/layers';
import { TileLayer, MVTLayer } from '@deck.gl/geo-layers';
import type { LayerConfig } from './deckGLView';

/**
 * Converts hex color to RGBA array for deck.gl
 * Supports 6-char (#RRGGBB) and 8-char (#RRGGBBAA) formats
 */
function hexToRgba(hex: string): [number, number, number, number] {
    hex = hex.replace('#', '');
    
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const a = hex.length === 8 
        ? parseInt(hex.substring(6, 8), 16) 
        : 255;
    
    return [r, g, b, a];
}

/**
 * Factory function to create deck.gl layers from configuration objects
 * This allows Blazor to specify layer types and properties without knowing deck.gl internals
 * Returns an array of layers (can include a text layer for labels)
 */
export function createLayerFromConfig(config: LayerConfig, data: any): Layer[] {
    const { id, type, props } = config;

    console.log(`Creating layer: ${id} (${type})`);
    console.log(`🏭 Props received:`, {
        propsKeys: Object.keys(props).slice(0, 10), // First 10 keys
        hasOnTileLoad: 'onTileLoad' in props,
        onTileLoadType: typeof props.onTileLoad
    });
    
    // Debug label config
    if (config.labelConfig) {
        console.log(`📝 Label config for ${id}:`, {
            textProperty: config.labelConfig.textProperty,
            enabled: config.labelConfig.enabled,
            minZoom: config.labelConfig.minZoom,
            fontSize: config.labelConfig.fontSize
        });
    }

    const layers: Layer[] = [];

    switch (type.toLowerCase()) {
        case 'geojson':
        case 'geojsonlayer':
            const geojsonProps: any = {
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
                updateTriggers: {
                    getFillColor: [props.getFillColor],
                    getLineColor: [props.getLineColor],
                    getLineWidth: [props.getLineWidth],
                    getPointRadius: [props.getPointRadius],
                    getElevation: [props.getElevation]
                }
            };

            // Add the main geometry layer
            layers.push(new GeoJsonLayer(geojsonProps));

            // Add a TextLayer for labels if configured
            if (config.labelConfig?.enabled && config.labelConfig?.textProperty) {
                console.log(`📝 Creating TextLayer for ${id}: property="${config.labelConfig.textProperty}"`);
                
                // Extract features array from GeoJSON if needed
                const textData = data?.type === 'FeatureCollection' ? data.features : data;
                
                // Helper: Calculate bounding box center (more accurate than coordinate averaging)
                const getBoundingBoxCenter = (coords: number[][]): [number, number] => {
                    let minLon = Infinity, maxLon = -Infinity;
                    let minLat = Infinity, maxLat = -Infinity;
                    
                    coords.forEach(coord => {
                        minLon = Math.min(minLon, coord[0]);
                        maxLon = Math.max(maxLon, coord[0]);
                        minLat = Math.min(minLat, coord[1]);
                        maxLat = Math.max(maxLat, coord[1]);
                    });
                    
                    return [(minLon + maxLon) / 2, (minLat + maxLat) / 2];
                };
                
                // Helper: Get bounding box dimensions
                const getBoundingBoxDimensions = (coords: number[][]): { width: number, height: number } => {
                    let minLon = Infinity, maxLon = -Infinity;
                    let minLat = Infinity, maxLat = -Infinity;
                    
                    coords.forEach(coord => {
                        minLon = Math.min(minLon, coord[0]);
                        maxLon = Math.max(maxLon, coord[0]);
                        minLat = Math.min(minLat, coord[1]);
                        maxLat = Math.max(maxLat, coord[1]);
                    });
                    
                    return {
                        width: maxLon - minLon,
                        height: maxLat - minLat
                    };
                };
                
                // Helper: Get largest polygon from MultiPolygon (by number of coordinates)
                const getLargestPolygon = (coordinates: number[][][][]): number[][][] | null => {
                    if (!coordinates || coordinates.length === 0) return null;
                    
                    let largest = coordinates[0];
                    let maxPoints = coordinates[0][0].length;
                    
                    for (let i = 1; i < coordinates.length; i++) {
                        const pointCount = coordinates[i][0].length;
                        if (pointCount > maxPoints) {
                            maxPoints = pointCount;
                            largest = coordinates[i];
                        }
                    }
                    
                    return largest;
                };
                
                // Helper: Estimate if text fits inside polygon bounds
                // Returns true if text should be shown, false if it would overflow
                const textFitsInBounds = (text: string, fontSize: number, geometry: any): boolean => {
                    if (!text || !geometry) return false;
                    
                    // Rough estimate: average character width is ~0.6 * fontSize for proportional fonts
                    const estimatedTextWidth = text.length * fontSize * 0.6;
                    const textHeight = fontSize;
                    
                    try {
                        let bounds: { width: number, height: number } | null = null;
                        
                        if (geometry.type === 'Polygon' && geometry.coordinates[0]) {
                            bounds = getBoundingBoxDimensions(geometry.coordinates[0]);
                        } 
                        else if (geometry.type === 'MultiPolygon' && geometry.coordinates.length > 0) {
                            const largestPolygon = getLargestPolygon(geometry.coordinates);
                            if (largestPolygon && largestPolygon[0]) {
                                bounds = getBoundingBoxDimensions(largestPolygon[0]);
                            }
                        }
                        
                        if (!bounds) return true; // Can't determine bounds, show label
                        
                        // Convert geographic degrees to approximate pixels at equator
                        // At zoom level ~10, 1 degree ≈ 11,000 pixels, but this varies by zoom and latitude
                        // We'll use a rough approximation: assume we're at mid-latitudes
                        // This is a heuristic - adjust the multiplier if needed (higher = more permissive)
                        const pixelsPerDegree = 8000; // Rough estimate at medium zoom
                        const bboxWidthPx = bounds.width * pixelsPerDegree;
                        const bboxHeightPx = bounds.height * pixelsPerDegree;
                        
                        // Label should fit within 70% of polygon bounds (leave 15% margin on each side)
                        const fitThreshold = 0.7;
                        const widthFits = estimatedTextWidth < (bboxWidthPx * fitThreshold);
                        const heightFits = textHeight < (bboxHeightPx * fitThreshold);
                        
                        return widthFits && heightFits;
                    } catch (error) {
                        console.warn('Error checking text bounds:', error);
                        return true; // On error, show label
                    }
                };
                
                let filteredCount = 0;
                let totalCount = 0;
                
                const textLayer = new TextLayer({
                    id: `${id}-labels`,
                    data: textData,
                    pickable: false, // Labels aren't interactive
                    
                    // Get position from feature centroid/bounding box center
                    getPosition: (d: any) => {
                        const geometry = d.geometry || d;
                        
                        if (!geometry || !geometry.type) {
                            return [0, 0];
                        }
                        
                        try {
                            if (geometry.type === 'Point') {
                                return geometry.coordinates;
                            } 
                            else if (geometry.type === 'Polygon' && geometry.coordinates[0]) {
                                return getBoundingBoxCenter(geometry.coordinates[0]);
                            } 
                            else if (geometry.type === 'MultiPolygon' && geometry.coordinates.length > 0) {
                                const largestPolygon = getLargestPolygon(geometry.coordinates);
                                if (largestPolygon && largestPolygon[0]) {
                                    return getBoundingBoxCenter(largestPolygon[0]);
                                }
                            } 
                            else if (geometry.type === 'LineString' && geometry.coordinates.length > 0) {
                                return getBoundingBoxCenter(geometry.coordinates);
                            } 
                            else if (geometry.type === 'MultiLineString' && geometry.coordinates[0]) {
                                return getBoundingBoxCenter(geometry.coordinates[0]);
                            }
                        } catch (error) {
                            console.error('Error calculating label position:', error);
                        }
                        
                        return [0, 0];
                    },
                    
                    // Get text from feature property (with boundary check)
                    getText: (d: any) => {
                        totalCount++;
                        const properties = d.properties || d;
                        const text = properties?.[config.labelConfig.textProperty];
                        
                        if (text === null || text === undefined || text === '') {
                            return '';
                        }
                        
                        const textStr = String(text);
                        const geometry = d.geometry || d;
                        
                        // Check if text fits in polygon bounds
                        if (!textFitsInBounds(textStr, config.labelConfig.fontSize, geometry)) {
                            filteredCount++;
                            return ''; // Don't show label - it won't fit
                        }
                        
                        return textStr;
                    },
                    
                    // Font size (base size, will scale with zoom via sizeScale)
                    getSize: config.labelConfig.fontSize,
                    
                    // Text color
                    getColor: hexToRgba(config.labelConfig.textColor),
                    
                    // Background color for better readability
                    getBackgroundColor: hexToRgba(config.labelConfig.backgroundColor),
                    
                    // Text anchor and alignment
                    getTextAnchor: config.labelConfig.textAnchor as 'start' | 'middle' | 'end',
                    getAlignmentBaseline: config.labelConfig.textAlignment as 'top' | 'center' | 'bottom',
                    
                    // Padding around background
                    backgroundPadding: [2, 1],
                    
                    // CRITICAL: Scaling properties for proper zoom behavior
                    sizeScale: 1, // Base scale factor
                    sizeMinPixels: config.labelConfig.fontSize * 0.5, // Don't get smaller than half size
                    sizeMaxPixels: config.labelConfig.fontSize * 3, // Don't get larger than 3x size
                    
                    // Remove outline - requires SDF font configuration
                    // outlineWidth: 2,
                    // outlineColor: [255, 255, 255, 200],
                    
                    // Character set
                    characterSet: 'auto',
                    
                    // Font settings
                    fontFamily: 'Arial, sans-serif',
                    fontWeight: 'normal',
                    
                    // Billboard mode - text always faces camera
                    billboard: true,
                    
                    // Smooth transitions
                    transitions: {
                        getPosition: 300,
                        getSize: 300
                    }
                });
                
                layers.push(textLayer);
                
                // Log summary after a brief delay to let getText be called
                setTimeout(() => {
                    const shownCount = totalCount - filteredCount;
                    console.log(`✅ TextLayer: ${shownCount} of ${totalCount} labels shown (${filteredCount} filtered as too large)`);
                }, 500);
            }

            return layers;

        case 'scatterplot':
        case 'scatterplotlayer':
            layers.push(new ScatterplotLayer({
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
            }));
            return layers;

        case 'arc':
        case 'arclayer':
            layers.push(new ArcLayer({
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
            }));
            return layers;

        case 'tile':
        case 'tilelayer':
            layers.push(new TileLayer({
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
            }));
            return layers;

        case 'mvt':
        case 'mvtlayer':
            // Determine pickable setting (default to false for performance)
            const isPickable = props.pickable === true;
            
            // CRITICAL: When pickable=true OR labels enabled, we MUST use binary=false
            const hasLabels = config.labelConfig?.enabled && config.labelConfig?.textProperty;
            const useBinaryMode = !isPickable && !hasLabels;
            
            console.log(`🔧 Creating MVTLayer: ${id}`);
            console.log(`  pickable: ${isPickable}`);
            console.log(`  labels: ${hasLabels ? `enabled (${config.labelConfig.textProperty})` : 'disabled'}`);
            console.log(`  binary mode: ${useBinaryMode} (${useBinaryMode ? 'fast, no properties' : 'slower, has properties'})`);
            console.log(`  onTileLoad callback exists: ${typeof props.onTileLoad === 'function'}`);
            console.log(`  onTileError callback exists: ${typeof props.onTileError === 'function'}`);
            
            const mvtProps: any = {
                id,
                data: props.dataUrl || data,
                minZoom: props.minZoom ?? 0,
                maxZoom: props.maxZoom ?? 22,
                
                // Styling properties
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
                
                // Pass through uniqueIdProperty from LayerConfig
                uniqueIdProperty: config.uniqueIdProperty,
                
                // PERFORMANCE OPTIMIZATION: Use binary mode by default for 5-10x faster rendering
                // Binary mode is disabled when pickable=true or labels enabled
                // When binary=true: Uses WebGL buffers directly (fast, but no feature access)
                // When binary=false: Parses as GeoJSON (slower, but enables picking/selection/labels)
                binary: useBinaryMode,
                
                // Fix deprecation warning: use mvt.shape instead of gis
                loadOptions: {
                    mvt: {
                        shape: 'geojson-table'
                    }
                },
                
                // Update triggers for MVT styling
                updateTriggers: {
                    getFillColor: [props.getFillColor, props.fillColor],
                    getLineColor: [props.getLineColor, props.lineColor],
                    getLineWidth: [props.getLineWidth],
                    getRadius: [props.getRadius]
                },
                
                ...props
            };

            console.log(`🆔 MVT uniqueIdProperty: ${config.uniqueIdProperty || 'not set'}`);


            // For MVT layers with labels, we need to use renderSubLayers to create TextLayer per tile
            if (hasLabels) {
                console.log(`📝 Enabling per-tile labels for MVT layer ${id}: property="${config.labelConfig.textProperty}"`);
                
                // Override renderSubLayers to add a TextLayer for each tile's features
                const originalRenderSubLayers = mvtProps.renderSubLayers;
                
                mvtProps.renderSubLayers = (subLayerProps: any) => {
                    // Debug: Log tile info to understand coordinate system
                    if (subLayerProps.tile) {
                        console.log(`🗺️ Tile info:`, {
                            id: subLayerProps.tile.id,
                            bbox: subLayerProps.tile.bbox,
                            index: subLayerProps.tile.index,
                            zoom: subLayerProps.tile.zoom
                        });
                    }
                    
                    // Debug: Log what we receive
                    console.log(`📦 renderSubLayers called for tile:`, {
                        id: subLayerProps.id,
                        hasData: !!subLayerProps.data,
                        dataType: typeof subLayerProps.data,
                        isArray: Array.isArray(subLayerProps.data),
                        dataLength: Array.isArray(subLayerProps.data) ? subLayerProps.data.length : 'N/A',
                        hasTile: !!subLayerProps.tile,
                        tileKeys: subLayerProps.tile ? Object.keys(subLayerProps.tile) : []
                    });
                    
                    // First, render the geometry layer (default behavior)
                    const geoLayer = originalRenderSubLayers 
                        ? originalRenderSubLayers(subLayerProps)
                        : new GeoJsonLayer(subLayerProps);
                    
                    const layers: Layer[] = geoLayer ? [geoLayer] : [];
                    
                    // Try to get the features from various possible locations
                    let features: any[] = [];
                    
                    if (subLayerProps.data && Array.isArray(subLayerProps.data)) {
                        features = subLayerProps.data;
                    } else if (subLayerProps.tile?.data) {
                        const tileData = subLayerProps.tile.data;
                        if (Array.isArray(tileData)) {
                            features = tileData;
                        } else if (tileData.type === 'FeatureCollection' && tileData.features) {
                            features = tileData.features;
                        }
                    }
                    
                    // Add a TextLayer for this tile's features
                    if (features.length > 0) {
                        
                        // Get tile bounding box for coordinate transformation
                        const tileBbox = subLayerProps.tile?.bbox;
                        
                        if (!tileBbox) {
                            console.error(`❌ No tile bbox available for coordinate transformation`);
                            return layers;
                        }
                        
                        console.log(`📐 Tile bbox:`, tileBbox);
                        
                        // Helper function to convert tile coordinates [0,1] to geographic coordinates
                        const tileToGeo = (tileCoord: [number, number]): [number, number] => {
                            const [tileX, tileY] = tileCoord;
                            const lon = tileBbox.west + (tileX * (tileBbox.east - tileBbox.west));
                            // MVT Y axis is inverted: Y=0 is north (top), Y=1 is south (bottom)
                            const lat = tileBbox.north - (tileY * (tileBbox.north - tileBbox.south));
                            return [lon, lat];
                        };
                        
                        // Counters for debug logging
                        let labelCount = 0;
                        let debugLoggedText = false;
                        let debugLoggedPosition = false;
                        
                        const textLayer = new TextLayer({
                            id: `${subLayerProps.id}-labels`,
                            data: features,
                            pickable: false,
                            visible: true,  // Explicitly set visible
                            
                            // DO NOT inherit coordinate system from MVT layer!
                            // MVT uses tile-local coordinates, but we're converting to geographic
                            // Let TextLayer use default LNGLAT coordinate system
                            // coordinateSystem: subLayerProps.coordinateSystem,
                            // modelMatrix: subLayerProps.modelMatrix,
                            
                            getPosition: (d: any) => {
                                const geometry = d.geometry;
                                
                                if (!geometry || !geometry.coordinates) {
                                    if (!debugLoggedPosition) {
                                        console.log(`⚠️ Feature has no geometry or coordinates`);
                                    }
                                    return [0, 0];
                                }
                                
                                try {
                                    let tilePosition: [number, number] = [0, 0];
                                    
                                    if (geometry.type === 'Point') {
                                        tilePosition = geometry.coordinates as [number, number];
                                    } 
                                    else if (geometry.type === 'Polygon' && geometry.coordinates[0]) {
                                        // Calculate center of bounding box in tile space
                                        const coords = geometry.coordinates[0];
                                        let minX = Infinity, maxX = -Infinity;
                                        let minY = Infinity, maxY = -Infinity;
                                        
                                        coords.forEach((coord: number[]) => {
                                            minX = Math.min(minX, coord[0]);
                                            maxX = Math.max(maxX, coord[0]);
                                            minY = Math.min(minY, coord[1]);
                                            maxY = Math.max(maxY, coord[1]);
                                        });
                                        
                                        tilePosition = [(minX + maxX) / 2, (minY + maxY) / 2];
                                    }
                                    else if (geometry.type === 'MultiPolygon' && geometry.coordinates.length > 0) {
                                        const firstPolygon = geometry.coordinates[0][0];
                                        let minX = Infinity, maxX = -Infinity;
                                        let minY = Infinity, maxY = -Infinity;
                                        
                                        firstPolygon.forEach((coord: number[]) => {
                                            minX = Math.min(minX, coord[0]);
                                            maxX = Math.max(maxX, coord[0]);
                                            minY = Math.min(minY, coord[1]);
                                            maxY = Math.max(maxY, coord[1]);
                                        });
                                        
                                        tilePosition = [(minX + maxX) / 2, (minY + maxY) / 2];
                                    }
                                    else if (geometry.type === 'LineString' && geometry.coordinates.length > 0) {
                                        const coords = geometry.coordinates;
                                        let minX = Infinity, maxX = -Infinity;
                                        let minY = Infinity, maxY = -Infinity;
                                        
                                        coords.forEach((coord: number[]) => {
                                            minX = Math.min(minX, coord[0]);
                                            maxX = Math.max(maxX, coord[0]);
                                            minY = Math.min(minY, coord[1]);
                                            maxY = Math.max(maxY, coord[1]);
                                        });
                                        
                                        tilePosition = [(minX + maxX) / 2, (minY + maxY) / 2];
                                    }
                                    
                                    // Convert tile coordinates to geographic coordinates
                                    const geoPosition = tileToGeo(tilePosition);
                                    
                                    // Debug log first position
                                    if (!debugLoggedPosition) {
                                        debugLoggedPosition = true;
                                        console.log(`📍 Tile position:`, tilePosition);
                                        console.log(`📍 Converted to geo:`, geoPosition);
                                        console.log(`📍 Geometry type:`, geometry.type);
                                    }
                                    
                                    return geoPosition;
                                } catch (error) {
                                    if (!debugLoggedPosition) {
                                        console.error('❌ Error calculating position:', error);
                                    }
                                    return [0, 0];
                                }
                            },
                            
                            getText: (d: any) => {
                                const properties = d.properties || {};
                                const text = properties[config.labelConfig.textProperty];
                                
                                if (text === null || text === undefined || text === '') {
                                    return '';
                                }
                                
                                // SIZE VALIDATION: Check if the text fits within the polygon bounds
                                const geometry = d.geometry;
                                let passesSizeCheck = true;
                                
                                if (geometry && (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon')) {
                                    try {
                                        let coords: number[][] = [];
                                        
                                        if (geometry.type === 'Polygon' && geometry.coordinates[0]) {
                                            coords = geometry.coordinates[0];
                                        } else if (geometry.type === 'MultiPolygon' && geometry.coordinates.length > 0) {
                                            coords = geometry.coordinates[0][0];
                                        }
                                        
                                        if (coords.length > 0) {
                                            // Calculate bounding box in tile space [0,1]
                                            let minX = Infinity, maxX = -Infinity;
                                            let minY = Infinity, maxY = -Infinity;
                                            
                                            coords.forEach((coord: number[]) => {
                                                minX = Math.min(minX, coord[0]);
                                                maxX = Math.max(maxX, coord[0]);
                                                minY = Math.min(minY, coord[1]);
                                                maxY = Math.max(maxY, coord[1]);
                                            });
                                            
                                            const width = maxX - minX;
                                            const height = maxY - minY;
                                            
                                            // Convert to pixel dimensions (MVT tiles are typically 512px)
                                            const tileExtent = 512;
                                            const pixelWidth = width * tileExtent;
                                            const pixelHeight = height * tileExtent;
                                            
                                            // Estimate text dimensions
                                            const fontSize = config.labelConfig.fontSize || 12;
                                            const textStr = String(text);
                                            // Average char width is ~0.6 * fontSize for proportional fonts
                                            const estimatedTextWidth = textStr.length * fontSize * 0.6;
                                            // Add vertical padding for background
                                            const textHeight = fontSize * 1.5;
                                            
                                            // Label must fit within polygon with some margin
                                            // Require polygon to be at least 1.5x the text size
                                            const fitThreshold = 1.5;
                                            if (pixelWidth < estimatedTextWidth * fitThreshold || 
                                                pixelHeight < textHeight * fitThreshold) {
                                                passesSizeCheck = false;
                                            }
                                        }
                                    } catch (error) {
                                        console.error('Error checking label bounds:', error);
                                    }
                                }
                                
                                if (!passesSizeCheck) {
                                    return '';
                                }
                                
                                labelCount++;
                                return String(text);
                            },
                            
                            getSize: config.labelConfig.fontSize,
                            getColor: hexToRgba(config.labelConfig.textColor),
                            getBackgroundColor: hexToRgba(config.labelConfig.backgroundColor),
                            getTextAnchor: config.labelConfig.textAnchor as 'start' | 'middle' | 'end',
                            getAlignmentBaseline: config.labelConfig.textAlignment as 'top' | 'center' | 'bottom',
                            
                            backgroundPadding: [2, 1],
                            sizeScale: 1,
                            sizeMinPixels: config.labelConfig.fontSize * 0.5,
                            sizeMaxPixels: config.labelConfig.fontSize * 3,
                            
                            // Remove outline for now - requires SDF font configuration
                            // outlineWidth: 2,
                            // outlineColor: [255, 255, 255, 200],
                            
                            characterSet: 'auto',
                            fontFamily: 'Arial, sans-serif',
                            fontWeight: 'normal',
                            billboard: true
                        });
                        
                        layers.push(textLayer);
                    }
                    
                    return layers;
                };
            }
            
            // Create the MVT layer (with custom renderSubLayers if labels enabled)
            const mvtLayer = new MVTLayer(mvtProps);
            layers.push(mvtLayer);
            
            return layers;

        default:
            console.warn(`Unknown layer type: ${type}`);
            return [];
    }
}

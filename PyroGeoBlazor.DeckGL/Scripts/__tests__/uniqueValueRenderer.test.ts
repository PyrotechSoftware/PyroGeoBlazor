import { describe, it, expect, beforeEach } from 'vitest';

// Mock types for testing
interface FeatureStyleConfig {
    fillColor?: string;
    fillOpacity?: number;
    lineColor?: string;
    opacity?: number;
    lineWidth?: number;
    radiusScale?: number;
}

interface UniqueValueRenderer {
    attribute: string;
    valueStyles: Record<string, FeatureStyleConfig>;
    defaultStyle?: FeatureStyleConfig;
}

interface LayerConfig {
    id: string;
    type: string;
    props: Record<string, any>;
    uniqueValueRenderer?: UniqueValueRenderer;
}

// Helper function to convert hex to RGBA (copied from deckGLView.ts)
function hexToRgba(hex: string, opacity: number = 1.0): [number, number, number, number] {
    hex = hex.replace(/^#/, '');
    
    let r: number, g: number, b: number, a: number = 255;
    
    if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    } else if (hex.length === 8) {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
        a = parseInt(hex.substring(6, 8), 16);
        opacity = a / 255;
    } else {
        return [255, 255, 255, 255];
    }
    
    a = Math.round(opacity * 255);
    return [r, g, b, a];
}

// Mock implementation of applyUniqueValueRenderer
function applyUniqueValueRenderer(config: LayerConfig, enhancedProps: Record<string, any>): void {
    const renderer = config.uniqueValueRenderer!;
    const attribute = renderer.attribute;
    const valueStyles = renderer.valueStyles;
    const defaultStyle = renderer.defaultStyle;

    // Create getFillColor accessor function
    enhancedProps.getFillColor = (feature: any) => {
        let value = feature.properties?.[attribute];
        const valueKey = value === null || value === undefined ? 'null' : String(value);
        const style = valueStyles[valueKey] ?? defaultStyle;
        
        if (style?.fillColor) {
            const fillOpacity = style.fillOpacity ?? 1.0;
            return hexToRgba(style.fillColor, fillOpacity);
        }
        
        return [160, 160, 180, 200];
    };

    // Create getLineColor accessor function
    enhancedProps.getLineColor = (feature: any) => {
        let value = feature.properties?.[attribute];
        const valueKey = value === null || value === undefined ? 'null' : String(value);
        const style = valueStyles[valueKey] ?? defaultStyle;
        
        if (style?.lineColor) {
            const lineOpacity = style.opacity ?? 1.0;
            return hexToRgba(style.lineColor, lineOpacity);
        }
        
        return [80, 80, 80, 255];
    };

    // Create getLineWidth accessor function
    enhancedProps.getLineWidth = (feature: any) => {
        let value = feature.properties?.[attribute];
        const valueKey = value === null || value === undefined ? 'null' : String(value);
        const style = valueStyles[valueKey] ?? defaultStyle;
        
        return style?.lineWidth ?? 1;
    };
}

describe('UniqueValueRenderer', () => {
    describe('hexToRgba', () => {
        it('should convert 6-digit hex color to RGBA', () => {
            const result = hexToRgba('#FF0000', 1.0);
            expect(result).toEqual([255, 0, 0, 255]);
        });

        it('should convert 3-digit hex color to RGBA', () => {
            const result = hexToRgba('#F00', 1.0);
            expect(result).toEqual([255, 0, 0, 255]);
        });

        it('should apply opacity to RGBA', () => {
            const result = hexToRgba('#00FF00', 0.5);
            expect(result).toEqual([0, 255, 0, 128]);
        });

        it('should handle 8-digit hex color with alpha', () => {
            const result = hexToRgba('#FF0000AA');
            expect(result[0]).toBe(255);
            expect(result[1]).toBe(0);
            expect(result[2]).toBe(0);
            expect(result[3]).toBeGreaterThan(0);
        });

        it('should handle hex without # prefix', () => {
            const result = hexToRgba('0000FF', 1.0);
            expect(result).toEqual([0, 0, 255, 255]);
        });
    });

    describe('applyUniqueValueRenderer', () => {
        let config: LayerConfig;
        let enhancedProps: Record<string, any>;

        beforeEach(() => {
            config = {
                id: 'test-layer',
                type: 'GeoJsonLayer',
                props: {},
                uniqueValueRenderer: {
                    attribute: 'category',
                    valueStyles: {
                        'A': { fillColor: '#FF0000', fillOpacity: 0.8, lineColor: '#AA0000', lineWidth: 2 },
                        'B': { fillColor: '#00FF00', fillOpacity: 0.6, lineColor: '#00AA00', lineWidth: 3 },
                        'null': { fillColor: '#808080', fillOpacity: 0.5, lineColor: '#404040', lineWidth: 1 }
                    },
                    defaultStyle: { fillColor: '#CCCCCC', fillOpacity: 0.4, lineColor: '#666666', lineWidth: 1 }
                }
            };
            enhancedProps = {};
        });

        it('should create getFillColor accessor', () => {
            applyUniqueValueRenderer(config, enhancedProps);
            expect(enhancedProps.getFillColor).toBeDefined();
            expect(typeof enhancedProps.getFillColor).toBe('function');
        });

        it('should create getLineColor accessor', () => {
            applyUniqueValueRenderer(config, enhancedProps);
            expect(enhancedProps.getLineColor).toBeDefined();
            expect(typeof enhancedProps.getLineColor).toBe('function');
        });

        it('should create getLineWidth accessor', () => {
            applyUniqueValueRenderer(config, enhancedProps);
            expect(enhancedProps.getLineWidth).toBeDefined();
            expect(typeof enhancedProps.getLineWidth).toBe('function');
        });

        it('getFillColor should return correct color for value A', () => {
            applyUniqueValueRenderer(config, enhancedProps);
            const feature = { properties: { category: 'A' } };
            const color = enhancedProps.getFillColor(feature);
            expect(color).toEqual([255, 0, 0, 204]); // Red with 0.8 opacity
        });

        it('getFillColor should return correct color for value B', () => {
            applyUniqueValueRenderer(config, enhancedProps);
            const feature = { properties: { category: 'B' } };
            const color = enhancedProps.getFillColor(feature);
            expect(color).toEqual([0, 255, 0, 153]); // Green with 0.6 opacity
        });

        it('getFillColor should handle null values', () => {
            applyUniqueValueRenderer(config, enhancedProps);
            const feature = { properties: { category: null } };
            const color = enhancedProps.getFillColor(feature);
            expect(color).toEqual([128, 128, 128, 128]); // Gray with 0.5 opacity
        });

        it('getFillColor should handle undefined values', () => {
            applyUniqueValueRenderer(config, enhancedProps);
            const feature = { properties: {} };
            const color = enhancedProps.getFillColor(feature);
            expect(color).toEqual([128, 128, 128, 128]); // Null style
        });

        it('getFillColor should use default style for unspecified values', () => {
            applyUniqueValueRenderer(config, enhancedProps);
            const feature = { properties: { category: 'C' } };
            const color = enhancedProps.getFillColor(feature);
            expect(color).toEqual([204, 204, 204, 102]); // Default gray with 0.4 opacity
        });

        it('getLineColor should return correct color for value A', () => {
            applyUniqueValueRenderer(config, enhancedProps);
            const feature = { properties: { category: 'A' } };
            const color = enhancedProps.getLineColor(feature);
            expect(color).toEqual([170, 0, 0, 255]); // Dark red
        });

        it('getLineWidth should return correct width for value A', () => {
            applyUniqueValueRenderer(config, enhancedProps);
            const feature = { properties: { category: 'A' } };
            const width = enhancedProps.getLineWidth(feature);
            expect(width).toBe(2);
        });

        it('getLineWidth should return correct width for value B', () => {
            applyUniqueValueRenderer(config, enhancedProps);
            const feature = { properties: { category: 'B' } };
            const width = enhancedProps.getLineWidth(feature);
            expect(width).toBe(3);
        });

        it('getLineWidth should return default width for unspecified values', () => {
            applyUniqueValueRenderer(config, enhancedProps);
            const feature = { properties: { category: 'C' } };
            const width = enhancedProps.getLineWidth(feature);
            expect(width).toBe(1);
        });

        it('should handle numeric attribute values by converting to string', () => {
            applyUniqueValueRenderer(config, enhancedProps);
            const feature = { properties: { category: 123 } };
            
            // Add numeric key to valueStyles for this test
            config.uniqueValueRenderer!.valueStyles['123'] = { 
                fillColor: '#0000FF', 
                fillOpacity: 0.7 
            };
            
            // Re-apply
            enhancedProps = {};
            applyUniqueValueRenderer(config, enhancedProps);
            
            const color = enhancedProps.getFillColor(feature);
            expect(color).toEqual([0, 0, 255, 179]); // Blue with 0.7 opacity
        });

        it('should fallback to gray when no style is found and no default', () => {
            config.uniqueValueRenderer!.defaultStyle = undefined;
            applyUniqueValueRenderer(config, enhancedProps);
            
            const feature = { properties: { category: 'unknown' } };
            const color = enhancedProps.getFillColor(feature);
            expect(color).toEqual([160, 160, 180, 200]); // Fallback gray
        });
    });

    describe('Zoning Use Case', () => {
        it('should style residential parcels with beige', () => {
            const config: LayerConfig = {
                id: 'parcels',
                type: 'GeoJsonLayer',
                props: {},
                uniqueValueRenderer: {
                    attribute: 'zoning',
                    valueStyles: {
                        'Residential': { fillColor: '#FFE4B5', fillOpacity: 0.7 }
                    }
                }
            };

            const enhancedProps: Record<string, any> = {};
            applyUniqueValueRenderer(config, enhancedProps);

            const feature = { properties: { zoning: 'Residential' } };
            const color = enhancedProps.getFillColor(feature);
            
            // #FFE4B5 = RGB(255, 228, 181) with 0.7 opacity
            expect(color).toEqual([255, 228, 181, 179]);
        });

        it('should style commercial parcels with red', () => {
            const config: LayerConfig = {
                id: 'parcels',
                type: 'GeoJsonLayer',
                props: {},
                uniqueValueRenderer: {
                    attribute: 'zoning',
                    valueStyles: {
                        'Commercial': { fillColor: '#FF6B6B', fillOpacity: 0.7 }
                    }
                }
            };

            const enhancedProps: Record<string, any> = {};
            applyUniqueValueRenderer(config, enhancedProps);

            const feature = { properties: { zoning: 'Commercial' } };
            const color = enhancedProps.getFillColor(feature);
            
            // #FF6B6B = RGB(255, 107, 107) with 0.7 opacity
            expect(color).toEqual([255, 107, 107, 179]);
        });
    });
});

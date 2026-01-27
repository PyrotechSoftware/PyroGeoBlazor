import { describe, it, expect } from 'vitest';
import { createLayerFromConfig } from '../layerFactory';

describe('LayerFactory', () => {
    it('should create a GeoJsonLayer from config', () => {
        const config = {
            id: 'test-geojson',
            type: 'GeoJsonLayer',
            props: {
                pickable: true
            }
        };

        const data = {
            type: 'FeatureCollection',
            features: []
        };

        const layers = createLayerFromConfig(config, data);
        
        expect(layers).toBeDefined();
        expect(Array.isArray(layers)).toBe(true);
        expect(layers.length).toBeGreaterThan(0);
        expect(layers[0]?.id).toBe('test-geojson');
    });

    it('should create a ScatterplotLayer from config', () => {
        const config = {
            id: 'test-scatter',
            type: 'ScatterplotLayer',
            props: {
                pickable: true,
                radiusScale: 6
            }
        };

        const data = [
            { position: [-122.45, 37.8], radius: 100 }
        ];

        const layers = createLayerFromConfig(config, data);
        
        expect(layers).toBeDefined();
        expect(Array.isArray(layers)).toBe(true);
        expect(layers.length).toBeGreaterThan(0);
        expect(layers[0]?.id).toBe('test-scatter');
    });

    it('should create an ArcLayer from config', () => {
        const config = {
            id: 'test-arc',
            type: 'ArcLayer',
            props: {
                pickable: true
            }
        };

        const data = [
            {
                from: { coordinates: [-122.45, 37.8] },
                to: { coordinates: [-122.43, 37.78] }
            }
        ];

        const layers = createLayerFromConfig(config, data);
        
        expect(layers).toBeDefined();
        expect(Array.isArray(layers)).toBe(true);
        expect(layers.length).toBeGreaterThan(0);
        expect(layers[0]?.id).toBe('test-arc');
    });

    it('should return empty array for unknown layer type', () => {
        const config = {
            id: 'test-unknown',
            type: 'UnknownLayer',
            props: {}
        };

        const layers = createLayerFromConfig(config, null);
        
        expect(layers).toBeDefined();
        expect(Array.isArray(layers)).toBe(true);
        expect(layers.length).toBe(0);
    });

    it('should create GeoJsonLayer with TextLayer when labels are enabled', () => {
        const config = {
            id: 'test-geojson-labels',
            type: 'GeoJsonLayer',
            props: {
                pickable: true
            },
            labelConfig: {
                enabled: true,
                textProperty: 'name',
                fontSize: 12,
                textColor: '#000000',
                backgroundColor: '#FFFFFFCC',
                textAnchor: 'middle',
                textAlignment: 'center'
            }
        };

        const data = {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    properties: { name: 'Test Feature' },
                    geometry: {
                        type: 'Point',
                        coordinates: [-122.45, 37.8]
                    }
                }
            ]
        };

        const layers = createLayerFromConfig(config, data);
        
        expect(layers).toBeDefined();
        expect(Array.isArray(layers)).toBe(true);
        expect(layers.length).toBe(2); // GeoJsonLayer + TextLayer
        expect(layers[0]?.id).toBe('test-geojson-labels');
        expect(layers[1]?.id).toBe('test-geojson-labels-labels');
    });

    it('should create only GeoJsonLayer when labels are disabled', () => {
        const config = {
            id: 'test-geojson-no-labels',
            type: 'GeoJsonLayer',
            props: {
                pickable: true
            },
            labelConfig: {
                enabled: false,
                textProperty: 'name',
                fontSize: 12,
                textColor: '#000000',
                backgroundColor: '#FFFFFFCC'
            }
        };

        const data = {
            type: 'FeatureCollection',
            features: []
        };

        const layers = createLayerFromConfig(config, data);
        
        expect(layers).toBeDefined();
        expect(Array.isArray(layers)).toBe(true);
        expect(layers.length).toBe(1); // Only GeoJsonLayer
        expect(layers[0]?.id).toBe('test-geojson-no-labels');
    });
});

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

        const layer = createLayerFromConfig(config, data);
        
        expect(layer).toBeDefined();
        expect(layer?.id).toBe('test-geojson');
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

        const layer = createLayerFromConfig(config, data);
        
        expect(layer).toBeDefined();
        expect(layer?.id).toBe('test-scatter');
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

        const layer = createLayerFromConfig(config, data);
        
        expect(layer).toBeDefined();
        expect(layer?.id).toBe('test-arc');
    });

    it('should return null for unknown layer type', () => {
        const config = {
            id: 'test-unknown',
            type: 'UnknownLayer',
            props: {}
        };

        const layer = createLayerFromConfig(config, null);
        
        expect(layer).toBeNull();
    });
});

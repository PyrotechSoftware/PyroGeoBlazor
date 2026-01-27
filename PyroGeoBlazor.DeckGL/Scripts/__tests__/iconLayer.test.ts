import { describe, it, expect, vi } from 'vitest';
import { createLayerFromConfig } from '../layerFactory';
import type { LayerConfig } from '../deckGLView';
import { IconLayer } from '@deck.gl/layers';

describe('IconLayer Factory', () => {
    it('should create IconLayer from config', () => {
        // Arrange
        const config: LayerConfig = {
            id: 'test-icon-layer',
            type: 'IconLayer',
            props: {
                pickable: true
            },
            featureStyle: undefined,
            selectionStyle: undefined,
            hoverStyle: undefined,
            tooltipConfig: undefined,
            uniqueIdProperty: undefined,
            displayProperty: undefined,
            uniqueValueRenderer: undefined
        };

        const data = [
            { coordinates: [-122.45, 37.8], name: 'San Francisco' },
            { coordinates: [-74.006, 40.7128], name: 'New York' }
        ];

        // Act
        const layers = createLayerFromConfig(config, data);

        // Assert
        expect(layers).toHaveLength(1);
        expect(layers[0]).toBeInstanceOf(IconLayer);
        expect(layers[0].id).toBe('test-icon-layer');
    });

    it('should use default Google Maps pin icon when no icon specified', () => {
        // Arrange
        const config: LayerConfig = {
            id: 'default-markers',
            type: 'IconLayer',
            props: {},
            featureStyle: undefined,
            selectionStyle: undefined,
            hoverStyle: undefined,
            tooltipConfig: undefined,
            uniqueIdProperty: undefined,
            displayProperty: undefined,
            uniqueValueRenderer: undefined
        };

        const data = [{ coordinates: [-122.45, 37.8] }];

        // Act
        const layers = createLayerFromConfig(config, data);
        const iconLayer = layers[0] as any;

        // Assert - IconLayer passes iconAtlas to constructor, not exposed in props
        // We verify the layer was created successfully and check the getIcon function
        expect(iconLayer).toBeInstanceOf(IconLayer);
        expect(iconLayer.props.getIcon).toBeDefined();
        // The default icon name should be 'marker'
        const testData = { coordinates: [-122.45, 37.8] };
        expect(iconLayer.props.getIcon(testData)).toBe('marker');
    });

    it('should apply custom icon properties when provided', () => {
        // Arrange
        const customIconAtlas = '/custom/icon.png';
        const customIconMapping = {
            customIcon: { x: 0, y: 0, width: 32, height: 32, mask: true }
        };

        const config: LayerConfig = {
            id: 'custom-icons',
            type: 'IconLayer',
            props: {
                iconAtlas: customIconAtlas,
                iconMapping: customIconMapping,
                iconName: 'customIcon',
                iconSize: 48
            },
            featureStyle: undefined,
            selectionStyle: undefined,
            hoverStyle: undefined,
            tooltipConfig: undefined,
            uniqueIdProperty: undefined,
            displayProperty: undefined,
            uniqueValueRenderer: undefined
        };

        const data = [{ coordinates: [-122.45, 37.8] }];

        // Act
        const layers = createLayerFromConfig(config, data);
        const iconLayer = layers[0] as any;

        // Assert - Verify the layer was created and uses the custom icon name
        expect(iconLayer).toBeInstanceOf(IconLayer);
        expect(iconLayer.props.getIcon).toBeDefined();
        const testData = { coordinates: [-122.45, 37.8] };
        expect(iconLayer.props.getIcon(testData)).toBe('customIcon');
    });

    it('should default to red color for pins', () => {
        // Arrange
        const config: LayerConfig = {
            id: 'red-markers',
            type: 'IconLayer',
            props: {},
            featureStyle: undefined,
            selectionStyle: undefined,
            hoverStyle: undefined,
            tooltipConfig: undefined,
            uniqueIdProperty: undefined,
            displayProperty: undefined,
            uniqueValueRenderer: undefined
        };

        const data = [{ coordinates: [-122.45, 37.8] }];

        // Act
        const layers = createLayerFromConfig(config, data);
        const iconLayer = layers[0] as IconLayer;

        // Assert
        expect(iconLayer.props.getColor).toEqual([255, 0, 0, 255]);
    });

    it('should accept custom color tinting', () => {
        // Arrange
        const blueColor = [0, 128, 255, 255];
        const config: LayerConfig = {
            id: 'blue-markers',
            type: 'IconLayer',
            props: {
                getColor: blueColor
            },
            featureStyle: undefined,
            selectionStyle: undefined,
            hoverStyle: undefined,
            tooltipConfig: undefined,
            uniqueIdProperty: undefined,
            displayProperty: undefined,
            uniqueValueRenderer: undefined
        };

        const data = [{ coordinates: [-122.45, 37.8] }];

        // Act
        const layers = createLayerFromConfig(config, data);
        const iconLayer = layers[0] as IconLayer;

        // Assert
        expect(iconLayer.props.getColor).toEqual(blueColor);
    });

    it('should set billboard to true by default', () => {
        // Arrange
        const config: LayerConfig = {
            id: 'billboard-markers',
            type: 'IconLayer',
            props: {},
            featureStyle: undefined,
            selectionStyle: undefined,
            hoverStyle: undefined,
            tooltipConfig: undefined,
            uniqueIdProperty: undefined,
            displayProperty: undefined,
            uniqueValueRenderer: undefined
        };

        const data = [{ coordinates: [-122.45, 37.8] }];

        // Act
        const layers = createLayerFromConfig(config, data);
        const iconLayer = layers[0] as IconLayer;

        // Assert
        expect(iconLayer.props.billboard).toBe(true);
    });

    it('should extract coordinates from various data formats', () => {
        // Arrange
        const config: LayerConfig = {
            id: 'flexible-markers',
            type: 'IconLayer',
            props: {},
            featureStyle: undefined,
            selectionStyle: undefined,
            hoverStyle: undefined,
            tooltipConfig: undefined,
            uniqueIdProperty: undefined,
            displayProperty: undefined,
            uniqueValueRenderer: undefined
        };

        const testData = [
            { coordinates: [-122.45, 37.8] },
            { position: [-74.006, 40.7128] },
            { longitude: -118.24, latitude: 34.05 }
        ];

        // Act
        const layers = createLayerFromConfig(config, testData);
        const iconLayer = layers[0] as IconLayer;

        // Assert
        expect(iconLayer.props.getPosition).toBeDefined();
        
        // Test the default getPosition accessor with different data formats
        expect(iconLayer.props.getPosition(testData[0])).toEqual([-122.45, 37.8]);
        expect(iconLayer.props.getPosition(testData[1])).toEqual([-74.006, 40.7128]);
        expect(iconLayer.props.getPosition(testData[2])).toEqual([-118.24, 34.05]);
    });

    it('should set pickable to true by default', () => {
        // Arrange
        const config: LayerConfig = {
            id: 'pickable-markers',
            type: 'IconLayer',
            props: {},
            featureStyle: undefined,
            selectionStyle: undefined,
            hoverStyle: undefined,
            tooltipConfig: undefined,
            uniqueIdProperty: undefined,
            displayProperty: undefined,
            uniqueValueRenderer: undefined
        };

        const data = [{ coordinates: [-122.45, 37.8] }];

        // Act
        const layers = createLayerFromConfig(config, data);
        const iconLayer = layers[0] as IconLayer;

        // Assert
        expect(iconLayer.props.pickable).toBe(true);
    });

    it('should handle lowercase type variants', () => {
        // Arrange
        const configs = [
            { type: 'icon' },
            { type: 'Icon' },
            { type: 'ICON' },
            { type: 'iconlayer' },
            { type: 'IconLayer' },
            { type: 'ICONLAYER' }
        ];

        const data = [{ coordinates: [-122.45, 37.8] }];

        // Act & Assert
        configs.forEach((typeConfig) => {
            const config: LayerConfig = {
                id: `test-${typeConfig.type}`,
                type: typeConfig.type,
                props: {},
                featureStyle: undefined,
                selectionStyle: undefined,
                hoverStyle: undefined,
                tooltipConfig: undefined,
                uniqueIdProperty: undefined,
                displayProperty: undefined,
                uniqueValueRenderer: undefined
            };

            const layers = createLayerFromConfig(config, data);
            expect(layers).toHaveLength(1);
            expect(layers[0]).toBeInstanceOf(IconLayer);
        });
    });
});

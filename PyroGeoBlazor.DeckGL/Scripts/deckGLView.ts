import { Deck, DeckProps, Layer, MapView } from '@deck.gl/core';
import { EditableGeoJsonLayer, DrawPolygonMode, ViewMode } from '@deck.gl-community/editable-layers';
import { PathStyleExtension } from '@deck.gl/extensions';

/**
 * View state for controlling the deck.gl camera
 */
export interface ViewState {
    longitude: number;
    latitude: number;
    zoom: number;
    pitch?: number;
    bearing?: number;
    minZoom?: number;
    maxZoom?: number;
}

/**
 * Configuration for creating a deck.gl view
 */
export interface DeckGLViewConfig {
    containerId: string;
    initialViewState: ViewState;
    controller?: boolean | object;
    getTooltip?: (info: any) => string | null;
    onViewStateChange?: (viewState: ViewState) => void;
    onLayerClick?: (info: any) => void;
    onLayerHover?: (info: any) => void;
}

/**
 * Layer configuration passed from C#
 */
export interface LayerConfig {
    id: string;
    type: string;
    dataUrl?: string;
    data?: any;
    props: Record<string, any>;
    featureStyle?: FeatureStyleConfig;  // Base style for all features
    selectionStyle?: FeatureStyleConfig;  // Style for selected features only
    hoverStyle?: FeatureStyleConfig;  // Style for hovered feature
    tooltipConfig?: TooltipConfig;  // Tooltip configuration for this layer
    uniqueIdProperty?: string;  // Property name to use as unique feature ID (e.g., "CustomIdentifier")
}

/**
 * Configuration for feature styling (used for both base and selection styles)
 */
export interface FeatureStyleConfig {
    fillColor?: string;  // Hex color string (e.g., "#FF0000" or "#FF0000FF")
    fillOpacity?: number;  // 0.0 to 1.0
    lineColor?: string;  // Hex color string
    opacity?: number;  // 0.0 to 1.0 (for lines)
    lineWidth?: number;
    radiusScale?: number;
}

/**
 * Configuration for tooltip customization
 */
export interface TooltipConfig {
    properties?: string[];  // List of property names to display
    format?: string;  // Format string with {propertyName} placeholders
    enabled?: boolean;  // Whether to show tooltips
    style?: Record<string, string>;  // CSS styles
}

/**
 * Convert hex color string to RGBA array
 * Supports formats: #RGB, #RRGGBB, #RRGGBBAA
 */
function hexToRgba(hex: string, opacity: number = 1.0): [number, number, number, number] {
    // Remove # if present
    hex = hex.replace(/^#/, '');
    
    let r: number, g: number, b: number, a: number = 255;
    
    if (hex.length === 3) {
        // #RGB format
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
        // #RRGGBB format
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    } else if (hex.length === 8) {
        // #RRGGBBAA format
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
        a = parseInt(hex.substring(6, 8), 16);
        opacity = a / 255; // Use alpha from hex
    } else {
        console.warn(`Invalid hex color format: ${hex}`);
        return [255, 255, 255, 255];
    }
    
    // Apply opacity (0-1) to alpha (0-255)
    a = Math.round(opacity * 255);
    
    return [r, g, b, a];
}

/**
 * Manages a deck.gl instance and provides an imperative API for Blazor
 * JS owns the WebGL context, data fetching, and rendering
 * Blazor controls configuration, layer updates, and receives callbacks
 */
export class DeckGLView {
private deck: Deck | null = null;
private containerId: string;
private dotNetHelper: any = null;
private currentLayers: Layer[] = [];
private dataCache: Map<string, any> = new Map();
    
// Editable layer state
private editableLayer: EditableGeoJsonLayer | null = null;
private drawingMode: any = ViewMode; // Start in view mode
private drawnFeatures: any[] = [];

// Selection state
private selectedFeatureIds: Set<string> = new Set();
private globalSelectionStyle: FeatureStyleConfig = {
    fillColor: '#FFFF00',
    fillOpacity: 0.6,
    lineColor: '#FFFF00',
    opacity: 1.0,
    lineWidth: 3
};

// Hover state
private hoveredFeatureId: string | null = null;
private hoveredLayerId: string | null = null;

// Layer-specific styles storage
private layerConfigs: Map<string, LayerConfig> = new Map();  // Store original configs

constructor(config: DeckGLViewConfig, dotNetHelper?: any) {
        this.containerId = config.containerId;
        this.dotNetHelper = dotNetHelper;

        // Get the container element
        const containerElement = document.getElementById(config.containerId);
        if (!containerElement) {
            console.error(`Container element with id "${config.containerId}" not found`);
            throw new Error(`Container element with id "${config.containerId}" not found`);
        }

        console.log(`Creating DeckGLView for container: ${config.containerId}`, {
            containerElement,
            initialViewState: config.initialViewState
        });

        // Get container dimensions
        const rect = containerElement.getBoundingClientRect();
        console.log(`Container dimensions: ${rect.width}x${rect.height}`);

        // CRITICAL: deck.gl doesn't auto-create canvas with container mode
        // We must create the canvas ourselves and pass it directly
        const canvas = this.createCanvas(containerElement, rect);

        // Pass the canvas element to deck.gl
        const deckProps: DeckProps = {
            canvas: canvas,  // Pass canvas instead of container
            width: rect.width,
            height: rect.height,
            initialViewState: {
                ...config.initialViewState,
                minZoom: config.initialViewState.minZoom ?? 0,
                maxZoom: config.initialViewState.maxZoom ?? 20
            },
            controller: {
                dragPan: true,
                dragRotate: true,
                scrollZoom: true,
                touchZoom: true,
                touchRotate: true,
                keyboard: true,
                doubleClickZoom: true
            },
            layers: [],  // Start with empty layers
            
            // onLoad fires when deck.gl completes initialization
            onLoad: () => {
                console.log('✅ Deck.gl onLoad fired');
                
                // Don't set viewState here - that makes it controlled and locks the camera
                // The initialViewState passed at construction should work now that canvas is created properly
                
                // Just notify Blazor of the initial state
                // The viewState will be sent via onViewStateChange callback
                
                setTimeout(() => this.logDeckState(), 50);
            },
            
            // Callbacks that notify Blazor
            onViewStateChange: ({ viewState }) => {
                if (config.onViewStateChange) {
                    config.onViewStateChange(viewState as ViewState);
                }
                if (this.dotNetHelper) {
                    this.dotNetHelper.invokeMethodAsync('OnViewStateChangedCallback', viewState);
                }
            },

            onClick: (info: any) => {
                // Debug logging for MVT layers
                if (info.layer?.constructor.name === 'GeoJsonLayer' && info.layer.id.includes('mvt')) {
                    console.log('MVT feature clicked:', {
                        layerId: info.layer?.id,
                        object: info.object,
                        properties: info.object?.properties
                    });
                }
                
                // Normal click handling when not drawing
                if (config.onLayerClick) {
                    config.onLayerClick(info);
                }
                if (this.dotNetHelper && info.object) {
                    this.dotNetHelper.invokeMethodAsync('OnLayerClickCallback', {
                        layerId: info.layer?.id,
                        object: info.object,
                        coordinate: info.coordinate,
                        pixel: info.pixel
                    });
                }
            },

            onHover: (info: any) => {
                // Track hovered feature for hover styling
                const newHoveredId = info.object ? this.getFeatureId(info.object, info.layer?.id) : null;
                const newHoveredLayerId = info.layer?.id || null;
                
                // Check if hover state changed
                if (newHoveredId !== this.hoveredFeatureId || newHoveredLayerId !== this.hoveredLayerId) {
                    this.hoveredFeatureId = newHoveredId;
                    this.hoveredLayerId = newHoveredLayerId;
                    
                    // Refresh layers to apply hover style
                    const hoveredConfig = newHoveredLayerId ? this.layerConfigs.get(newHoveredLayerId) : null;
                    if (hoveredConfig?.hoverStyle) {
                        this.refreshLayersWithHover();
                    }
                }
                
                if (config.onLayerHover) {
                    config.onLayerHover(info);
                }
                if (this.dotNetHelper && info.object) {
                    this.dotNetHelper.invokeMethodAsync('OnLayerHoverCallback', {
                        layerId: info.layer?.id,
                        object: info.object,
                        coordinate: info.coordinate
                    });
                }
            },

            getTooltip: config.getTooltip ?? ((info: any) => {
                if (!info.object) return null;
                
                // Get layer-specific tooltip config
                const layerId = info.layer?.id;
                const layerConfig = layerId ? this.layerConfigs.get(layerId) : null;
                const tooltipConfig = layerConfig?.tooltipConfig;
                
                // Use layer-specific tooltip config if available
                if (tooltipConfig) {
                    return this.formatTooltip(info.object, tooltipConfig);
                }
                
                // Default tooltip
                return {
                    html: `<div>${JSON.stringify(info.object)}</div>`,
                    style: {
                        backgroundColor: '#fff',
                        color: '#000',
                        fontSize: '12px',
                        padding: '8px'
                    }
                };
            }),
            
            // Custom cursor control
            getCursor: () => {
                if (this.editableLayer && this.drawingMode.constructor.name !== 'ViewMode') {
                    return 'crosshair';
                }
                return 'grab';
            }
        };

        this.deck = new Deck(deckProps);
        
        console.log(`DeckGLView created, checking initialization...`);
        
        // Check deck state after a brief moment
        setTimeout(() => this.logDeckState(), 100);
    }

    /**
     * Log the current state of the deck.gl instance for debugging
     */
    private logDeckState(): void {
        if (!this.deck) {
            console.error('❌ Deck is null');
            return;
        }

        const canvas = document.querySelector(`#${this.containerId} canvas`);
        const gl = (canvas as HTMLCanvasElement)?.getContext('webgl2') || (canvas as HTMLCanvasElement)?.getContext('webgl');
        
        console.log('🔍 Deck.gl state:', {
            deckExists: !!this.deck,
            canvasExists: !!canvas,
            webGLContext: !!gl,
            props: {
                width: (this.deck as any).width,
                height: (this.deck as any).height
            }
        });
    }

    /**
     * Create and insert a canvas element into the container
     */
    private createCanvas(container: HTMLElement, rect: DOMRect): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        
        // Set explicit pixel dimensions for WebGL
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        container.appendChild(canvas);
        console.log(`Canvas created and appended: ${rect.width}x${rect.height}`);
        
        return canvas;
    }

    /**
     * Update the view state (camera position)
     */
    public setViewState(viewState: ViewState): void {
        if (this.deck) {
            this.deck.setProps({ initialViewState: viewState });
        }
    }

    /**
     * Get the current view state
     */
    public getViewState(): ViewState | null {
        // Return the current view state from deck's internal props
        return (this.deck as any)?._lastViewState || null;
    }

    /**
     * Update layers - this is the main method Blazor calls to control rendering
     * Blazor provides layer configurations; JS handles data fetching and layer creation
     */
    public async updateLayers(layerConfigs: LayerConfig[]): Promise<void> {
        console.log(`Updating ${layerConfigs.length} layers`);

        const layers: Layer[] = [];

        for (const config of layerConfigs) {
            try {
                // Store the config for later reference
                this.layerConfigs.set(config.id, config);
                
                const layer = await this.createLayer(config);
                if (layer) {
                    layers.push(layer);
                }
            } catch (error) {
                console.error(`Error creating layer ${config.id}:`, error);
            }
        }

        this.currentLayers = layers;
        if (this.deck) {
            // Include editable layer if exists
            const allLayers = [...layers];
            if (this.editableLayer) {
                allLayers.push(this.editableLayer);
            }
            this.deck.setProps({ layers: allLayers });
        }
    }

    /**
     * Create a layer from configuration
     * Handles data fetching if dataUrl is provided and applies feature style
     */
    private async createLayer(config: LayerConfig): Promise<Layer | null> {
        // Import the layer class dynamically based on type
        const { createLayerFromConfig } = await import('./layerFactory');
        
        // If dataUrl is provided, fetch the data (JS owns data fetching)
        let data = config.data;
        if (config.dataUrl) {
            data = await this.fetchData(config.dataUrl, config.id);
        }

        // Apply base feature style if provided
        const enhancedConfig = this.applyFeatureStyle(config);

        // Create the layer using the factory
        return createLayerFromConfig(enhancedConfig, data);
    }

    /**
     * Apply base feature style to layer configuration
     */
    private applyFeatureStyle(config: LayerConfig): LayerConfig {
        if (!config.featureStyle) {
            return config;
        }

        const style = config.featureStyle;
        const enhancedProps = { ...config.props };

        // Apply style properties based on layer type
        if (style.fillColor && !enhancedProps.fillColor && !enhancedProps.getFillColor) {
            const fillOpacity = style.fillOpacity ?? 1.0;
            enhancedProps.fillColor = hexToRgba(style.fillColor, fillOpacity);
        }
        
        if (style.lineColor && !enhancedProps.lineColor && !enhancedProps.getLineColor) {
            const lineOpacity = style.opacity ?? 1.0;
            enhancedProps.lineColor = hexToRgba(style.lineColor, lineOpacity);
        }
        
        if (style.lineWidth && !enhancedProps.lineWidth && !enhancedProps.getLineWidth) {
            enhancedProps.lineWidth = style.lineWidth;
        }
        
        if (style.radiusScale && !enhancedProps.radiusScale) {
            enhancedProps.radiusScale = style.radiusScale;
        }

        return {
            ...config,
            props: enhancedProps
        };
    }

    /**
     * Fetch data from an API endpoint
     * Caches data to avoid redundant requests
     */
    private async fetchData(url: string, cacheKey: string): Promise<any> {
        // Check cache first
        if (this.dataCache.has(cacheKey)) {
            console.log(`Using cached data for ${cacheKey}`);
            return this.dataCache.get(cacheKey);
        }

        console.log(`Fetching data from ${url}`);
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.dataCache.set(cacheKey, data);
            
            console.log(`Fetched and cached data for ${cacheKey}`);
            return data;
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
            throw error;
        }
    }

    /**
     * Clear the data cache
     */
    public clearCache(): void {
        this.dataCache.clear();
        console.log('Data cache cleared');
    }

    /**
     * Remove a specific item from cache
     */
    public removeCacheItem(key: string): void {
        this.dataCache.delete(key);
        console.log(`Removed cache item: ${key}`);
    }

    /**
     * Set the global selection style for selected features
     */
    public setGlobalSelectionStyle(style: FeatureStyleConfig): void {
        this.globalSelectionStyle = { ...this.globalSelectionStyle, ...style };
        console.log('Global selection style updated:', this.globalSelectionStyle);
        
        // Refresh layers to apply new style
        if (this.selectedFeatureIds.size > 0) {
            this.refreshLayersWithSelection();
        }
    }

    /**
     * Set the base feature style for a specific layer
     */
    public async setLayerFeatureStyle(layerId: string, style: FeatureStyleConfig): Promise<void> {
        const config = this.layerConfigs.get(layerId);
        if (!config) {
            console.warn(`Layer ${layerId} not found`);
            return;
        }

        // Update the stored config
        config.featureStyle = { ...config.featureStyle, ...style };
        this.layerConfigs.set(layerId, config);

        console.log(`Feature style updated for layer ${layerId}:`, style);

        // Recreate the layer with new style
        await this.recreateLayer(layerId);
    }

    /**
     * Set the selection style for a specific layer
     */
    public setLayerSelectionStyle(layerId: string, style: FeatureStyleConfig): void {
        const config = this.layerConfigs.get(layerId);
        if (!config) {
            console.warn(`Layer ${layerId} not found`);
            return;
        }

        // Update the stored config
        config.selectionStyle = { ...config.selectionStyle, ...style };
        this.layerConfigs.set(layerId, config);

        console.log(`Selection style updated for layer ${layerId}:`, style);

        // Refresh if there are selected features
        if (this.selectedFeatureIds.size > 0) {
            this.refreshLayersWithSelection();
        }
    }

    /**
     * Set the visibility of a specific layer
     */
    public async setLayerVisibility(layerId: string, visible: boolean): Promise<void> {
        const config = this.layerConfigs.get(layerId);
        if (!config) {
            console.warn(`Layer ${layerId} not found`);
            return;
        }

        // Update the visible property in the config
        config.props.visible = visible;
        this.layerConfigs.set(layerId, config);

        console.log(`Layer ${layerId} visibility set to ${visible}`);

        // Recreate the layer with new visibility
        await this.recreateLayer(layerId);
    }

    /**
     * Get the visibility of a specific layer
     */
    public getLayerVisibility(layerId: string): boolean {
        const config = this.layerConfigs.get(layerId);
        if (!config) {
            console.warn(`Layer ${layerId} not found`);
            return false;
        }

        // Return visibility (default to true if not specified)
        return config.props.visible !== false;
    }

    /**
     * Toggle the visibility of a specific layer
     */
    public async toggleLayerVisibility(layerId: string): Promise<boolean> {
        const currentVisibility = this.getLayerVisibility(layerId);
        const newVisibility = !currentVisibility;
        await this.setLayerVisibility(layerId, newVisibility);
        return newVisibility;
    }

    /**
     * Recreate a specific layer with updated configuration
     */
    private async recreateLayer(layerId: string): Promise<void> {
        const config = this.layerConfigs.get(layerId);
        if (!config) return;

        // Find the index of the layer
        const layerIndex = this.currentLayers.findIndex(layer => layer.id === layerId);
        if (layerIndex === -1) return;

        // Recreate the layer
        const newLayer = await this.createLayer(config);
        if (newLayer) {
            this.currentLayers[layerIndex] = newLayer;
            
            // Refresh the deck
            if (this.selectedFeatureIds.size > 0) {
                this.refreshLayersWithSelection();
            } else {
                this.refreshLayers();
            }
        }
    }

    /**
     * Set which features are selected (by feature ID or index)
     */
    public setSelectedFeatures(featureIds: string[]): void {
        this.selectedFeatureIds = new Set(featureIds);
        console.log(`Selection updated: ${featureIds.length} features selected`);
        console.log(`  Feature IDs:`, featureIds);
        this.refreshLayersWithSelection();
    }

    /**
     * Clear all selected features
     */
    public clearSelection(): void {
        this.selectedFeatureIds.clear();
        console.log('Selection cleared');
        this.refreshLayersWithSelection();
    }

    /**
     * Refresh layers with selection styling applied
     */
    private async refreshLayersWithSelection(): Promise<void> {
        if (!this.deck) return;
        
        // Recreate layers with selection styling
        const layerConfigsArray = Array.from(this.layerConfigs.values());
        
        const styledLayers: Layer[] = [];
        
        for (const config of layerConfigsArray) {
            const layer = await this.createLayerWithSelection(config);
            if (layer) {
                styledLayers.push(layer);
            }
        }
        
        const allLayers = [...styledLayers];
        if (this.editableLayer) {
            allLayers.push(this.editableLayer as any);
        }
        
        this.deck.setProps({ layers: allLayers });
    }

    /**
     * Refresh layers with hover styling applied
     */
    private async refreshLayersWithHover(): Promise<void> {
        if (!this.deck) return;
        
        // Recreate layers with hover styling
        const layerConfigsArray = Array.from(this.layerConfigs.values());
        
        const styledLayers: Layer[] = [];
        
        for (const config of layerConfigsArray) {
            const layer = await this.createLayerWithHoverAndSelection(config);
            if (layer) {
                styledLayers.push(layer);
            }
        }
        
        const allLayers = [...styledLayers];
        if (this.editableLayer) {
            allLayers.push(this.editableLayer as any);
        }
        
        this.deck.setProps({ layers: allLayers });
    }

    /**
     * Create a layer with selection styling applied
     */
    private async createLayerWithSelection(config: LayerConfig): Promise<Layer | null> {
        const { createLayerFromConfig } = await import('./layerFactory');
        
        // Fetch data if needed
        let data = config.data;
        if (config.dataUrl) {
            data = await this.fetchData(config.dataUrl, config.id);
        }
        
        const selectedIds = this.selectedFeatureIds;
        
        // Determine which selection style to use: layer-specific or global
        const selectionStyle = config.selectionStyle || this.globalSelectionStyle;
        
        // Apply base feature style first
        const baseConfig = this.applyFeatureStyle(config);
        
        // Enhance the config with selection-aware accessor functions
        const enhancedConfig = {
            ...baseConfig,
            props: {
                ...baseConfig.props,
                updateTriggers: {
                    ...baseConfig.props.updateTriggers,
                    getFillColor: Array.from(selectedIds).join(','),
                    getLineColor: Array.from(selectedIds).join(','),
                    getLineWidth: Array.from(selectedIds).join(','),
                    getRadius: Array.from(selectedIds).join(',')
                }
            }
        };
        
        // Store original accessors
        const originalGetFillColor = (enhancedConfig.props as any).getFillColor || (enhancedConfig.props as any).fillColor;
        const originalGetLineColor = (enhancedConfig.props as any).getLineColor || (enhancedConfig.props as any).lineColor;
        const originalGetLineWidth = (enhancedConfig.props as any).getLineWidth || (enhancedConfig.props as any).lineWidth;
        const originalGetRadius = (enhancedConfig.props as any).getRadius;
        
        // Add selection-aware accessors
        if (config.type === 'GeoJsonLayer' || config.type === 'geojson' || 
            config.type === 'MVTLayer' || config.type === 'mvt') {
            
            console.log(`Adding selection accessors for layer ${config.id} (${config.type}), ${selectedIds.size} features selected`);
            
            (enhancedConfig.props as any).getFillColor = (d: any) => {
                const featureId = this.getFeatureId(d, config.id);
                const isSelected = featureId && selectedIds.has(featureId);
                
                if (isSelected) {
                    console.log(`  Styling selected feature: ${featureId}`);
                    if (selectionStyle.fillColor) {
                        const fillOpacity = selectionStyle.fillOpacity ?? 0.6;
                        return hexToRgba(selectionStyle.fillColor, fillOpacity);
                    }
                    return [255, 255, 0, 150]; // Default yellow
                }
                return typeof originalGetFillColor === 'function' 
                    ? originalGetFillColor(d) 
                    : (originalGetFillColor || [160, 160, 180, 200]);
            };
            
            (enhancedConfig.props as any).getLineColor = (d: any) => {
                const featureId = this.getFeatureId(d, config.id);
                if (featureId && selectedIds.has(featureId)) {
                    if (selectionStyle.lineColor) {
                        const lineOpacity = selectionStyle.opacity ?? 1.0;
                        return hexToRgba(selectionStyle.lineColor, lineOpacity);
                    }
                    return [255, 255, 0, 255]; // Default yellow
                }
                return typeof originalGetLineColor === 'function'
                    ? originalGetLineColor(d)
                    : (originalGetLineColor || [80, 80, 80, 255]);
            };
            
            (enhancedConfig.props as any).getLineWidth = (d: any) => {
                const featureId = this.getFeatureId(d, config.id);
                if (featureId && selectedIds.has(featureId)) {
                    return selectionStyle.lineWidth || 3;
                }
                return typeof originalGetLineWidth === 'function'
                    ? originalGetLineWidth(d)
                    : (originalGetLineWidth || 1);
            };
        }
        
        if (config.type === 'ScatterplotLayer' || config.type === 'scatterplot') {
            (enhancedConfig.props as any).getFillColor = (d: any) => {
                const featureId = this.getFeatureId(d, config.id);
                if (featureId && selectedIds.has(featureId)) {
                    if (selectionStyle.fillColor) {
                        const fillOpacity = selectionStyle.fillOpacity ?? 0.6;
                        return hexToRgba(selectionStyle.fillColor, fillOpacity);
                    }
                    return [255, 255, 0, 150]; // Default yellow
                }
                return typeof originalGetFillColor === 'function'
                    ? originalGetFillColor(d)
                    : (originalGetFillColor || [255, 140, 0, 200]);
            };
            
            (enhancedConfig.props as any).getLineColor = (d: any) => {
                const featureId = this.getFeatureId(d, config.id);
                if (featureId && selectedIds.has(featureId)) {
                    if (selectionStyle.lineColor) {
                        const lineOpacity = selectionStyle.opacity ?? 1.0;
                        return hexToRgba(selectionStyle.lineColor, lineOpacity);
                    }
                    return [255, 255, 0, 255]; // Default yellow
                }
                return typeof originalGetLineColor === 'function'
                    ? originalGetLineColor(d)
                    : (originalGetLineColor || [0, 0, 0, 255]);
            };
            
            (enhancedConfig.props as any).getRadius = (d: any) => {
                const featureId = this.getFeatureId(d, config.id);
                const baseRadius = typeof originalGetRadius === 'function'
                    ? originalGetRadius(d)
                    : (d.radius || 100);
                if (featureId && selectedIds.has(featureId)) {
                    return baseRadius * (selectionStyle.radiusScale || 1.5);
                }
                return baseRadius;
            };
        }
        
        return createLayerFromConfig(enhancedConfig, data);
    }

    /**
     * Create a layer with both hover and selection styling applied
     */
    private async createLayerWithHoverAndSelection(config: LayerConfig): Promise<Layer | null> {
        const { createLayerFromConfig } = await import('./layerFactory');
        
        // Fetch data if needed
        let data = config.data;
        if (config.dataUrl) {
            data = await this.fetchData(config.dataUrl, config.id);
        }
        
        const selectedIds = this.selectedFeatureIds;
        const hoveredId = this.hoveredFeatureId;
        const hoveredLayerId = this.hoveredLayerId;
        
        // Determine which styles to use
        const selectionStyle = config.selectionStyle || this.globalSelectionStyle;
        const hoverStyle = config.hoverStyle;
        
        // Apply base feature style first
        const baseConfig = this.applyFeatureStyle(config);
        
        // Enhance the config with hover and selection-aware accessor functions
        const enhancedConfig = {
            ...baseConfig,
            props: {
                ...baseConfig.props,
                updateTriggers: {
                    ...baseConfig.props.updateTriggers,
                    getFillColor: `${Array.from(selectedIds).join(',')}_${hoveredId}_${hoveredLayerId}`,
                    getLineColor: `${Array.from(selectedIds).join(',')}_${hoveredId}_${hoveredLayerId}`,
                    getLineWidth: `${Array.from(selectedIds).join(',')}_${hoveredId}_${hoveredLayerId}`,
                    getRadius: `${Array.from(selectedIds).join(',')}_${hoveredId}_${hoveredLayerId}`
                }
            }
        };
        
        // Store original accessors
        const originalGetFillColor = (enhancedConfig.props as any).getFillColor || (enhancedConfig.props as any).fillColor;
        const originalGetLineColor = (enhancedConfig.props as any).getLineColor || (enhancedConfig.props as any).lineColor;
        const originalGetLineWidth = (enhancedConfig.props as any).getLineWidth || (enhancedConfig.props as any).lineWidth;
        const originalGetRadius = (enhancedConfig.props as any).getRadius;
        
        // Add hover and selection-aware accessors
        if (config.type === 'GeoJsonLayer' || config.type === 'geojson' || 
            config.type === 'MVTLayer' || config.type === 'mvt') {
            
            (enhancedConfig.props as any).getFillColor = (d: any) => {
                const featureId = this.getFeatureId(d, config.id);
                
                // Priority: Selected > Hovered > Base
                if (featureId && selectedIds.has(featureId)) {
                    if (selectionStyle.fillColor) {
                        const fillOpacity = selectionStyle.fillOpacity ?? 0.6;
                        return hexToRgba(selectionStyle.fillColor, fillOpacity);
                    }
                    return [255, 255, 0, 150]; // Default yellow
                } else if (featureId && featureId === hoveredId && config.id === hoveredLayerId && hoverStyle?.fillColor) {
                    const fillOpacity = hoverStyle.fillOpacity ?? 0.8;
                    return hexToRgba(hoverStyle.fillColor, fillOpacity);
                }
                
                return typeof originalGetFillColor === 'function' 
                    ? originalGetFillColor(d) 
                    : (originalGetFillColor || [160, 160, 180, 200]);
            };
            
            (enhancedConfig.props as any).getLineColor = (d: any) => {
                const featureId = this.getFeatureId(d, config.id);
                
                if (featureId && selectedIds.has(featureId)) {
                    if (selectionStyle.lineColor) {
                        const lineOpacity = selectionStyle.opacity ?? 1.0;
                        return hexToRgba(selectionStyle.lineColor, lineOpacity);
                    }
                    return [255, 255, 0, 255]; // Default yellow
                } else if (featureId && featureId === hoveredId && config.id === hoveredLayerId && hoverStyle?.lineColor) {
                    const lineOpacity = hoverStyle.opacity ?? 1.0;
                    return hexToRgba(hoverStyle.lineColor, lineOpacity);
                }
                
                return typeof originalGetLineColor === 'function'
                    ? originalGetLineColor(d)
                    : (originalGetLineColor || [80, 80, 80, 255]);
            };
            
            (enhancedConfig.props as any).getLineWidth = (d: any) => {
                const featureId = this.getFeatureId(d, config.id);
                
                if (featureId && selectedIds.has(featureId)) {
                    return selectionStyle.lineWidth || 3;
                } else if (featureId && featureId === hoveredId && config.id === hoveredLayerId && hoverStyle?.lineWidth) {
                    return hoverStyle.lineWidth;
                }
                
                return typeof originalGetLineWidth === 'function'
                    ? originalGetLineWidth(d)
                    : (originalGetLineWidth || 1);
            };
        }
        
        if (config.type === 'ScatterplotLayer' || config.type === 'scatterplot') {
            (enhancedConfig.props as any).getFillColor = (d: any) => {
                const featureId = this.getFeatureId(d, config.id);
                
                if (featureId && selectedIds.has(featureId)) {
                    if (selectionStyle.fillColor) {
                        const fillOpacity = selectionStyle.fillOpacity ?? 0.6;
                        return hexToRgba(selectionStyle.fillColor, fillOpacity);
                    }
                    return [255, 255, 0, 150]; // Default yellow
                } else if (featureId && featureId === hoveredId && config.id === hoveredLayerId && hoverStyle?.fillColor) {
                    const fillOpacity = hoverStyle.fillOpacity ?? 0.8;
                    return hexToRgba(hoverStyle.fillColor, fillOpacity);
                }
                
                return typeof originalGetFillColor === 'function'
                    ? originalGetFillColor(d)
                    : (originalGetFillColor || [255, 140, 0, 200]);
            };
            
            (enhancedConfig.props as any).getLineColor = (d: any) => {
                const featureId = this.getFeatureId(d, config.id);
                
                if (featureId && selectedIds.has(featureId)) {
                    if (selectionStyle.lineColor) {
                        const lineOpacity = selectionStyle.opacity ?? 1.0;
                        return hexToRgba(selectionStyle.lineColor, lineOpacity);
                    }
                    return [255, 255, 0, 255]; // Default yellow
                } else if (featureId && featureId === hoveredId && config.id === hoveredLayerId && hoverStyle?.lineColor) {
                    const lineOpacity = hoverStyle.opacity ?? 1.0;
                    return hexToRgba(hoverStyle.lineColor, lineOpacity);
                }
                
                return typeof originalGetLineColor === 'function'
                    ? originalGetLineColor(d)
                    : (originalGetLineColor || [0, 0, 0, 255]);
            };
            
            (enhancedConfig.props as any).getRadius = (d: any) => {
                const featureId = this.getFeatureId(d, config.id);
                const baseRadius = typeof originalGetRadius === 'function'
                    ? originalGetRadius(d)
                    : (d.radius || 100);
                
                if (featureId && selectedIds.has(featureId)) {
                    return baseRadius * (selectionStyle.radiusScale || 1.5);
                } else if (featureId && featureId === hoveredId && config.id === hoveredLayerId && hoverStyle?.radiusScale) {
                    return baseRadius * hoverStyle.radiusScale;
                }
                
                return baseRadius;
            };
        }
        
        return createLayerFromConfig(enhancedConfig, data);
    }

    /**
     * Get a unique identifier for a feature
     * First checks the layer's configured uniqueIdProperty, then falls back to common fields
     */
    private getFeatureId(feature: any, layerId?: string, logDetails: boolean = false): string | null {
        if (!feature) return null;
        
        // Check if this layer has a configured unique ID property
        if (layerId) {
            const layerConfig = this.layerConfigs.get(layerId);
            if (layerConfig?.uniqueIdProperty) {
                const idProperty = layerConfig.uniqueIdProperty;
                // MVT features may have properties in multiple locations:
                // 1. feature.properties[idProperty] (standard GeoJSON)
                // 2. feature[idProperty] (properties at root level)
                // 3. feature.__source.object.properties[idProperty] (MVT with __source.object)
                const uniqueId = feature.properties?.[idProperty] 
                    ?? feature[idProperty]
                    ?? feature.__source?.object?.properties?.[idProperty];
                
                if (logDetails) {
                    console.log(`Looking for ID in feature.properties.${idProperty}, feature.${idProperty}, or feature.__source.object.properties.${idProperty}:`, uniqueId);
                    console.log(`  Feature properties:`, feature.properties);
                    console.log(`  Feature __source:`, feature.__source);
                    console.log(`  Feature __source.object:`, feature.__source?.object);
                    console.log(`  Feature __source.object.properties:`, feature.__source?.object?.properties);
                    console.log(`  Feature keys:`, Object.keys(feature));
                }
                
                if (uniqueId !== undefined && uniqueId !== null) {
                    const idString = String(uniqueId);
                    if (logDetails) {
                        console.log(`  ✅ Using configured uniqueIdProperty: ${idString}`);
                    }
                    return idString;
                } else if (logDetails) {
                    console.warn(`  ⚠️ uniqueIdProperty '${idProperty}' not found in feature.properties, feature, or feature.__source.object.properties`);
                }
            }
        }
        
        // Fall back to common ID fields (check all possible locations)
        if (feature.id) return String(feature.id);
        if (feature.properties?.id) return String(feature.properties.id);
        if (feature.__source?.object?.properties?.id) return String(feature.__source.object.properties.id);
        if (feature.properties?.ID) return String(feature.properties.ID);
        if (feature.__source?.object?.properties?.ID) return String(feature.__source.object.properties.ID);
        if (feature.properties?.name) return String(feature.properties.name);
        if (feature.__source?.object?.properties?.name) return String(feature.__source.object.properties.name);
        
        // For MVT features, try additional ID fields (check all locations)
        if (feature.properties?.CustomIdentifier) return String(feature.properties.CustomIdentifier);
        if (feature.CustomIdentifier) return String(feature.CustomIdentifier);
        if (feature.__source?.object?.properties?.CustomIdentifier) return String(feature.__source.object.properties.CustomIdentifier);
        if (feature.properties?.GeoPropertyID) return String(feature.properties.GeoPropertyID);
        if (feature.GeoPropertyID) return String(feature.GeoPropertyID);
        if (feature.__source?.object?.properties?.GeoPropertyID) return String(feature.__source.object.properties.GeoPropertyID);
        if (feature.properties?.objectid) return String(feature.properties.objectid);
        if (feature.objectid) return String(feature.objectid);
        if (feature.__source?.object?.properties?.objectid) return String(feature.__source.object.properties.objectid);
        if (feature.properties?.OBJECTID) return String(feature.properties.OBJECTID);
        if (feature.OBJECTID) return String(feature.OBJECTID);
        if (feature.__source?.object?.properties?.OBJECTID) return String(feature.__source.object.properties.OBJECTID);
        if (feature.properties?.fid) return String(feature.properties.fid);
        if (feature.fid) return String(feature.fid);
        if (feature.__source?.object?.properties?.fid) return String(feature.__source.object.properties.fid);
        if (feature.properties?.FID) return String(feature.properties.FID);
        if (feature.FID) return String(feature.FID);
        if (feature.__source?.object?.properties?.FID) return String(feature.__source.object.properties.FID);
        
        // For GeoJSON features, create a hash from coordinates
        if (feature.geometry?.coordinates) {
            const coords = JSON.stringify(feature.geometry.coordinates);
            const coordId = coords.substring(0, 50); // Use first 50 chars as ID
            if (logDetails) {
                console.log(`  Using coordinate-based ID (no unique property found)`);
            }
            return coordId;
        }
        
        // For point data
        if (feature.position || feature.coordinates) {
            const coords = feature.position || feature.coordinates;
            return `${coords[0]}_${coords[1]}`;
        }
        
        return null;
    }

    /**
     * Enable or disable polygon drawing mode for feature selection
     */
    public setDrawingMode(enabled: boolean): void {
        if (enabled) {
            this.drawingMode = new DrawPolygonMode();
            console.log('🎨 Drawing mode enabled - Click to add vertices, double-click to complete');
            
            // Clear any previous drawn features
            this.drawnFeatures = [];
            
            // Disable double-click zoom to allow double-click to complete polygon
            if (this.deck) {
                this.deck.setProps({
                    controller: {
                        dragPan: true,
                        dragRotate: true,
                        scrollZoom: true,
                        touchZoom: true,
                        touchRotate: true,
                        keyboard: true,
                        doubleClickZoom: false  // Disable during drawing
                    }
                });
            }
            
            // Set crosshair cursor on both canvas and container
            const canvas = document.querySelector(`#${this.containerId} canvas`) as HTMLCanvasElement;
            const container = document.getElementById(this.containerId);
            if (canvas) {
                canvas.style.cursor = 'crosshair';
            }
            if (container) {
                container.style.cursor = 'crosshair';
            }
            
            // Create the temporary editable layer
            this.updateEditableLayer();
            
            // Force deck.gl to update the cursor
            if (this.deck) {
                this.deck.redraw('cursor update');
            }
        } else {
            this.drawingMode = new ViewMode();
            console.log('✅ Drawing mode disabled');
            
            // Re-enable double-click zoom
            if (this.deck) {
                this.deck.setProps({
                    controller: {
                        dragPan: true,
                        dragRotate: true,
                        scrollZoom: true,
                        touchZoom: true,
                        touchRotate: true,
                        keyboard: true,
                        doubleClickZoom: true  // Re-enable
                    }
                });
            }
            
            // Reset cursor to default (grab/hand) on both canvas and container
            const canvas = document.querySelector(`#${this.containerId} canvas`) as HTMLCanvasElement;
            const container = document.getElementById(this.containerId);
            if (canvas) {
                canvas.style.cursor = '';
            }
            if (container) {
                container.style.cursor = '';
            }
            
            // Destroy the temporary editable layer
            this.destroyEditableLayer();
            
            // Force deck.gl to update the cursor
            if (this.deck) {
                this.deck.redraw('cursor update');
            }
        }
    }
    
    private updateEditableLayer(): void {
        // Create editable layer with current mode
        this.editableLayer = new EditableGeoJsonLayer({
            id: 'editable-selection-layer',
            data: {
                type: 'FeatureCollection',
                features: this.drawnFeatures
            },
            mode: this.drawingMode,
            selectedFeatureIndexes: [],
            
            // Styling for the temporary selection polygon - dark grey with dashed line
            getFillColor: [64, 64, 64, 26],  // Dark grey with ~10% opacity (26/255 ≈ 0.1)
            getLineColor: [64, 64, 64, 255],  // Dark grey, fully opaque
            getLineWidth: 0.5,  // Very thin line
            lineWidthUnits: 'pixels',
            
            // Enable dashed lines using PathStyleExtension
            extensions: [new PathStyleExtension({ dash: true })],
            getDashArray: [10, 5],  // 10px dash, 5px gap
            
            // Set cursor for the editable layer
            getCursor: () => 'crosshair',
            
            onEdit: ({ updatedData, editType, editContext }: any) => {
                console.log('📝 Edit event:', editType, editContext);
                
                // Handle feature completion
                if (editType === 'addFeature') {
                    const newFeature = updatedData.features[updatedData.features.length - 1];
                    
                    console.log('🎯 Polygon completed, performing selection...');
                    
                    // Perform selection with the completed polygon
                    if (newFeature.geometry.type === 'Polygon') {
                        const polygon = newFeature.geometry.coordinates[0];
                        this.performSelection(polygon);
                    }
                    
                    // Clear the drawn feature and reset for next polygon
                    // Keep drawing mode active - user must explicitly exit
                    this.drawnFeatures = [];
                    this.updateEditableLayer();
                    
                    console.log('✨ Polygon cleared, ready for next selection');
                }
            }
        } as any); // Cast to any to allow potential extended properties
        
        this.refreshLayers();
        
        // Force cursor update after layer is created
        this.updateCursor();
    }
    
    /**
     * Destroy the temporary editable layer
     */
    private destroyEditableLayer(): void {
        this.editableLayer = null;
        this.drawnFeatures = [];
        this.refreshLayers();
        console.log('✨ Temporary selection layer destroyed');
    }
    
    /**
     * Update cursor to crosshair when in drawing mode
     */
    private updateCursor(): void {
        const canvas = document.querySelector(`#${this.containerId} canvas`) as HTMLCanvasElement;
        const container = document.getElementById(this.containerId);
        
        if (this.editableLayer && this.drawingMode.constructor.name !== 'ViewMode') {
            // Drawing mode is active - set crosshair
            if (canvas) {
                canvas.style.cursor = 'crosshair';
            }
            if (container) {
                container.style.cursor = 'crosshair';
            }
        } else {
            // Not in drawing mode - reset to default
            if (canvas) {
                canvas.style.cursor = '';
            }
            if (container) {
                container.style.cursor = '';
            }
        }
    }

    /**
     * Format tooltip content based on configuration
     */
    private formatTooltip(object: any, config: TooltipConfig): any {
        if (!config.enabled) {
            return null;
        }

        let html = '';
        
        // Extract properties (check both object directly and object.properties)
        const getProperty = (obj: any, key: string): any => {
            return obj[key] ?? obj.properties?.[key] ?? 'N/A';
        };

        if (config.format) {
            // Use format string with placeholders
            html = config.format;
            const placeholderRegex = /\{(\w+)\}/g;
            html = html.replace(placeholderRegex, (match, key) => {
                const value = getProperty(object, key);
                return value !== 'N/A' ? String(value) : match;
            });
            // Replace \n with <br> for line breaks
            html = html.replace(/\\n/g, '<br>');
        } else if (config.properties && config.properties.length > 0) {
            // Display specific properties
            const items = config.properties.map(prop => {
                const value = getProperty(object, prop);
                return `<div><strong>${prop}:</strong> ${value}</div>`;
            });
            html = items.join('');
        } else {
            // Fall back to JSON display
            html = `<div>${JSON.stringify(object)}</div>`;
        }

        return {
            html: `<div>${html}</div>`,
            style: config.style || {
                backgroundColor: '#fff',
                color: '#000',
                fontSize: '12px',
                padding: '8px'
            }
        };
    }

    /**
     * Set tooltip configuration for a specific layer
     */
    public async setLayerTooltipConfig(layerId: string, config: TooltipConfig | null): Promise<void> {
        const layerConfig = this.layerConfigs.get(layerId);
        if (!layerConfig) {
            console.warn(`Layer ${layerId} not found`);
            return;
        }

        // Update the stored config (handle null by setting undefined)
        layerConfig.tooltipConfig = config ?? undefined;
        this.layerConfigs.set(layerId, layerConfig);

        console.log(`Tooltip config updated for layer ${layerId}:`, config);
        
        // Tooltips are evaluated dynamically, no need to recreate layers
    }
    
    private performSelection(polygon: [number, number][]): void {
        const selectedFeatures = this.selectFeaturesInPolygon(polygon);
        
        console.log(`✅ Selection complete: ${selectedFeatures.length} features selected (before deduplication)`);
        
        // Deduplicate features by ID (MVT features can span multiple tiles)
        const uniqueFeatures = this.deduplicateFeatures(selectedFeatures);
        
        console.log(`✅ After deduplication: ${uniqueFeatures.length} unique features`);
        
        // Extract feature IDs and update selection state
        const featureIds = uniqueFeatures
            .map(sf => this.getFeatureId(sf.feature, sf.layerId))
            .filter(id => id !== null) as string[];
        
        this.setSelectedFeatures(featureIds);
        
        if (this.dotNetHelper) {
            // Sanitize features to remove circular references before sending to .NET
            const sanitizedFeatures = uniqueFeatures.map(sf => ({
                layerId: sf.layerId,
                feature: this.sanitizeFeature(sf.feature)
            }));
            
            this.dotNetHelper.invokeMethodAsync('OnFeaturesSelected', {
                polygon,
                features: sanitizedFeatures,
                featureCount: uniqueFeatures.length
            });
        }
    }
    
    /**
     * Deduplicate features by their unique ID
     * MVT features can span multiple tiles, resulting in duplicate selections
     */
    private deduplicateFeatures(features: any[]): any[] {
        const seenIds = new Set<string>();
        const uniqueFeatures: any[] = [];
        
        for (let i = 0; i < features.length; i++) {
            const feature = features[i];
            // Log details for the first feature only
            const featureId = this.getFeatureId(feature.feature, feature.layerId, i === 0);
            
            if (!featureId) {
                // If no ID, keep the feature (can't deduplicate without ID)
                uniqueFeatures.push(feature);
                continue;
            }
            
            // Only add if we haven't seen this ID before
            if (!seenIds.has(featureId)) {
                seenIds.add(featureId);
                uniqueFeatures.push(feature);
            } else if (i === 0) {
                console.log(`  Skipping duplicate feature with ID: ${featureId}`);
            }
        }
        
        return uniqueFeatures;
    }
    
    /**
     * Sanitize a feature object to remove circular references and non-serializable properties
     * Only keeps essential GeoJSON properties
     */
    private sanitizeFeature(feature: any): any {
        if (!feature) return null;
        
        return {
            type: feature.type || 'Feature',
            id: feature.id,
            geometry: feature.geometry ? {
                type: feature.geometry.type,
                coordinates: feature.geometry.coordinates
            } : null,
            properties: feature.properties ? { ...feature.properties } : {}
        };
    }
    
    /**
     * Select features that fall within the given polygon
     * Uses point-in-polygon algorithm for point geometries
     */
    private selectFeaturesInPolygon(polygon: [number, number][]): any[] {
        const selectedFeatures: any[] = [];
        
        if (!this.deck) return selectedFeatures;
        
        // For MVT and tile-based layers, we need to use deck.gl's picking system
        // to get features from all rendered tiles
        const bbox = this.getBoundingBox(polygon);
        
        // Iterate through all current layers to find features
        for (const layer of this.currentLayers) {
            const layerData = (layer.props as any).data;
            const layerType = layer.constructor.name;
            const layerId = layer.id;
            
            console.log(`Checking layer ${layerId} (${layerType}) for selection`);
            
            // For MVT layers, check if this layer has the MVT-specific properties
            // After minification, constructor names change, so check for layer characteristics
            const isMVTLayer = layerType.includes('MVT') || 
                               layerId.includes('mvt') || 
                               (typeof (layer as any).getSubLayers === 'function' && 
                                typeof layerData === 'string' && 
                                (layerData.includes('.pbf') || layerData.includes('mvt')));
            
            if (isMVTLayer) {
                console.log(`Detected MVT layer: ${layerId}`);
                this.selectMVTFeaturesInPolygon(layer, polygon, bbox, selectedFeatures);
                continue;
            }
            
            if (!layerData) {
                console.log(`No layer data for ${layerId}`);
                continue;
            }
            
            this.processLayerData(layerData, layer.id, polygon, selectedFeatures);
        }
        
        console.log(`Selected ${selectedFeatures.length} features within polygon`);
        return selectedFeatures;
    }
    
    /**
     * Get bounding box for a polygon
     */
    private getBoundingBox(polygon: [number, number][]): { minX: number, minY: number, maxX: number, maxY: number } {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        for (const [x, y] of polygon) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
        }
        
        return { minX, minY, maxX, maxY };
    }
    
    /**
     * Select MVT features within polygon using deck.gl's picking system
     */
    private selectMVTFeaturesInPolygon(layer: any, polygon: [number, number][], bbox: any, selectedFeatures: any[]): void {
        // MVT layers render sublayers (GeoJsonLayers) for each tile
        // We need to get the rendered sublayers and check their features
        const subLayers = layer.getSubLayers?.();
        
        console.log(`MVT layer ${layer.id}: checking for sublayers...`);
        
        if (!subLayers || subLayers.length === 0) {
            console.log(`  ❌ No sublayers found for MVT layer ${layer.id}`);
            return;
        }
        
        console.log(`  ✅ Found ${subLayers.length} sublayers for MVT layer ${layer.id}`);
        
        let totalChecked = 0;
        let totalMatched = 0;
        
        // Check each sublayer's features
        for (const subLayer of subLayers) {
            const subLayerType = subLayer.constructor.name;
            
            // Get the tile's bounding box from props
            const tileBBox = subLayer.props?.tile?.bbox;
            if (!tileBBox) {
                console.log(`    Sublayer ${subLayer.id}: No bbox found, skipping`);
                continue;
            }
            
            console.log(`    Sublayer: ${subLayer.id}, bbox:`, tileBBox);
            
            // Try multiple ways to access the data
            let features: any[] = [];
            
            // Method 1: Check state.features (for binary or non-binary mode)
            if (subLayer.state?.features) {
                const stateFeatures = subLayer.state.features;
                
                // Collect all features from the different geometry types
                if (stateFeatures.polygonFeatures) {
                    features.push(...stateFeatures.polygonFeatures);
                }
                if (stateFeatures.pointFeatures) {
                    features.push(...stateFeatures.pointFeatures);
                }
                if (stateFeatures.lineFeatures) {
                    features.push(...stateFeatures.lineFeatures);
                }
            }
            
            // Method 2: Check props.data
            if (features.length === 0) {
                const subLayerData = subLayer.props?.data;
                if (subLayerData) {
                    if (subLayerData.type === 'FeatureCollection' && subLayerData.features) {
                        features = subLayerData.features;
                    } else if (Array.isArray(subLayerData)) {
                        features = subLayerData;
                    }
                }
            }
            
            if (features.length === 0) {
                console.log(`      No features found in sublayer`);
                continue;
            }
            
            console.log(`      Checking ${features.length} features in sublayer`);
            
            for (const feature of features) {
                if (!feature || !feature.geometry) continue;
                
                totalChecked++;
                
                // Convert MVT tile coordinates to world coordinates and check
                if (this.isFeatureInPolygonMVT(feature, polygon, tileBBox)) {
                    totalMatched++;
                    selectedFeatures.push({
                        layerId: layer.id, // Use parent MVT layer ID
                        feature: feature
                    });
                }
            }
        }
        
        console.log(`  MVT layer ${layer.id}: checked ${totalChecked} features, matched ${totalMatched}`);
    }
    
    /**
     * Check if an MVT feature (with tile-local coordinates) falls within a polygon (world coordinates)
     */
    private isFeatureInPolygonMVT(feature: any, polygon: [number, number][], tileBBox: any): boolean {
        if (!feature.geometry) return false;
        
        const geom = feature.geometry;
        
        // For polygon features, we need to check:
        // 1. If the centroid is inside the selection polygon
        // 2. If any point of the selection polygon is inside the feature polygon (reverse check)
        // 3. If any edges intersect
        if (geom.type === 'Polygon' && geom.coordinates[0]) {
            // Convert feature polygon coordinates to world space
            const worldPolygon: [number, number][] = geom.coordinates[0].map((coord: [number, number]) => 
                this.tileToWorld(coord, tileBBox)
            );
            
            // Check 1: Is the feature's centroid inside the selection polygon?
            const centroid = this.calculateCentroid(worldPolygon);
            if (this.pointInPolygon(centroid, polygon)) {
                return true;
            }
            
            // Check 2: Is any point of the selection polygon inside the feature?
            // This handles cases where the selection is drawn inside a large feature
            for (const point of polygon) {
                if (this.pointInPolygon(point, worldPolygon)) {
                    return true;
                }
            }
            
            // Check 3: Do any edges intersect?
            // This handles cases where polygons overlap but no vertices are inside
            if (this.polygonsIntersect(polygon, worldPolygon)) {
                return true;
            }
            
            return false;
        }
        else if (geom.type === 'MultiPolygon' && geom.coordinates[0]?.[0]) {
            // For MultiPolygon, check the first polygon (simplified approach)
            const worldPolygon: [number, number][] = geom.coordinates[0][0].map((coord: [number, number]) => 
                this.tileToWorld(coord, tileBBox)
            );
            
            const centroid = this.calculateCentroid(worldPolygon);
            if (this.pointInPolygon(centroid, polygon)) {
                return true;
            }
            
            for (const point of polygon) {
                if (this.pointInPolygon(point, worldPolygon)) {
                    return true;
                }
            }
            
            if (this.polygonsIntersect(polygon, worldPolygon)) {
                return true;
            }
            
            return false;
        }
        
        // For other geometry types (Point, LineString, etc.), use single point check
        let tileLocalCoords: [number, number] | null = null;
        
        if (geom.type === 'Point') {
            tileLocalCoords = geom.coordinates as [number, number];
        }
        else if (geom.type === 'LineString' && geom.coordinates[0]) {
            tileLocalCoords = geom.coordinates[0] as [number, number];
        }
        else if (geom.type === 'MultiLineString' && geom.coordinates[0]?.[0]) {
            tileLocalCoords = geom.coordinates[0][0] as [number, number];
        }
        
        if (!tileLocalCoords) return false;
        
        const worldCoords = this.tileToWorld(tileLocalCoords, tileBBox);
        return this.pointInPolygon(worldCoords, polygon);
    }
    
    /**
     * Convert tile-local coordinates to world lon/lat coordinates
     * Note: deck.gl's MVT layer provides coordinates already normalized to 0-1 range,
     * NOT in raw tile extent units (e.g., 0-4096)
     * 
     * IMPORTANT: MVT tile Y-axis is inverted compared to geographic coordinates:
     * - Tile Y=0 is at the TOP (north) of the tile
     * - Tile Y=1 is at the BOTTOM (south) of the tile
     * - Geographic lat increases from SOUTH to NORTH
     * Therefore, we must flip Y: tileY = 1 - normalizedY
     */
    private tileToWorld(tileCoords: [number, number], tileBBox: any): [number, number] {
        const [normalizedX, normalizedY] = tileCoords;
        
        // Flip Y coordinate: MVT tiles have origin at top-left, but lat increases upward
        const flippedY = 1.0 - normalizedY;
        
        // Coordinates are already normalized (0-1), so directly interpolate to world space
        const lon = tileBBox.west + normalizedX * (tileBBox.east - tileBBox.west);
        const lat = tileBBox.south + flippedY * (tileBBox.north - tileBBox.south);
        
        return [lon, lat];
    }
    
    /**
     * Process layer data to find features within polygon
     */
    private processLayerData(layerData: any, layerId: string, polygon: [number, number][], selectedFeatures: any[]): void {
        // Handle GeoJSON FeatureCollection
        if (layerData.type === 'FeatureCollection' && layerData.features) {
            for (const feature of layerData.features) {
                if (this.isFeatureInPolygon(feature, polygon)) {
                    selectedFeatures.push({
                        layerId: layerId,
                        feature: feature
                    });
                }
            }
        }
        // Handle array of features/objects
        else if (Array.isArray(layerData)) {
            for (const item of layerData) {
                if (this.isFeatureInPolygon(item, polygon)) {
                    selectedFeatures.push({
                        layerId: layerId,
                        feature: item
                    });
                }
            }
        }
        // Handle binary data (used by MVT layers)
        else if (layerData.points || layerData.lines || layerData.polygons) {
            // Binary format - need to reconstruct features
            console.log('Binary data format detected - selection may be limited');
        }
    }
    
    /**
     * Check if a feature or object falls within the polygon
     */
    private isFeatureInPolygon(feature: any, polygon: [number, number][]): boolean {
        // Extract coordinates based on feature type
        let coordinates: [number, number] | null = null;
        
        // GeoJSON feature (including MVT features rendered as GeoJSON)
        if (feature.geometry) {
            // For Polygon features, do a proper polygon-in-polygon check
            if (feature.geometry.type === 'Polygon' && feature.geometry.coordinates[0]) {
                const featurePolygon = feature.geometry.coordinates[0] as [number, number][];
                
                // Check 1: Is the feature's centroid inside the selection polygon?
                const centroid = this.calculateCentroid(featurePolygon);
                if (this.pointInPolygon(centroid, polygon)) {
                    return true;
                }
                
                // Check 2: Is any point of the selection polygon inside the feature?
                for (const point of polygon) {
                    if (this.pointInPolygon(point, featurePolygon)) {
                        return true;
                    }
                }
                
                // Check 3: Do any edges intersect?
                if (this.polygonsIntersect(polygon, featurePolygon)) {
                    return true;
                }
                
                return false;
            }
            else if (feature.geometry.type === 'MultiPolygon' && feature.geometry.coordinates[0]?.[0]) {
                const featurePolygon = feature.geometry.coordinates[0][0] as [number, number][];
                
                const centroid = this.calculateCentroid(featurePolygon);
                if (this.pointInPolygon(centroid, polygon)) {
                    return true;
                }
                
                for (const point of polygon) {
                    if (this.pointInPolygon(point, featurePolygon)) {
                        return true;
                    }
                }
                
                if (this.polygonsIntersect(polygon, featurePolygon)) {
                    return true;
                }
                
                return false;
            }
            else if (feature.geometry.type === 'Point') {
                coordinates = feature.geometry.coordinates as [number, number];
            }
            else if (feature.geometry.type === 'LineString' && feature.geometry.coordinates[0]) {
                coordinates = feature.geometry.coordinates[0] as [number, number];
            }
            else if (feature.geometry.type === 'MultiLineString' && feature.geometry.coordinates[0]?.[0]) {
                coordinates = feature.geometry.coordinates[0][0] as [number, number];
            }
        }
        // Direct coordinate arrays (common in deck.gl layers)
        else if (feature.position) {
            coordinates = feature.position as [number, number];
        }
        else if (feature.coordinates) {
            coordinates = feature.coordinates as [number, number];
        }
        else if (Array.isArray(feature) && feature.length >= 2) {
            coordinates = [feature[0], feature[1]];
        }
        
        if (!coordinates) {
            console.warn('Could not extract coordinates from feature:', feature);
            return false;
        }
        
        return this.pointInPolygon(coordinates, polygon);
    }
    
    /**
     * Check if two polygons intersect by testing if any of their edges cross
     */
    private polygonsIntersect(polygon1: [number, number][], polygon2: [number, number][]): boolean {
        // Check if any edge of polygon1 intersects any edge of polygon2
        for (let i = 0; i < polygon1.length; i++) {
            const p1 = polygon1[i];
            const p2 = polygon1[(i + 1) % polygon1.length];
            
            for (let j = 0; j < polygon2.length; j++) {
                const p3 = polygon2[j];
                const p4 = polygon2[(j + 1) % polygon2.length];
                
                if (this.lineSegmentsIntersect(p1, p2, p3, p4)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    /**
     * Check if two line segments intersect
     * Uses the orientation method to detect intersection
     */
    private lineSegmentsIntersect(
        p1: [number, number], 
        p2: [number, number], 
        p3: [number, number], 
        p4: [number, number]
    ): boolean {
        const [x1, y1] = p1;
        const [x2, y2] = p2;
        const [x3, y3] = p3;
        const [x4, y4] = p4;
        
        // Calculate the direction of the cross products
        const d1 = this.crossProduct(x3 - x1, y3 - y1, x2 - x1, y2 - y1);
        const d2 = this.crossProduct(x4 - x1, y4 - y1, x2 - x1, y2 - y1);
        const d3 = this.crossProduct(x1 - x3, y1 - y3, x4 - x3, y4 - y3);
        const d4 = this.crossProduct(x2 - x3, y2 - y3, x4 - x3, y4 - y3);
        
        // If the cross products have opposite signs, the segments intersect
        if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
            ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
            return true;
        }
        
        // Check for collinear cases (edges overlap)
        if (d1 === 0 && this.pointOnSegment(p1, p2, p3)) return true;
        if (d2 === 0 && this.pointOnSegment(p1, p2, p4)) return true;
        if (d3 === 0 && this.pointOnSegment(p3, p4, p1)) return true;
        if (d4 === 0 && this.pointOnSegment(p3, p4, p2)) return true;
        
        return false;
    }
    
    /**
     * Calculate 2D cross product (z-component)
     */
    private crossProduct(ux: number, uy: number, vx: number, vy: number): number {
        return ux * vy - uy * vx;
    }
    
    /**
     * Check if point q lies on line segment pr (assuming q is collinear with pr)
     */
    private pointOnSegment(p: [number, number], r: [number, number], q: [number, number]): boolean {
        return q[0] <= Math.max(p[0], r[0]) && q[0] >= Math.min(p[0], r[0]) &&
               q[1] <= Math.max(p[1], r[1]) && q[1] >= Math.min(p[1], r[1]);
    }
    
    /**
     * Point-in-polygon algorithm using ray casting
     * Returns true if point [lng, lat] is inside the polygon
     */
    private pointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
        const [x, y] = point;
        let inside = false;
        
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const [xi, yi] = polygon[i];
            const [xj, yj] = polygon[j];
            
            const intersect = ((yi > y) !== (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            
            if (intersect) inside = !inside;
        }
        
        return inside;
    }
    
    /**
     * Calculate centroid of a polygon
     */
    private calculateCentroid(coordinates: [number, number][]): [number, number] {
        let totalX = 0;
        let totalY = 0;
        
        for (const [x, y] of coordinates) {
            totalX += x;
            totalY += y;
        }
        
        return [totalX / coordinates.length, totalY / coordinates.length];
    }
    
    private refreshLayers(): void {
        if (!this.deck) return;
        
        // Use selection-aware refresh if there are selected features
        if (this.selectedFeatureIds.size > 0) {
            this.refreshLayersWithSelection();
            return;
        }
        
        const allLayers = [...this.currentLayers];
        if (this.editableLayer) {
            allLayers.push(this.editableLayer as any);
        }
        
        this.deck.setProps({ layers: allLayers });
        
        // Ensure cursor is correct after layer refresh
        setTimeout(() => this.updateCursor(), 50);
    }
}

/**
 * Create a DeckGLView instance
 */
export function createDeckGLView(config: DeckGLViewConfig, dotNetHelper?: any): DeckGLView {
    return new DeckGLView(config, dotNetHelper);
}



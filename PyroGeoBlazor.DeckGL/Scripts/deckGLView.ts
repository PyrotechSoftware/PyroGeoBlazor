import { Deck, DeckProps, Layer, MapView } from '@deck.gl/core';
import { EditableGeoJsonLayer, DrawPolygonMode, ViewMode } from '@deck.gl-community/editable-layers';
import { PathStyleExtension } from '@deck.gl/extensions';

/**
 * Debug logging control
 * Set to false to disable verbose logging in production
 */
const DEBUG_LOGGING = false;

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
    displayProperty?: string;  // Property name to use for displaying feature names in UI
    uniqueValueRenderer?: UniqueValueRenderer;  // Attribute-based styling
    minZoom?: number;  // Minimum zoom level before data is fetched
    enableViewportCulling?: boolean;  // Whether to append viewport bounds to dataUrl
    labelConfig?: LabelConfig;  // Label configuration for this layer
    tileLoadingDebounceMs?: number;  // Debounce time for tile loading indicators
}

/**
 * Configuration for rendering labels on map features
 */
export interface LabelConfig {
    textProperty?: string;  // Property name to use for label text
    enabled?: boolean;  // Whether labels are currently enabled
    minZoom?: number;  // Minimum zoom level for label visibility
    fontSize?: number;  // Font size in pixels
    textColor?: string;  // Text color (hex format)
    backgroundColor?: string;  // Background color (hex format with optional alpha)
    textAnchor?: string;  // Text anchor: "start", "middle", "end"
    textAlignment?: string;  // Text alignment: "left", "center", "right"
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
 * Unique value renderer for styling features by attribute values
 */
export interface UniqueValueRenderer {
    attribute: string;  // Property name to use for classification
    valueStyles: Record<string, FeatureStyleConfig>;  // Map of value -> style
    defaultStyle?: FeatureStyleConfig;  // Default style for unspecified values
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
 * Manages a deck.gl instance and provides an imperative API for Blazor.
 * JavaScript owns the WebGL context, data fetching, and rendering.
 * Blazor controls configuration, layer updates, and receives callbacks.
 */
export class DeckGLView {
    private deck: Deck | null = null;
    private containerId: string;
    private dotNetHelper: any = null;
    private currentLayers: Layer[] = [];
    private dataCache: Map<string, any> = new Map();

    // Editable layer state
    private editableLayer: EditableGeoJsonLayer | null = null;
    private drawingMode: any = ViewMode;
    private drawnFeatures: any[] = [];

    // Selection state
    private selectedFeatureIds: Set<string> = new Set();
    private selectedFeaturesData: Map<string, { layerId: string, feature: any }> = new Map(); // Track full feature data with layer
    private globalSelectionStyle: FeatureStyleConfig = {
        fillColor: '#4169E1',
        fillOpacity: 0.6,
        lineColor: '#4169E1',
        opacity: 1.0,
        lineWidth: 3
    };

    // Hover state
    private hoveredFeatureId: string | null = null;
    private hoveredLayerId: string | null = null;

    // Map mode state
    private currentMapMode: string = 'Explore';

    // Layer-specific styles and configurations
    private layerConfigs: Map<string, LayerConfig> = new Map();

    // Zoom and viewport tracking for MinZoom and viewport culling
    private lastZoomByLayer: Map<string, number> = new Map();
    private lastViewportByLayer: Map<string, { longitude: number; latitude: number }> = new Map();

    // Bounds cache for layers with viewport culling
    private layerBoundsCache: Map<string, { minLng: number, minLat: number, maxLng: number, maxLat: number }> = new Map();

    // Loading state tracking
    private activeFetches: Set<string> = new Set();
    private pendingTiles: Map<string, Set<string>> = new Map(); // Map of layerId -> Set of pending tile keys
    private tileLoadingLayers: Set<string> = new Set(); // Layers currently loading tiles
    private tileDebounceTimers: Map<string, NodeJS.Timeout> = new Map(); // Debounce timers per layer
    private isLoading: boolean = false;

    /**
     * Checks if a layer configuration needs to be updated.
     * Returns true if the layer must be recreated, false if it can be reused.
     */
    private layerNeedsUpdate(oldConfig: LayerConfig | undefined, newConfig: LayerConfig): boolean {
        // Check if layer is visible (default to true if not specified)
        const isVisible = newConfig.props.visible ?? true;
        const wasVisible = oldConfig?.props.visible ?? true;

        // Always log visibility checks for debugging label toggle issues
        console.log(`🔍 Checking if layer ${newConfig.id} needs update...`);
        console.log(`  - Has old config: ${!!oldConfig}`);
        console.log(`  - Visible (new): ${isVisible}, Visible (old): ${wasVisible}`);
        console.log(`  - MinZoom: ${newConfig.minZoom ?? 'none'}`);
        console.log(`  - EnableViewportCulling: ${newConfig.enableViewportCulling ?? false}`);
        console.log(`  - LabelConfig: ${JSON.stringify(newConfig.labelConfig)}`);

        // If visibility changed, we need to update
        if (isVisible !== wasVisible) {
            console.log(`  ✅ Visibility changed for ${newConfig.id}: ${wasVisible} → ${isVisible}`);
            return true;
        }

        // If layer is not visible, don't trigger updates (skip data fetching)
        if (!isVisible) {
            console.log(`  ⏭️ Layer ${newConfig.id} is not visible - skipping update check`);
            return false;
        }

        if (!oldConfig) {
            console.log(`  ✅ First time creating layer - needs update`);
            return true;
        }

        // Check if zoom crossed MinZoom threshold
        if (newConfig.minZoom) {
            const currentZoom = this.getCurrentZoom();
            const lastZoom = this.lastZoomByLayer.get(newConfig.id) ?? currentZoom;

            console.log(`  - MinZoom check: current=${currentZoom.toFixed(2)}, last=${lastZoom.toFixed(2)}, threshold=${newConfig.minZoom}`);

            // Check if we crossed the threshold in either direction
            const wasBelowMin = lastZoom < newConfig.minZoom;
            const isNowBelowMin = currentZoom < newConfig.minZoom;

            console.log(`  - Was below min: ${wasBelowMin}, Is now below min: ${isNowBelowMin}`);

            if (wasBelowMin !== isNowBelowMin) {
                console.log(`  ✅ Zoom crossed MinZoom threshold for ${newConfig.id}: ${lastZoom.toFixed(1)} → ${currentZoom.toFixed(1)} (minZoom: ${newConfig.minZoom})`);
                this.lastZoomByLayer.set(newConfig.id, currentZoom);
                return true;
            }

            // Update last zoom even if threshold not crossed
            this.lastZoomByLayer.set(newConfig.id, currentZoom);
        }

        // Check if viewport changed for layers with viewport culling enabled
        if (newConfig.enableViewportCulling) {
            const currentViewState = (this as any)._currentViewState;
            const currentZoom = this.getCurrentZoom();
            const lastZoom = this.lastZoomByLayer.get(newConfig.id) ?? currentZoom;
            const zoomDiff = Math.abs(currentZoom - lastZoom);

            // Get current and last position
            const currentLon = currentViewState?.longitude ?? 0;
            const currentLat = currentViewState?.latitude ?? 0;
            const lastViewport = this.lastViewportByLayer.get(newConfig.id);

            console.log(`  - Viewport culling check: zoom=${currentZoom.toFixed(2)}, lastZoom=${lastZoom.toFixed(2)}, diff=${zoomDiff.toFixed(3)}`);
            console.log(`  - Position: [${currentLon.toFixed(4)}, ${currentLat.toFixed(4)}]`);

            if (lastViewport) {
                const lonDiff = Math.abs(currentLon - lastViewport.longitude);
                const latDiff = Math.abs(currentLat - lastViewport.latitude);
                console.log(`  - Last position: [${lastViewport.longitude.toFixed(4)}, ${lastViewport.latitude.toFixed(4)}]`);
                console.log(`  - Position diff: lon=${lonDiff.toFixed(4)}, lat=${latDiff.toFixed(4)}`);

                // Calculate significant movement threshold based on zoom level
                // At zoom 10, moving 0.1 degrees (~11km) should trigger refresh
                // At zoom 17, moving 0.001 degrees (~110m) should trigger refresh
                const movementThreshold = 1 / Math.pow(2, currentZoom - 8);
                console.log(`  - Movement threshold for zoom ${currentZoom.toFixed(1)}: ${movementThreshold.toFixed(6)}`);

                // Update if zoom changed OR position moved significantly
                if (zoomDiff > 0.01 || lonDiff > movementThreshold || latDiff > movementThreshold) {
                    console.log(`  ✅ Viewport changed for ${newConfig.id} (zoom diff: ${zoomDiff.toFixed(3)}, lon diff: ${lonDiff.toFixed(4)}, lat diff: ${latDiff.toFixed(4)})`);
                    this.lastZoomByLayer.set(newConfig.id, currentZoom);
                    this.lastViewportByLayer.set(newConfig.id, { longitude: currentLon, latitude: currentLat });
                    return true;
                }
            } else {
                // First time - store current position
                console.log(`  ✅ First viewport check for ${newConfig.id} - will update`);
                this.lastZoomByLayer.set(newConfig.id, currentZoom);
                this.lastViewportByLayer.set(newConfig.id, { longitude: currentLon, latitude: currentLat });
                return true;
            }
        }

        // Check if data source changed
        if (oldConfig.dataUrl !== newConfig.dataUrl) {
            console.log(`  ✅ DataUrl changed for ${newConfig.id}`);
            return true;
        }

        if (oldConfig.data !== newConfig.data) {
            console.log(`  ✅ Data changed for ${newConfig.id}`);
            return true;
        }

        // Check if critical props changed
        const oldPropsStr = JSON.stringify(oldConfig.props);
        const newPropsStr = JSON.stringify(newConfig.props);
        if (oldPropsStr !== newPropsStr) {
            console.log(`  ✅ Props changed for ${newConfig.id}`);
            return true;
        }

        // Check if styles changed
        if (JSON.stringify(oldConfig.featureStyle) !== JSON.stringify(newConfig.featureStyle)) {
            console.log(`  ✅ FeatureStyle changed for ${newConfig.id}`);
            return true;
        }

        if (JSON.stringify(oldConfig.selectionStyle) !== JSON.stringify(newConfig.selectionStyle)) {
            console.log(`  ✅ SelectionStyle changed for ${newConfig.id}`);
            return true;
        }

        if (JSON.stringify(oldConfig.hoverStyle) !== JSON.stringify(newConfig.hoverStyle)) {
            console.log(`  ✅ HoverStyle changed for ${newConfig.id}`);
            return true;
        }

        // Check if label config changed
        if (JSON.stringify(oldConfig.labelConfig) !== JSON.stringify(newConfig.labelConfig)) {
            console.log(`  ✅ LabelConfig changed for ${newConfig.id}`);
            return true;
        }

        if (DEBUG_LOGGING) console.log(`  ❌ No changes detected - layer can be reused`);
        return false;
    }

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

        // Wait for container to have valid dimensions (flexbox layout needs time to calculate)
        this.initializeWhenReady(containerElement, config);
    }

    /**
     * Initialize deck.gl once the container has valid dimensions
     */
    private initializeWhenReady(containerElement: HTMLElement, config: DeckGLViewConfig): void {
        let retryCount = 0;
        const maxRetries = 20; // Max 1 second (20 * 50ms)

        const checkDimensions = () => {
            const rect = containerElement.getBoundingClientRect();
            console.log(`Container dimensions (attempt ${retryCount + 1}): ${rect.width}x${rect.height}`);

            // Wait until container has valid dimensions (width > 0 and height > 0)
            if (rect.width > 0 && rect.height > 0) {
                this.initializeDeck(containerElement, rect, config);
            } else if (retryCount < maxRetries) {
                // Retry after a brief delay
                retryCount++;
                console.log(`Container not yet sized, retrying in 50ms... (${retryCount}/${maxRetries})`);
                setTimeout(checkDimensions, 50);
            } else {
                console.error(`❌ Failed to initialize deck.gl: Container dimensions are still 0x0 after ${maxRetries} attempts`);
                console.error('Container element:', containerElement);
                console.error('Container parent:', containerElement.parentElement);
                console.error('Container computed style:', window.getComputedStyle(containerElement));
            }
        };

        // Start checking
        checkDimensions();
    }

    /**
     * Initialize the deck.gl instance with valid dimensions
     */
    private initializeDeck(containerElement: HTMLElement, rect: DOMRect, config: DeckGLViewConfig): void {
        console.log(`Initializing deck.gl with dimensions: ${rect.width}x${rect.height}`);

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
                // Handle SelectFeature mode - single feature selection
                if (this.currentMapMode === 'SelectFeature' && info.object && info.layer) {
                    this.handleSingleFeatureSelection(info);
                    return;
                }

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
                if (this.currentMapMode === 'SelectFeature') {
                    return 'pointer';
                }
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

        // Notify .NET that deck.gl is initialized and ready
        if (this.dotNetHelper) {
            console.log('🎉 Notifying .NET that deck.gl is initialized');
            this.dotNetHelper.invokeMethodAsync('OnDeckInitializedCallback');
        }
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
     * Updates layers using provided configurations.
     * Implements caching to avoid redundant recreation.
     * Only recreates layers when configuration actually changes.
     */
    public async updateLayers(layerConfigs: LayerConfig[], currentViewState?: ViewState): Promise<void> {
        const startTime = performance.now();
        console.log(`🔄 Updating ${layerConfigs.length} layers...`);

        // Store the current view state if provided (for accurate zoom detection)
        if (currentViewState) {
            (this as any)._currentViewState = currentViewState;
            console.log(`📊 Current zoom level from C#: ${currentViewState.zoom.toFixed(2)}`);
        } else {
            console.log(`📊 Current zoom level: ${this.getCurrentZoom().toFixed(2)}`);
        }

        if (DEBUG_LOGGING) {
            // Debug: Log each layer's config
            layerConfigs.forEach(config => {
                console.log(`📋 Layer ${config.id}: minZoom=${config.minZoom ?? 'none'}, enableViewportCulling=${config.enableViewportCulling ?? false}, dataUrl=${config.dataUrl ?? 'none'}`);
            });
        }

        const layers: Layer[] = [];
        let recreatedCount = 0;
        let reusedCount = 0;

        for (const config of layerConfigs) {
            try {
                const oldConfig = this.layerConfigs.get(config.id);
                const existingLayer = this.currentLayers.find(l => l.id === config.id);

                // Check if we can reuse the existing layer
                if (existingLayer && oldConfig && !this.layerNeedsUpdate(oldConfig, config)) {
                    console.log(`  ♻️  Reusing layer: ${config.id}`);
                    
                    // Find all layers that belong to this config (including companion layers like text)
                    const relatedLayers = this.currentLayers.filter(l => 
                        l.id === config.id || l.id.startsWith(`${config.id}-`)
                    );
                    
                    layers.push(...relatedLayers);
                    console.log(`  ♻️  Reused ${relatedLayers.length} layer(s) for ${config.id}`);
                    reusedCount++;
                } else {
                    // Layer needs update - clear cache to force fresh data fetch
                    if (this.dataCache.has(config.id)) {
                        console.log(`  🗑️  Clearing cache for ${config.id} (viewport/zoom changed)`);
                        this.dataCache.delete(config.id);
                    }

                    // Create new layer only if needed
                    console.log(`  🔨 Creating layer: ${config.id}`);
                    const createdLayers = await this.createLayer(config);
                    if (createdLayers && createdLayers.length > 0) {
                        // Add all created layers (may include text layer for labels)
                        layers.push(...createdLayers);
                        recreatedCount++;
                    }
                }

                // Always update the config map with a deep copy to prevent mutation issues
                this.layerConfigs.set(config.id, JSON.parse(JSON.stringify(config)));
            } catch (error) {
                console.error(`❌ Error creating layer ${config.id}:`, error);
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

        const endTime = performance.now();
        const duration = (endTime - startTime).toFixed(2);
        console.log(`✅ Layer update complete in ${duration}ms (♻️ ${reusedCount} reused, 🔨 ${recreatedCount} recreated)`);
    }

    /**
     * Creates a layer from configuration.
     * Handles data fetching and applies feature styles.
     * Returns an array of layers (may include a text layer for labels).
     */
    private async createLayer(config: LayerConfig): Promise<Layer[]> {
        // Import the layer class dynamically based on type
        const { createLayerFromConfig } = await import('./layerFactory');

        // Check if layer is visible (default to true if not specified)
        const isVisible = config.props.visible ?? true;

        // If dataUrl is provided, fetch the data (JS owns data fetching)
        let data = config.data;
        if (config.dataUrl && isVisible) {
            // Only fetch data if layer is visible
            // Check MinZoom: don't fetch if below minimum zoom level
            const currentZoom = this.getCurrentZoom();
            if (config.minZoom && currentZoom < config.minZoom) {
                console.log(`⏭️ Skipping layer ${config.id}: zoom ${currentZoom.toFixed(1)} < minZoom ${config.minZoom}`);
                // Return null or empty data - layer won't render
                data = null;
            } else {
                // Build URL with viewport parameters if viewport culling enabled
                let dataUrl = config.dataUrl;
                if (config.enableViewportCulling) {
                    dataUrl = this.buildViewportUrl(config.dataUrl);
                    console.log(`🌍 Viewport culling enabled for ${config.id}: ${dataUrl}`);
                }

                data = await this.fetchData(dataUrl, config.id);
            }
        } else if (config.dataUrl && !isVisible) {
            console.log(`⏭️ Skipping data fetch for ${config.id}: layer is not visible`);
            data = null;
        }

        // Auto-generate IDs for GeoJSON features if they don't have one
        if (data && (config.type === 'GeoJsonLayer' || config.type === 'geojson')) {
            data = this.ensureFeatureIds(data, config.id);
        }

        // Apply base feature style if provided
        const enhancedConfig = this.applyFeatureStyle(config);

        // Add tile loading callbacks for MVT/Tile layers
        if (config.type === 'MVTLayer' || config.type === 'mvt' || 
            config.type === 'TileLayer' || config.type === 'tile') {
            
            const debounceMs = config.tileLoadingDebounceMs ?? 1000;
            
            enhancedConfig.props.onTileLoad = (tile: any) => {
                const tileKey = `${tile.index?.x ?? 'x'}-${tile.index?.y ?? 'y'}-${tile.index?.z ?? 'z'}`;
                console.log(`🔵 Tile loaded: ${config.id} [${tileKey}]`);
                
                // Mark layer as loading when first tile loads
                if (!this.tileLoadingLayers.has(config.id)) {
                    this.setLayerTileLoading(config.id);
                }
                
                this.onTileLoadComplete(config.id, tileKey, debounceMs);
            };
            
            enhancedConfig.props.onTileError = (error: any, tile: any) => {
                const tileKey = `${tile.index?.x ?? 'x'}-${tile.index?.y ?? 'y'}-${tile.index?.z ?? 'z'}`;
                console.log(`🔴 Tile error: ${config.id} [${tileKey}]`, error);
                
                // Mark layer as loading when first tile loads  
                if (!this.tileLoadingLayers.has(config.id)) {
                    this.setLayerTileLoading(config.id);
                }
                
                this.onTileLoadComplete(config.id, tileKey, debounceMs);
            };
        }

        // Create the layer(s) using the factory
        // Returns an array that may contain both geometry and text layers
        return createLayerFromConfig(enhancedConfig, data);
    }

    /**
     * Ensures all features have unique IDs.
     * Auto-generates IDs for features without one.
     */
    private ensureFeatureIds(data: any, layerId: string): any {
        if (!data) return data;

        if (data.type === 'FeatureCollection' && data.features) {
            let idCounter = 0;
            data.features = data.features.map((feature: any) => {
                if (!feature.id && !feature.properties?.id) {
                    // Generate a unique ID based on layer and counter
                    const generatedId = `${layerId}_feature_${idCounter++}`;
                    if (DEBUG_LOGGING) {
                        console.log(`Auto-generated ID for feature: ${generatedId}`);
                    }
                    // Set both at root level and in properties for compatibility
                    return {
                        ...feature,
                        id: generatedId,
                        properties: {
                            ...feature.properties,
                            id: generatedId
                        }
                    };
                }
                return feature;
            });
        }

        return data;
    }

    /**
     * Applies base feature style to layer configuration.
     */
    private applyFeatureStyle(config: LayerConfig): LayerConfig {
        if (DEBUG_LOGGING) {
            console.log(`🎨 [applyFeatureStyle] START - Layer: ${config.id}`);
            console.log(`  Input config.featureStyle:`, config.featureStyle);
            console.log(`  Input config.uniqueValueRenderer:`, config.uniqueValueRenderer);
            console.log(`  Input config.props.fillColor:`, config.props.fillColor);
            console.log(`  Input config.props.getFillColor:`, config.props.getFillColor);
            console.log(`  Input config.props.lineColor:`, config.props.lineColor);
            console.log(`  Input config.props.getLineColor:`, config.props.getLineColor);
        }

        if (!config.featureStyle && !config.uniqueValueRenderer) {
            if (DEBUG_LOGGING) console.log(`  ❌ No featureStyle or uniqueValueRenderer - returning config unchanged`);
            return config;
        }

        const enhancedProps = { ...config.props };
        if (DEBUG_LOGGING) console.log(`  Created enhancedProps copy`);

        // If unique value renderer is specified, use attribute-based styling
        if (config.uniqueValueRenderer) {
            if (DEBUG_LOGGING) console.log(`  ✅ Applying unique value renderer...`);
            this.applyUniqueValueRenderer(config, enhancedProps);

            if (DEBUG_LOGGING) {
                console.log(`  After unique value renderer:`);
                console.log(`    enhancedProps.getFillColor:`, typeof enhancedProps.getFillColor);
                console.log(`    enhancedProps.getLineColor:`, typeof enhancedProps.getLineColor);
                console.log(`🎨 [applyFeatureStyle] END (unique value renderer)`);
            }

            return {
                ...config,
                props: enhancedProps
            };
        }

        // Otherwise, apply simple feature style
        const style = config.featureStyle!;
        if (DEBUG_LOGGING) console.log(`  ✅ Applying simple feature style:`, style);

        // Apply style properties based on layer type
        if (style.fillColor) {
            const fillOpacity = style.fillOpacity ?? 1.0;
            const rgbaColor = hexToRgba(style.fillColor, fillOpacity);
            if (DEBUG_LOGGING) console.log(`    Set fillColor: ${style.fillColor} (opacity: ${fillOpacity}) -> RGBA:`, rgbaColor);

            enhancedProps.fillColor = rgbaColor;
            enhancedProps.getFillColor = () => rgbaColor;
            if (DEBUG_LOGGING) console.log(`    Set fillColor static property and getFillColor accessor to return RGBA:`, rgbaColor);

            enhancedProps.filled = fillOpacity > 0;
            if (DEBUG_LOGGING) console.log(`    Set filled based on fillOpacity (${fillOpacity}):`, enhancedProps.filled);
        }

        if (style.lineColor) {
            const lineOpacity = style.opacity ?? 1.0;
            const rgbaColor = hexToRgba(style.lineColor, lineOpacity);
            if (DEBUG_LOGGING) console.log(`    Set lineColor: ${style.lineColor} (opacity: ${lineOpacity}) -> RGBA:`, rgbaColor);

            enhancedProps.lineColor = rgbaColor;
            enhancedProps.getLineColor = () => rgbaColor;
            if (DEBUG_LOGGING) console.log(`    Set lineColor static property and getLineColor accessor to return RGBA:`, rgbaColor);

            enhancedProps.stroked = true;
            if (DEBUG_LOGGING) console.log(`    Set stroked: true (has lineColor)`);
        }

        if (style.lineWidth !== undefined) {
            enhancedProps.lineWidth = style.lineWidth;
            if (DEBUG_LOGGING) console.log(`    Set lineWidth:`, style.lineWidth);

            enhancedProps.getLineWidth = () => style.lineWidth;
            if (DEBUG_LOGGING) console.log(`    Set getLineWidth accessor to return:`, style.lineWidth);
        }

        if (style.radiusScale !== undefined) {
            enhancedProps.radiusScale = style.radiusScale;
            if (DEBUG_LOGGING) console.log(`    Set radiusScale:`, style.radiusScale);
        }

        // Add update triggers to force deck.gl to re-evaluate the style
        const timestamp = Date.now();
        enhancedProps.updateTriggers = {
            ...enhancedProps.updateTriggers,
            getFillColor: `style-${timestamp}`,
            getLineColor: `style-${timestamp}`,
            getLineWidth: `style-${timestamp}`,
            getRadius: `style-${timestamp}`
        };
        if (DEBUG_LOGGING) console.log(`    Set updateTriggers with timestamp: ${timestamp}`);

        if (DEBUG_LOGGING) {
            console.log(`  Final enhancedProps.fillColor:`, enhancedProps.fillColor);
            console.log(`  Final enhancedProps.lineColor:`, enhancedProps.lineColor);
            console.log(`  Final enhancedProps.getFillColor:`, enhancedProps.getFillColor);
            console.log(`  Final enhancedProps.getLineColor:`, enhancedProps.getLineColor);
            console.log(`🎨 [applyFeatureStyle] END (simple style)`);
        }

        return {
            ...config,
            props: enhancedProps
        };
    }

    /**
     * Apply unique value renderer to create attribute-based styling
     */
    private applyUniqueValueRenderer(config: LayerConfig, enhancedProps: Record<string, any>): void {
        const renderer = config.uniqueValueRenderer!;
        const attribute = renderer.attribute;
        const valueStyles = renderer.valueStyles;
        const defaultStyle = renderer.defaultStyle;

        console.log(`Applying unique value renderer on attribute '${attribute}' for layer ${config.id}`);
        console.log(`  Styles defined for values:`, Object.keys(valueStyles));

        // Create getFillColor accessor function
        enhancedProps.getFillColor = (feature: any) => {
            // Get the attribute value from the feature
            let value = feature.properties?.[attribute];

            // Convert to string for comparison (unless it's null/undefined)
            const valueKey = value === null || value === undefined ? 'null' : String(value);

            // Look up the style for this value
            const style = valueStyles[valueKey] ?? defaultStyle;

            if (style?.fillColor) {
                const fillOpacity = style.fillOpacity ?? 1.0;
                return hexToRgba(style.fillColor, fillOpacity);
            }

            // Fallback to default gray
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

        // Create getRadius accessor function (for point layers)
        if (config.type === 'ScatterplotLayer' || config.type === 'scatterplot') {
            const originalGetRadius = enhancedProps.getRadius;

            enhancedProps.getRadius = (feature: any) => {
                let value = feature.properties?.[attribute];
                const valueKey = value === null || value === undefined ? 'null' : String(value);
                const style = valueStyles[valueKey] ?? defaultStyle;

                const baseRadius = typeof originalGetRadius === 'function'
                    ? originalGetRadius(feature)
                    : (feature.radius || 100);

                return baseRadius * (style?.radiusScale ?? 1.0);
            };
        }

        // Set update triggers to ensure deck.gl re-renders when styles change
        enhancedProps.updateTriggers = {
            ...enhancedProps.updateTriggers,
            getFillColor: attribute,
            getLineColor: attribute,
            getLineWidth: attribute,
            getRadius: attribute
        };
    }

    /**
     * Fetches data from an API endpoint with caching.
     * Updates layer bounds cache for viewport-culled layers.
     */
    private async fetchData(url: string, cacheKey: string): Promise<any> {
        // Check cache first
        if (this.dataCache.has(cacheKey)) {
            console.log(`Using cached data for ${cacheKey}`);
            return this.dataCache.get(cacheKey);
        }

        console.log(`Fetching data from ${url}`);

        // Track this fetch
        this.activeFetches.add(cacheKey);
        this.updateLoadingState();

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.dataCache.set(cacheKey, data);

            // Update bounds cache for this layer
            this.updateLayerBoundsCache(cacheKey, data);

            console.log(`Fetched and cached data for ${cacheKey}`);
            return data;
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
            throw error;
        } finally {
            // Remove from active fetches
            this.activeFetches.delete(cacheKey);
            this.updateLoadingState();
        }
    }

    /**
     * Update loading state and notify .NET if state changed
     */
    private updateLoadingState(): void {
        const newLoadingState = this.activeFetches.size > 0 || this.tileLoadingLayers.size > 0;

        if (newLoadingState !== this.isLoading) {
            this.isLoading = newLoadingState;
            console.log(`📊 Loading state changed: ${this.isLoading} (fetches: ${this.activeFetches.size}, tile layers: ${this.tileLoadingLayers.size})`);

            // Notify .NET of loading state change
            if (this.dotNetHelper) {
                this.dotNetHelper.invokeMethodAsync('OnLoadingStateChanged', this.isLoading);
            }
        }
    }

    /**
     * Mark a layer as loading tiles (called when layer is created/updated)
     */
    private setLayerTileLoading(layerId: string): void {
        this.tileLoadingLayers.add(layerId);
        console.log(`🔄 Layer ${layerId} marked as tile-loading`);
        this.updateLoadingState();
    }

    /**
     * Clear tile loading state for a layer after debounce period
     */
    private clearLayerTileLoadingDebounced(layerId: string, debounceMs: number = 1000): void {
        // Clear any existing timer
        const existingTimer = this.tileDebounceTimers.get(layerId);
        if (existingTimer) {
            clearTimeout(existingTimer);
        }

        // Set new timer - if no tiles complete in the debounce period, consider loading done
        const timer = setTimeout(() => {
            this.tileLoadingLayers.delete(layerId);
            this.tileDebounceTimers.delete(layerId);
            console.log(`✅ Layer ${layerId} tile loading complete (debounced ${debounceMs}ms)`);
            this.updateLoadingState();
        }, debounceMs);

        this.tileDebounceTimers.set(layerId, timer);
    }

    /**
     * Track tile loading for a layer
     */
    private onTileLoadStart(layerId: string, tileKey: string): void {
        if (!this.pendingTiles.has(layerId)) {
            this.pendingTiles.set(layerId, new Set());
        }
        this.pendingTiles.get(layerId)!.add(tileKey);
        this.updateLoadingState();
    }

    /**
     * Track tile load completion
     */
    private onTileLoadComplete(layerId: string, tileKey: string, debounceMs?: number): void {
        console.log(`✓ Tile loaded for ${layerId}: ${tileKey}`);
        
        const tiles = this.pendingTiles.get(layerId);
        if (tiles) {
            tiles.delete(tileKey);
            if (tiles.size === 0) {
                this.pendingTiles.delete(layerId);
            }
        }
        
        // Debounce the "done loading" state - wait for more tiles
        this.clearLayerTileLoadingDebounced(layerId, debounceMs);
    }

    /**
     * Refresh all layers at current view state (clears cache and reloads)
     */
    public async refreshLayers(): Promise<void> {
        console.log('🔄 Refreshing all layers...');

        // Clear data cache to force reload
        this.dataCache.clear();
        console.log('  ✅ Data cache cleared');

        // Clear pending tiles
        this.pendingTiles.clear();

        // Re-apply layers which will trigger data fetching
        await this.applyLayerChanges();

        console.log('  ✅ Layers refreshed');
    }

    /**
     * Clears the data cache.
     */
    public clearCache(): void {
        this.dataCache.clear();
        console.log('Data cache cleared');
    }

    /**
     * Removes a specific item from cache.
     */
    public removeCacheItem(key: string): void {
        this.dataCache.delete(key);
        console.log(`Removed cache item: ${key}`);
    }

    /**
     * Updates the bounds cache for a layer based on newly loaded data.
     * Expands existing bounds if new data extends beyond current bounds.
     */
    private updateLayerBoundsCache(layerId: string, data: any): void {
        if (!data) return;

        let features: any[] = [];
        if (data.type === 'FeatureCollection' && data.features) {
            features = data.features;
        } else if (Array.isArray(data)) {
            features = data;
        }

        if (features.length === 0) return;

        // Calculate bounds of new data
        let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
        for (const feature of features) {
            const bounds = this.calculateFeatureBounds(feature);
            if (bounds) {
                minLng = Math.min(minLng, bounds.minLng);
                minLat = Math.min(minLat, bounds.minLat);
                maxLng = Math.max(maxLng, bounds.maxLng);
                maxLat = Math.max(maxLat, bounds.maxLat);
            }
        }

        if (minLng === Infinity) return;

        if (DEBUG_LOGGING) {
            console.log(`📐 [updateLayerBoundsCache] Calculated bounds from ${features.length} features for ${layerId}:`,
                { minLng, minLat, maxLng, maxLat });
        }

        // Get existing cached bounds
        const existingBounds = this.layerBoundsCache.get(layerId);

        if (existingBounds) {
            if (DEBUG_LOGGING) {
                console.log(`📐 [updateLayerBoundsCache] Existing cached bounds for ${layerId}:`, existingBounds);
            }
            // Expand existing bounds
            minLng = Math.min(minLng, existingBounds.minLng);
            minLat = Math.min(minLat, existingBounds.minLat);
            maxLng = Math.max(maxLng, existingBounds.maxLng);
            maxLat = Math.max(maxLat, existingBounds.maxLat);
            if (DEBUG_LOGGING) {
                console.log(`📐 [updateLayerBoundsCache] Expanded bounds for ${layerId}:`, { minLng, minLat, maxLng, maxLat });
            }
        } else {
            if (DEBUG_LOGGING) {
                console.log(`📐 [updateLayerBoundsCache] Created initial bounds cache for ${layerId}:`, { minLng, minLat, maxLng, maxLat });
            }
        }

        // Store updated bounds
        this.layerBoundsCache.set(layerId, { minLng, minLat, maxLng, maxLat });
    }

    /**
     * Gets the current zoom level from the deck's view state.
     */
    private getCurrentZoom(): number {
        // First, try to use the viewState passed from C# (most accurate)
        const currentViewState = (this as any)._currentViewState;
        if (currentViewState?.zoom != null) {
            console.log(`📍 Got zoom from stored C# viewState: ${currentViewState.zoom}`);
            return currentViewState.zoom;
        }

        if (!this.deck) {
            console.warn('⚠️ getCurrentZoom: deck is null');
            return 0;
        }

        // Try multiple methods to get the zoom level
        try {
            // Method 1: Try viewState property
            const viewState = (this.deck as any).viewState;
            if (viewState?.zoom != null) {
                console.log(`📍 Got zoom from deck.viewState: ${viewState.zoom}`);
                return viewState.zoom;
            }

            // Method 2: Try viewManager
            const viewManager = (this.deck as any).viewManager;
            if (viewManager?.getViewState) {
                const vs = viewManager.getViewState();
                if (vs?.zoom != null) {
                    console.log(`📍 Got zoom from viewManager: ${vs.zoom}`);
                    return vs.zoom;
                }
            }

            // Method 3: Try getViewports
            const viewports = this.deck.getViewports();
            if (viewports?.[0]?.zoom != null) {
                console.log(`📍 Got zoom from getViewports: ${viewports[0].zoom}`);
                return viewports[0].zoom;
            }

            // Method 4: Try _lastViewState (fallback)
            const lastViewState = (this.deck as any)._lastViewState;
            if (lastViewState?.zoom != null) {
                console.log(`📍 Got zoom from _lastViewState: ${lastViewState.zoom}`);
                return lastViewState.zoom;
            }

            console.warn('⚠️ Could not get zoom from any deck.gl property');
            return 0;
        } catch (error) {
            console.error('❌ Error getting current zoom:', error);
            return 0;
        }
    }

    /**
     * Builds a URL with viewport bounds and zoom parameters.
     * Appends minLon, minLat, maxLon, maxLat, and zoom to the URL.
     */
    private buildViewportUrl(baseUrl: string): string {
        // ALWAYS use the stored viewState from C# first (most accurate and up-to-date)
        let viewState: any = (this as any)._currentViewState;

        // Only fall back to deck.gl if no C# viewState available
        if (!viewState && this.deck) {
            // Try viewState property
            viewState = (this.deck as any).viewState;

            // Try viewManager
            if (!viewState) {
                const viewManager = (this.deck as any).viewManager;
                if (viewManager?.getViewState) {
                    viewState = viewManager.getViewState();
                }
            }

            // Try getViewports
            if (!viewState) {
                const viewports = this.deck.getViewports();
                if (viewports?.[0]) {
                    viewState = viewports[0];
                }
            }
        }

        if (!viewState) {
            console.warn('⚠️ Could not get viewState for buildViewportUrl');
            return baseUrl;
        }

        const { longitude, latitude, zoom } = viewState;

        console.log(`🗺️ Building viewport URL - Center: [${longitude?.toFixed(4)}, ${latitude?.toFixed(4)}], Zoom: ${zoom?.toFixed(2)}`);

        if (longitude == null || latitude == null || zoom == null) {
            console.warn('⚠️ ViewState missing required properties:', viewState);
            return baseUrl;
        }

        // Calculate approximate viewport bounds based on zoom level
        const latDelta = 180 / Math.pow(2, zoom);  // Degrees latitude visible
        const lonDelta = 360 / Math.pow(2, zoom);  // Degrees longitude visible

        // No padding added here - the server-side controller will add padding for data fetching
        const minLon = longitude - lonDelta;
        const maxLon = longitude + lonDelta;
        const minLat = latitude - latDelta;
        const maxLat = latitude + latDelta;

        console.log(`📐 Calculated viewport bounds (no padding): minLon=${minLon.toFixed(4)}, minLat=${minLat.toFixed(4)}, maxLon=${maxLon.toFixed(4)}, maxLat=${maxLat.toFixed(4)}`);
        console.log(`   (viewport delta: lat=${latDelta.toFixed(4)}, lon=${lonDelta.toFixed(4)})`);


        // Add query parameters to URL
        const separator = baseUrl.includes('?') ? '&' : '?';
        return `${baseUrl}${separator}minLon=${minLon}&minLat=${minLat}&maxLon=${maxLon}&maxLat=${maxLat}&zoom=${zoom}`;
    }

    /**
     * Sets the global selection style for selected features.
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

        console.log(`🎨 [setLayerFeatureStyle] START - Layer: ${layerId}`);
        console.log(`  Incoming style:`, style);
        console.log(`  Current config.featureStyle:`, config.featureStyle);

        // Update the stored config
        config.featureStyle = { ...config.featureStyle, ...style };

        // Clear uniqueValueRenderer since we're now using a simple feature style
        // (user is explicitly overriding attribute-based styling)
        config.uniqueValueRenderer = undefined;

        // Add a version timestamp to force deck.gl to recognize this as a new layer
        config.props._styleVersion = Date.now();

        this.layerConfigs.set(layerId, config);

        console.log(`  After update - config.featureStyle:`, config.featureStyle);
        console.log(`🎨 [setLayerFeatureStyle] END`);

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

        // Find the existing layer(s) - may include companion layers like text
        const layerIndices: number[] = [];
        this.currentLayers.forEach((layer, index) => {
            if (layer.id === layerId || layer.id.startsWith(`${layerId}-`)) {
                layerIndices.push(index);
            }
        });

        if (layerIndices.length === 0) {
            console.warn(`Layer ${layerId} not found in currentLayers`);
            return;
        }

        // Update visibility on existing layer(s) instead of recreating
        layerIndices.forEach(index => {
            const layer = this.currentLayers[index];
            // Clone the layer with updated visible prop
            this.currentLayers[index] = layer.clone({ visible });
        });

        // Update deck.gl to reflect the change
        if (this.deck) {
            const allLayers = [...this.currentLayers];
            if (this.editableLayer) {
                allLayers.push(this.editableLayer as any);
            }
            this.deck.setProps({ layers: allLayers });
        }

        console.log(`Layer ${layerId} visibility updated to ${visible} (${layerIndices.length} layer(s) affected)`);
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
        console.log(`🔄 [recreateLayer] START - Layer: ${layerId}`);

        const config = this.layerConfigs.get(layerId);
        if (!config) {
            console.log(`  ❌ Config not found`);
            return;
        }

        console.log(`  Current config.featureStyle:`, config.featureStyle);
        console.log(`  Current config.props.fillColor:`, config.props.fillColor);
        console.log(`  Current config.props.getFillColor:`, config.props.getFillColor);

        // Find the index of the layer
        const layerIndex = this.currentLayers.findIndex(layer => layer.id === layerId);
        if (layerIndex === -1) {
            console.log(`  ❌ Layer not found in currentLayers array`);
            return;
        }

        console.log(`  Found layer at index ${layerIndex}`);

        // Apply feature style and save the enhanced config back to the map
        // This ensures future recreations use the updated static colors
        const enhancedConfig = this.applyFeatureStyle(config);
        console.log(`  Enhanced config.props.fillColor:`, enhancedConfig.props.fillColor);
        console.log(`  Enhanced config.props.getFillColor:`, enhancedConfig.props.getFillColor);

        this.layerConfigs.set(layerId, enhancedConfig);
        console.log(`  Saved enhanced config to layerConfigs map`);

        // Recreate the layer with selection styling if needed
        let newLayer: Layer | null;
        if (this.selectedFeatureIds.size > 0 || this.hoveredFeatureId) {
            console.log(`  Creating layer with hover and selection (${this.selectedFeatureIds.size} selected)`);
            newLayer = await this.createLayerWithHoverAndSelection(enhancedConfig);
        } else {
            console.log(`  Creating layer without selection`);
            newLayer = await this.createLayer(enhancedConfig);
        }

        if (newLayer) {
            console.log(`  ✅ New layer created successfully`);
            console.log(`  New layer fillColor:`, (newLayer.props as any).fillColor);
            console.log(`  New layer getFillColor:`, (newLayer.props as any).getFillColor);

            this.currentLayers[layerIndex] = newLayer;

            // Update deck with the modified layers array
            if (this.deck) {
                const allLayers = [...this.currentLayers];
                if (this.editableLayer) {
                    allLayers.push(this.editableLayer as any);
                }
                console.log(`  Updating deck.gl with ${allLayers.length} layers`);
                this.deck.setProps({ layers: allLayers });
            }
        } else {
            console.log(`  ❌ Failed to create new layer`);
        }

        console.log(`🔄 [recreateLayer] END`);
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
        this.selectedFeaturesData.clear();
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
        // Callbacks must be in props to be spread by layerFactory's ...props
        const enhancedConfig = {
            ...baseConfig,
            props: {
                ...baseConfig.props,
                // Add tile loading callbacks - these will be spread into MVTLayer
                onTileLoad: (tile: any) => {
                    const tileKey = `${tile.index?.x ?? 'x'}-${tile.index?.y ?? 'y'}-${tile.index?.z ?? 'z'}`;
                    console.log(`🔵 Tile loaded: ${config.id} [${tileKey}]`);
                    
                    // Mark layer as loading when first tile loads
                    if (!this.tileLoadingLayers.has(config.id)) {
                        this.setLayerTileLoading(config.id);
                    }
                    
                    this.onTileLoadComplete(config.id, tileKey);
                },
                onTileError: (error: any, tile: any) => {
                    const tileKey = `${tile.index?.x ?? 'x'}-${tile.index?.y ?? 'y'}-${tile.index?.z ?? 'z'}`;
                    console.log(`🔴 Tile error: ${config.id} [${tileKey}]`, error);
                    
                    // Mark layer as loading when first tile loads
                    if (!this.tileLoadingLayers.has(config.id)) {
                        this.setLayerTileLoading(config.id);
                    }
                    
                    this.onTileLoadComplete(config.id, tileKey);
                },
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

            // Track which features we've logged to avoid spam
            const loggedFeatures = new Set<string>();

            (enhancedConfig.props as any).getFillColor = (d: any) => {
                const featureId = this.getFeatureId(d, config.id);
                const isSelected = featureId && selectedIds.has(featureId);

                if (isSelected) {
                    // Only log the first time we style each selected feature
                    if (DEBUG_LOGGING && !loggedFeatures.has(featureId!)) {
                        console.log(`  Styling selected feature: ${featureId}`);
                        loggedFeatures.add(featureId!);
                    }
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

        // Apply base feature style first
        const baseConfig = this.applyFeatureStyle(config);

        // Check if there are selections or hover states
        const hasSelections = selectedIds.size > 0;
        const hasHover = hoveredId && hoveredLayerId === config.id;

        // Always add tile callbacks for MVT layers (for loading indicator)
        // Callbacks must be in props to be spread by layerFactory's ...props
        const configWithTileCallbacks = {
            ...baseConfig,
            props: {
                ...baseConfig.props,
                // Add tile loading callbacks - these will be spread into MVTLayer
                onTileLoad: (tile: any) => {
                    const tileKey = `${tile.index?.x ?? 'x'}-${tile.index?.y ?? 'y'}-${tile.index?.z ?? 'z'}`;
                    console.log(`🔵 Tile loaded: ${config.id} [${tileKey}]`);
                    
                    // Mark layer as loading when first tile loads
                    if (!this.tileLoadingLayers.has(config.id)) {
                        this.setLayerTileLoading(config.id);
                    }
                    
                    this.onTileLoadComplete(config.id, tileKey);
                },
                onTileError: (error: any, tile: any) => {
                    const tileKey = `${tile.index?.x ?? 'x'}-${tile.index?.y ?? 'y'}-${tile.index?.z ?? 'z'}`;
                    console.log(`🔴 Tile error: ${config.id} [${tileKey}]`, error);
                    
                    // Mark layer as loading when first tile loads
                    if (!this.tileLoadingLayers.has(config.id)) {
                        this.setLayerTileLoading(config.id);
                    }
                    
                    this.onTileLoadComplete(config.id, tileKey);
                }
            }
        };

        console.log(`📦 Config before createLayerFromConfig:`, {
            id: config.id,
            type: config.type,
            hasOnTileLoad: typeof configWithTileCallbacks.props.onTileLoad === 'function',
            hasOnTileError: typeof configWithTileCallbacks.props.onTileError === 'function'
        });

        // If there are no selections and no hover for this layer, return with just tile callbacks
        if (!hasSelections && !hasHover) {
            return createLayerFromConfig(configWithTileCallbacks, data);
        }


        // Determine which styles to use
        const selectionStyle = config.selectionStyle || this.globalSelectionStyle;
        const hoverStyle = config.hoverStyle;

        // Enhance the config with hover and selection-aware accessor functions
        const enhancedConfig = {
            ...configWithTileCallbacks,
            props: {
                ...configWithTileCallbacks.props,
                updateTriggers: {
                    ...configWithTileCallbacks.props.updateTriggers,
                    getFillColor: `${Array.from(selectedIds).join(',')}_${hoveredId}_${hoveredLayerId}`,
                    getLineColor: `${Array.from(selectedIds).join(',')}_${hoveredId}_${hoveredLayerId}`,
                    getLineWidth: `${Array.from(selectedIds).join(',')}_${hoveredId}_${hoveredLayerId}`,
                    getRadius: `${Array.from(selectedIds).join(',')}_${hoveredId}_${hoveredLayerId}`
                }
            }
        };

        // Store original accessors or static colors
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

            onEdit: async ({ updatedData, editType, editContext }: any) => {
                console.log('📝 Edit event:', editType, editContext);

                // Handle feature completion
                if (editType === 'addFeature') {
                    const newFeature = updatedData.features[updatedData.features.length - 1];

                    console.log('🎯 Polygon completed, performing selection...');

                    // Perform selection with the completed polygon
                    if (newFeature.geometry.type === 'Polygon') {
                        const polygon = newFeature.geometry.coordinates[0];
                        console.log('🔵 About to call performSelection with polygon:', polygon.length, 'points');

                        try {
                            await this.performSelection(polygon);
                            console.log('🟢 performSelection completed successfully');
                        } catch (error) {
                            console.error('🔴 performSelection failed:', error);
                        }
                    } else {
                        console.warn('⚠️ Feature is not a Polygon:', newFeature.geometry.type);
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

    /**
     * Move a layer to a specific index in the rendering stack
     * Index 0 is the bottom-most layer (rendered first)
     * Returns the updated list of layer IDs in order
     */
    public moveLayerToIndex(layerId: string, targetIndex: number): string[] {
        // Find the layer in the current layers array
        const layerIndex = this.currentLayers.findIndex(layer => layer.id === layerId);

        if (layerIndex === -1) {
            console.warn(`Layer ${layerId} not found`);
            return this.currentLayers.map(l => l.id);
        }

        // Validate target index
        if (targetIndex < 0 || targetIndex >= this.currentLayers.length) {
            console.warn(`Invalid target index ${targetIndex}. Must be between 0 and ${this.currentLayers.length - 1}`);
            return this.currentLayers.map(l => l.id);
        }

        // If the layer is already at the target index, do nothing
        if (layerIndex === targetIndex) {
            console.log(`Layer ${layerId} is already at index ${targetIndex}`);
            return this.currentLayers.map(l => l.id);
        }

        // Remove the layer from its current position
        const [layer] = this.currentLayers.splice(layerIndex, 1);

        // Insert it at the target index
        this.currentLayers.splice(targetIndex, 0, layer);

        console.log(`Moved layer ${layerId} from index ${layerIndex} to ${targetIndex}`);

        // Refresh the layers to update the rendering
        this.refreshLayers();

        // Return the updated layer order
        return this.currentLayers.map(l => l.id);
    }

    /**
     * Move a layer up one position (toward the top/end of the array)
     * Returns the updated list of layer IDs in order
     */
    public moveLayerUp(layerId: string): string[] {
        const layerIndex = this.currentLayers.findIndex(layer => layer.id === layerId);

        if (layerIndex === -1) {
            console.warn(`Layer ${layerId} not found`);
            return this.currentLayers.map(l => l.id);
        }

        if (layerIndex === this.currentLayers.length - 1) {
            console.log(`Layer ${layerId} is already at the top`);
            return this.currentLayers.map(l => l.id);
        }

        return this.moveLayerToIndex(layerId, layerIndex + 1);
    }

    /**
     * Move a layer down one position (toward the bottom/start of the array)
     * Returns the updated list of layer IDs in order
     */
    public moveLayerDown(layerId: string): string[] {
        const layerIndex = this.currentLayers.findIndex(layer => layer.id === layerId);

        if (layerIndex === -1) {
            console.warn(`Layer ${layerId} not found`);
            return this.currentLayers.map(l => l.id);
        }

        if (layerIndex === 0) {
            console.log(`Layer ${layerId} is already at the bottom`);
            return this.currentLayers.map(l => l.id);
        }

        return this.moveLayerToIndex(layerId, layerIndex - 1);
    }

    /**
     * Move a layer to the top of the rendering stack (end of array)
     * Returns the updated list of layer IDs in order
     */
    public moveLayerToTop(layerId: string): string[] {
        const layerIndex = this.currentLayers.findIndex(layer => layer.id === layerId);

        if (layerIndex === -1) {
            console.warn(`Layer ${layerId} not found`);
            return this.currentLayers.map(l => l.id);
        }

        return this.moveLayerToIndex(layerId, this.currentLayers.length - 1);
    }

    /**
     * Move a layer to the bottom of the rendering stack (start of array)
     * Returns the updated list of layer IDs in order
     */
    public moveLayerToBottom(layerId: string): string[] {
        const layerIndex = this.currentLayers.findIndex(layer => layer.id === layerId);

        if (layerIndex === -1) {
            console.warn(`Layer ${layerId} not found`);
            return this.currentLayers.map(l => l.id);
        }

        return this.moveLayerToIndex(layerId, 0);
    }

    /**
     * Flashes a feature to highlight it temporarily.
     */
    public flashFeature(layerId: string, featureId: string, durationMs: number = 2000): void {
        console.log(`⚡ Flashing feature: ${featureId} in layer: ${layerId} for ${durationMs}ms`);

        if (!this.selectedFeatureIds.has(featureId)) {
            console.log(`Feature ${featureId} is not currently selected, adding temporarily...`);
        }

        // Add feature to a temporary flash set
        const flashKey = `${layerId}_${featureId}`;
        const flashSet = new Set<string>([flashKey]);

        // Store original selection
        const originalSelection = new Set(this.selectedFeatureIds);

        // Create flash animation by toggling highlight
        let flashCount = 0;
        const flashInterval = 200; // Flash every 200ms
        const totalFlashes = Math.floor(durationMs / flashInterval);

        const interval = setInterval(() => {
            flashCount++;

            if (flashCount % 2 === 0) {
                // Even count: add to selection (highlight)
                this.selectedFeatureIds.add(featureId);
            } else {
                // Odd count: remove from selection (dim)
                this.selectedFeatureIds.delete(featureId);
            }

            this.refreshLayersWithSelection();

            if (flashCount >= totalFlashes) {
                clearInterval(interval);
                // Restore original selection
                this.selectedFeatureIds = originalSelection;
                this.refreshLayersWithSelection();
                console.log(`✅ Flash complete for feature ${featureId}`);
            }
        }, flashInterval);
    }

    /**
     * Zooms to a specific feature's bounds.
     */
    public zoomToFeature(layerId: string, featureId: string, padding: number = 0): void {
        console.log(`🔍 Zooming to feature: ${featureId} in layer: ${layerId}`);

        // Find the feature in the layer
        const layer = this.currentLayers.find(l => l.id === layerId);
        if (!layer) {
            console.warn(`❌ Layer ${layerId} not found`);
            return;
        }

        const layerData = (layer.props as any).data;
        let feature = null;

        // Search for the feature
        if (layerData?.type === 'FeatureCollection' && layerData.features) {
            feature = layerData.features.find((f: any) => {
                const fid = this.getFeatureId(f, layerId, true);
                return fid === featureId;
            });
        } else if (Array.isArray(layerData)) {
            feature = layerData.find((f: any) => {
                const fid = this.getFeatureId(f, layerId, true);
                return fid === featureId;
            });
        }

        if (!feature) {
            console.warn(`❌ Feature ${featureId} not found in layer ${layerId}`);
            console.log('Available features:', layerData?.features?.length || 0);
            if (layerData?.features?.length > 0) {
                const sampleFeature = layerData.features[0];
                console.log('Sample feature ID:', this.getFeatureId(sampleFeature, layerId, true));
                console.log('Sample feature:', sampleFeature);
            }
            return;
        }

        console.log(`✅ Found feature, calculating bounds...`);

        // Calculate bounds
        const bounds = this.calculateFeatureBounds(feature);
        if (bounds) {
            console.log(`Bounds:`, bounds);
            this.zoomToBounds(bounds, padding);
        } else {
            console.warn(`❌ Could not calculate bounds for feature`);
        }
    }

    /**
     * Zooms to all features in a layer.
     * For viewport-culled layers, uses cached bounds if no features currently loaded.
     */
    public zoomToLayer(layerId: string, padding: number = 0): void {
        if (DEBUG_LOGGING) {
            console.log(`🔍 [zoomToLayer] Called for layer: ${layerId}, padding: ${padding}`);
        }

        const layer = this.currentLayers.find(l => l.id === layerId);
        if (!layer) {
            console.warn(`❌ [zoomToLayer] Layer ${layerId} not found`);
            return;
        }

        const layerData = (layer.props as any).data;
        let features: any[] = [];

        if (layerData?.type === 'FeatureCollection' && layerData.features) {
            features = layerData.features;
        } else if (Array.isArray(layerData)) {
            features = layerData;
        }

        if (DEBUG_LOGGING) {
            console.log(`🔍 [zoomToLayer] Found ${features.length} features in current layer data`);
        }

        // If no features in current viewport, check if we have cached bounds
        if (features.length === 0) {
            const cachedBounds = this.layerBoundsCache.get(layerId);
            if (cachedBounds) {
                if (DEBUG_LOGGING) {
                    console.log(`✅ [zoomToLayer] Using cached bounds for ${layerId}:`, cachedBounds);
                }
                this.zoomToBounds(cachedBounds, padding);
                return;
            }

            console.warn(`❌ [zoomToLayer] No features found in layer ${layerId} and no cached bounds available`);
            return;
        }

        // Calculate combined bounds from current features
        let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;

        for (const feature of features) {
            const bounds = this.calculateFeatureBounds(feature);
            if (bounds) {
                minLng = Math.min(minLng, bounds.minLng);
                minLat = Math.min(minLat, bounds.minLat);
                maxLng = Math.max(maxLng, bounds.maxLng);
                maxLat = Math.max(maxLat, bounds.maxLat);
            }
        }

        if (minLng !== Infinity) {
            if (DEBUG_LOGGING) {
                console.log(`✅ [zoomToLayer] Calculated bounds from ${features.length} current features:`,
                    { minLng, minLat, maxLng, maxLat });
            }
            this.zoomToBounds({ minLng, minLat, maxLng, maxLat }, padding);
        } else {
            console.warn(`❌ [zoomToLayer] Could not calculate bounds from features`);
        }
    }

    /**
     * Zooms to the bounds of specific selected features.
     */
    public zoomToSelectedFeatures(selectedFeatures: any[], padding: number = 0): void {
        console.log(`🔍 Zooming to ${selectedFeatures.length} selected features`);

        if (!selectedFeatures || selectedFeatures.length === 0) {
            console.warn('No features provided to zoom to');
            return;
        }

        // Calculate combined bounds of all selected features
        let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;

        for (const selectedFeature of selectedFeatures) {
            const feature = selectedFeature.feature;
            const bounds = this.calculateFeatureBoundsFromJson(feature);

            if (bounds) {
                minLng = Math.min(minLng, bounds.minLng);
                minLat = Math.min(minLat, bounds.minLat);
                maxLng = Math.max(maxLng, bounds.maxLng);
                maxLat = Math.max(maxLat, bounds.maxLat);
            }
        }

        if (minLng !== Infinity) {
            console.log(`✅ Calculated bounds for ${selectedFeatures.length} features:`,
                { minLng, minLat, maxLng, maxLat });
            this.zoomToBounds({ minLng, minLat, maxLng, maxLat }, padding);
        } else {
            console.warn(`❌ Could not calculate bounds for selected features`);
        }
    }

    /**
     * Calculate bounds from a sanitized JSON feature (from .NET)
     */
    private calculateFeatureBoundsFromJson(feature: any): { minLng: number, minLat: number, maxLng: number, maxLat: number } | null {
        if (!feature || !feature.geometry) return null;

        let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;

        const processCoordinate = (coord: [number, number]) => {
            const [lng, lat] = coord;
            minLng = Math.min(minLng, lng);
            minLat = Math.min(minLat, lat);
            maxLng = Math.max(maxLng, lng);
            maxLat = Math.max(maxLat, lat);
        };

        const processCoordinates = (coords: any) => {
            if (Array.isArray(coords)) {
                if (typeof coords[0] === 'number') {
                    // Single coordinate [lng, lat]
                    processCoordinate(coords as [number, number]);
                } else {
                    // Array of coordinates
                    for (const coord of coords) {
                        processCoordinates(coord);
                    }
                }
            }
        };

        if (feature.geometry.coordinates) {
            processCoordinates(feature.geometry.coordinates);
        }

        if (minLng === Infinity) return null;

        return { minLng, minLat, maxLng, maxLat };
    }

    /**
     * Calculates bounds for a feature.
     */
    private calculateFeatureBounds(feature: any): { minLng: number, minLat: number, maxLng: number, maxLat: number } | null {
        if (!feature) return null;

        let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;

        const processCoordinate = (coord: [number, number]) => {
            const [lng, lat] = coord;
            minLng = Math.min(minLng, lng);
            minLat = Math.min(minLat, lat);
            maxLng = Math.max(maxLng, lng);
            maxLat = Math.max(maxLat, lat);
        };

        const processCoordinates = (coords: any) => {
            if (Array.isArray(coords)) {
                if (typeof coords[0] === 'number') {
                    // Single coordinate [lng, lat]
                    processCoordinate(coords as [number, number]);
                } else {
                    // Array of coordinates
                    for (const coord of coords) {
                        processCoordinates(coord);
                    }
                }
            }
        };

        if (feature.geometry?.coordinates) {
            processCoordinates(feature.geometry.coordinates);
        } else if (feature.position) {
            processCoordinate(feature.position);
        } else if (feature.coordinates) {
            processCoordinate(feature.coordinates);
        }

        if (minLng === Infinity) return null;

        return { minLng, minLat, maxLng, maxLat };
    }

    /**
     * Zooms to specific bounds with optional padding.
     */
    private zoomToBounds(bounds: { minLng: number, minLat: number, maxLng: number, maxLat: number }, padding: number): void {
        if (DEBUG_LOGGING) {
            console.log(`🎯 [zoomToBounds] Called with bounds:`, bounds, `padding: ${padding}`);
        }

        if (!this.deck) return;

        const { minLng, minLat, maxLng, maxLat } = bounds;

        // Calculate center
        const longitude = (minLng + maxLng) / 2;
        const latitude = (minLat + maxLat) / 2;

        // Calculate zoom level based on bounds and viewport size
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const viewportWidth = rect.width;
        const viewportHeight = rect.height;

        // Calculate degrees per pixel at different zoom levels
        const lngDiff = maxLng - minLng;
        const latDiff = maxLat - minLat;

        if (DEBUG_LOGGING) {
            console.log(`🔍 Bounds calculation:`, {
                bounds: { minLng, minLat, maxLng, maxLat },
                lngDiff,
                latDiff,
                padding,
                viewportWidth,
                viewportHeight
            });
        }

        // Apply padding only if specified
        let adjustedLngDiff = lngDiff;
        let adjustedLatDiff = latDiff;

        if (padding > 0) {
            const paddingFraction = padding / Math.min(viewportWidth, viewportHeight);
            adjustedLngDiff = lngDiff / (1 - paddingFraction * 1.0);
            adjustedLatDiff = latDiff / (1 - paddingFraction * 1.0);
            if (DEBUG_LOGGING) {
                console.log(`🔍 Applied padding:`, { paddingFraction, adjustedLngDiff, adjustedLatDiff });
            }
        } else {
            if (DEBUG_LOGGING) {
                console.log(`🔍 No padding applied (padding = 0)`);
            }
        }

        // Calculate zoom to fit the bounds in the viewport
        // Web Mercator: at zoom level z, the world is 256 * 2^z pixels wide
        // Longitude spans 360 degrees, so degrees per pixel at zoom z = 360 / (256 * 2^z)
        // We need: adjustedLngDiff / (360 / (256 * 2^z)) <= viewportWidth
        // Solving for z: 2^z >= (adjustedLngDiff * 256) / (360 * viewportWidth) * 2
        // Therefore: z = log2((adjustedLngDiff * 256 * viewportWidth) / 360)

        const lngZoom = Math.log2((viewportWidth * 360) / (adjustedLngDiff * 256));

        // For latitude, account for Web Mercator distortion
        // At the center latitude, the scale factor is 1/cos(lat)
        const centerLat = (minLat + maxLat) / 2;
        const latScale = 1 / Math.cos(centerLat * Math.PI / 180);
        const latZoom = Math.log2((viewportHeight * 180) / (adjustedLatDiff * 256 * latScale));

        if (DEBUG_LOGGING) {
            console.log(`🔍 Calculated zoom levels:`, { lngZoom, latZoom, centerLat, latScale });
        }

        // Use the smaller zoom to ensure everything fits
        let zoom = Math.min(lngZoom, latZoom);
        zoom = Math.max(0, Math.min(20, zoom)); // Clamp between 0 and 20

        if (DEBUG_LOGGING) {
            console.log(`🔍 Final zoom (clamped):`, zoom);
        }

        // Get current zoom to determine if we're zooming in or out
        const currentViewState = (this.deck as any).viewState || (this.deck as any).props?.initialViewState || {};
        const currentZoom = currentViewState.zoom || 0;

        if (DEBUG_LOGGING) {
            console.log(`Zooming to bounds:`, {
                center: { longitude, latitude },
                calculatedZoom: zoom,
                currentZoom: currentZoom,
                bounds: { minLng, minLat, maxLng, maxLat },
                viewport: { width: viewportWidth, height: viewportHeight }
            });
        }

        // Use longer duration for zoom out, shorter for zoom in
        const isZoomingOut = zoom < currentZoom;
        const transitionDuration = isZoomingOut ? 1500 : 1000;

        // Create a completely new initialViewState object to ensure deck.gl detects the change
        // Add a small random offset to ensure the state is always "new"
        const newViewState = {
            longitude: longitude,
            latitude: latitude,
            zoom: zoom,
            pitch: currentViewState.pitch || 0,
            bearing: currentViewState.bearing || 0,
            transitionDuration: transitionDuration,
            transitionInterpolator: null,
            // Add a timestamp to ensure the object is always unique
            _timestamp: Date.now()
        };

        // Update the deck with the new view state
        this.deck.setProps({
            initialViewState: newViewState
        });

        // Force a redraw to ensure the transition starts
        setTimeout(() => {
            if (this.deck) {
                this.deck.redraw('zoom');
            }
        }, 10);
    }

    /**
     * Unselect a specific feature
     */
    public unselectFeature(featureId: string): void {
        console.log(`🗑️ Attempting to unselect feature: ${featureId}`);
        console.log(`Currently selected IDs:`, Array.from(this.selectedFeatureIds));

        if (this.selectedFeatureIds.has(featureId)) {
            this.selectedFeatureIds.delete(featureId);
            this.selectedFeaturesData.delete(featureId); // Also remove from data map
            console.log(`✅ Unselected feature: ${featureId}`);

            // Notify .NET of updated selection - use stored data
            if (this.dotNetHelper) {
                const selectedFeatures = this.getSelectedFeaturesFromData();
                this.dotNetHelper.invokeMethodAsync('OnFeaturesSelected', {
                    polygon: [],
                    features: selectedFeatures,
                    featureCount: selectedFeatures.length
                });
            }

            this.refreshLayersWithSelection();
        } else {
            console.warn(`❌ Feature ${featureId} was not in selection`);
        }
    }

    /**
     * Clear selection for all features in a specific layer
     */
    public clearLayerSelection(layerId: string): void {
        console.log(`🧹 Clearing selection for layer: ${layerId}`);

        // Find all selected feature IDs that belong to this layer using stored data
        const featuresToRemove: string[] = [];

        for (const [featureId, data] of this.selectedFeaturesData.entries()) {
            if (data.layerId === layerId) {
                featuresToRemove.push(featureId);
            }
        }

        // Remove all features from this layer
        for (const featureId of featuresToRemove) {
            this.selectedFeatureIds.delete(featureId);
            this.selectedFeaturesData.delete(featureId);
        }

        console.log(`✅ Cleared selection for ${featuresToRemove.length} features in layer ${layerId}`);

        // Notify .NET of updated selection - use stored data
        if (this.dotNetHelper) {
            const selectedFeatures = this.getSelectedFeaturesFromData();
            this.dotNetHelper.invokeMethodAsync('OnFeaturesSelected', {
                polygon: [],
                features: selectedFeatures,
                featureCount: selectedFeatures.length
            });
        }

        this.refreshLayersWithSelection();
    }

    /**
     * Get selected features from stored data (works for all layer types including MVT)
     */
    private getSelectedFeaturesFromData(): any[] {
        const selectedFeatures: any[] = [];

        for (const [featureId, data] of this.selectedFeaturesData.entries()) {
            selectedFeatures.push({
                layerId: data.layerId,
                feature: this.sanitizeFeature(data.feature)
            });
        }

        return selectedFeatures;
    }

    /**
     * Get selected features with their layer and feature data (legacy method, falls back to stored data)
     */
    private getSelectedFeaturesFromIds(): any[] {
        const selectedFeatures: any[] = [];

        for (const layer of this.currentLayers) {
            const layerData = (layer.props as any).data;
            let features: any[] = [];

            if (layerData?.type === 'FeatureCollection' && layerData.features) {
                features = layerData.features;
            } else if (Array.isArray(layerData)) {
                features = layerData;
            }

            for (const feature of features) {
                const featureId = this.getFeatureId(feature, layer.id);
                if (featureId && this.selectedFeatureIds.has(featureId)) {
                    selectedFeatures.push({
                        layerId: layer.id,
                        feature: this.sanitizeFeature(feature)
                    });
                }
            }
        }

        return selectedFeatures;
    }

    private async performSelection(polygon: [number, number][]): Promise<void> {
        console.log('🟡 performSelection START - polygon has', polygon.length, 'points');
        console.log('🟡 dotNetHelper exists:', !!this.dotNetHelper);

        const selectedFeatures = this.selectFeaturesInPolygon(polygon);

        console.log(`✅ Selection complete: ${selectedFeatures.length} features selected (before deduplication)`);

        // CRITICAL: Deduplicate BEFORE extracting IDs and applying styles
        // This prevents styling the same feature ID multiple times across MVT tiles
        const uniqueFeatures = this.deduplicateFeatures(selectedFeatures);

        console.log(`✅ After deduplication: ${uniqueFeatures.length} unique features`);

        // Extract unique feature IDs and store full feature data
        const uniqueFeatureIds = uniqueFeatures
            .map(sf => this.getFeatureId(sf.feature, sf.layerId))
            .filter(id => id !== null) as string[];

        // Store full feature data for each selected feature
        uniqueFeatures.forEach(sf => {
            const featureId = this.getFeatureId(sf.feature, sf.layerId);
            if (featureId) {
                this.selectedFeaturesData.set(featureId, {
                    layerId: sf.layerId,
                    feature: sf.feature
                });
            }
        });

        console.log(`📊 Applying selection styling to ${uniqueFeatureIds.length} unique feature IDs`);

        // Apply selection styling to deduplicated features only
        this.setSelectedFeatures(uniqueFeatureIds);

        if (this.dotNetHelper) {
            const sanitizeStart = performance.now();

            // Sanitize features to remove circular references before sending to .NET
            const sanitizedFeatures = uniqueFeatures.map(sf => ({
                layerId: sf.layerId,
                feature: this.sanitizeFeature(sf.feature)
            }));

            const sanitizeTime = performance.now() - sanitizeStart;

            const result = {
                polygon,
                features: sanitizedFeatures,
                featureCount: uniqueFeatures.length
            };

            // Check payload size
            const payloadSize = JSON.stringify(result).length;
            console.log(`📦 Payload size: ${(payloadSize / 1024).toFixed(2)} KB`);
            console.log(`⏱️ Sanitization took: ${sanitizeTime.toFixed(2)}ms`);
            console.log(`📤 Calling .NET OnFeaturesSelected with ${result.featureCount} features`);

            const invokeStart = performance.now();
            try {
                await this.dotNetHelper.invokeMethodAsync('OnFeaturesSelected', result);
                const invokeTime = performance.now() - invokeStart;
                console.log(`✅ .NET OnFeaturesSelected callback succeeded in ${invokeTime.toFixed(2)}ms`);
            } catch (error) {
                const invokeTime = performance.now() - invokeStart;
                console.error(`❌ Failed to invoke .NET OnFeaturesSelected after ${invokeTime.toFixed(2)}ms:`, error);
                console.error(`   This usually means the Blazor connection was disconnected.`);
                console.error(`   Features are selected in JavaScript but .NET won't be notified.`);
                console.error(`   Payload size was: ${(payloadSize / 1024).toFixed(2)} KB`);
            }
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
     * Only keeps essential GeoJSON properties. Omits geometry coordinates for complex shapes
     * to reduce payload size (the feature ID and properties are sufficient for most use cases).
     */
    private sanitizeFeature(feature: any): any {
        if (!feature) return null;

        // Debug: Log what properties we're receiving
        if (DEBUG_LOGGING) {
            console.log(`  Sanitizing feature:`, {
                hasProperties: !!feature.properties,
                propertyCount: feature.properties ? Object.keys(feature.properties).length : 0,
                sampleProps: feature.properties ? Object.keys(feature.properties).slice(0, 5) : []
            });
        }

        // Check if geometry is complex (polygon with many points)
        // Complex geometries can be thousands of coordinates for parcels/buildings
        const hasComplexGeometry = feature.geometry?.coordinates?.[0]?.length > 100 ||
            feature.geometry?.coordinates?.length > 100;

        return {
            type: feature.type || 'Feature',
            id: feature.id,
            geometry: hasComplexGeometry ? {
                type: feature.geometry.type,
                coordinates: null // Omit to reduce payload size
            } : (feature.geometry ? {
                type: feature.geometry.type,
                coordinates: feature.geometry.coordinates
            } : null),
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
            const layerId = layer.id;
            const layerType = layer.constructor.name;

            // CRITICAL: Skip non-pickable layers
            const isPickable = (layer.props as any).pickable !== false;
            if (!isPickable) {
                console.log(`⏭️ Skipping non-pickable layer: ${layerId}`);
                continue;
            }

            const layerData = (layer.props as any).data;

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
     * Uses pickObjects which properly returns features with properties (unlike manual sublayer access)
     */
    private selectMVTFeaturesInPolygon(layer: any, polygon: [number, number][], bbox: any, selectedFeatures: any[]): void {
        if (!this.deck) return;

        console.log(`MVT layer ${layer.id}: using pickObjects for proper feature properties...`);

        // Use deck.gl's pickObjects to sample points within the polygon
        // This ensures we get features with properties properly parsed
        const samplingDensity = 20; // Sample every 20 pixels
        const pickedObjects: any[] = [];

        // Convert polygon to screen coordinates and sample within the bounding box
        const viewport = this.deck.getViewports()[0];
        if (!viewport) {
            console.log(`  ❌ No viewport found`);
            return;
        }

        // Project polygon points to screen space to get bounding box
        const screenPoints = polygon.map(([lng, lat]) => viewport.project([lng, lat]));
        const screenBBox = {
            minX: Math.min(...screenPoints.map(p => p[0])),
            maxX: Math.max(...screenPoints.map(p => p[0])),
            minY: Math.min(...screenPoints.map(p => p[1])),
            maxY: Math.max(...screenPoints.map(p => p[1]))
        };

        console.log(`  Sampling area: ${Math.round(screenBBox.maxX - screenBBox.minX)}x${Math.round(screenBBox.maxY - screenBBox.minY)} pixels`);

        // Sample points within the screen bounding box
        const pickedFeatures = new Set<string>();
        let sampleCount = 0;

        for (let x = screenBBox.minX; x <= screenBBox.maxX; x += samplingDensity) {
            for (let y = screenBBox.minY; y <= screenBBox.maxY; y += samplingDensity) {
                sampleCount++;

                // Use pickObject to get feature at this point
                const picked = this.deck.pickObject({
                    x,
                    y,
                    layerIds: [layer.id]
                });

                if (picked && picked.object && picked.layer && picked.layer.id === layer.id) {
                    const feature = picked.object;
                    const featureId = this.getFeatureId(feature, layer.id);

                    // Deduplicate by feature ID
                    if (featureId && !pickedFeatures.has(featureId)) {
                        // Get world coordinates of the picked point to verify it's in polygon
                        const worldCoords = viewport.unproject([x, y]);
                        if (this.pointInPolygon([worldCoords[0], worldCoords[1]], polygon)) {
                            pickedFeatures.add(featureId);

                            if (DEBUG_LOGGING) {
                                console.log(`    Picked feature ${featureId} with ${feature.properties ? Object.keys(feature.properties).length : 0} properties`);
                            }

                            selectedFeatures.push({
                                layerId: layer.id,
                                feature: feature
                            });
                        }
                    }
                }
            }
        }

        console.log(`  Sampled ${sampleCount} points, found ${pickedFeatures.size} unique features`);
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

    private applyCurrentLayers(): void {
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

    /**
     * Set the map interaction mode
     * @param mode - 'Explore', 'SelectFeature', or 'SelectByPolygon'
     */
    public setMapMode(mode: string): void {
        console.log(`Setting map mode to: ${mode}`);

        const previousMode = this.currentMapMode;
        this.currentMapMode = mode;

        // Handle mode transitions
        if (mode === 'SelectByPolygon') {
            // Enable polygon drawing mode
            this.setDrawingMode(true);
        } else if (previousMode === 'SelectByPolygon') {
            // Disable polygon drawing mode if we're leaving it
            this.setDrawingMode(false);
        }

        // Clear selection when changing modes
        if (mode !== previousMode) {
            this.clearSelection();
        }

        // Update cursor
        this.updateCursor();
    }

    /**
     * Handle single feature selection (SelectFeature mode)
     */
    private async handleSingleFeatureSelection(info: any): Promise<void> {
        if (!info.object || !info.layer) return;

        const layerId = info.layer.id;
        const feature = info.object;

        // Get feature ID
        const featureId = this.getFeatureId(feature, layerId);

        console.log(`🖱️ Feature clicked in SelectFeature mode:`, {
            layerId,
            featureId,
            feature
        });

        // Check if this is the currently selected feature
        const isAlreadySelected = featureId && this.selectedFeatureIds.has(featureId);

        // Clear previous selection
        this.selectedFeatureIds.clear();

        if (!isAlreadySelected && featureId) {
            // Select the new feature
            this.selectedFeatureIds.add(featureId);
            console.log(`✅ Feature selected: ${featureId}`);

            // Notify .NET with a FeatureSelectionResult containing the single feature
            if (this.dotNetHelper) {
                const sanitizedFeature = this.sanitizeFeature(feature);
                const result = {
                    polygon: [], // No polygon for single click selection
                    features: [{
                        layerId: layerId,
                        feature: sanitizedFeature
                    }],
                    featureCount: 1
                };

                console.log(`📤 Calling .NET OnFeaturesSelected with 1 feature`);

                try {
                    await this.dotNetHelper.invokeMethodAsync('OnFeaturesSelected', result);
                    console.log(`✅ .NET OnFeaturesSelected callback succeeded`);
                } catch (error) {
                    console.error(`❌ Failed to invoke .NET OnFeaturesSelected:`, error);
                }
            }
        } else {
            console.log(`❌ Feature deselected`);

            // Notify .NET with an empty selection result
            if (this.dotNetHelper) {
                const result = {
                    polygon: [],
                    features: [],
                    featureCount: 0
                };

                try {
                    await this.dotNetHelper.invokeMethodAsync('OnFeaturesSelected', result);
                } catch (error) {
                    console.error(`❌ Failed to invoke .NET OnFeaturesSelected:`, error);
                }
            }
        }

        // Refresh layers to show selection
        this.refreshLayersWithSelection();
    }
}

/**
 * Create a DeckGLView instance
 */
export function createDeckGLView(config: DeckGLViewConfig, dotNetHelper?: any): DeckGLView {
    return new DeckGLView(config, dotNetHelper);
}



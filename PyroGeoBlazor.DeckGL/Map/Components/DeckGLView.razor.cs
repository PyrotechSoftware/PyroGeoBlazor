namespace PyroGeoBlazor.DeckGL.Components;

using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

using PyroGeoBlazor.DeckGL.Models;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public partial class DeckGLView
{
    private DeckGLJSBinder? _jsBinder;
    private IJSObjectReference? _deckGLViewRef;
    private DotNetObjectReference<DeckGLView>? _dotNetRef;
    private List<DeckGLLayer> _childLayers = [];
    private List<LayerConfig> _layers = [];
    private ViewState? _currentViewState;
    private bool _isLoading;
    private System.Threading.Timer? _viewportUpdateTimer;
    private ViewState? _pendingViewState;

    /// <summary>
    /// Event raised when the selection changes (features selected or deselected).
    /// Components can subscribe to this event to automatically update when selection changes.
    /// </summary>
    public event Action<FeatureSelectionResult>? SelectionChanged;

    [Inject] private IJSRuntime JSRuntime { get; set; } = default!;

    /// <summary>
    /// Unique identifier for the deck.gl container element
    /// </summary>
    [Parameter]
    public string ContainerId { get; set; } = $"deckgl-{Guid.NewGuid():N}";

    /// <summary>
    /// Child content for layers. Use the Layers component to define layers.
    /// </summary>
    [Parameter]
    public RenderFragment? LayersContent { get; set; }

    /// <summary>
    /// Child content that can contain non-layer UI elements (controls, overlays, etc.)
    /// </summary>
    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    /// <summary>
    /// Initial view state (camera position and zoom)
    /// </summary>
    [Parameter]
    public ViewState InitialViewState { get; set; } = new ViewState
    {
        Longitude = -122.45,
        Latitude = 37.8,
        Zoom = 12
    };

    /// <summary>
    /// Enable map controls (pan, zoom, rotate)
    /// </summary>
    [Parameter]
    public bool Controller { get; set; } = true;

    /// <summary>
    /// Enable tooltips
    /// </summary>
    [Parameter]
    public bool EnableTooltips { get; set; } = true;

    /// <summary>
    /// Callback when view state changes (camera moves)
    /// </summary>
    [Parameter]
    public EventCallback<ViewState> OnViewStateChanged { get; set; }

    /// <summary>
    /// Callback when a layer is clicked
    /// </summary>
    [Parameter]
    public EventCallback<LayerClickEventArgs> OnLayerClick { get; set; }

    /// <summary>
    /// Callback when a layer is hovered
    /// </summary>
    [Parameter]
    public EventCallback<LayerHoverEventArgs> OnLayerHover { get; set; }

    /// <summary>
    /// Read-only list of all active layers. This list is maintained by DeckGLView and reflects
    /// the current state including registration, unregistration, and reordering of layers.
    /// </summary>
    public IReadOnlyList<LayerConfig> Layers => _layers.AsReadOnly();

    /// <summary>
    /// Current feature selection result. Updated when features are selected or unselected.
    /// </summary>
    public FeatureSelectionResult? SelectionResult { get; private set; }

    /// <summary>
    /// Current view state of the map. Updated when the camera moves.
    /// </summary>
    public ViewState? CurrentViewState => _currentViewState;

    /// <summary>
    /// Indicates whether layers are currently being updated or data is being fetched.
    /// </summary>
    public bool IsLoading => _isLoading;

    /// <summary>
    /// Whether to display the status bar showing view state information.
    /// </summary>
    [Parameter]
    public bool ShowStatusBar { get; set; } = true;

    /// <summary>
    /// Debounce duration in milliseconds for viewport updates.
    /// When the viewport changes (zoom/pan), layer updates are delayed by this amount
    /// to avoid excessive updates during rapid camera movements.
    /// Set to 0 to disable debouncing. Default is 300ms.
    /// </summary>
    [Parameter]
    public int ViewportUpdateDebounceMs { get; set; } = 300;

    /// <summary>
    /// Callback when features are selected (both single and multi-selection)
    /// </summary>
    [Parameter]
    public EventCallback<FeatureSelectionResult> OnFeaturesSelectedCallback { get; set; }

    /// <summary>
    /// Register a child layer component
    /// </summary>
    /// <param name="layer">The layer component to register</param>
    internal void RegisterLayer(DeckGLLayer layer)
    {
        if (!_childLayers.Contains(layer))
        {
            _childLayers.Add(layer);

            // Add the layer's config to the layers list
            var layerConfig = layer.GetLayerConfig();
            _layers.Add(layerConfig);
        }
    }

    /// <summary>
    /// Unregister a child layer component
    /// </summary>
    /// <param name="layer">The layer component to unregister</param>
    internal void UnregisterLayer(DeckGLLayer layer)
    {
        if (_childLayers.Remove(layer))
        {
            // Remove the layer's config from the layers list
            var layerConfig = layer.GetLayerConfig();
            _layers.RemoveAll(l => l.Id == layerConfig.Id);
        }
    }

    /// <summary>
    /// Programmatically add a layer using a LayerConfig object.
    /// Use this method for dynamically adding layers from configuration files,
    /// databases, or at runtime.
    /// </summary>
    /// <param name="layerConfig">The layer configuration to add</param>
    /// <param name="updateLayers">Whether to automatically trigger layer update on the map. Default is false.</param>
    public async Task AddLayer(LayerConfig layerConfig, bool updateLayers = false)
    {
        ArgumentNullException.ThrowIfNull(layerConfig);

        if (_layers.Any(l => l.Id == layerConfig.Id))
        {
            throw new InvalidOperationException($"A layer with ID '{layerConfig.Id}' already exists. Layer IDs must be unique.");
        }

        _layers.Add(layerConfig);

        // Update the map with the new layer if requested and component is initialized
        if (updateLayers && _deckGLViewRef != null)
        {
            await UpdateLayers(_currentViewState);
        }
    }

    /// <summary>
    /// Programmatically remove a layer by its ID.
    /// </summary>
    /// <param name="layerId">The ID of the layer to remove</param>
    /// <param name="updateLayers">Whether to automatically trigger layer update on the map. Default is false.</param>
    /// <returns>True if the layer was found and removed, false otherwise</returns>
    public async Task<bool> RemoveLayer(string layerId, bool updateLayers = false)
    {
        var removed = _layers.RemoveAll(l => l.Id == layerId) > 0;

        if (removed && updateLayers && _deckGLViewRef != null)
        {
            await UpdateLayers(_currentViewState);
        }

        return removed;
    }

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender)
        {
            await InitializeDeckGL();
        }
    }

    private async Task InitializeDeckGL()
    {
        try
        {
            _jsBinder = new DeckGLJSBinder(JSRuntime);
            var module = await _jsBinder.GetDeckGLModule();

            _currentViewState = InitialViewState;

            var config = new DeckGLViewOptions
            {
                ContainerId = ContainerId,
                InitialViewState = InitialViewState,
                Controller = Controller,
                EnableTooltips = EnableTooltips
            };

            _dotNetRef = DotNetObjectReference.Create(this);

            _deckGLViewRef = await module.InvokeAsync<IJSObjectReference>(
                "DeckGL.DeckGLView.createDeckGLView",
                config,
                _dotNetRef
            );

            Console.WriteLine($"DeckGL view initialized: {ContainerId}");

            // Update layers if any were provided
            if (_layers.Count > 0)
            {
                await UpdateLayers();
            }

            // Notify that initialization is complete
            if (OnDeckInitialized.HasDelegate)
            {
                await OnDeckInitialized.InvokeAsync();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error initializing DeckGL: {ex.Message}");
        }
    }

    /// <summary>
    /// Update the layers rendered in the view
    /// </summary>
    /// <param name="currentViewState">Optional current view state for accurate zoom detection</param>
    public async Task UpdateLayers(ViewState? currentViewState = null)
    {
        if (_deckGLViewRef != null)
        {
            try
            {
                // Debug: Log layer configs being sent
                foreach (var layer in _layers)
                {
                    Console.WriteLine($"📤 Sending layer {layer.Id}: Visible={layer.Visible}, HasLabelConfig={layer.LabelConfig != null}");
                    if (layer.LabelConfig != null)
                    {
                        Console.WriteLine($"   Label: Property={layer.LabelConfig.TextProperty}, Enabled={layer.LabelConfig.Enabled}, MinZoom={layer.LabelConfig.MinZoom}");
                    }
                }
                
                if (currentViewState != null)
                {
                    await _deckGLViewRef.InvokeVoidAsync("updateLayers", _layers, currentViewState);
                }
                else
                {
                    await _deckGLViewRef.InvokeVoidAsync("updateLayers", _layers);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating layers: {ex.Message}");
            }
        }
    }

    /// <summary>
    /// Update the view state (camera position)
    /// </summary>
    public async Task SetViewState(ViewState viewState)
    {
        if (_deckGLViewRef != null)
        {
            try
            {
                await _deckGLViewRef.InvokeVoidAsync("setViewState", viewState);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error setting view state: {ex.Message}");
            }
        }
    }

    /// <summary>
    /// Get the current view state
    /// </summary>
    public async Task<ViewState?> GetViewState()
    {
        if (_deckGLViewRef != null)
        {
            try
            {
                return await _deckGLViewRef.InvokeAsync<ViewState>("getViewState");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting view state: {ex.Message}");
            }
        }
        return null;
    }

    /// <summary>
    /// Clear the data cache
    /// </summary>
    public async Task ClearCache()
    {
        if (_deckGLViewRef != null)
        {
            try
            {
                await _deckGLViewRef.InvokeVoidAsync("clearCache");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error clearing cache: {ex.Message}");
            }
        }
    }

    /// <summary>
    /// Refresh all layers at current view state (clears cache and reloads data)
    /// </summary>
    public async Task RefreshLayers()
    {
        if (_deckGLViewRef != null)
        {
            try
            {
                await _deckGLViewRef.InvokeVoidAsync("refreshLayers");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error refreshing layers: {ex.Message}");
            }
        }
    }

    /// <summary>
    /// Handle refresh button click from MapStatusBar
    /// </summary>
    private async Task HandleRefreshClicked()
    {
        await RefreshLayers();
    }

    /// <summary>
    /// Called from JavaScript when view state changes
    /// </summary>
    [JSInvokable]
    public async Task OnViewStateChangedCallback(ViewState viewState)
    {
        _currentViewState = viewState;
        await InvokeAsync(StateHasChanged);
        
        // Notify subscribers immediately (for UI updates like status bar)
        if (OnViewStateChanged.HasDelegate)
        {
            await OnViewStateChanged.InvokeAsync(viewState);
        }

        // Debounce layer updates to avoid excessive refreshes during camera movement
        if (ViewportUpdateDebounceMs > 0)
        {
            // Store the pending view state
            _pendingViewState = viewState;

            // Cancel any existing timer and start a new one
            _viewportUpdateTimer?.Dispose();
            _viewportUpdateTimer = new Timer(async _ =>
            {
                await InvokeAsync(async () =>
                {
                    if (_pendingViewState != null)
                    {
                        // Update layers with the current view state for accurate zoom detection
                        await UpdateLayers(_pendingViewState);
                    }
                });
            }, null, ViewportUpdateDebounceMs, Timeout.Infinite);
        }
        else
        {
            // No debouncing - update layers immediately
            await UpdateLayers(viewState);
        }
    }

    /// <summary>
    /// Called from JavaScript when loading state changes (data fetching starts/stops)
    /// </summary>
    [JSInvokable]
    public void OnLoadingStateChanged(bool isLoading)
    {
        _isLoading = isLoading;
        StateHasChanged();
    }

    /// <summary>
    /// Called from JavaScript when a layer is clicked
    /// </summary>
    [JSInvokable]
    public async Task OnLayerClickCallback(LayerClickEventArgs args)
    {
        if (OnLayerClick.HasDelegate)
        {
            await OnLayerClick.InvokeAsync(args);
        }
    }

    /// <summary>
    /// Callback when the deck.gl instance is fully initialized and ready
    /// </summary>
    [Parameter]
    public EventCallback OnDeckInitialized { get; set; }

    /// <summary>
    /// Enable or disable polygon drawing mode for feature selection.
    /// When enabled, click on the map to add vertices, double-click to complete the polygon.
    /// The temporary drawing layer is automatically destroyed after selection completes.
    /// </summary>
    public async Task SetDrawingMode(bool enabled)
    {
        if (_deckGLViewRef != null)
        {
            try
            {
                await _deckGLViewRef.InvokeVoidAsync("setDrawingMode", enabled);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error setting drawing mode: {ex.Message}");
            }
        }
    }

    /// <summary>
    /// Set the map interaction mode
    /// </summary>
    /// <param name="mode">The map mode to activate</param>
    public async Task SetMapMode(MapMode mode)
    {
        if (_deckGLViewRef != null)
        {
            try
            {
                await _deckGLViewRef.InvokeVoidAsync("setMapMode", mode.ToString());
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error setting map mode: {ex.Message}");
            }
        }
    }

    /// <summary>
    /// Set the visual style for selected features (global)
    /// </summary>
    public async Task SetGlobalSelectionStyle(FeatureStyle style)
    {
        if (_deckGLViewRef != null)
        {
            try
            {
                await _deckGLViewRef.InvokeVoidAsync("setGlobalSelectionStyle", style);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error setting global selection style: {ex.Message}");
            }
        }
    }

    /// <summary>
    /// Set the base feature style for a specific layer
    /// </summary>
    public async Task SetLayerFeatureStyle(string layerId, FeatureStyle style)
    {
        if (_deckGLViewRef != null)
        {
            try
            {
                await _deckGLViewRef.InvokeVoidAsync("setLayerFeatureStyle", layerId, style);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error setting layer feature style: {ex.Message}");
            }
        }
    }

    /// <summary>
    /// Set the selection style for a specific layer
    /// </summary>
    public async Task SetLayerSelectionStyle(string layerId, FeatureStyle style)
    {
        if (_deckGLViewRef != null)
        {
            try
            {
                await _deckGLViewRef.InvokeVoidAsync("setLayerSelectionStyle", layerId, style);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error setting layer selection style: {ex.Message}");
            }
        }
    }

    /// <summary>
    /// Set the visibility of a specific layer
    /// </summary>
    public async Task SetLayerVisibility(string layerId, bool visible)
    {
        // Update the LayerConfig in the collection
        var layer = _layers.FirstOrDefault(l => l.Id == layerId);
        if (layer != null)
        {
            layer.Visible = visible;
        }
        
        if (_deckGLViewRef != null)
        {
            try
            {
                await _deckGLViewRef.InvokeVoidAsync("setLayerVisibility", layerId, visible);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error setting layer visibility: {ex.Message}");
            }
        }
    }

    /// <summary>
    /// Get the visibility of a specific layer
    /// </summary>
    public async Task<bool> GetLayerVisibility(string layerId)
    {
        if (_deckGLViewRef != null)
        {
            try
            {
                return await _deckGLViewRef.InvokeAsync<bool>("getLayerVisibility", layerId);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting layer visibility: {ex.Message}");
                return false;
            }
        }
        return false;
    }

    /// <summary>
    /// Toggle the visibility of a specific layer
    /// </summary>
    public async Task<bool> ToggleLayerVisibility(string layerId)
    {
        if (_deckGLViewRef != null)
        {
            try
            {
                return await _deckGLViewRef.InvokeAsync<bool>("toggleLayerVisibility", layerId);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error toggling layer visibility: {ex.Message}");
                return false;
            }
        }
        return false;
    }

    /// <summary>
    /// Set which features are currently selected
    /// </summary>
    public async Task SetSelectedFeatures(string[] featureIds)
    {
        if (_deckGLViewRef != null)
        {
            try
            {
                await _deckGLViewRef.InvokeVoidAsync("setSelectedFeatures", featureIds);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error setting selected features: {ex.Message}");
            }
        }
    }

    /// <summary>
    /// Clear all selected features
    /// </summary>
    public async Task ClearSelection()
    {
        if (_deckGLViewRef != null)
        {
            try
            {
                await _deckGLViewRef.InvokeVoidAsync("clearSelection");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error clearing selection: {ex.Message}");
            }
        }
    }

    /// <summary>
    /// Configure tooltip display behavior for a specific layer
    /// </summary>
    public async Task SetLayerTooltipConfig(string layerId, TooltipConfig? config)
    {
        if (_deckGLViewRef != null)
        {
            try
            {
                await _deckGLViewRef.InvokeVoidAsync("setLayerTooltipConfig", layerId, config);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error setting layer tooltip config: {ex.Message}");
            }
        }
    }

    /// <summary>
    /// Move a layer to a specific index in the rendering stack.
    /// Index 0 is the bottom-most layer (rendered first).
    /// Returns the updated list of layer IDs in order.
    /// </summary>
    /// <param name="layerId">The ID of the layer to move</param>
    /// <param name="targetIndex">The target index (0 = bottom)</param>
    /// <returns>Array of layer IDs in their new order (index 0 = bottom)</returns>
    public async Task<string[]> MoveLayerToIndex(string layerId, int targetIndex)
    {
        if (_deckGLViewRef != null)
        {
            try
            {
                var updatedOrder = await _deckGLViewRef.InvokeAsync<string[]>("moveLayerToIndex", layerId, targetIndex);

                // Update the internal _layers list to match the new order
                ReorderLayersFromIds(updatedOrder);

                return updatedOrder;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error moving layer: {ex.Message}");
                return [];
            }
        }
        return [];
    }

    /// <summary>
    /// Move a layer up one position in the rendering stack (toward the top).
    /// Returns the updated list of layer IDs in order.
    /// </summary>
    /// <returns>Array of layer IDs in their new order (index 0 = bottom)</returns>
    public async Task<string[]> MoveLayerUp(string layerId)
    {
        if (_deckGLViewRef != null)
        {
            try
            {
                var updatedOrder = await _deckGLViewRef.InvokeAsync<string[]>("moveLayerUp", layerId);

                // Update the internal _layers list to match the new order
                ReorderLayersFromIds(updatedOrder);

                return updatedOrder;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error moving layer up: {ex.Message}");
                return [];
            }
        }
        return [];
    }

    /// <summary>
    /// Move a layer down one position in the rendering stack (toward the bottom).
    /// Returns the updated list of layer IDs in order.
    /// </summary>
    /// <returns>Array of layer IDs in their new order (index 0 = bottom)</returns>
    public async Task<string[]> MoveLayerDown(string layerId)
    {
        if (_deckGLViewRef != null)
        {
            try
            {
                var updatedOrder = await _deckGLViewRef.InvokeAsync<string[]>("moveLayerDown", layerId);

                // Update the internal _layers list to match the new order
                ReorderLayersFromIds(updatedOrder);

                return updatedOrder;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error moving layer down: {ex.Message}");
                return [];
            }
        }
        return [];
    }

    /// <summary>
    /// Reorder the internal _layers list based on the provided layer IDs
    /// </summary>
    private void ReorderLayersFromIds(string[] layerIds)
    {
        if (layerIds.Length == 0) return;

        var reorderedLayers = new List<LayerConfig>();

        foreach (var layerId in layerIds)
        {
            var layer = _layers.FirstOrDefault(l => l.Id == layerId);
            if (layer != null)
            {
                reorderedLayers.Add(layer);
            }
        }

        _layers.Clear();
        _layers.AddRange(reorderedLayers);

        Console.WriteLine($"Layers reordered: {string.Join(", ", _layers.Select(l => l.Id))}");
    }

    /// <summary>
    /// Move a layer to the top of the rendering stack (rendered last, appears on top)
    /// </summary>
    public async Task MoveLayerToTop(string layerId)
    {
        if (_deckGLViewRef != null)
        {
            try
            {
                await _deckGLViewRef.InvokeVoidAsync("moveLayerToTop", layerId);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error moving layer to top: {ex.Message}");
            }
        }
    }

    /// <summary>
    /// Move a layer to the bottom of the rendering stack (rendered first, appears behind others)
    /// </summary>
    public async Task MoveLayerToBottom(string layerId)
    {
        if (_deckGLViewRef != null)
        {
            try
            {
                await _deckGLViewRef.InvokeVoidAsync("moveLayerToBottom", layerId);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error moving layer to bottom: {ex.Message}");
            }
        }
    }

    /// <summary>
    /// Flash a feature on the map to highlight it temporarily
    /// </summary>
    /// <param name="layerId">The layer containing the feature</param>
    /// <param name="featureId">The unique ID of the feature to flash</param>
    /// <param name="durationMs">Duration of the flash effect in milliseconds (default: 2000)</param>
    public async Task FlashFeature(string layerId, string featureId, int durationMs = 2000)
    {
        if (_deckGLViewRef != null)
        {
            try
            {
                await _deckGLViewRef.InvokeVoidAsync("flashFeature", layerId, featureId, durationMs);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error flashing feature: {ex.Message}");
            }
        }
    }

    /// <summary>
    /// Zoom to a specific feature's bounds
    /// </summary>
    /// <param name="layerId">The layer containing the feature</param>
    /// <param name="featureId">The unique ID of the feature</param>
    /// <param name="padding">Padding around the feature in pixels (default: 0)</param>
    public async Task ZoomToFeature(string layerId, string featureId, int padding = 0)
    {
        if (_deckGLViewRef != null)
        {
            try
            {
                await _deckGLViewRef.InvokeVoidAsync("zoomToFeature", layerId, featureId, padding);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error zooming to feature: {ex.Message}");
            }
        }
    }

    /// <summary>
    /// Zoom to all features in a layer
    /// </summary>
    /// <param name="layerId">The layer ID</param>
    /// <param name="padding">Padding around the bounds in pixels (default: 0)</param>
    public async Task ZoomToLayer(string layerId, int padding = 0)
    {
        if (_deckGLViewRef != null)
        {
            try
            {
                await _deckGLViewRef.InvokeVoidAsync("zoomToLayer", layerId, padding);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error zooming to layer: {ex.Message}");
            }
        }
    }

    /// <summary>
    /// Zoom and pan to the bounds of a specific set of selected features
    /// </summary>
    /// <param name="features">Array of selected features to zoom to</param>
    /// <param name="padding">Padding around the bounds in pixels (default: 0)</param>
    public async Task ZoomToSelectedFeatures(SelectedFeature[] features, int padding = 0)
    {
        if (_deckGLViewRef != null && features != null && features.Length > 0)
        {
            try
            {
                await _deckGLViewRef.InvokeVoidAsync("zoomToSelectedFeatures", features, padding);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error zooming to selected features: {ex.Message}");
            }
        }
    }

    /// <summary>
    /// Unselect a specific feature
    /// </summary>
    /// <param name="featureId">The unique ID of the feature to unselect</param>
    public async Task UnselectFeature(string featureId)
    {
        if (_deckGLViewRef != null)
        {
            try
            {
                await _deckGLViewRef.InvokeVoidAsync("unselectFeature", featureId);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error unselecting feature: {ex.Message}");
            }
        }
    }

    /// <summary>
    /// Clear selection for all features in a specific layer
    /// </summary>
    /// <param name="layerId">The layer ID</param>
    public async Task ClearLayerSelection(string layerId)
    {
        if (_deckGLViewRef != null)
        {
            try
            {
                await _deckGLViewRef.InvokeVoidAsync("clearLayerSelection", layerId);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error clearing layer selection: {ex.Message}");
            }
        }
    }

    /// <summary>
    /// Called from JavaScript when features are selected
    /// </summary>
    [JSInvokable]
    public async Task OnFeaturesSelected(FeatureSelectionResult result)
    {
        Console.WriteLine($"[DeckGLView] OnFeaturesSelected called: {result.FeatureCount} features");
        foreach (var feature in result.Features)
        {
            Console.WriteLine($"  - Layer: {feature.LayerId}");
        }
        
        // Store the selection result
        SelectionResult = result;
        Console.WriteLine($"[DeckGLView] SelectionResult stored, now has {SelectionResult.FeatureCount} features");

        // Raise the SelectionChanged event for components to subscribe to
        SelectionChanged?.Invoke(result);
        Console.WriteLine($"[DeckGLView] SelectionChanged event raised to {SelectionChanged?.GetInvocationList().Length ?? 0} subscribers");

        // Notify subscribers via EventCallback (optional, for additional external subscribers)
        if (OnFeaturesSelectedCallback.HasDelegate)
        {
            await OnFeaturesSelectedCallback.InvokeAsync(result);
        }

        // Trigger re-render for components that depend on SelectionResult
        StateHasChanged();
    }

    /// <summary>
    /// Called from JavaScript when deck.gl is fully initialized
    /// </summary>
    [JSInvokable]
    public async Task OnDeckInitializedCallback()
    {
        if (OnDeckInitialized.HasDelegate)
        {
            await OnDeckInitialized.InvokeAsync();
        }
    }


    /// <summary>
    /// Called from JavaScript when a layer is hovered
    /// </summary>
    [JSInvokable]
    public async Task OnLayerHoverCallback(LayerHoverEventArgs args)
    {
        if (OnLayerHover.HasDelegate)
        {
            await OnLayerHover.InvokeAsync(args);
        }
    }

    public async ValueTask DisposeAsync()
    {
        // Dispose the viewport update timer
        _viewportUpdateTimer?.Dispose();

        if (_deckGLViewRef != null)
        {
            try
            {
                await _deckGLViewRef.InvokeVoidAsync("dispose");
                await _deckGLViewRef.DisposeAsync();
            }
            catch (JSDisconnectedException)
            {
                // Swallow - page is being refreshed
            }
        }

        if (_jsBinder != null)
        {
            await _jsBinder.DisposeAsync();
        }

        _dotNetRef?.Dispose();

        GC.SuppressFinalize(this);
    }
}

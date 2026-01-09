namespace PyroGeoBlazor.Leaflet.Models;

using Microsoft.JSInterop;

using PyroGeoBlazor.Leaflet.EventArgs;

using System.Threading.Tasks;

public class GeoJsonLayer : FeatureGroup
{
    protected new readonly DomEventHandlerMapping<GeoJsonLayer>? EventHandlerMapping;
    protected new GeoJsonLayerOptions? Options { get; }
    protected object? Data { get; }

    /// <summary>
    /// Gets the currently selected feature, if any. When multiple selection is enabled, this returns the most recently selected feature.
    /// </summary>
    public GeoJsonFeature? SelectedFeature { get; private set; }

    /// <summary>
    /// Gets the list of all currently selected features when multiple selection is enabled.
    /// </summary>
    public List<GeoJsonFeature> SelectedFeatures { get; private set; } = new List<GeoJsonFeature>();

    /// <summary>
    /// Fired when a GeoJSON feature is clicked.
    /// </summary>
    public event EventHandler<EventArgs.GeoJsonFeatureClickEventArgs?>? OnFeatureClicked;

    /// <summary>
    /// Fired when a GeoJSON feature is selected.
    /// </summary>
    public event EventHandler<EventArgs.GeoJsonFeatureClickEventArgs?>? OnFeatureSelected;

    /// <summary>
    /// Fired when a GeoJSON feature is unselected.
    /// </summary>
    public event EventHandler<EventArgs.GeoJsonFeatureClickEventArgs?>? OnFeatureUnselected;

    public GeoJsonLayer(object? data, GeoJsonLayerOptions? options)
        : base([] , options)
    {
        Data = data;
        Options = options;
        if (Options is null || Options.EventsEnabled)
        {
            var dotNetObjectRef = DotNetObjectReference.Create(this);
            EventHandlerMapping = new DomEventHandlerMapping<GeoJsonLayer>(dotNetObjectRef, new Dictionary<string, string>
            {
                { "featureclicked", nameof(this.FeatureClicked) },
                { "featureselected", nameof(this.FeatureSelectedAsync) },
                { "featureunselected", nameof(this.FeatureUnselectedAsync) }
            });
            if (base.EventHandlerMapping != null)
            {
                foreach (var eventMapping in base.EventHandlerMapping.Events)
                {
                    EventHandlerMapping.Events.Add(eventMapping.Key, eventMapping.Value);
                }
            }
        }
    }

    /// <inheritdoc />
    protected override async Task<IJSObjectReference> CreateJsObjectRef()
    {
        if (JSBinder == null)
        {
            throw new InvalidOperationException("JavaScript binder is not set.");
        }

        var module = await JSBinder.GetLeafletMapModule();
        return await module.InvokeAsync<IJSObjectReference>("LeafletMap.GeoJsonLayer.createGeoJsonLayer", Data, Options, EventHandlerMapping);
    }

    #region Methods

    /// <summary>
    /// Adds a GeoJSON object to the layer.
    /// </summary>
    /// <param name="data">The data to add</param>
    /// <param name="timeoutMs">Optional timeout in milliseconds for the operation (default: 60000ms). Use when adding large GeoJSON datasets that may trigger many callbacks.</param>
    public async Task<GeoJsonLayer> AddData(object data, int timeoutMs = 60000)
    {
        if (JSObjectReference == null)
        {
            throw new InvalidOperationException("JavaScript object reference is not set.");
        }
        
        using var cts = new CancellationTokenSource(timeoutMs);
        await JSObjectReference.InvokeAsync<IJSObjectReference>("addData", cts.Token, data);
        return this;
    }

    /// <summary>
    /// Resets the given vector layer's style to the original GeoJSON style, useful for resetting style after hover events.
    /// If layer is omitted, the style of all features in the current layer is reset.
    /// </summary>
    /// <param name="layer">(Optionally) the layer to reset styles for.</param>
    /// <param name="timeoutMs">Optional timeout in milliseconds for the operation (default: 10000ms).</param>
    public async Task<GeoJsonLayer> ResetStyle(object? layer = null, int timeoutMs = 10000)
    {
        if (JSObjectReference == null)
        {
            throw new InvalidOperationException("JavaScript object reference is not set.");
        }
        
        using var cts = new CancellationTokenSource(timeoutMs);
        if (layer != null)
        {
            await JSObjectReference.InvokeVoidAsync("resetStyle", cts.Token, layer);
        }
        else
        {
            await JSObjectReference.InvokeVoidAsync("resetStyle", cts.Token);
        }
        return this;
    }

    /// <summary>
    /// Changes styles of GeoJSON vector layers with the given style function.
    /// </summary>
    /// <param name="style">The style to apply</param>
    /// <param name="timeoutMs">Optional timeout in milliseconds for the operation (default: 10000ms).</param>
    public async Task<GeoJsonLayer> SetStyle(object style, int timeoutMs = 10000)
    {
        if (JSObjectReference == null)
        {
            throw new InvalidOperationException("JavaScript object reference is not set.");
        }
        
        using var cts = new CancellationTokenSource(timeoutMs);
        await JSObjectReference.InvokeVoidAsync("setStyle", cts.Token, style);
        return this;
    }

    /// <summary>
    /// Clears the currently selected feature.
    /// </summary>
    public async Task<GeoJsonLayer> ClearSelection()
    {
        if (JSObjectReference == null)
        {
            throw new InvalidOperationException("JavaScript object reference is not set.");
        }
        
        await JSObjectReference.InvokeVoidAsync("clearSelection");
        return this;
    }

    /// <summary>
    /// Gets a read-only list of all currently selected features.
    /// </summary>
    /// <returns>A read-only list of selected GeoJSON features.</returns>
    public IReadOnlyList<GeoJsonFeature> GetSelectedFeatures()
    {
        return SelectedFeatures.AsReadOnly();
    }

    /// <summary>
    /// Gets the count of currently selected features.
    /// </summary>
    /// <returns>The number of selected features.</returns>
    public int GetSelectedFeaturesCount()
    {
        return SelectedFeatures.Count;
    }

    /// <summary>
    /// Checks if any features are currently selected.
    /// </summary>
    /// <returns>True if at least one feature is selected, otherwise false.</returns>
    public bool HasSelectedFeatures()
    {
        return SelectedFeatures.Count > 0;
    }

    /// <summary>
    /// Checks if a specific feature is currently selected.
    /// </summary>
    /// <param name="featureId">The ID of the feature to check.</param>
    /// <returns>True if the feature is selected, otherwise false.</returns>
    public bool IsFeatureSelected(object? featureId)
    {
        if (featureId == null)
        {
            return false;
        }
        
        return SelectedFeatures.Any(f => f.Id != null && f.Id.Equals(featureId));
    }

    /// <summary>
    /// Gets all selected feature IDs.
    /// </summary>
    /// <returns>A list of selected feature IDs (may contain nulls).</returns>
    public List<object?> GetSelectedFeatureIds()
    {
        return SelectedFeatures.Select(f => f.Id).ToList();
    }

    #endregion

    #region Events

    [JSInvokable]
    public void FeatureClicked(GeoJsonFeatureClickEventArgs? args)
    {
        OnFeatureClicked?.Invoke(this, args);
    }

    [JSInvokable]
    public async Task FeatureSelectedAsync(GeoJsonFeatureClickEventArgs? args)
    {
        if (args?.Feature != null)
        {
            SelectedFeature = args.Feature;
            
            // Add to selected features list if not already present
            if (!SelectedFeatures.Any(f => 
                (f.Id != null && f.Id.Equals(args.Feature.Id)) || 
                (f.Id == null && args.Feature.Id == null && f.Properties == args.Feature.Properties)))
            {
                SelectedFeatures.Add(args.Feature);
            }
        }
        
        OnFeatureSelected?.Invoke(this, args);
        await Task.CompletedTask;
    }

    [JSInvokable]
    public async Task FeatureUnselectedAsync(GeoJsonFeatureClickEventArgs? args)
    {
        if (args?.Feature != null)
        {
            // Remove from selected features list
            SelectedFeatures.RemoveAll(f => 
                (f.Id != null && f.Id.Equals(args.Feature.Id)) || 
                (f.Id == null && args.Feature.Id == null && f.Properties == args.Feature.Properties));
            
            // Update SelectedFeature to the last item in the list, or null if empty
            SelectedFeature = SelectedFeatures.LastOrDefault();
        }
        else
        {
            // Clear all if no specific feature provided
            SelectedFeature = null;
            SelectedFeatures.Clear();
        }
        
        OnFeatureUnselected?.Invoke(this, args);
        await Task.CompletedTask;
    }

    #endregion
}

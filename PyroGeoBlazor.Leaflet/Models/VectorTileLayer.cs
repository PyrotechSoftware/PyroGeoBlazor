namespace PyroGeoBlazor.Leaflet.Models;

using Microsoft.JSInterop;

using PyroGeoBlazor.Leaflet.EventArgs;

using System.Text.Json.Serialization;
using System.Threading.Tasks;

/// <summary>
/// Abstract base class for vector tile layers using the Leaflet.VectorGrid plugin.
/// <see href="https://github.com/Leaflet/Leaflet.VectorGrid"/>
/// </summary>
public abstract class VectorTileLayer : GridLayer
{
    /// <summary>
    /// A URL template string with formatting options for subdomain, zoom level, coordinates, and layer name.
    /// </summary>
    [JsonIgnore]
    public string UrlTemplate { get; }

    /// <summary>
    /// The <see cref="VectorTileLayerOptions"/> used to create the layer.
    /// </summary>
    [JsonIgnore]
    public new VectorTileLayerOptions? Options { get; }

    [JsonIgnore]
    protected new readonly DomEventHandlerMapping<VectorTileLayer>? EventHandlerMapping;

    /// <summary>
    /// Gets the currently selected feature, if any. When multiple selection is enabled, this returns the most recently selected feature.
    /// </summary>
    public DecodedFeature? SelectedFeature { get; private set; }

    /// <summary>
    /// Gets the list of all currently selected features when multiple selection is enabled.
    /// </summary>
    public List<DecodedFeature> SelectedFeatures { get; private set; } = [];

    /// <summary>
    /// Fired when a feature in the vector tile layer is clicked.
    /// </summary>
    public event EventHandler<LeafletFeatureMouseEventArgs?>? OnFeatureClicked;

    /// <summary>
    /// Fired when a feature in the vector tile layer is selected.
    /// </summary>
    public event EventHandler<LeafletFeatureMouseEventArgs?>? OnFeatureSelected;

    /// <summary>
    /// Fired when a feature in the vector tile layer is unselected.
    /// </summary>
    public event EventHandler<LeafletFeatureMouseEventArgs?>? OnFeatureUnselected;

    /// <summary>
    /// Fired when the mouse enters a feature in an interactive vector tile layer.
    /// Only fires when Interactive option is set to true.
    /// </summary>
    public event EventHandler<LeafletFeatureMouseEventArgs?>? OnMouseOver;

    /// <summary>
    /// Fired when the mouse leaves a feature in an interactive vector tile layer.
    /// Only fires when Interactive option is set to true.
    /// </summary>
    public event EventHandler<LeafletFeatureMouseEventArgs?>? OnMouseOut;

    /// <summary>
    /// Fired when the mouse moves over a feature in an interactive vector tile layer.
    /// Only fires when Interactive option is set to true.
    /// </summary>
    public event EventHandler<LeafletFeatureMouseEventArgs?>? OnMouseMove;

    /// <summary>
    /// Fired when a feature in an interactive vector tile layer is double-clicked.
    /// Only fires when Interactive option is set to true.
    /// </summary>
    public event EventHandler<LeafletFeatureMouseEventArgs?>? OnDoubleClick;

    /// <summary>
    /// Fired when a feature in an interactive vector tile layer is right-clicked.
    /// Only fires when Interactive option is set to true.
    /// </summary>
    public event EventHandler<LeafletFeatureMouseEventArgs?>? OnContextMenu;

    /// <param name="urlTemplate">A URL template string with formatting options for subdomain, zoom level, coordinates, and layer name.</param>
    /// <param name="options">The <see cref="VectorTileLayerOptions"/> used to create the layer.</param>
    protected VectorTileLayer(string urlTemplate, VectorTileLayerOptions? options = null) : base(options)
    {
        UrlTemplate = urlTemplate;
        Options = options;
        if (Options is null || Options.EventsEnabled)
        {
            var dotNetObjectRef = DotNetObjectReference.Create(this);
            EventHandlerMapping = new DomEventHandlerMapping<VectorTileLayer>(dotNetObjectRef, new Dictionary<string, string>
            {
                { "featureclicked", nameof(this.FeatureClicked) },
                { "featureselected", nameof(this.FeatureSelectedAsync) },
                { "featureunselected", nameof(this.FeatureUnselectedAsync) },
                { "mouseover", nameof(this.MouseOver) },
                { "mouseout", nameof(this.MouseOut) },
                { "mousemove", nameof(this.MouseMove) },
                { "dblclick", nameof(this.DoubleClick) },
                { "contextmenu", nameof(this.ContextMenu) }
            });
            if (base.EventHandlerMapping is not null)
            {
                foreach (var eventMapping in base.EventHandlerMapping.Events)
                {
                    EventHandlerMapping.Events.Add(eventMapping.Key, eventMapping.Value);
                }
            }
        }
    }

    /// <inheritdoc/>
    protected override async Task<IJSObjectReference> CreateJsObjectRef()
    {
        if (JSBinder is null)
        {
            throw new InvalidOperationException("Cannot create MapboxVectorTileLayer object. No JavaScript binding has been set up for this object.");
        }

        var module = await JSBinder.GetLeafletMapModule();
        return await module.InvokeAsync<IJSObjectReference>("LeafletMap.VectorTileLayer.createVectorTileLayer", UrlTemplate, Options, EventHandlerMapping);
    }

    #region Methods

    /// <summary>
    /// Sets the URL template for the vector tile layer.
    /// </summary>
    /// <param name="url">The new URL template</param>
    /// <param name="noRedraw">If true, the layer will not redraw after changing the URL</param>
    public async Task<VectorTileLayer> SetUrl(string url, bool? noRedraw = null)
    {
        if (JSObjectReference is null)
        {
            throw new InvalidOperationException("Cannot call SetUrl. The JavaScript object reference has not been created yet.");
        }
        await JSObjectReference.InvokeVoidAsync("setUrl", url, noRedraw);
        return this;
    }

    /// <summary>
    /// Clears the currently selected feature(s).
    /// </summary>
    public async Task<VectorTileLayer> ClearSelection()
    {
        if (JSObjectReference is null)
        {
            throw new InvalidOperationException("Cannot call ClearSelection. The JavaScript object reference has not been set up for this object.");
        }

        await JSObjectReference.InvokeVoidAsync("clearSelection");
        return this;
    }

    /// <summary>
    /// Gets a read-only list of all currently selected features.
    /// </summary>
    /// <returns>A read-only list of selected features.</returns>
    public IReadOnlyList<DecodedFeature> GetSelectedFeatures()
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
        if (featureId is null)
        {
            return false;
        }

        return SelectedFeatures.Any(f => f.Id is not null && f.Id.Equals(featureId));
    }

    /// <summary>
    /// Gets all selected feature IDs.
    /// </summary>
    /// <returns>A list of selected feature IDs (may contain nulls).</returns>
    public List<object?> GetSelectedFeatureIds()
    {
        return SelectedFeatures.Select(f => (object?)f.Id).ToList();
    }

    #endregion

    #region Events

    [JSInvokable]
    public void FeatureClicked(LeafletFeatureMouseEventArgs? args)
    {
        OnFeatureClicked?.Invoke(this, args);
    }

    [JSInvokable]
    public async Task FeatureSelectedAsync(LeafletFeatureMouseEventArgs? args)
    {
        if (args?.Feature is not null)
        {
            SelectedFeature = args.Feature;

            // Add to selected features list if not already present
            if (!SelectedFeatures.Any(f =>
                (f.Id is not null && f.Id.Equals(args.Feature.Id)) ||
                (f.Id is null && args.Feature.Id is null && f.Properties == args.Feature.Properties)))
            {
                SelectedFeatures.Add(args.Feature);
            }
        }

        OnFeatureSelected?.Invoke(this, args);
        await Task.CompletedTask;
    }

    [JSInvokable]
    public async Task FeatureUnselectedAsync(LeafletFeatureMouseEventArgs? args)
    {
        if (args?.Feature is not null)
        {
            // Remove from selected features list
            SelectedFeatures.RemoveAll(f =>
                (f.Id is not null && f.Id.Equals(args.Feature.Id)) ||
                (f.Id is null && args.Feature.Id is null && f.Properties == args.Feature.Properties));

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

    [JSInvokable]
    public void MouseOver(LeafletFeatureMouseEventArgs? args)
    {
        OnMouseOver?.Invoke(this, args);
    }

    [JSInvokable]
    public void MouseOut(LeafletFeatureMouseEventArgs? args)
    {
        OnMouseOut?.Invoke(this, args);
    }

    [JSInvokable]
    public void MouseMove(LeafletFeatureMouseEventArgs? args)
    {
        OnMouseMove?.Invoke(this, args);
    }

    [JSInvokable]
    public void DoubleClick(LeafletFeatureMouseEventArgs? args)
    {
        OnDoubleClick?.Invoke(this, args);
    }

    [JSInvokable]
    public void ContextMenu(LeafletFeatureMouseEventArgs? args)
    {
        OnContextMenu?.Invoke(this, args);
    }

    #endregion
}

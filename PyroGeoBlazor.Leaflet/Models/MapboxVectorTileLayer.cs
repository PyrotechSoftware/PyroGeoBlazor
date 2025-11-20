namespace PyroGeoBlazor.Leaflet.Models;

using Microsoft.JSInterop;

using PyroGeoBlazor.Leaflet.EventArgs;

using System.Threading.Tasks;

public class MapboxVectorTileLayer : GridLayer
{
    protected new readonly DomEventHandlerMapping<MapboxVectorTileLayer>? EventHandlerMapping;
    protected new MapboxVectorTileLayerOptions? Options { get; }
    protected string UrlTemplate { get; }

    public DecodedMvtFeature? SelectedFeature { get; private set; }

    public MapboxVectorTileLayer(string urlTemplate, MapboxVectorTileLayerOptions? options)
        : base(options)
    {
        UrlTemplate = urlTemplate;
        Options = options;
        if (Options is null || Options.EventsEnabled)
        {
            var dotNetObjectRef = DotNetObjectReference.Create(this);
            EventHandlerMapping = new DomEventHandlerMapping<MapboxVectorTileLayer>(dotNetObjectRef, new Dictionary<string, string>
            {
                { "featureselected", nameof(this.FeatureSelectedAsync) },
                { "featureunselected", nameof(this.FeatureUnselectedAsync) },
                { "featureclick", nameof(this.FeatureClick) },
                { "featuredblclick", nameof(this.FeatureDoubleClick) },
                { "featurecontextmenu", nameof(this.FeatureContextMenu) },
                { "featuremouseover", nameof(this.FeatureMouseOver) },
                { "featuremouseout", nameof(this.FeatureMouseOut) },
                { "tilefetcherror", nameof(this.TileFetchError) }
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

    protected override async Task<IJSObjectReference> CreateJsObjectRef()
    {
        if (JSBinder == null)
        {
            throw new InvalidOperationException("JavaScript binder is not set.");
        }

        var module = await JSBinder.GetLeafletMapModule();
        return await module.InvokeAsync<IJSObjectReference>("LeafletMap.MapboxVectorTileLayer.createMvtLayer", UrlTemplate, Options, EventHandlerMapping);
    }

    #region Methods

    /// <summary>
    /// Sets the style for a specific feature identified by its ID in the specified layer.
    /// </summary>
    /// <param name="layerName">The name of the layer.</param>
    /// <param name="featureId">The ID of the feature.</param>
    /// <param name="style">The style to apply.</param>
    public async Task<MapboxVectorTileLayer> SetFeatureStyleById(string layerName, int featureId, FeatureStyle style)
    {
        if (JSObjectReference == null)
        {
            throw new InvalidOperationException("JavaScript object reference is not set.");
        }

        await JSObjectReference.InvokeAsync<MapboxVectorTileLayer>("setFeatureStyleById", layerName, featureId, style);
        return this;
    }

    /// <summary>
    /// Clears the feature style applied to the feature with the specified ID in the given layer.
    /// </summary>
    /// <param name="layerName">The name of the layer.</param>
    /// <param name="featureId">The ID of the feature.</param>
    public async Task<MapboxVectorTileLayer> ClearFeatureStyleById(string layerName, string featureId)
    {
        if (JSObjectReference == null)
        {
            throw new InvalidOperationException("JavaScript object reference is not set.");
        }

        await JSObjectReference.InvokeVoidAsync("clearFeatureStyleById", layerName, featureId);
        return this;
    }

    /// <summary>
    /// Clears all feature styles applied to the layer.
    /// </summary>
    public async Task<MapboxVectorTileLayer> ClearAllFeatureStyles()
    {
        if (JSObjectReference == null)
        {
            throw new InvalidOperationException("JavaScript object reference is not set.");
        }

        await JSObjectReference.InvokeVoidAsync("clearAllFeatureStyles");
        return this;
    }

    #endregion

    #region Events

    public event EventHandler<LeafletFeatureMouseEventArgs?>? OnFeatureSelected;
    public event EventHandler<LeafletFeatureMouseEventArgs?>? OnFeatureUnselected;
    public event EventHandler<LeafletFeatureMouseEventArgs?>? OnFeatureClick;
    public event EventHandler<LeafletFeatureMouseEventArgs?>? OnFeatureDoubleClick;
    public event EventHandler<LeafletFeatureMouseEventArgs?>? OnFeatureContextMenu;
    public event EventHandler<LeafletFeatureMouseEventArgs?>? OnFeatureMouseOver;
    public event EventHandler<LeafletFeatureMouseEventArgs?>? OnFeatureMouseOut;
    public event EventHandler<LeafletTileFetchErrorEventArgs?>? OnTileFetchError;

    [JSInvokable]
    public async Task FeatureSelectedAsync(LeafletFeatureMouseEventArgs? args)
    {
        if (args?.Feature is not null)
        {
            if (!string.IsNullOrEmpty(args.LayerName) && args.Feature.Id.HasValue && Options?.SelectedFeatureStyle is not null)
            {
                await SetFeatureStyleById(args.LayerName, args.Feature.Id.Value, Options.SelectedFeatureStyle);
            }
        }

        SelectedFeature = args?.Feature;
        OnFeatureSelected?.Invoke(this, args);
    }

    [JSInvokable]
    public async Task FeatureUnselectedAsync(LeafletFeatureMouseEventArgs? args)
    {
        if (Options?.SelectedFeatureStyle is not null)
        {
            await ClearAllFeatureStyles();
        }

        SelectedFeature = null;
        OnFeatureUnselected?.Invoke(this, args);
    }

    [JSInvokable]
    public void FeatureClick(LeafletFeatureMouseEventArgs? args)
    {
        OnFeatureClick?.Invoke(this, args);
    }

    [JSInvokable]
    public void FeatureDoubleClick(LeafletFeatureMouseEventArgs? args)
    {
        OnFeatureDoubleClick?.Invoke(this, args);
    }

    [JSInvokable]
    public void FeatureContextMenu(LeafletFeatureMouseEventArgs? args)
    {
        OnFeatureContextMenu?.Invoke(this, args);
    }

    [JSInvokable]
    public void FeatureMouseOver(LeafletFeatureMouseEventArgs? args)
    {
        OnFeatureMouseOver?.Invoke(this, args);
    }

    [JSInvokable]
    public void FeatureMouseOut(LeafletFeatureMouseEventArgs? args)
    {
        OnFeatureMouseOut?.Invoke(this, args);
    }

    [JSInvokable]
    public void TileFetchError(LeafletTileFetchErrorEventArgs? args)
    {
        OnTileFetchError?.Invoke(this, args);
    }

    #endregion
}

namespace PyroGeoBlazor.Leaflet.Models;

using Microsoft.JSInterop;

using PyroGeoBlazor.Leaflet.EventArgs;

using System.Threading.Tasks;

public class GeoJsonLayer : FeatureGroup
{
    /// <summary>
    /// Fired when a GeoJSON feature is clicked.
    /// </summary>
    public event EventHandler<EventArgs.GeoJsonFeatureClickEventArgs?>? OnFeatureClicked;

    protected new readonly DomEventHandlerMapping<GeoJsonLayer>? EventHandlerMapping;
    protected new GeoJsonLayerOptions? Options { get; }
    protected object? Data { get; }

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
                { "featureclicked", nameof(this.FeatureClicked) }
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

    #endregion

    #region Events

    [JSInvokable]
    public void FeatureClicked(GeoJsonFeatureClickEventArgs? args)
    {
        OnFeatureClicked?.Invoke(this, args);
    }

    #endregion
}

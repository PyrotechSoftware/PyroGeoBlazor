namespace PyroGeoBlazor.Leaflet.Models;

using Microsoft.JSInterop;

using System.Threading.Tasks;

public class GeoJsonLayer : FeatureGroup
{
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
            EventHandlerMapping = new DomEventHandlerMapping<GeoJsonLayer>(dotNetObjectRef, []);
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
    public async Task<GeoJsonLayer> AddData(object data)
    {
        if (JSObjectReference == null)
        {
            throw new InvalidOperationException("JavaScript object reference is not set.");
        }
        await JSObjectReference.InvokeVoidAsync("addData", data);
        return this;
    }

    /// <summary>
    /// Resets the given vector layer's style to the original GeoJSON style, useful for resetting style after hover events.
    /// If layer is omitted, the style of all features in the current layer is reset.
    /// </summary>
    /// <param name="layer">(Optionally) the layer to reset styles for.</param>
    public async Task<GeoJsonLayer> ResetStyle(object? layer = null)
    {
        if (JSObjectReference == null)
        {
            throw new InvalidOperationException("JavaScript object reference is not set.");
        }
        if (layer != null)
        {
            await JSObjectReference.InvokeVoidAsync("resetStyle", layer);
        }
        else
        {
            await JSObjectReference.InvokeVoidAsync("resetStyle");
        }
        return this;
    }

    /// <summary>
    /// Changes styles of GeoJSON vector layers with the given style function.
    /// </summary>
    /// <param name="style">The style to apply</param>
    public async Task<GeoJsonLayer> SetStyle(object style)
    {
        if (JSObjectReference == null)
        {
            throw new InvalidOperationException("JavaScript object reference is not set.");
        }
        await JSObjectReference.InvokeVoidAsync("setStyle", style);
        return this;
    }

    #endregion
}

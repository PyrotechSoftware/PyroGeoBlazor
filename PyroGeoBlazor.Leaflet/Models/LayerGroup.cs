namespace PyroGeoBlazor.Leaflet.Models;

using Microsoft.JSInterop;

using System;
using System.Threading.Tasks;

/// <summary>
/// Used to group several layers and handle them as one.
/// If you add it to the map, any layers added or removed from the group will be added/removed on the map as well.
/// <see href="https://leafletjs.com/reference.html#layergroup"/>
/// </summary>
public class LayerGroup : InteractiveLayer
{
    protected new readonly DomEventHandlerMapping<LayerGroup>? EventHandlerMapping;
    protected InteractiveLayerOptions? Options { get; }
    protected Layer[] Layers { get; }

    public LayerGroup(Layer[] layers, InteractiveLayerOptions? options)
        : base(options)
    {
        Layers = layers;
        Options = options;
        if (Options is null || Options.EventsEnabled)
        {
            var dotNetObjectRef = DotNetObjectReference.Create(this);
            EventHandlerMapping = new DomEventHandlerMapping<LayerGroup>(dotNetObjectRef, []);
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
        return await module.InvokeAsync<IJSObjectReference>("LeafletMap.LayerGroup.createLayerGroup", Layers, Options, EventHandlerMapping);
    }

    #region Methods

    /// <summary>
    /// Returns a GeoJSON representation of the layer group (as a GeoJSON FeatureCollection, GeometryCollection, or MultiPoint).
    /// </summary>
    /// <param name="precision"></param>
    /// <returns></returns>
    public async Task<object> ToGeoJSON(int? precision = null)
    {
        if (JSObjectReference == null)
        {
            throw new InvalidOperationException("JavaScript object reference is not set.");
        }
        return await JSObjectReference.InvokeAsync<object>("toGeoJSON", precision);
    }

    /// <summary>
    /// Adds a given layer to the layer group.
    /// </summary>
    /// <param name="layer">The layer to add</param>
    public async Task<LayerGroup> AddLayer(Layer layer)
    {
        if (JSObjectReference == null)
        {
            throw new InvalidOperationException("JavaScript object reference is not set.");
        }
        await JSObjectReference.InvokeVoidAsync("addLayer", layer);
        return this;
    }

    public async Task<LayerGroup> RemoveLayer(Layer layer)
    {
        if (JSObjectReference == null)
        {
            throw new InvalidOperationException("JavaScript object reference is not set.");
        }
        await JSObjectReference.InvokeVoidAsync("removeLayer", layer);
        return this;
    }

    public async Task<LayerGroup> RemoveLayer(int number)
    {
        if (JSObjectReference == null)
        {
            throw new InvalidOperationException("JavaScript object reference is not set.");
        }
        await JSObjectReference.InvokeVoidAsync("removeLayer", number);
        return this;
    }

    public async Task<bool> HasLayer(Layer layer)
    {
        if (JSObjectReference == null)
        {
            throw new InvalidOperationException("JavaScript object reference is not set.");
        }
        return await JSObjectReference.InvokeAsync<bool>("hasLayer", layer);
    }

    public async Task<bool> HasLayer(int number)
    {
        if (JSObjectReference == null)
        {
            throw new InvalidOperationException("JavaScript object reference is not set.");
        }
        return await JSObjectReference.InvokeAsync<bool>("hasLayer", number);
    }

    public async Task<LayerGroup> ClearLayers()
    {
        if (JSObjectReference == null)
        {
            throw new InvalidOperationException("JavaScript object reference is not set.");
        }
        await JSObjectReference.InvokeVoidAsync("clearLayers");
        return this;
    }

    /// <summary>
    /// Calls methodName on every layer contained in this group, passing any additional parameters. Has no effect if the layers contained do not implement methodName.
    /// </summary>
    /// <param name="methodName">The name of the method to invoke.</param>
    /// <param name="args">Any additional args to pass</param>
    public async Task<LayerGroup> Invoke(string methodName, params object[] args)
    {
        if (JSObjectReference == null)
        {
            throw new InvalidOperationException("JavaScript object reference is not set.");
        }
        await JSObjectReference.InvokeVoidAsync("invoke", methodName, args);
        return this;
    }

    public async Task<Layer> GetLayer(int id)
    {
        if (JSObjectReference == null)
        {
            throw new InvalidOperationException("JavaScript object reference is not set.");
        }
        return await JSObjectReference.InvokeAsync<Layer>("getLayer", id);
    }

    public async Task<Layer[]> GetLayers()
    {
        if (JSObjectReference == null)
        {
            throw new InvalidOperationException("JavaScript object reference is not set.");
        }
        return await JSObjectReference.InvokeAsync<Layer[]>("getLayers");
    }

    public async Task<LayerGroup> SetZIndex(int zIndex)
    {
        if (JSObjectReference == null)
        {
            throw new InvalidOperationException("JavaScript object reference is not set.");
        }
        await JSObjectReference.InvokeVoidAsync("setZIndex", zIndex);
        return this;
    }

    public async Task<int> GetLayerId(Layer layer)
    {
        if (JSObjectReference == null)
        {
            throw new InvalidOperationException("JavaScript object reference is not set.");
        }
        return await JSObjectReference.InvokeAsync<int>("getLayerId", layer);
    }

    #endregion
}

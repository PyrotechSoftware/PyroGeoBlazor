namespace PyroGeoBlazor.Leaflet.Models;

using Microsoft.JSInterop;

using PyroGeoBlazor.Leaflet.EventArgs;

using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Extended <see cref="LayerGroup" /> that makes it easier to do the same thing to all its member layers.
/// </summary>
/// <remarks>
/// Bind
/// </remarks>
public class FeatureGroup : LayerGroup
{
    public event EventHandler<LeafletLayerEventArgs>? OnLayerAdd;
    public event EventHandler<LeafletLayerEventArgs>? OnLayerRemove;

    protected new readonly DomEventHandlerMapping<FeatureGroup>? EventHandlerMapping;
    protected new InteractiveLayerOptions? Options { get; }
    protected new Layer[] Layers { get; }

    public FeatureGroup(Layer[] layers, InteractiveLayerOptions? options)
        : base(layers, options)
    {
        Layers = layers;
        Options = options;
        if (Options is null || Options.EventsEnabled)
        {
            var dotNetObjectRef = DotNetObjectReference.Create(this);
            EventHandlerMapping = new DomEventHandlerMapping<FeatureGroup>(dotNetObjectRef, new Dictionary<string, string>
            {
                { "layeradd", nameof(this.LayerAdd) },
                { "layerremove", nameof(this.LayerRemove) }
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
        return await module.InvokeAsync<IJSObjectReference>("LeafletMap.FeatureGroup.createFeatureGroup", Layers, Options, EventHandlerMapping);
    }

    #region Methods

    /// <summary>
    /// Sets the given path options to each layer of the group that has a setStyleMethod.
    /// </summary>
    /// <param name="style">The style options to set.</param>
    public async Task<FeatureGroup> SetStyle(PathOptions style)
    {
        if (JSObjectReference == null)
        {
            throw new InvalidOperationException("JavaScript object reference is not set.");
        }
        await JSObjectReference.InvokeVoidAsync("setStyle", style);
        return this;
    }

    /// <summary>
    /// Brings the layer group to the top of all other layers
    /// </summary>
    public async Task<FeatureGroup> BringToFront()
    {
        if (JSObjectReference == null)
        {
            throw new InvalidOperationException("JavaScript object reference is not set.");
        }
        await JSObjectReference.InvokeVoidAsync("bringToFront");
        return this;
    }

    /// <summary>
    /// Brings the layer group to the back of all other layers
    /// </summary>
    public async Task<FeatureGroup> BringToBack()
    {
        if (JSObjectReference == null)
        {
            throw new InvalidOperationException("JavaScript object reference is not set.");
        }
        await JSObjectReference.InvokeVoidAsync("bringToBack");
        return this;
    }

    /// <summary>
    /// Returns the <see cref="LatLngBounds"/> of the Feature Group (created from bounds and coordinates of its children).
    /// </summary>
    public async Task<LatLngBounds> GetBounds()
    {
        if (JSObjectReference == null)
        {
            throw new InvalidOperationException("JavaScript object reference is not set.");
        }
        var json = await JSObjectReference.InvokeAsync<JsonElement>("getBounds");
        if (json.ValueKind == JsonValueKind.Null || json.ValueKind == JsonValueKind.Undefined) return null;

        // shape 1: { SouthWest: { Lat, Lng }, NorthEast: { Lat, Lng } }
        if (json.TryGetProperty("SouthWest", out var swEl) && json.TryGetProperty("NorthEast", out var neEl))
        {
            var swLat = swEl.GetProperty("Lat").GetDouble();
            var swLng = swEl.GetProperty("Lng").GetDouble();
            var neLat = neEl.GetProperty("Lat").GetDouble();
            var neLng = neEl.GetProperty("Lng").GetDouble();

            var ne = new LatLng(neLat, neLng);
            var sw = new LatLng(swLat, swLng);
            return new LatLngBounds(ne, sw);
        }

        // shape 2: lowercase properties
        if (json.TryGetProperty("southWest", out swEl) && json.TryGetProperty("northEast", out neEl))
        {
            var swLat = swEl.GetProperty("lat").GetDouble();
            var swLng = swEl.GetProperty("lng").GetDouble();
            var neLat = neEl.GetProperty("lat").GetDouble();
            var neLng = neEl.GetProperty("lng").GetDouble();

            var ne = new LatLng(neLat, neLng);
            var sw = new LatLng(swLat, swLng);
            return new LatLngBounds(ne, sw);
        }

        // shape 3: array [[swLat, swLng], [neLat, neLng]]
        if (json.ValueKind == JsonValueKind.Array && json.GetArrayLength() == 2)
        {
            var swArr = json[0];
            var neArr = json[1];
            var swLat = swArr[0].GetDouble();
            var swLng = swArr[1].GetDouble();
            var neLat = neArr[0].GetDouble();
            var neLng = neArr[1].GetDouble();

            var ne = new LatLng(neLat, neLng);
            var sw = new LatLng(swLat, swLng);
            return new LatLngBounds(ne, sw);
        }

        return null;
    }

    #endregion

    #region Events

    [JSInvokable]
    public async Task LayerAdd(LeafletLayerEventArgs args)
    {
        OnLayerAdd?.Invoke(this, args);
        await Task.CompletedTask;
    }

    [JSInvokable]
    public async Task LayerRemove(LeafletLayerEventArgs args)
    {
        OnLayerRemove?.Invoke(this, args);
        await Task.CompletedTask;
    }

    #endregion
}

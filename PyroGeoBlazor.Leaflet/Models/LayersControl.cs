namespace PyroGeoBlazor.Leaflet.Models;

using Microsoft.JSInterop;

using System;
using System.Threading.Tasks;

public class LayersControl(Dictionary<string, Layer>? baseLayers, Dictionary<string, Layer>? overlays, LayersControlOptions? options) : Control
{
    public Dictionary<string, Layer>? BaseLayers { get; } = baseLayers;
    public Dictionary<string, Layer>? Overlays { get; } = overlays;
    public new LayersControlOptions? Options { get; } = options;

    protected override async Task<IJSObjectReference> CreateJsObjectRef()
    {
        return JSBinder is null
            ? throw new InvalidOperationException("Cannot create layers control. JavaScript is not setup yet.")
            : await JSBinder.JSRuntime.InvokeAsync<IJSObjectReference>(
            "L.control.layers", BaseLayers, Overlays, Options);
    }

    #region Methods

    /// <summary>
    /// Adds a base layer (radio button entry) with the given name to the control.
    /// </summary>
    /// <param name="layer">The layer to add.</param>
    /// <param name="name">The name of the layer.</param>
    public async Task<LayersControl> AddBaseLayer(Layer layer, string name)
    {
        GuardAgainstNullBinding("Cannot add base layer. JavaScript object reference is null.");
        await JSObjectReference!.InvokeVoidAsync("addBaseLayer", layer.JSObjectReference, name);
        return this;
    }

    /// <summary>
    /// Adds an overlay (checkbox entry) with the given name to the control.
    /// </summary>
    /// <param name="layer">The layer to add.</param>
    /// <param name="name">The name of the layer.</param>
    public async Task<LayersControl> AddOverlay(Layer layer, string name)
    {
        GuardAgainstNullBinding("Cannot add overlay. JavaScript object reference is null.");
        await JSObjectReference!.InvokeVoidAsync("addOverlay", layer.JSObjectReference, name);
        return this;
    }

    /// <summary>
    /// Removes the given layer from the control.
    /// </summary>
    /// <param name="layer">The layer to remove.</param>
    public async Task<LayersControl> RemoveLayer(Layer layer)
    {
        GuardAgainstNullBinding("Cannot remove layer. JavaScript object reference is null.");
        await JSObjectReference!.InvokeVoidAsync("removeLayer", layer.JSObjectReference);
        return this;
    }

    /// <summary>
    /// Expand the control container if collapsed.
    /// </summary>
    public async Task<LayersControl> Expand()
    {
        GuardAgainstNullBinding("Cannot expand layers control. JavaScript object reference is null.");
        await JSObjectReference!.InvokeVoidAsync("expand");
        return this;
    }

    /// <summary>
    /// Collapse the control container if expanded.
    /// </summary>
    public async Task<LayersControl> Collapse()
    {
        GuardAgainstNullBinding("Cannot collapse layers control. JavaScript object reference is null.");
        await JSObjectReference!.InvokeVoidAsync("collapse");
        return this;
    }

    #endregion
}

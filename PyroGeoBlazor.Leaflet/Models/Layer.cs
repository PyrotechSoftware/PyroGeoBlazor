namespace PyroGeoBlazor.Leaflet.Models;

using Microsoft.JSInterop;

using PyroGeoBlazor.Leaflet.EventArgs;

using System.Threading.Tasks;

/// <summary>
/// A layer that can be added to a <see cref="Map"/>.
/// </summary>
public abstract class Layer : InteropObject
{
    public event EventHandler<LeafletEventArgs>? OnAdd;
    public event EventHandler<LeafletEventArgs>? OnRemove;

    /// <summary>
    /// These interaction options for the layer.
    /// </summary>
    protected readonly DomEventHandlerMapping<Layer>? EventHandlerMapping;

    protected Layer(LayerOptions? options = null)
    {
        var dotnetReference = DotNetObjectReference.Create(this);
        EventHandlerMapping = new DomEventHandlerMapping<Layer>(dotnetReference, new Dictionary<string, string>()
        {
            { "add", nameof(this.Add) },
            { "remove", nameof(this.Remove) }
        });
    }

    /// <summary>
    /// Adds the layer to a <see cref="Map"/>.
    /// </summary>
    /// <param name="map">The <see cref="Map"/> to add the Layer to.</param>
    /// <returns>The Layer.</returns>
    public async Task<Layer> AddTo(Map map)
    {
        if (JSBinder is null)
        {
            await BindJsObjectReference(map.JSBinder!);
        }
        GuardAgainstNullBinding("Cannot add layer to map. No JavaScript binding has been set up.");
        var module = await JSBinder!.GetLeafletMapModule();
        await module.InvokeVoidAsync("LeafletMap.Layer.addTo", JSObjectReference, map.JSObjectReference, EventHandlerMapping);
        return this;
    }

    /// <summary>
    /// Removes the Layer from the <see cref="Map"/> it's currently active on.
    /// </summary>
    /// <returns>The Layer.</returns>
    public async Task<Layer> RemoveLayer()
    {
        GuardAgainstNullBinding("Cannot remove layer from map. No JavaScript binding has been set up.");
        var module = await JSBinder!.GetLeafletMapModule();
        await module.InvokeVoidAsync("LeafletMap.Layer.remove", JSObjectReference);
        return this;
    }

    #region Events

    [JSInvokable]
    public Task Add(LeafletEventArgs args)
    {
        OnAdd?.Invoke(this, args);
        return Task.CompletedTask;
    }

    [JSInvokable]
    public Task Remove(LeafletEventArgs args)
    {
        OnRemove?.Invoke(this, args);
        return Task.CompletedTask;
    }

    #endregion
}

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
    public virtual async Task<Layer> AddTo(Map map)
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
    public virtual async Task<Layer> RemoveLayer()
    {
        GuardAgainstNullBinding("Cannot remove layer from map. No JavaScript binding has been set up.");
        var module = await JSBinder!.GetLeafletMapModule();
        await module.InvokeVoidAsync("LeafletMap.Layer.remove", JSObjectReference);
        return this;
    }

    /// <summary>
    /// Adds this layer to a map with managed ordering support.
    /// Convenience wrapper around <see cref="Map.AddLayerManaged"/>.
    /// </summary>
    /// <param name="map">The map to add the layer to.</param>
    /// <param name="layerId">Optional unique identifier for the layer. If null, a GUID is generated.</param>
    /// <returns>The Map instance.</returns>
    public async Task<Map> AddToManaged(Map map, string? layerId = null)
    {
        if (map is null) throw new ArgumentNullException(nameof(map));
        return await map.AddLayerManaged(this, layerId);
    }

    /// <summary>
    /// Removes this layer from a map's managed layer registry.
    /// Convenience wrapper around <see cref="Map.RemoveLayerManaged(Layer)"/>.
    /// </summary>
    /// <param name="map">The map to remove the layer from.</param>
    /// <returns>The Map instance.</returns>
    public async Task<Map> RemoveFromManaged(Map map)
    {
        if (map is null) throw new ArgumentNullException(nameof(map));
        return await map.RemoveLayerManaged(this);
    }

    /// <summary>
    /// Reorders this layer to a new position in the managed layer stack.
    /// Convenience wrapper around <see cref="Map.ReorderLayer(Layer, int)"/>.
    /// </summary>
    /// <param name="map">The map containing the layer.</param>
    /// <param name="newIndex">The zero-based target index.</param>
    /// <returns>The Map instance.</returns>
    public async Task<Map> ReorderManaged(Map map, int newIndex)
    {
        if (map is null) throw new ArgumentNullException(nameof(map));
        return await map.ReorderLayer(this, newIndex);
    }

    /// <summary>
    /// Moves this layer to the top of the managed layer stack.
    /// Convenience wrapper around <see cref="Map.MoveLayerManagedToTop(Layer)"/>.
    /// </summary>
    /// <param name="map">The map containing the layer.</param>
    /// <returns>The Map instance.</returns>
    public async Task<Map> MoveToTopManaged(Map map)
    {
        if (map is null) throw new ArgumentNullException(nameof(map));
        return await map.MoveLayerManagedToTop(this);
    }

    /// <summary>
    /// Moves this layer to the bottom of the managed layer stack.
    /// Convenience wrapper around <see cref="Map.MoveLayerManagedToBottom(Layer)"/>.
    /// </summary>
    /// <param name="map">The map containing the layer.</param>
    /// <returns>The Map instance.</returns>
    public async Task<Map> MoveToBottomManaged(Map map)
    {
        if (map is null) throw new ArgumentNullException(nameof(map));
        return await map.MoveLayerManagedToBottom(this);
    }

    /// <summary>
    /// Moves this layer up one position in the managed layer stack.
    /// Convenience wrapper around <see cref="Map.MoveLayerManagedUp(Layer)"/>.
    /// </summary>
    /// <param name="map">The map containing the layer.</param>
    /// <returns>The Map instance.</returns>
    public async Task<Map> MoveUpManaged(Map map)
    {
        if (map is null) throw new ArgumentNullException(nameof(map));
        return await map.MoveLayerManagedUp(this);
    }

    /// <summary>
    /// Moves this layer down one position in the managed layer stack.
    /// Convenience wrapper around <see cref="Map.MoveLayerManagedDown(Layer)"/>.
    /// </summary>
    /// <param name="map">The map containing the layer.</param>
    /// <returns>The Map instance.</returns>
    public async Task<Map> MoveDownManaged(Map map)
    {
        if (map is null) throw new ArgumentNullException(nameof(map));
        return await map.MoveLayerManagedDown(this);
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

namespace PyroGeoBlazor.Leaflet.Models;

using Microsoft.JSInterop;

using PyroGeoBlazor.Leaflet.EventArgs;

/// <summary>
/// A <see cref="Layer"/> that the user can interact with.
/// <see href="https://leafletjs.com/reference.html#interactive-layer"/>
/// </summary>
public abstract class InteractiveLayer : Layer
{
    public event EventHandler<LeafletMouseEventArgs>? OnClick;
    public event EventHandler<LeafletMouseEventArgs>? OnDoubleClick;
    public event EventHandler<LeafletMouseEventArgs>? OnMouseDown;

    protected new readonly DomEventHandlerMapping<InteractiveLayer>? EventHandlerMapping;

    protected InteractiveLayer(InteractiveLayerOptions? options = null)
        : base(options)
    {
        if (options is null || options.Interactive)
        {
            var dotnetReference = DotNetObjectReference.Create(this);
            EventHandlerMapping = new DomEventHandlerMapping<InteractiveLayer>(dotnetReference, new Dictionary<string, string>
            {
                { "click", nameof(this.Click) },
                { "dblclick", nameof(this.DoubleClick) },
                { "mousedown", nameof(this.MouseDown) }
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

    #region Events

    [JSInvokable]
    public virtual Task Click(LeafletMouseEventArgs args)
    {
        OnClick?.Invoke(this, args);
        return Task.CompletedTask;
    }

    [JSInvokable]
    public virtual Task DoubleClick(LeafletMouseEventArgs args)
    {
        OnDoubleClick?.Invoke(this, args);
        return Task.CompletedTask;
    }

    [JSInvokable]
    public virtual Task MouseDown(LeafletMouseEventArgs args)
    {
        OnMouseDown?.Invoke(this, args);
        return Task.CompletedTask;
    }

    #endregion
}

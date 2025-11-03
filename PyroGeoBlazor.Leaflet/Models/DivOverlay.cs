namespace PyroGeoBlazor.Leaflet.Models;

using Microsoft.JSInterop;

using PyroGeoBlazor.Leaflet.EventArgs;

/// <summary>
/// Base model for Popup and Tooltip.
/// Inherit from it for custom overlays like plugins.
/// <see href="https://leafletjs.com/reference.html#divoverlay"/>
/// </summary>
public abstract class DivOverlay : InteractiveLayer
{
    public event EventHandler<LeafletEventArgs>? OnContentUpdate;

    protected new readonly DomEventHandlerMapping<DivOverlay>? InteractionOptions;

    protected DivOverlay(DivOverlayOptions? options = null)
    {
        if (options is null || options.Interactive)
        {
            var dotnetReference = DotNetObjectReference.Create(this);
            InteractionOptions = new DomEventHandlerMapping<DivOverlay>(dotnetReference, new Dictionary<string, string>
            {
                { "contentupdate", nameof(this.ContentUpdate) }
            });
            if (base.InteractionOptions != null)
            {
                // Get the events from the base InteractiveLayer
                foreach (var eventMapping in base.InteractionOptions.Events)
                {
                    InteractionOptions.Events.Add(eventMapping.Key, eventMapping.Value);
                }
            }
        }
    }

    #region Events

    [JSInvokable]
    public Task ContentUpdate(LeafletEventArgs args)
    {
        OnContentUpdate?.Invoke(this, args);
        return Task.CompletedTask;
    }

    #endregion
}

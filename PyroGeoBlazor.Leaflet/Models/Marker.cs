namespace PyroGeoBlazor.Leaflet.Models;

using Microsoft.JSInterop;

using PyroGeoBlazor.Leaflet.EventArgs;

using System.Text.Json.Serialization;
using System.Threading.Tasks;

/// <summary>
/// A clickable, draggable icon that can be added to a <see cref="Map"/>
/// <see href="https://leafletjs.com/reference.html#marker"/>
/// </summary>
/// <remarks>
/// Constructs a marker
/// </remarks>
public class Marker : InteractiveLayer
{
    /// <summary>
    /// The initial position of the marker.
    /// </summary>
    [JsonIgnore] public LatLng LatLng { get; }
    /// <summary>
    /// The <see cref="MarkerOptions"/> used to create the marker.
    /// </summary>
    [JsonIgnore] public MarkerOptions Options { get; }

    protected new readonly DomEventHandlerMapping<Marker>? EventHandlerMapping;

    /// <param name="latlng">The initial position of the marker.</param>
    /// <param name="options">The <see cref="MarkerOptions"/> used to create the marker.</param>
    public Marker(LatLng latlng, MarkerOptions options)
    {
        LatLng = latlng;
        Options = options;
        if (Options.EnableEvents)
        {
            var dotnetReference = DotNetObjectReference.Create(this);
            EventHandlerMapping = new DomEventHandlerMapping<Marker>(dotnetReference, new Dictionary<string, string>
            {
                { "move", nameof(this.Move) },
                { "dragstart", nameof(this.DragStart) },
                { "movestart", nameof(this.MoveStart) },
                { "drag", nameof(this.Drag) },
                { "dragend", nameof(this.DragEnd) },
                { "moveend", nameof(this.MoveEnd)   }
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

    /// <inheritdoc/>
    protected override async Task<IJSObjectReference> CreateJsObjectRef()
    {
        if (JSBinder is null)
        {
            throw new System.InvalidOperationException("Cannot create Marker object. No JavaScript binding has been set up for this object.");
        }

        var module = await JSBinder.GetLeafletMapModule();
        return await module.InvokeAsync<IJSObjectReference>("LeafletMap.Marker.createMarker", LatLng, Options, EventHandlerMapping);
        
    }

    #region Events

    public event EventHandler<LeafletEventArgs>? OnMove;

    [JSInvokable]
    public Task Move(LeafletEventArgs args)
    {
        OnMove?.Invoke(this, args);
        return Task.CompletedTask;
    }

    #region Dragging Events

    public event EventHandler<LeafletEventArgs>? OnDragStart;
    public event EventHandler<LeafletEventArgs>? OnMoveStart;
    public event EventHandler<LeafletEventArgs>? OnDrag;
    public event EventHandler<LeafletEventArgs>? OnDragEnd;
    public event EventHandler<LeafletEventArgs>? OnMoveEnd;

    [JSInvokable]
    public Task DragStart(LeafletEventArgs args)
    {
        OnDragStart?.Invoke(this, args);
        return Task.CompletedTask;
    }

    [JSInvokable]
    public Task MoveStart(LeafletEventArgs args)
    {
        OnMoveStart?.Invoke(this, args);
        return Task.CompletedTask;
    }

    [JSInvokable]
    public Task Drag(LeafletEventArgs args)
    {
        OnDrag?.Invoke(this, args);
        return Task.CompletedTask;
    }

    [JSInvokable]
    public Task DragEnd(LeafletDragEndEventArgs args)
    {
        OnDragEnd?.Invoke(this, args);
        return Task.CompletedTask;
    }

    [JSInvokable]
    public Task MoveEnd(LeafletEventArgs args)
    {
        OnMoveEnd?.Invoke(this, args);
        return Task.CompletedTask;
    }

    #endregion

    #endregion
}

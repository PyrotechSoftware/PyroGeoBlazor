namespace PyroGeoBlazor.Leaflet.Models;

using Microsoft.JSInterop;

using PyroGeoBlazor.Leaflet.EventArgs;

using System.Threading.Tasks;

/// <summary>
/// A leaflet Map object, used to create a Map on a page.
/// <see href="https://leafletjs.com/reference.html#map-methods-for-getting-map-state"/>
/// and <see href="https://leafletjs.com/reference.html#map-methods-for-modifying-map-state"/>
/// and <see href="https://leafletjs.com/reference.html#map-geolocation-methods"/>.
/// </summary>
/// <remarks>
/// Constructs a Map.
/// </remarks>
public class Map : InteropObject
{

    /// <summary>
    /// The ID of the HTML element the map will be rendered in.
    /// </summary>
    public string ElementId { get; }

    /// <summary>
    /// The <see cref="MapOptions"/> used to create the Map.
    /// </summary>
    public MapOptions Options { get; }

    /// <summary>
    /// The options for interaction with the Map.
    /// </summary>
    public DomEventHandlerMapping<Map>? InteractionOptions { get; }

    /// <param name="elementId">The ID of the HTML element the map will be rendered in.</param>
    /// <param name="options">The <see cref="MapOptions"/> used to create the Map.</param>
    public Map(string elementId, MapOptions options, bool enableEvents = false)
    {
        ElementId = elementId;
        Options = options;
        if (enableEvents)
        {
            var dotNetReference = DotNetObjectReference.Create(this);
            InteractionOptions = new DomEventHandlerMapping<Map>(dotNetReference, []);
            if (Options.EventOptions.Click)
            {
                InteractionOptions.Events.Add("click", nameof(this.Click));
            }
            if (Options.EventOptions.DoubleClick)
            {
                InteractionOptions.Events.Add("dblclick", nameof(this.DoubleClick));
            }
            if (Options.EventOptions.Resize)
            {
                InteractionOptions.Events.Add("resize", nameof(this.Resize));
            }
            if (Options.EventOptions.ZoomLevelsChange)
            {
                InteractionOptions.Events.Add("zoomlevelschange", nameof(this.ZoomLevelsChange));
            }
            if (Options.EventOptions.ContextMenu)
            {
                InteractionOptions.Events.Add("contextmenu", nameof(this.ContextMenu));
            }
            if (Options.EventOptions.LocationEvents)
            {
                InteractionOptions.Events.Add("locationfound", nameof(this.LocationFound));
                InteractionOptions.Events.Add("locationerror", nameof(this.LocationError));
            }
        }
    }

    /// <inheritdoc/>
    protected override async Task<IJSObjectReference> CreateJsObjectRef()
    {
        GuardAgainstNullBinding("Cannot create Map object. No JavaScript binding has been set up for this object.");
        var module = await JSBinder!.GetLeafletMapModule();
        return await module.InvokeAsync<IJSObjectReference>("LeafletMap.Map.createMap", ElementId, Options, InteractionOptions);
    }

    #region Get map state

    /// <summary>
    /// Gets the point at the centre of the map view.
    /// </summary>
    /// <returns>A <see cref="LatLng"/> representing the geographical centre of the map.</returns>
    public async Task<LatLng> GetCenter()
    {
        return await JSObjectReference!.InvokeAsync<LatLng>("getCenter");
    }

    /// <summary>
    /// Gets the geographical bounds of the map view.
    /// </summary>
    /// <returns>A <see cref="LatLngBounds"/> object representing the geographical bounds of the map.</returns>
    public async Task<LatLngBounds> GetBounds()
    {
        return await JSObjectReference!.InvokeAsync<LatLngBounds>("getBounds");
    }

    /// <summary>
    /// Gets the zoom level of the map view.
    /// </summary>
    /// <returns>The zoom level.</returns>
    public async Task<int> GetZoom()
    {
        return await JSObjectReference!.InvokeAsync<int>("getZoom");
    }

    /// <summary>
    /// Gets the minimum zoom level of the map view.
    /// </summary>
    /// <returns>The minimum zoom level.</returns>
    public async Task<int> GetMinZoom()
    {
        return await JSObjectReference!.InvokeAsync<int>("getMinZoom");
    }

    /// <summary>
    /// Gets the maximum zoom level of the map view.
    /// </summary>
    /// <returns>The maximum zoom level.</returns>
    public async Task<int> GetMaxZoom()
    {
        return await JSObjectReference!.InvokeAsync<int>("getMaxZoom");
    }

    /// <summary>
    /// Gets the maximum zoom level on which the bounds fit the map view.
    /// </summary>
    /// <param name="bounds">The <see cref="LatLngBounds"/> to fit to the map.</param>
    /// <param name="inside">A flag indicating the fit direction. If true, method returns minimum zoom level
    /// on which the map fits into the bounds.</param>
    /// <param name="padding">The padding in pixels.</param>
    /// <returns></returns>
    public async Task<int> GetBoundsZoom(LatLngBounds bounds, bool inside = false, Point? padding = null)
    {
        if (bounds.JSBinder is null)
        {
            await bounds.BindJsObjectReference(JSBinder!);
        }
        bounds.GuardAgainstNullBinding("Cannot get bounds zoom. No JavaScript binding has been set up for the bounds parameter.");
        if (padding is not null)
        {
            if (padding.JSBinder is null)
            {
                await padding.BindJsObjectReference(JSBinder!);
            }
            padding.GuardAgainstNullBinding("Cannot get bounds zoom. No JavaScript binding has been set up for the padding parameter.");
        }
        return await JSObjectReference!.InvokeAsync<int>("getBoundsZoom", bounds.JSObjectReference, inside, padding?.JSObjectReference);
    }

    /// <summary>
    /// Gets the size of the map container in pixels.
    /// </summary>
    /// <returns>A <see cref="Point"/> representing the size of the map container in pixels.</returns>
    public async Task<Point> GetSize()
    {
        return await JSObjectReference!.InvokeAsync<Point>("getSize");
    }

    /// <summary>
    /// Gets the bounds of the map view in projected pixel coordinates.
    /// </summary>
    /// <returns>A <see cref="Bounds"/> representing the size of the map container in pixels.</returns>
    public async Task<Bounds> GetPixelBounds()
    {
        return await JSObjectReference!.InvokeAsync<Bounds>("getPixelBounds");
    }

    /// <summary>
    /// Gets the projected pixel coordinates of the top left point of the map layer.
    /// </summary>
    /// <returns>A <see cref="Point"/> representing top left point of the map in pixels.</returns>
    public async Task<Point> GetPixelOrigin()
    {
        return await JSObjectReference!.InvokeAsync<Point>("getPixelOrigin");
    }

    /// <summary>
    /// Gets the world's bounds in pixel coordinates.
    /// </summary>
    /// <param name="zoom">The zoom level used to calculate the bounds. Current map zoom level is used if null or omitted.</param>
    /// <returns>A <see cref="Bounds"/> representing the size of the map container in pixels.</returns>
    public async Task<Bounds> GetPixelWorldBounds(int? zoom = null)
    {
        return await JSObjectReference!.InvokeAsync<Bounds>("getPixelWorldBounds", zoom);
    }

    #endregion

    #region Set map state

    /// <summary>
    /// Sets the view of the map with the given centre and zoom.
    /// </summary>
    /// <param name="center">A <see cref="LatLng"/> representing the geogrpahical centre of the map.</param>
    /// <param name="zoom">The zoom level of the map.</param>
    /// <returns>The Map.</returns>
    public async Task<Map> SetView(LatLng center, int zoom)
    {
        if (center.JSBinder is null)
        {
            await center.BindJsObjectReference(JSBinder!);
        }
        center.GuardAgainstNullBinding("Cannot set map view. No JavaScript binding has been set up for the center argument.");
        var module = await JSBinder!.GetLeafletMapModule();
        await module.InvokeVoidAsync("LeafletMap.Map.setView", JSObjectReference, center.JSObjectReference, zoom);
        return this;
    }

    /// <summary>
    /// Restricts the map view to the given bounds (see the maxBounds option).
    /// </summary>
    /// <param name="bounds">The bounds to limit the view to.</param>
    /// <returns>The Map.</returns>
    public async Task<Map> SetMaxBounds(LatLngBounds bounds)
    {
        if (bounds.JSBinder is null)
        {
            await bounds.BindJsObjectReference(JSBinder!);
        }

        bounds.GuardAgainstNullBinding("Cannot set map max bounds. No JavaScript binding has been set up for the bounds argument.");
        var module = await JSBinder!.GetLeafletMapModule();
        await module.InvokeVoidAsync("LeafletMap.Map.setMaxBounds", JSObjectReference, bounds.JSObjectReference);
        return this;
    }

    /// <summary>
    /// Pans the map to a given center.
    /// </summary>
    /// <param name="center">The center to pan to.</param>
    /// <param name="zoom">The zoom level.</param>
    /// <param name="options">Options to apply when panning.</param>
    /// <returns>The Map.</returns>
    public async Task<Map> PanTo(LatLng center, int zoom, PanOptions? options)
    {
        if (center.JSBinder is null)
        {
            await center.BindJsObjectReference(JSBinder!);
        }
        center.GuardAgainstNullBinding("Cannot pan map. No JavaScript binding has been set up for the center argument.");
        var module = await JSBinder!.GetLeafletMapModule();
        await module.InvokeVoidAsync("LeafletMap.Map.panTo", JSObjectReference, center.JSObjectReference);
        return this;
    }

    /// <summary>
    /// Sets the view of the map(geographical center and zoom) performing a smooth pan-zoom animation.
    /// </summary>
    /// <param name="center">The <see cref="LatLng"/> coordinates of the center to fly to.</param>
    /// <param name="zoom">The zoom level.</param>
    /// <param name="options">The <see cref="ZoomPanOptions"/> to apply if any.</param>
    /// <returns>The Map.</returns>
    public async Task<Map> FlyTo(LatLng center, int zoom, ZoomPanOptions? options = null)
    {
        if (center.JSBinder is null)
        {
            await center.BindJsObjectReference(JSBinder!);
        }
        center.GuardAgainstNullBinding("Cannot fly map. No JavaScript binding has been set up for the center argument.");
        var module = await JSBinder!.GetLeafletMapModule();
        await module.InvokeVoidAsync("LeafletMap.Map.flyTo", JSObjectReference, center.JSObjectReference, zoom, options);
        return this;
    }

    /// <summary>
    /// Stops the currently running PanTo or FlyTo animation, if any.
    /// </summary>
    /// <returns>The Map.</returns>
    public async Task<Map> Stop()
    {
        return await JSObjectReference!.InvokeAsync<Map>("stop");
    }

    #endregion

    #region Geolocation methods

    /// <summary>
    /// Tries to locate the user using the Geolocation API,
    /// firing a locationfound event with location data on success or a locationerror event on failure,
    /// and optionally sets the map view to the user's location with respect to detection accuracy (or to the world view if geolocation failed).
    /// Note that, if your page doesn't use HTTPS, this method will fail in modern browsers (Chrome 50 and newer)
    /// See <see cref="LocateOptions"/> for more details.
    /// </summary>
    /// <param name="options">The options to apply.</param>
    /// <returns>The Map.</returns>
    public async Task<Map> Locate(LocateOptions? options = null)
    {
        var module = await JSBinder!.GetLeafletMapModule();
        await module.InvokeVoidAsync("LeafletMap.Map.locate", JSObjectReference, options);
        return this;
    }

    /// <summary>
    /// Stops watching location previously initiated by Map.Locate({ Watch = true })
    /// and aborts resetting the map view if Map.Locate was called with { SetView = true}.
    /// </summary>
    /// <returns>The Map.</returns>
    public async Task<Map> StopLocate()
    {
        return await JSObjectReference!.InvokeAsync<Map>("stopLocate");
    }

    #endregion

    #region Events

    #region MapStateChangeEvents

    /// <summary>
    /// Fired when the map is resized.
    /// </summary>
    public event EventHandler<LeafletResizeEventArgs>? OnResize;
    public event EventHandler<LeafletEventArgs>? OnZoomLevelsChange;

    [JSInvokable]
    public Task ZoomLevelsChange(LeafletEventArgs args)
    {
        OnZoomLevelsChange?.Invoke(this, args);
        return Task.CompletedTask;
    }

    [JSInvokable]
    public Task Resize(LeafletResizeEventArgs args)
    {
        OnResize?.Invoke(this, args);
        return Task.CompletedTask;
    }

    #endregion

    #region InteractionEvents

    /// <summary>
    /// Fired when the user clicks (or taps) the map.
    /// </summary>
    public event EventHandler<LeafletMouseEventArgs>? OnClick;

    /// <summary>
    /// Fired when the user double-clicks (or double-taps) the map.
    /// </summary>
    public event EventHandler<LeafletMouseEventArgs>? OnDoubleClick;

    /// <summary>
    /// Fired when the user pushes the right mouse button on the map,
    /// prevents default browser context menu from showing if there are listeners on this event.
    /// Also fired on mobile when the user holds a single touch for a second (also called long press).
    /// </summary>
    public event EventHandler<LeafletMouseEventArgs>? OnContextMenu;

    [JSInvokable]
    public Task Click(LeafletMouseEventArgs args)
    {
        OnClick?.Invoke(this, args);
        return Task.CompletedTask;
    }

    [JSInvokable]
    public Task DoubleClick(LeafletMouseEventArgs args)
    {
        OnDoubleClick?.Invoke(this, args);
        return Task.CompletedTask;
    }

    [JSInvokable]
    public Task ContextMenu(LeafletMouseEventArgs args)
    {
        OnContextMenu?.Invoke(this, args);
        return Task.CompletedTask;
    }
    #endregion

    #region LocationEvents

    public event EventHandler<LeafletLocationEventArgs>? OnLocationFound;
    public event EventHandler<LeafletErrorEventArgs>? OnLocationError;

    [JSInvokable]
    public Task LocationFound(LeafletLocationEventArgs args)
    {
        OnLocationFound?.Invoke(this, args);
        return Task.CompletedTask;
    }

    [JSInvokable]
    public Task LocationError(LeafletErrorEventArgs args)
    {
        OnLocationError?.Invoke(this, args);
        return Task.CompletedTask;
    }

    #endregion

    #endregion
}

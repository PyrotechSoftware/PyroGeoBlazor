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
    protected readonly DomEventHandlerMapping<Map>? EventHandlerMapping;

    /// <param name="elementId">The ID of the HTML element the map will be rendered in.</param>
    /// <param name="options">The <see cref="MapOptions"/> used to create the Map.</param>
    public Map(string elementId, MapOptions options, bool enableEvents = false)
    {
        ElementId = elementId;
        Options = options;
        if (enableEvents)
        {
            var dotNetReference = DotNetObjectReference.Create(this);
            EventHandlerMapping = new DomEventHandlerMapping<Map>(dotNetReference, []);
            if (Options.EventOptions.Click)
            {
                EventHandlerMapping.Events.Add("click", nameof(this.Click));
            }
            if (Options.EventOptions.DoubleClick)
            {
                EventHandlerMapping.Events.Add("dblclick", nameof(this.DoubleClick));
            }
            if (Options.EventOptions.Resize)
            {
                EventHandlerMapping.Events.Add("resize", nameof(this.Resize));
            }
            if (Options.EventOptions.ZoomLevelsChange)
            {
                EventHandlerMapping.Events.Add("zoomlevelschange", nameof(this.ZoomLevelsChange));
            }
            if (Options.EventOptions.ContextMenu)
            {
                EventHandlerMapping.Events.Add("contextmenu", nameof(this.ContextMenu));
            }
            if (Options.EventOptions.LocationEvents)
            {
                EventHandlerMapping.Events.Add("locationfound", nameof(this.LocationFound));
                EventHandlerMapping.Events.Add("locationerror", nameof(this.LocationError));
            }
            // Always subscribe to zoomend and moveend for WFS auto-refresh and other features
            EventHandlerMapping.Events.Add("zoomend", nameof(this.ZoomEnd));
            EventHandlerMapping.Events.Add("moveend", nameof(this.MoveEnd));
        }
    }

    /// <inheritdoc/>
    protected override async Task<IJSObjectReference> CreateJsObjectRef()
    {
        GuardAgainstNullBinding("Cannot create Map object. No JavaScript binding has been set up for this object.");
        var module = await JSBinder!.GetLeafletMapModule();
        return await module.InvokeAsync<IJSObjectReference>("LeafletMap.Map.createMap", ElementId, Options, EventHandlerMapping);
    }

    #region Methods

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
    /// Gets the zoom level of the map view.
    /// </summary>
    /// <returns>The zoom level.</returns>
    public async Task<int> GetZoom()
    {
        return await JSObjectReference!.InvokeAsync<int>("getZoom");
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

    #region Conversion Methods

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
        GuardAgainstNullBinding("Cannot set view. No JavaScript binding has been setup for this Map object.");
        await JSObjectReference!.InvokeVoidAsync("setView", center, zoom);
        return this;
    }

    /// <summary>
    /// Set the zoom of the map.
    /// </summary>
    /// <param name="zoom">The zoom level to set.</param>
    /// <param name="options">(Optional) <see cref="ZoomPanOptions"/> to apply.</param>
    /// <returns></returns>
    public async Task<Map> SetZoom(int zoom, ZoomPanOptions? options = null)
    {
        GuardAgainstNullBinding("Cannot set map zoom. No JavaScript binding has been setup for the map");
        await JSObjectReference!.InvokeVoidAsync("setZoom", zoom, options);
        return this;
    }

    /// <summary>
    /// Increases the zoom of the map by the delta.
    /// Default of 1.
    /// </summary>
    /// <param name="delta">The delta.</param>
    /// <param name="options">(Optional) <see cref="ZoomOptions"/>.</param>
    public async Task<Map> ZoomIn(int delta = 1, ZoomOptions? options = null)
    {
        GuardAgainstNullBinding("Cannot zoom in. No JavaScript binding has been setup for the map");
        await JSObjectReference!.InvokeVoidAsync("zoomIn", delta, options);
        return this;
    }

    /// <summary>
    /// Decreases the zoom of the map by the delta.
    /// Default of 1.
    /// </summary>
    /// <param name="delta">The delta.</param>
    /// <param name="options">(Optional) <see cref="ZoomOptions"/>.</param>
    public async Task<Map> ZoomOut(int delta = 1, ZoomOptions? options = null)
    {
        GuardAgainstNullBinding("Cannot zoom out. No JavaScript binding has been setup for the map");
        await JSObjectReference!.InvokeVoidAsync("zoomOut", delta, options);
        return this;
    }

    /// <summary>
    /// Zooms the map while keeping a specified geographical point on the map stationary
    /// (e.g. used internally for scroll zoom and double-click zoom).
    /// </summary>
    /// <param name="latLng">The coordinates of the point to keep stationary.</param>
    /// <param name="zoom">The zoom to set it to.</param>
    /// <param name="options">The <see cref="ZoomOptions"/>.</param>
    /// <returns></returns>
    public async Task<Map> SetZoomAround(LatLng latLng, int zoom, ZoomOptions options)
    {
        GuardAgainstNullBinding("Cannot zoom around. No JavaScript binding has been setup for the map.");
        await JSObjectReference!.InvokeVoidAsync("setZoomAround", latLng, zoom, options);
        return this;
    }

    /// <summary>
    /// Zooms the map while keeping a specified pixel on the map (relative to the top-left corner) stationary.
    /// </summary>
    /// <param name="offset">The point on the map to keep stationary.</param>
    /// <param name="zoom">set the zoom.</param>
    /// <param name="options">The <see cref="ZoomOptions"/>.</param>
    /// <returns></returns>
    public async Task<Map> SetZoomAround(Point offset, int zoom, ZoomOptions options)
    {
        GuardAgainstNullBinding("Cannot set zoom around. No JavaScript binding has been setup for the map.");
        await JSObjectReference!.InvokeVoidAsync("setZoomAround", offset, zoom, options);
        return this;
    }

    /// <summary>
    /// Sets a map view that contains the given geographical bounds with the maximum zoom level possible.
    /// </summary>
    /// <param name="bounds">The bounds to fit the map to.</param>
    /// <param name="options">The (Optional) <see cref="FitBoundsOptions"/>.</param>
    /// <returns></returns>
    public async Task<Map> FitBounds(LatLngBounds bounds, FitBoundsOptions? options = null)
    {
        GuardAgainstNullBinding("Cannot fit bounds. No JavaScript binding has been setup for the map.");
        await JSObjectReference!.InvokeVoidAsync("fitBounds", bounds, options);
        return this;
    }

    /// <summary>
    /// Sets a map view that mostly contains the whole world with the maximum zoom level possible.
    /// </summary>
    /// <param name="options">The (Optional) <see cref="FitBoundsOptions"/>.</param>
    /// <returns></returns>
    public async Task<Map> FitWorld(FitBoundsOptions? options = null)
    {
        GuardAgainstNullBinding("Cannot fit world. No JavaScript binding has been setup for the map.");
        await JSObjectReference!.InvokeVoidAsync("fitWorld", options);
        return this;
    }

    /// <summary>
    /// Pans the map to a given center.
    /// </summary>
    /// <param name="center">The center to pan to.</param>
    /// <param name="options">Options to apply when panning.</param>
    /// <returns>The Map.</returns>
    public async Task<Map> PanTo(LatLng center, PanOptions? options = null)
    {
        if (center.JSBinder is null)
        {
            await center.BindJsObjectReference(JSBinder!);
        }
        center.GuardAgainstNullBinding("Cannot pan map. No JavaScript binding has been set up for the center argument.");
        await JSObjectReference!.InvokeVoidAsync("panTo", center, options);
        return this;
    }

    /// <summary>
    /// Pans the map by a given number of pixels (animated).
    /// </summary>
    /// <param name="offset">The <see cref="Point"/> indicating the offset.</param>
    /// <param name="options">The (Optional) <see cref="PanOptions"/>.</param>
    /// <returns></returns>
    public async Task<Map> PanBy(Point offset, PanOptions? options = null)
    {
        if (offset.JSBinder is null)
        {
            await offset.BindJsObjectReference(JSBinder!);
        }
        offset.GuardAgainstNullBinding("Cannot pan map. No JavaScript binding has been set up for the offset argument.");
        await JSObjectReference!.InvokeVoidAsync("panBy", offset, options);
        return this;
    }

    /// <summary>
    /// Sets the view of the map(geographical center and zoom) performing a smooth pan-zoom animation.
    /// </summary>
    /// <param name="latLng">The <see cref="LatLng"/> coordinates of the center to fly to.</param>
    /// <param name="zoom">The zoom level.</param>
    /// <param name="options">The <see cref="ZoomPanOptions"/> to apply if any.</param>
    /// <returns>The Map.</returns>
    public async Task<Map> FlyTo(LatLng latLng, int? zoom, ZoomPanOptions? options = null)
    {
        if (latLng.JSBinder is null)
        {
            await latLng.BindJsObjectReference(JSBinder!);
        }
        latLng.GuardAgainstNullBinding("Cannot fly map. No JavaScript binding has been set up for the center argument.");
        await JSObjectReference!.InvokeVoidAsync("flyTo", latLng, zoom, options);
        return this;
    }

    /// <summary>
    /// Sets the view of the map with a smooth animation like flyTo,
    /// but takes a bounds parameter like fitBounds.
    /// </summary>
    /// <param name="bounds">The <see cref="LatLngBounds"/>.</param>
    /// <param name="options">The (Optional) <see cref="FitBoundsOptions"/>.</param>
    public async Task<Map> FlyToBounds(LatLngBounds bounds, FitBoundsOptions? options = null)
    {
        GuardAgainstNullBinding("Cannot fly to bounds. No JavaScript binding has been setup for the map.");
        await JSObjectReference!.InvokeVoidAsync("flyToBounds", bounds, options);
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
        await JSObjectReference!.InvokeVoidAsync("setMaxBounds", bounds);
        return this;
    }

    /// <summary>
    /// Sets the lower limit for the available zoom levels (see the minZoom option).
    /// </summary>
    /// <param name="zoom">The zoom level.</param>
    public async Task<Map> SetMinZoom(int zoom)
    {
        GuardAgainstNullBinding("Cannot set map min zoom. No JavaScript binding has been set up for this Map object.");
        await JSObjectReference!.InvokeVoidAsync("setMinZoom", zoom);
        return this;
    }

    /// <summary>
    /// Sets the upper limit for the available zoom levels (see the maxZoom option).
    /// </summary>
    /// <param name="zoom">The zoom</param>
    public async Task<Map> SetMaxZoom(int zoom)
    {
        GuardAgainstNullBinding("Cannot set map max zoom. No JavaScript binding has been set up for this Map object.");
        await JSObjectReference!.InvokeVoidAsync("setMaxZoom", zoom);
        return this;
    }

    /// <summary>
    /// Pans the map to the closest view that would lie inside the given bounds (if it's not already),
    /// controlling the animation using the options specific, if any.
    /// </summary>
    /// <param name="bounds">The <see cref="LatLngBounds"/>.</param>
    /// <param name="options">The (Optional) <see cref="PanOptions"/>.</param>
    public async Task<Map> PanInsideBounds(LatLngBounds bounds, PanOptions? options = null)
    {
        GuardAgainstNullBinding("Cannot pan inside bounds. No JavaScript binding has been set up for this Map object.");
        await JSObjectReference!.InvokeVoidAsync("panInsideBounds", bounds, options);
        return this;
    }

    /// <summary>
    /// Pans the map the minimum amount to make the latlng visible.
    /// Use padding options to fit the display to more restricted bounds.
    /// If latlng is already within the (optionally padded) display bounds, the map will not be panned.
    /// </summary>
    /// <param name="latLng">The <see cref="LatLng"/>.</param>
    /// <param name="options">The (Optional) <see cref="PaddingOptions"/>.</param>
    public async Task<Map> PanInside(LatLng latLng, PaddingOptions? options = null)
    {
        GuardAgainstNullBinding("Cannot pan inside. No JavaScript binding has been set up for this Map object.");
        await JSObjectReference!.InvokeVoidAsync("panInside", latLng, options);
        return this;
    }

    /// <summary>
    /// Checks if the map container size changed and updates the map if so
    /// — call it after you've changed the map size dynamically, also animating pan by default.
    /// If options.pan is false, panning will not occur.
    /// If options.debounceMoveend is true, it will delay moveend event
    /// so that it doesn't happen often even if the method is called many times in a row.
    /// </summary>
    /// <param name="animate"></param>
    /// <returns></returns>
    public async Task<Map> InvalidateSize(ZoomPanOptions options)
    {
        GuardAgainstNullBinding("Cannot invalidate size. No JavaScript binding has been set up for this Map object.");
        await JSObjectReference!.InvokeVoidAsync("invalidateSize", options);
        return this;
    }

    /// <summary>
    /// Checks if the map container size changed and updates the map if so
    /// — call it after you've changed the map size dynamically, also animating pan by default.
    /// </summary>
    /// <param name="animate">Whether to animate or not.</param>
    public async Task<Map> InvalidateSize(bool animate = true)
    {
        GuardAgainstNullBinding("Cannot invalidate size. No JavaScript binding has been set up for this Map object.");
        await JSObjectReference!.InvokeVoidAsync("invalidateSize", animate);
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
        GuardAgainstNullBinding("Cannot locate. No JavaScript binding has been setup for this Map object.");
        await JSObjectReference!.InvokeVoidAsync("locate", options);
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

    #region Layers and Controls

    /// <summary>
    /// Adds the given control to the map.
    /// </summary>
    /// <param name="control">The control to be added.</param>
    public async Task<Map> AddControl(Control control)
    {
        GuardAgainstNullBinding("Cannot add control to map. No JavaScript binding has been set up for this Map object.");
        if (control.JSObjectReference is null)
        {
            await control.BindJsObjectReference(JSBinder!);
        }

        await JSObjectReference!.InvokeVoidAsync("addControl", control.JSObjectReference);
        return this;
    }

    /// <summary>
    /// Removes the given control from the map.
    /// </summary>
    /// <param name="control">The control to remove from the map.</param>
    public async Task<Map> RemoveControl(Control control)
    {
        GuardAgainstNullBinding("Cannot remove control from map. No JavaScript binding has been set up for this Map object.");
        await JSObjectReference!.InvokeVoidAsync("removeControl", control);
        return this;
    }

    /// <summary>
    /// Adds the given layer to the map
    /// </summary>
    /// <param name="layer">The layer to add to the map.</param>
    /// <returns>The Map.</returns>
    public async Task<Map> AddLayer(Layer layer)
    {
        GuardAgainstNullBinding("Cannot add layer to map. No JavaScript binding has been set up for this Map object.");
        if (layer.JSBinder is null)
        {
            await layer.BindJsObjectReference(JSBinder!);
        }
        await JSObjectReference!.InvokeVoidAsync("addLayer", layer);
        return this;
    }

    /// <summary>
    /// Removes the given layer from the map.
    /// </summary>
    /// <param name="layer">The layer to remove.</param>
    /// <returns>The Map.</returns>
    public async Task<Map> RemoveLayer(Layer layer)
    {
        GuardAgainstNullBinding("Cannot remove layer from map. No JavaScript binding has been set up for this Map object.");
        await JSObjectReference!.InvokeVoidAsync("removeLayer", layer);
        return this;
    }

    /// <summary>
    /// Returns true if the given layer is currently added to the map
    /// </summary>
    /// <param name="layer">The given layer.</param>
    public async Task<bool> HasLayer(Layer layer)
    {
        GuardAgainstNullBinding("Cannot check for layer on map. No JavaScript binding has been set up for this Map object.");
        return await JSObjectReference!.InvokeAsync<bool>("hasLayer", layer.JSObjectReference);
    }

    /// <summary>
    /// Iterates over the layers of the map, optionally specifying context of the iterator function.
    /// </summary>
    /// <param name="fn"></param>
    /// <exception cref="NotImplementedException">This method is not implemented yet.</exception>
    public Task<Map> EachLayer(Func<Layer, Task> fn)
    {
        throw new NotImplementedException();
    }

    /// <summary>
    /// Opens the specified popup while closing the previously opened (to make sure only one is opened at one time for usability).
    /// </summary>
    /// <param name="popup">The popup to open.</param>
    public async Task<Map> OpenPopup(Popup popup)
    {
        if (popup.JSBinder is null)
        {
            await popup.BindJsObjectReference(JSBinder!);
        }
        GuardAgainstNullBinding("Cannot open popup on map. No JavaScript binding has been set up for this Map object.");
        await JSObjectReference!.InvokeVoidAsync("openPopup", popup);
        return this;
    }

    /// <summary>
    /// Closes the popup previously opened with openPopup(or the given one).
    /// </summary>
    /// <param name="popup">(Optional) The popup to close.</param>
    public async Task<Map> ClosePopup(Popup? popup = null)
    {
        GuardAgainstNullBinding("Cannot close popup on map. No JavaScript binding has been set up for this Map object.");
        await JSObjectReference!.InvokeVoidAsync("closePopup", popup?.JSObjectReference);
        return this;
    }

    /// <summary>
    /// Opens the specified tooltip.
    /// </summary>
    /// <param name="tooltip">The tooltip to open.</param>
    public async Task<Map> OpenTooltip(Tooltip tooltip)
    {
        GuardAgainstNullBinding("Cannot open tooltip on map. No JavaScript binding has been set up for this Map object.");
        await JSObjectReference!.InvokeVoidAsync("openTooltip", tooltip);
        return this;
    }

    /// <summary>
    /// Closes the given tooltip.
    /// </summary>
    /// <param name="tooltip">The tooltip to close.</param>
    public async Task<Map> CloseTooltip(Tooltip tooltip)
    {
        GuardAgainstNullBinding("Cannot close tooltip on map. No JavaScript binding has been set up for this Map object.");
        await JSObjectReference!.InvokeVoidAsync("closeTooltip", tooltip);
        return this;
    }

    #endregion

    #region Other Methods

    /// <summary>
    /// Destroys the map and clears all related event handlers.
    /// </summary>
    public async Task Remove()
    {
        GuardAgainstNullBinding("Cannot remove the map. No JavaScript binding has been set up for this Map object");
        await JSObjectReference!.InvokeVoidAsync("remove");
        await DisposeAsync();
    }

    /// <summary>
    /// Creates a new map pane with the given name if it doesn't exist already, then returns it.
    /// The pane is created as a child of container, or as a child of the main map pane if not set.
    /// </summary>
    /// <param name="name">The name of the pane to create.</param>
    /// <param name="container">The (Optional) container to create it in.</param>
    public async Task<object> CreatePane(string name, object? container)
    {
        GuardAgainstNullBinding("Cannot create pane. No JavaScript binding has been set up for this Map object");
        return await JSObjectReference!.InvokeAsync<object>("createPane", name, container);
    }

    /// <summary>
    /// Returns a map pane.
    /// </summary>
    /// <param name="name">The name of the map pane to get.</param>
    public async Task<object> GetPane(string name)
    {
        GuardAgainstNullBinding("Cannot get pane. No JavaScript binding has been set up for this Map object");
        return await JSObjectReference!.InvokeAsync<object>("getPane", name);
    }

    /// <summary>
    /// Returns a plain object containing the names of all panes as keys and the panes as values.
    /// </summary>
    public async Task<object> GetPanes()
    {
        GuardAgainstNullBinding("Cannot get pane. No JavaScript binding has been set up for this Map object");
        return await JSObjectReference!.InvokeAsync<object>("getPanes");
    }

    /// <summary>
    /// Returns the HTML element that contains the map.
    /// </summary>
    public async Task<object> GetContainer()
    {
        GuardAgainstNullBinding("Cannot get pane. No JavaScript binding has been set up for this Map object");
        return await JSObjectReference!.InvokeAsync<object>("getContainer");
    }

    public Task<Map> WhenReady()
    {
        throw new NotImplementedException();
    }

    #endregion

    #endregion

    #region Events

    #region MapStateChangeEvents

    /// <summary>
    /// Fired when the map is resized.
    /// </summary>
    public event EventHandler<LeafletResizeEventArgs>? OnResize;
    public event EventHandler<LeafletEventArgs>? OnZoomLevelsChange;
    
    /// <summary>
    /// Fired when the map zoom animation ended.
    /// </summary>
    public event EventHandler<LeafletEventArgs>? OnZoomEnd;
    
    /// <summary>
    /// Fired when the center of the map stops changing (e.g. user stopped dragging the map).
    /// </summary>
    public event EventHandler<LeafletEventArgs>? OnMoveEnd;

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
    
    [JSInvokable]
    public Task ZoomEnd(LeafletEventArgs args)
    {
        OnZoomEnd?.Invoke(this, args);
        return Task.CompletedTask;
    }
    
    [JSInvokable]
    public Task MoveEnd(LeafletEventArgs args)
    {
        OnMoveEnd?.Invoke(this, args);
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

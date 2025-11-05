namespace PyroGeoBlazor.Leaflet.Models;

using Microsoft.JSInterop;

using PyroGeoBlazor.Leaflet.EventArgs;

using System.Threading.Tasks;

/// <summary>
/// Generic class for handling a tiled grid of HTML elements.
/// This is the base class for all tile layers and replaces TileLayer.Canvas.
/// GridLayer can be extended to create a tiled grid of HTML elements like <canvas>, <img> or <div>.
/// GridLayer will handle creating and animating these DOM elements for you.
/// <see href="https://leafletjs.com/reference.html#gridlayer"/>
/// </summary>
public class GridLayer : Layer
{
    protected new DomEventHandlerMapping<GridLayer>? EventHandlerMapping;

    public GridLayer(GridLayerOptions? options) : base(options)
    {
        Options = options;
        if (Options == null || Options.EventsEnabled)
        {
            var dotNetObjectRef = DotNetObjectReference.Create(this);
            EventHandlerMapping = new DomEventHandlerMapping<GridLayer>(dotNetObjectRef, new Dictionary<string, string>
            {
                { "loading", nameof(this.Loading) },
                { "tileunload", nameof(this.TileUnload) },
                { "tileloadstart", nameof(this.TileLoadStart) },
                { "tileerror", nameof(this.TileError) },
                { "tileload", nameof(this.TileLoad) },
                { "load", nameof(this.Load) }
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

    public GridLayerOptions? Options { get; }

    protected override async Task<IJSObjectReference> CreateJsObjectRef()
    {
        if (JSBinder is null)
        {
            throw new System.InvalidOperationException("Cannot create GridLayer object. No JavaScript binding has been set up for this object.");
        }

        var module = await JSBinder.GetLeafletMapModule();
        return await module.InvokeAsync<IJSObjectReference>("LeafletMap.GridLayer.createGridLayer", Options);
    }

    #region Events

    public event EventHandler<LeafletEventArgs>? OnLoading;
    public event EventHandler<LeafletTileEventArgs>? OnTileUnload;
    public event EventHandler<LeafletTileEventArgs>? OnTileLoadStart;
    public event EventHandler<LeafletTileErrorEventArgs>? OnTileError;
    public event EventHandler<LeafletTileEventArgs>? OnTileLoad;
    public event EventHandler<LeafletEventArgs>? OnLoad;

    [JSInvokable]
    public Task Loading(LeafletEventArgs args)
    {
        OnLoading?.Invoke(this, args);
        return Task.CompletedTask;
    }

    [JSInvokable]
    public Task TileUnload(LeafletTileEventArgs args)
    {
        OnTileUnload?.Invoke(this, args);
        return Task.CompletedTask;
    }

    [JSInvokable]
    public Task TileLoadStart(LeafletTileEventArgs args)
    {
        OnTileLoadStart?.Invoke(this, args);
        return Task.CompletedTask;
    }

    [JSInvokable]
    public Task TileError(LeafletTileErrorEventArgs args)
    {
        OnTileError?.Invoke(this, args);
        return Task.CompletedTask;
    }

    [JSInvokable]
    public Task TileLoad(LeafletTileEventArgs args)
    {
        OnTileLoad?.Invoke(this, args);
        return Task.CompletedTask;
    }

    [JSInvokable]
    public Task Load(LeafletEventArgs args)
    {
        OnLoad?.Invoke(this, args);
        return Task.CompletedTask;
    }

    #endregion

    #region Methods

    /// <summary>
    /// Brings the tile layer to the top of all tile layers.
    /// </summary>
    public async Task<GridLayer> BringToFront()
    {
        if (JSObjectReference == null)
        {
            throw new System.InvalidOperationException("Cannot call BringToFront. The GridLayer JavaScript object reference is null.");
        }
        await JSObjectReference.InvokeVoidAsync("bringToFront");
        return this;
    }

    /// <summary>
    /// Brings the tile layer to the bottom of all tile layers.
    /// </summary>
    public async Task<GridLayer> BringToBack()
    {
        if (JSObjectReference == null)
        {
            throw new System.InvalidOperationException("Cannot call BringToBack. The GridLayer JavaScript object reference is null.");
        }
        await JSObjectReference.InvokeVoidAsync("bringToBack");
        return this;
    }

    /// <summary>
    /// Returns the HTML element that contains the tiles for this layer.
    /// </summary>
    public async Task<object> GetContainer()
    {
        if (JSObjectReference == null)
        {
            throw new System.InvalidOperationException("Cannot call GetContainer. The GridLayer JavaScript object reference is null.");
        }
        return await JSObjectReference.InvokeAsync<object>("getContainer");
    }

    /// <summary>
    /// Changes the opacity of the grid layer.
    /// </summary>
    /// <param name="opacity">The new opacity</param>
    public async Task<GridLayer> SetOpacity(double opacity)
    {
        if (JSObjectReference == null)
        {
            throw new System.InvalidOperationException("Cannot call SetOpacity. The GridLayer JavaScript object reference is null.");
        }
        await JSObjectReference.InvokeVoidAsync("setOpacity", opacity);
        return this;
    }

    /// <summary>
    /// Changes the zIndex of the grid layer.
    /// </summary>
    /// <param name="zIndex">The new zIndex</param>
    public async Task<GridLayer> SetZIndex(int zIndex)
    {
        if (JSObjectReference == null)
        {
            throw new System.InvalidOperationException("Cannot call SetZIndex. The GridLayer JavaScript object reference is null.");
        }
        await JSObjectReference.InvokeVoidAsync("setZIndex", zIndex);
        return this;
    }

    /// <summary>
    /// Returns true if any tile in the grid layer has not finished loading.
    /// </summary>
    public async Task<bool> IsLoading()
    {
        if (JSObjectReference == null)
        {
            throw new System.InvalidOperationException("Cannot call IsLoading. The GridLayer JavaScript object reference is null.");
        }
        return await JSObjectReference.InvokeAsync<bool>("isLoading");
    }

    /// <summary>
    /// Causes the layer to clear all the tiles and request them again.
    /// </summary>
    public async Task<GridLayer> Redraw()
    {
        if (JSObjectReference == null)
        {
            throw new System.InvalidOperationException("Cannot call Redraw. The GridLayer JavaScript object reference is null.");
        }
        await JSObjectReference.InvokeVoidAsync("redraw");
        return this;
    }

    /// <summary>
    /// Normalizes the tileSize option into a point.Used by the createTile() method.
    /// </summary>
    public async Task<Point> GetTileSize()
    {
        if (JSObjectReference == null)
        {
            throw new System.InvalidOperationException("Cannot call GetTileSize. The GridLayer JavaScript object reference is null.");
        }
        return await JSObjectReference.InvokeAsync<Point>("getTileSize");
    }

    #endregion
}

namespace PyroGeoBlazor.Leaflet.Models;

using Microsoft.JSInterop;

using PyroGeoBlazor.Leaflet.EventArgs;

using System.Text.Json.Serialization;
using System.Threading.Tasks;

/// <summary>
/// A raster <see cref="Layer"/> used to display tiled images.
/// <see href="https://leafletjs.com/reference-1.7.1.html#tilelayer"/>
/// </summary>
/// <remarks>
/// Constructs a TileLayer
/// </remarks>
public class TileLayer : GridLayer
{
    /// <summary>
    /// A URL template string with formatting options for subdomain, zoom level, coordinates, and resolution.
    /// </summary>
    /// <example>
    /// <code>
    /// http://{s}.somedomain.com/blabla/{z}/{x}/{y}{r}.png
    /// </code>
    /// </example>
    [JsonIgnore] public string UrlTemplate { get; }

    /// <summary>
    /// The <see cref="TileLayerOptions"/> used to create the TileLayer.
    /// </summary>
    [JsonIgnore] public new TileLayerOptions? Options { get; }

    [JsonIgnore]
    protected new readonly DomEventHandlerMapping<TileLayer>? EventHandlerMapping;

    /// <param name="urlTemplate">A URL template string with formatting options for subdomain, zoom level, coordinates, and resolution.</param>
    /// <param name="options">The <see cref="TileLayerOptions"/> used to create the TileLayer.</param>
    public TileLayer(string urlTemplate, TileLayerOptions? options = null) : base(options)
    {
        UrlTemplate = urlTemplate;
        Options = options;
        if (Options == null || Options.EventsEnabled)
        {
            var dotNetObjectRef = DotNetObjectReference.Create(this);
            EventHandlerMapping = new DomEventHandlerMapping<TileLayer>(dotNetObjectRef, new Dictionary<string, string>
            {
                { "tileabort", nameof(this.TileAbort) }
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
            throw new System.InvalidOperationException("Cannot create TileLayer object. No JavaScript binding has been set up for this object.");
        }

        var module = await JSBinder.GetLeafletMapModule();
        return await module.InvokeAsync<IJSObjectReference>("LeafletMap.TileLayer.createTileLayer", UrlTemplate, Options, EventHandlerMapping);
    }

    #region Events

    public event EventHandler<LeafletTileEventArgs>? OnTileAbort;

    [JSInvokable]
    public Task TileAbort(LeafletTileEventArgs args)
    {
        OnTileAbort?.Invoke(this, args);
        return Task.CompletedTask;
    }

    #endregion

    #region Methods

    public async Task<TileLayer> SetUrl(string url, bool? noRedraw = null)
    {
        if (JSObjectReference == null)
        {
            throw new System.InvalidOperationException("Cannot call SetUrl. The JavaScript object reference has not been created yet.");
        }
        await JSObjectReference.InvokeVoidAsync("setUrl", url, noRedraw);
        return this;
    }

    public async Task<string> GetTileUrl(LatLng coords)
    {
        if (JSObjectReference == null)
        {
            throw new System.InvalidOperationException("Cannot call GetTileUrl. The JavaScript object reference has not been created yet.");
        }
        return await JSObjectReference.InvokeAsync<string>("getTileUrl", coords);
    }

    #endregion
}

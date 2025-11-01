namespace PyroGeoBlazor.Leaflet.Models;

using Microsoft.JSInterop;

using System.Text.Json.Serialization;
using System.Threading.Tasks;

/// <summary>
/// A raster <see cref="Layer"/> used to display tiled images.
/// <see href="https://leafletjs.com/reference-1.7.1.html#tilelayer"/>
/// </summary>
/// <remarks>
/// Constructs a TileLayer
/// </remarks>
/// <param name="urlTemplate">A URL template string with formatting options for subdomain, zoom level, coordinates, and resolution.</param>
/// <param name="options">The <see cref="TileLayerOptions"/> used to create the TileLayer.</param>
public class TileLayer(string urlTemplate, TileLayerOptions options) : Layer
{
    /// <summary>
    /// A URL template string with formatting options for subdomain, zoom level, coordinates, and resolution.
    /// </summary>
    /// <example>
    /// <code>
    /// http://{s}.somedomain.com/blabla/{z}/{x}/{y}{r}.png
    /// </code>
    /// </example>
    [JsonIgnore] public string UrlTemplate { get; } = urlTemplate;
    /// <summary>
    /// The <see cref="TileLayerOptions"/> used to create the TileLayer.
    /// </summary>
    [JsonIgnore] public TileLayerOptions Options { get; } = options;

    /// <inheritdoc/>
    protected override async Task<IJSObjectReference> CreateJsObjectRef()
    {
        return JSBinder is null
            ? throw new System.InvalidOperationException("Cannot create TileLayer object. No JavaScript binding has been set up for this object.")
            : await JSBinder.JSRuntime.InvokeAsync<IJSObjectReference>("L.tileLayer", UrlTemplate, Options);
    }
}

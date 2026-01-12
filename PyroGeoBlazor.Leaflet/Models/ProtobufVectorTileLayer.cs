namespace PyroGeoBlazor.Leaflet.Models;

using Microsoft.JSInterop;

using System.Text.Json.Serialization;

/// <summary>
/// A vector tile layer that displays Protobuf-encoded vector tiles (MVT/PBF) using the Leaflet.VectorGrid plugin.
/// <see href="https://github.com/Leaflet/Leaflet.VectorGrid"/>
/// </summary>
public class ProtobufVectorTileLayer : VectorTileLayer
{
    /// <summary>
    /// The <see cref="ProtobufVectorTileLayerOptions"/> used to create the layer.
    /// </summary>
    [JsonIgnore]
    public new ProtobufVectorTileLayerOptions? Options { get; }

    /// <param name="urlTemplate">A URL template string with formatting options for subdomain, zoom level, and coordinates.</param>
    /// <param name="options">The <see cref="ProtobufVectorTileLayerOptions"/> used to create the layer.</param>
    public ProtobufVectorTileLayer(string urlTemplate, ProtobufVectorTileLayerOptions? options = null) 
        : base(urlTemplate, options)
    {
        Options = options;
    }

    /// <inheritdoc/>
    protected override async Task<IJSObjectReference> CreateJsObjectRef()
    {
        if (JSBinder is null)
        {
            throw new InvalidOperationException("Cannot create ProtobufVectorTileLayer object. No JavaScript binding has been set up for this object.");
        }

        var module = await JSBinder.GetLeafletMapModule();
        return await module.InvokeAsync<IJSObjectReference>("LeafletMap.ProtobufVectorTileLayer.createProtobufVectorTileLayer", UrlTemplate, Options, EventHandlerMapping);
    }
}

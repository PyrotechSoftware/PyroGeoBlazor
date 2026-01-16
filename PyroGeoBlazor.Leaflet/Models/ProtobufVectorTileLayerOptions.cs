namespace PyroGeoBlazor.Leaflet.Models;

using System.Text.Json.Serialization;

/// <summary>
/// Options specific to Protobuf (MVT/PBF) vector tile layers.
/// <see href="https://github.com/Leaflet/Leaflet.VectorGrid"/>
/// </summary>
public class ProtobufVectorTileLayerOptions : VectorTileLayerOptions
{
    /// <summary>
    /// The name of the layer in the tile source to render.
    /// Can include a placeholder {LayerName} in the URL template that will be replaced with this value.
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public string? LayerName { get; set; }

    /// <summary>
    /// Subdomains of the tile service. Can be a string or array of strings.
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public string[]? Subdomains { get; set; }
}

namespace PyroGeoBlazor.Leaflet.Models;

using Microsoft.JSInterop;

using System.Text.Json.Serialization;

/// <summary>
/// A vector tile layer that slices GeoJSON data into vector tiles client-side using the Leaflet.VectorGrid plugin.
/// This is useful for rendering large GeoJSON datasets as tiles.
/// <see href="https://github.com/Leaflet/Leaflet.VectorGrid"/>
/// </summary>
public class SlicerVectorTileLayer : VectorTileLayer
{
    /// <summary>
    /// The <see cref="SlicerVectorTileLayerOptions"/> used to create the layer.
    /// </summary>
    [JsonIgnore]
    public new SlicerVectorTileLayerOptions? Options { get; }

    /// <summary>
    /// The GeoJSON data to be sliced into vector tiles.
    /// </summary>
    [JsonIgnore]
    public object? GeoJsonData { get; }

    /// <param name="geoJsonData">The GeoJSON data to be sliced into vector tiles.</param>
    /// <param name="options">The <see cref="SlicerVectorTileLayerOptions"/> used to create the layer.</param>
    public SlicerVectorTileLayer(object geoJsonData, SlicerVectorTileLayerOptions? options = null) 
        : base(string.Empty, options) // Slicer doesn't use a URL template
    {
        GeoJsonData = geoJsonData;
        Options = options;
    }

    /// <inheritdoc/>
    protected override async Task<IJSObjectReference> CreateJsObjectRef()
    {
        if (JSBinder is null)
        {
            throw new InvalidOperationException("Cannot create SlicerVectorTileLayer object. No JavaScript binding has been set up for this object.");
        }

        var module = await JSBinder.GetLeafletMapModule();
        return await module.InvokeAsync<IJSObjectReference>("LeafletMap.SlicerVectorTileLayer.createSlicerVectorTileLayer", GeoJsonData, Options, EventHandlerMapping);
    }
}

namespace PyroGeoBlazor.Leaflet.Models;

using Microsoft.JSInterop;

using System.Text.Json.Serialization;

/// <summary>
/// Options specific to Slicer vector tile layers (for GeoJSON slicing).
/// <see href="https://github.com/Leaflet/Leaflet.VectorGrid"/>
/// </summary>
public class SlicerVectorTileLayerOptions : VectorTileLayerOptions
{
    // Slicer-specific options can be added here as needed
    // The Slicer method slices GeoJSON data into vector tiles client-side
}

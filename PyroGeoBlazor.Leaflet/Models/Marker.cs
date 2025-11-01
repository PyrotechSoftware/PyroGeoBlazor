namespace PyroGeoBlazor.Leaflet.Models;

using Microsoft.JSInterop;

using System.Text.Json.Serialization;
using System.Threading.Tasks;

/// <summary>
/// A clickable, draggable icon that can be added to a <see cref="Map"/>
/// <see href="https://leafletjs.com/reference-1.7.1.html#marker"/>
/// </summary>
/// <remarks>
/// Constructs a marker
/// </remarks>
/// <param name="latlng">The initial position of the marker.</param>
/// <param name="options">The <see cref="MarkerOptions"/> used to create the marker.</param>
public class Marker(LatLng latlng, MarkerOptions options) : InteractiveLayer
{
    /// <summary>
    /// The initial position of the marker.
    /// </summary>
    [JsonIgnore] public LatLng LatLng { get; } = latlng;
    /// <summary>
    /// The <see cref="MarkerOptions"/> used to create the marker.
    /// </summary>
    [JsonIgnore] public MarkerOptions Options { get; } = options;

    /// <inheritdoc/>
    protected override async Task<IJSObjectReference> CreateJsObjectRef()
    {
        return JSBinder is null
            ? throw new System.InvalidOperationException("Cannot create Marker object. No JavaScript binding has been set up for this object.")
            : await JSBinder.JSRuntime.InvokeAsync<IJSObjectReference>("L.marker", LatLng, Options);
    }
}
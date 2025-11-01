namespace PyroGeoBlazor.Leaflet.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

public class LocateOptions
{
    /// <summary>
    /// If true, starts continuous watching of location changes (instead of detecting it once) using W3C watchPosition method.
    /// You can later stop watching using map.stopLocate() method.
    /// </summary>
    public bool Watch { get; set; } = false;

    /// <summary>
    /// If true, automatically sets the map view to the user location with respect to detection accuracy,
    /// or to world view if geolocation failed.
    /// </summary>
    public bool SetView { get; set; } = false;

    /// <summary>
    /// The maximum zoom for automatic view setting when using SetView option.
    /// </summary>
    public int? MaxZoom { get; set; }

    /// <summary>
    /// Number of milliseconds to wait for a response from geolocation before firing a locationerror event.
    /// </summary>
    public int? Timeout { get; set; } = 10000;

    /// <summary>
    /// Maximum age of detected location.
    /// If less than this amount of milliseconds passed since last geolocation response, locate will return a cached location.
    /// </summary>
    public int? MaximumAge { get; set; } = 0;

    /// <summary>
    /// Enables high accuracy, see description in the W3C spec.
    /// </summary>
    public bool EnableHighAccuracy { get; set; } = false;
}

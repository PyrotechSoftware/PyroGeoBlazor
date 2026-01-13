namespace PyroGeoBlazor.Leaflet.Models;

/// <summary>
/// Options for configuring a WFS layer.
/// </summary>
public class WfsLayerOptions : GeoJsonLayerOptions
{
    /// <summary>
    /// WFS request parameters (typename, CQL filter, bbox, etc.).
    /// Required.
    /// </summary>
    public required WfsRequestParameters RequestParameters { get; set; }

    /// <summary>
    /// If true, automatically refreshes features when the map is panned or zoomed.
    /// Default is true.
    /// </summary>
    public bool AutoRefresh { get; init; } = true;

    /// <summary>
    /// Milliseconds to wait after map movement stops before refreshing.
    /// Default is 1000ms (1 second).
    /// </summary>
    public int RefreshDebounceMs { get; init; } = 1000;

    /// <summary>
    /// If true, only new features are added during refresh (incremental loading).
    /// If false, all existing features are cleared before loading new ones (complete reload).
    /// Default is true.
    /// Only applies when AutoRefresh is true.
    /// </summary>
    public bool IncrementalRefresh { get; init; } = true;
}


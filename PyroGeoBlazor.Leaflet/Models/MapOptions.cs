namespace PyroGeoBlazor.Leaflet.Models;

/// <summary>
/// The options used when creating a <see cref="Map"/>.
/// </summary>
public class MapOptions
{
    /// <summary>
    /// The initial centre point of the <see cref="Map"/>.
    /// </summary>
    public LatLng? Center { get; set; }
    /// <summary>
    /// The initial zoom level of the <see cref="Map"/>.
    /// </summary>
    public int Zoom { get; set; }

    /// <summary>
    /// Gets or sets the options for configuring map-related events.
    /// </summary>
    public MapEventOptions EventOptions { get; set; } = new MapEventOptions();
}

public class MapEventOptions
{
    /// <summary>
    /// If false the Resize event will not be fired when the map is resized.
    /// </summary>
    public bool Resize { get; set; } = true;

    /// <summary>
    /// If false the ZoomLevelsChange event will not be fired when the zoom level changes.
    /// </summary>
    public bool ZoomLevelsChange { get; set; } = true;

    /// <summary>
    /// If true, the default context menu of the browser is overridden, and when the user right clicks on the map,
    /// the OnContextMenu event is fired.
    /// </summary>
    public bool ContextMenu { get; set; } = false;

    /// <summary>
    /// If false the Click event will not be fired when the map is clicked.
    /// </summary>
    public bool Click { get; set; } = true;

    /// <summary>
    /// If false the DoubleClick event will not be fired when the map is double-clicked.
    /// </summary>
    public bool DoubleClick { get; set; } = true;

    /// <summary>
    /// Gets or sets a value indicating whether Geo-location events are enabled.
    /// </summary>
    public bool LocationEvents { get; set; } = true;

    /// <summary>
    /// If true the Map will fire LayerAdd events to .NET when layers are added.
    /// </summary>
    public bool LayerAdd { get; set; } = true;

    /// <summary>
    /// If true the Map will fire LayerRemove events to .NET when layers are removed.
    /// </summary>
    public bool LayerRemove { get; set; } = true;
}

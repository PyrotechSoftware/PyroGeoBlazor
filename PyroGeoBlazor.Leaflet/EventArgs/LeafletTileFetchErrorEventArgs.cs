namespace PyroGeoBlazor.Leaflet.EventArgs;

public class LeafletTileFetchErrorEventArgs : LeafletTileErrorEventArgs
{
    public string? Url { get; set; }
    public int? Z { get; set; }
    public int? X { get; set; }
    public int? Y { get; set; }
}

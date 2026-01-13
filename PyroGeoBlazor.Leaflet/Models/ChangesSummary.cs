namespace PyroGeoBlazor.Leaflet.Models;

/// <summary>
/// Represents a summary of changes made to features in an editable layer.
/// </summary>
public class ChangesSummary
{
    /// <summary>
    /// Collection of features that have been modified.
    /// </summary>
    public List<GeoJsonFeature> ModifiedFeatures { get; set; } = new();

    /// <summary>
    /// Collection of features that have been deleted.
    /// </summary>
    public List<GeoJsonFeature> DeletedFeatures { get; set; } = new();

    /// <summary>
    /// The number of modified features.
    /// </summary>
    public int ModifiedCount { get; set; }

    /// <summary>
    /// The number of deleted features.
    /// </summary>
    public int DeletedCount { get; set; }

    /// <summary>
    /// Gets a value indicating whether there are any changes.
    /// </summary>
    public bool HasChanges => ModifiedCount > 0 || DeletedCount > 0;
}

namespace PyroGeoBlazor.DeckGL.Models;

using System.Text.Json.Serialization;

/// <summary>
/// Renders features with different styles based on unique values of a specified attribute.
/// Similar to ArcGIS UniqueValueRenderer - each unique value of an attribute gets its own style.
/// </summary>
/// <example>
/// <code>
/// var renderer = new UniqueValueRenderer
/// {
///     Attribute = "zoning",
///     ValueStyles = new Dictionary&lt;string, FeatureStyle&gt;
///     {
///         ["Residential"] = FeatureStyle.Blue,
///         ["Commercial"] = FeatureStyle.Red,
///         ["Industrial"] = FeatureStyle.Purple,
///         [null] = FeatureStyle.Gray
///     },
///     DefaultStyle = FeatureStyle.Gray
/// };
/// </code>
/// </example>
public class UniqueValueRenderer
{
    /// <summary>
    /// The name of the attribute/property to use for classification.
    /// This is the property name in the feature's properties object (e.g., "zoning", "category", "type").
    /// </summary>
    [JsonPropertyName("attribute")]
    public string Attribute { get; set; } = string.Empty;

    /// <summary>
    /// Mapping of attribute values to their respective styles.
    /// Key: attribute value as string (use null for null/missing values)
    /// Value: style to apply for that value
    /// </summary>
    /// <remarks>
    /// All keys are converted to strings for comparison.
    /// Use null as a key to specify style for features with missing/null attribute values.
    /// </remarks>
    [JsonPropertyName("valueStyles")]
    public Dictionary<string, FeatureStyle> ValueStyles { get; set; } = new();

    /// <summary>
    /// Default style for values not specified in ValueStyles.
    /// If not provided, features with unspecified values will use the layer's base style.
    /// </summary>
    [JsonPropertyName("defaultStyle")]
    public FeatureStyle? DefaultStyle { get; set; }

    /// <summary>
    /// Creates a simple categorical renderer for zoning types
    /// </summary>
    public static UniqueValueRenderer ForZoning() => new()
    {
        Attribute = "zoning",
        ValueStyles = new Dictionary<string, FeatureStyle>
        {
            ["Residential"] = new FeatureStyle
            {
                FillColor = "#FFE4B5",
                FillOpacity = 0.7,
                LineColor = "#8B4513",
                LineWidth = 1
            },
            ["Commercial"] = new FeatureStyle
            {
                FillColor = "#FF6B6B",
                FillOpacity = 0.7,
                LineColor = "#C92A2A",
                LineWidth = 1
            },
            ["Industrial"] = new FeatureStyle
            {
                FillColor = "#A78BFA",
                FillOpacity = 0.7,
                LineColor = "#7C3AED",
                LineWidth = 1
            },
            ["Park"] = new FeatureStyle
            {
                FillColor = "#51CF66",
                FillOpacity = 0.7,
                LineColor = "#2F9E44",
                LineWidth = 1
            }
        },
        DefaultStyle = new FeatureStyle
        {
            FillColor = "#CED4DA",
            FillOpacity = 0.5,
            LineColor = "#ADB5BD",
            LineWidth = 1
        }
    };

    /// <summary>
    /// Creates a simple categorical renderer for land use types
    /// </summary>
    public static UniqueValueRenderer ForLandUse() => new()
    {
        Attribute = "landuse",
        ValueStyles = new Dictionary<string, FeatureStyle>
        {
            ["Agriculture"] = FeatureStyle.Green,
            ["Urban"] = FeatureStyle.Red,
            ["Forest"] = new FeatureStyle { FillColor = "#2D5016", FillOpacity = 0.7, LineColor = "#1A2E0A", LineWidth = 1 },
            ["Water"] = new FeatureStyle { FillColor = "#1E88E5", FillOpacity = 0.7, LineColor = "#0D47A1", LineWidth = 1 },
        },
        DefaultStyle = FeatureStyle.Gray
    };
}

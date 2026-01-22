namespace PyroGeoBlazor.DeckGL.Models;

using System.Text.Json.Serialization;

/// <summary>
/// Configuration for customizing tooltip display when hovering over features
/// </summary>
public class TooltipConfig
{
    /// <summary>
    /// List of property/attribute names to display in the tooltip.
    /// If null or empty, the full object JSON is displayed.
    /// </summary>
    [JsonPropertyName("properties")]
    public List<string>? Properties { get; set; }

    /// <summary>
    /// Custom format string for the tooltip.
    /// Use {propertyName} placeholders to insert values.
    /// Example: "Name: {name}\nPopulation: {population}"
    /// </summary>
    [JsonPropertyName("format")]
    public string? Format { get; set; }

    /// <summary>
    /// Whether to show the tooltip at all
    /// </summary>
    [JsonPropertyName("enabled")]
    public bool Enabled { get; set; } = true;

    /// <summary>
    /// CSS style for the tooltip
    /// </summary>
    [JsonPropertyName("style")]
    public Dictionary<string, string>? Style { get; set; }

    /// <summary>
    /// Create a simple tooltip that shows specific properties
    /// </summary>
    public static TooltipConfig ForProperties(params string[] properties)
    {
        return new TooltipConfig
        {
            Properties = properties.ToList(),
            Style = new Dictionary<string, string>
            {
                ["backgroundColor"] = "#fff",
                ["color"] = "#000",
                ["fontSize"] = "12px",
                ["padding"] = "8px",
                ["borderRadius"] = "4px",
                ["boxShadow"] = "0 2px 4px rgba(0,0,0,0.2)"
            }
        };
    }

    /// <summary>
    /// Create a formatted tooltip
    /// </summary>
    public static TooltipConfig WithFormat(string format, Dictionary<string, string>? style = null)
    {
        return new TooltipConfig
        {
            Format = format,
            Style = style ?? new Dictionary<string, string>
            {
                ["backgroundColor"] = "#fff",
                ["color"] = "#000",
                ["fontSize"] = "12px",
                ["padding"] = "8px",
                ["borderRadius"] = "4px",
                ["boxShadow"] = "0 2px 4px rgba(0,0,0,0.2)"
            }
        };
    }

    /// <summary>
    /// Disable tooltips
    /// </summary>
    public static TooltipConfig Disabled => new() { Enabled = false };
}

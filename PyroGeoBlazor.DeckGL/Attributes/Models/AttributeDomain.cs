namespace PyroGeoBlazor.DeckGL.Models;

using System.Text.Json.Serialization;

/// <summary>
/// Base class for attribute domains that constrain valid values.
/// Similar to ArcGIS domains.
/// </summary>
[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(CodedValueDomain), "codedValue")]
[JsonDerivedType(typeof(RangeDomain), "range")]
public abstract class AttributeDomain
{
    /// <summary>
    /// Name of the domain.
    /// </summary>
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Description of the domain.
    /// </summary>
    [JsonPropertyName("description")]
    public string? Description { get; set; }
}

/// <summary>
/// Domain that defines a list of valid coded values.
/// Each value has a code (stored value) and a name (display value).
/// Example: Status field with values: { code: 1, name: "Active" }, { code: 2, name: "Inactive" }
/// </summary>
public class CodedValueDomain : AttributeDomain
{
    /// <summary>
    /// List of valid coded values.
    /// </summary>
    [JsonPropertyName("codedValues")]
    public List<CodedValue> CodedValues { get; set; } = [];
}

/// <summary>
/// Represents a single coded value in a CodedValueDomain.
/// </summary>
public class CodedValue
{
    /// <summary>
    /// The actual value stored in the attribute (can be string, number, etc.)
    /// </summary>
    [JsonPropertyName("code")]
    public object Code { get; set; } = null!;

    /// <summary>
    /// The display name shown to users.
    /// </summary>
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
}

/// <summary>
/// Domain that defines a valid range for numeric values.
/// Example: Age field with minValue: 0, maxValue: 120
/// </summary>
public class RangeDomain : AttributeDomain
{
    /// <summary>
    /// Minimum allowed value (inclusive).
    /// </summary>
    [JsonPropertyName("minValue")]
    public double MinValue { get; set; }

    /// <summary>
    /// Maximum allowed value (inclusive).
    /// </summary>
    [JsonPropertyName("maxValue")]
    public double MaxValue { get; set; }
}

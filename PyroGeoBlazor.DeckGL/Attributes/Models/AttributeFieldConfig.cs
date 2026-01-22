namespace PyroGeoBlazor.DeckGL.Models;

using System.Text.Json.Serialization;

/// <summary>
/// Configuration for an editable attribute field.
/// Defines metadata, data type, editability, and constraints for a feature attribute.
/// </summary>
public class AttributeFieldConfig
{
    /// <summary>
    /// The property name of the field in the feature's properties object.
    /// This is the key used to access the value (e.g., "status", "name", "age").
    /// </summary>
    [JsonPropertyName("fieldName")]
    public string FieldName { get; set; } = string.Empty;

    /// <summary>
    /// Display name shown in the UI. If not set, FieldName is used.
    /// Example: FieldName="status_code", DisplayName="Status"
    /// </summary>
    [JsonPropertyName("displayName")]
    public string? DisplayName { get; set; }

    /// <summary>
    /// Data type of the field. Determines which edit control is rendered.
    /// </summary>
    [JsonPropertyName("dataType")]
    public AttributeDataType DataType { get; set; } = AttributeDataType.String;

    /// <summary>
    /// Whether the field is read-only (cannot be edited).
    /// Default is true for safety - must be explicitly set to false to allow editing.
    /// </summary>
    [JsonPropertyName("isReadOnly")]
    public bool IsReadOnly { get; set; } = true;

    /// <summary>
    /// Whether the field is required (cannot be null or empty).
    /// </summary>
    [JsonPropertyName("isRequired")]
    public bool IsRequired { get; set; } = false;

    /// <summary>
    /// Optional domain that constrains valid values.
    /// Can be a CodedValueDomain (dropdown list) or RangeDomain (numeric range).
    /// </summary>
    [JsonPropertyName("domain")]
    public AttributeDomain? Domain { get; set; }

    /// <summary>
    /// Maximum length for string fields. Null means no limit.
    /// </summary>
    [JsonPropertyName("maxLength")]
    public int? MaxLength { get; set; }

    /// <summary>
    /// Placeholder text shown in empty input fields.
    /// </summary>
    [JsonPropertyName("placeholder")]
    public string? Placeholder { get; set; }

    /// <summary>
    /// Help text or description shown to users.
    /// </summary>
    [JsonPropertyName("helpText")]
    public string? HelpText { get; set; }

    /// <summary>
    /// Display order in the UI. Lower numbers appear first.
    /// If not set, fields appear in their natural order.
    /// </summary>
    [JsonPropertyName("order")]
    public int? Order { get; set; }

    /// <summary>
    /// Gets the effective display name (DisplayName if set, otherwise FieldName).
    /// </summary>
    [JsonIgnore]
    public string EffectiveDisplayName => DisplayName ?? FieldName;
}

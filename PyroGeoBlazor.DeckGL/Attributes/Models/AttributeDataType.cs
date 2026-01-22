namespace PyroGeoBlazor.DeckGL.Models;

using System.Text.Json.Serialization;

/// <summary>
/// Defines the data type of an attribute field.
/// Used to determine appropriate edit controls and validation.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter<AttributeDataType>))]
public enum AttributeDataType
{
    /// <summary>
    /// Text string value. Rendered as text input.
    /// </summary>
    String,

    /// <summary>
    /// Integer number (whole number). Rendered as numeric input without decimals.
    /// </summary>
    Integer,

    /// <summary>
    /// Decimal number (floating point). Rendered as numeric input with decimals.
    /// </summary>
    Double,

    /// <summary>
    /// Boolean value (true/false). Rendered as checkbox or switch.
    /// </summary>
    Boolean,

    /// <summary>
    /// Date only (no time component). Rendered as date picker.
    /// </summary>
    Date,

    /// <summary>
    /// Date and time. Rendered as datetime picker.
    /// </summary>
    DateTime
}

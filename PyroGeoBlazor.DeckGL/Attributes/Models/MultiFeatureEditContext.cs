namespace PyroGeoBlazor.DeckGL.Models;

using System.Text.Json;

/// <summary>
/// Tracks attribute changes for multiple features being edited together.
/// Handles display of common values vs. different values across the selected features.
/// </summary>
public class MultiFeatureEditContext
{
    /// <summary>
    /// List of all features being edited together.
    /// </summary>
    public List<SelectedFeature> Features { get; set; } = [];

    /// <summary>
    /// Dictionary of field names to their common/aggregated values.
    /// Value is null if the field has different values across features.
    /// </summary>
    public Dictionary<string, FieldValueState> FieldStates { get; set; } = [];

    /// <summary>
    /// Dictionary of field names to their current (possibly modified) values.
    /// When a field is edited, all features will receive this value on save.
    /// </summary>
    public Dictionary<string, object?> CurrentValues { get; set; } = [];

    /// <summary>
    /// Dictionary of field names to their validation errors (if any).
    /// Key is field name, value is error message.
    /// </summary>
    public Dictionary<string, string> ValidationErrors { get; set; } = [];

    /// <summary>
    /// Whether any fields have been modified.
    /// </summary>
    public bool IsDirty => CurrentValues.Count > 0;

    /// <summary>
    /// Whether the current state is valid (no validation errors).
    /// </summary>
    public bool IsValid => ValidationErrors.Count == 0;

    /// <summary>
    /// Gets the modified fields (field names that have been changed).
    /// </summary>
    public IEnumerable<string> ModifiedFields => CurrentValues.Keys;

    /// <summary>
    /// Gets the current value of a field, or null if not found.
    /// </summary>
    public object? GetCurrentValue(string fieldName)
    {
        return CurrentValues.TryGetValue(fieldName, out var value) ? value : null;
    }

    /// <summary>
    /// Sets the current value of a field (marks it as modified).
    /// </summary>
    public void SetCurrentValue(string fieldName, object? value)
    {
        CurrentValues[fieldName] = value;
    }

    /// <summary>
    /// Adds or updates a validation error for a field.
    /// </summary>
    public void SetValidationError(string fieldName, string errorMessage)
    {
        ValidationErrors[fieldName] = errorMessage;
    }

    /// <summary>
    /// Clears validation error for a field.
    /// </summary>
    public void ClearValidationError(string fieldName)
    {
        ValidationErrors.Remove(fieldName);
    }

    /// <summary>
    /// Resets all fields to their original state (clears modifications).
    /// </summary>
    public void ResetAll()
    {
        CurrentValues.Clear();
        ValidationErrors.Clear();
    }

    /// <summary>
    /// Gets the display value for a field, considering whether it's been modified
    /// or if it has different values across features.
    /// </summary>
    public string GetDisplayValue(string fieldName)
    {
        // If modified, show the new value
        if (CurrentValues.TryGetValue(fieldName, out var modifiedValue))
        {
            return FormatValue(modifiedValue);
        }

        // If not modified, check if values differ
        if (FieldStates.TryGetValue(fieldName, out var state))
        {
            if (state.HasDifferentValues)
            {
                return "(Different values)";
            }
            return FormatValue(state.CommonValue);
        }

        return string.Empty;
    }

    private string FormatValue(object? value)
    {
        return value switch
        {
            null => string.Empty,
            bool b => b ? "Yes" : "No",
            DateTime dt => dt.ToString("yyyy-MM-dd HH:mm:ss"),
            DateOnly d => d.ToString("yyyy-MM-dd"),
            _ => value.ToString() ?? string.Empty
        };
    }
}

/// <summary>
/// Represents the state of a field's values across multiple features.
/// </summary>
public class FieldValueState
{
    /// <summary>
    /// Whether the field has different values across the selected features.
    /// </summary>
    public bool HasDifferentValues { get; set; }

    /// <summary>
    /// The common value if all features have the same value (or all null).
    /// Null if HasDifferentValues is true.
    /// </summary>
    public object? CommonValue { get; set; }

    /// <summary>
    /// Whether all features have null values for this field.
    /// </summary>
    public bool AllNull { get; set; }
}

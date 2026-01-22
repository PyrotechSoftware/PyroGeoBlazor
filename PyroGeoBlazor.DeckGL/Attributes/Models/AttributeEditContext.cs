namespace PyroGeoBlazor.DeckGL.Models;

using System.Text.Json;

/// <summary>
/// Tracks attribute changes for a feature being edited.
/// Maintains original values and current (modified) values.
/// </summary>
public class AttributeEditContext
{
    /// <summary>
    /// The original feature data (before any edits).
    /// </summary>
    public JsonElement OriginalFeature { get; set; }

    /// <summary>
    /// Dictionary of field names to their original values.
    /// </summary>
    public Dictionary<string, object?> OriginalValues { get; set; } = [];

    /// <summary>
    /// Dictionary of field names to their current (possibly modified) values.
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
    public bool IsDirty => CurrentValues.Any(kv =>
    {
        if (!OriginalValues.TryGetValue(kv.Key, out var originalValue))
            return true; // New field

        // Handle null comparisons
        if (originalValue == null && kv.Value == null)
            return false;
        if (originalValue == null || kv.Value == null)
            return true;

        // Compare values
        return !originalValue.Equals(kv.Value);
    });

    /// <summary>
    /// Whether the current state is valid (no validation errors).
    /// </summary>
    public bool IsValid => ValidationErrors.Count == 0;

    /// <summary>
    /// Gets the modified fields (field names that have changed values).
    /// </summary>
    public IEnumerable<string> ModifiedFields
    {
        get
        {
            foreach (var kv in CurrentValues)
            {
                if (!OriginalValues.TryGetValue(kv.Key, out var originalValue))
                {
                    yield return kv.Key;
                    continue;
                }

                // Handle null comparisons
                if (originalValue == null && kv.Value == null)
                    continue;
                if (originalValue == null || kv.Value == null)
                {
                    yield return kv.Key;
                    continue;
                }

                // Compare values
                if (!originalValue.Equals(kv.Value))
                    yield return kv.Key;
            }
        }
    }

    /// <summary>
    /// Resets a field to its original value.
    /// </summary>
    public void ResetField(string fieldName)
    {
        if (OriginalValues.TryGetValue(fieldName, out var originalValue))
        {
            CurrentValues[fieldName] = originalValue;
            ValidationErrors.Remove(fieldName);
        }
    }

    /// <summary>
    /// Resets all fields to their original values.
    /// </summary>
    public void ResetAll()
    {
        CurrentValues.Clear();
        foreach (var kv in OriginalValues)
        {
            CurrentValues[kv.Key] = kv.Value;
        }
        ValidationErrors.Clear();
    }

    /// <summary>
    /// Gets the current value of a field, or null if not found.
    /// </summary>
    public object? GetCurrentValue(string fieldName)
    {
        return CurrentValues.TryGetValue(fieldName, out var value) ? value : null;
    }

    /// <summary>
    /// Sets the current value of a field.
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
}

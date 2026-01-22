namespace PyroGeoBlazor.DeckGL.Components;

using Microsoft.AspNetCore.Components;
using PyroGeoBlazor.DeckGL.Models;

/// <summary>
/// Defines a custom edit control for a specific field in the FeatureAttributesControl.
/// Used declaratively in markup to provide custom rendering for attribute fields.
/// </summary>
/// <typeparam name="TValue">The type of the field value</typeparam>
public class CustomFieldEditControl<TValue> : ComponentBase
{
    /// <summary>
    /// The name of the field this custom control applies to.
    /// Must match the field name in the feature's properties.
    /// </summary>
    [Parameter, EditorRequired]
    public string FieldName { get; set; } = string.Empty;

    /// <summary>
    /// The template for rendering the custom edit control.
    /// Receives a context with the current value and setter.
    /// </summary>
    [Parameter, EditorRequired]
    public RenderFragment<CustomFieldContext<TValue>>? Template { get; set; }

    /// <summary>
    /// Cascading parameter to register this field with the parent container.
    /// </summary>
    [CascadingParameter]
    private FieldTemplateContainer? Container { get; set; }

    protected override void OnInitialized()
    {
        if (Container == null)
        {
            throw new InvalidOperationException(
                $"{nameof(CustomFieldEditControl<TValue>)} must be used inside a {nameof(FeatureSelectionControl)} or {nameof(FeatureAttributesControl)} with EditTemplates.");
        }

        if (Template == null)
        {
            throw new InvalidOperationException(
                $"{nameof(CustomFieldEditControl<TValue>)} requires a {nameof(Template)} parameter.");
        }

        // Register this field template with the container
        Container.RegisterFieldTemplate(FieldName, CreateRenderFragment());
    }

    private RenderFragment<FeatureAttributesControl.FieldRenderContext> CreateRenderFragment()
    {
        return context => builder =>
        {
            // Convert the generic context to our typed context
            var typedContext = new CustomFieldContext<TValue>(
                context.FieldName,
                context.DisplayName,
                ConvertValue(context.CurrentValue),
                value => context.SetValue(value),
                context.Config,
                context.HasError,
                context.ErrorText
            );

            // Render the template with the typed context
            Template!(typedContext).Invoke(builder);
        };
    }

    private TValue? ConvertValue(object? value)
    {
        if (value == null)
            return default;

        if (value is TValue typedValue)
            return typedValue;

        try
        {
            return (TValue)Convert.ChangeType(value, typeof(TValue));
        }
        catch
        {
            return default;
        }
    }
}

/// <summary>
/// Context passed to custom field templates.
/// </summary>
public record CustomFieldContext<TValue>(
    string FieldName,
    string DisplayName,
    TValue? Value,
    Action<object?> SetValue,
    AttributeFieldConfig? Config,
    bool HasError,
    string? ErrorText
);

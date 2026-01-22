namespace PyroGeoBlazor.DeckGL.Components;

using Microsoft.AspNetCore.Components;

/// <summary>
/// Internal component that provides cascading context for field template registration.
/// </summary>
public class FieldTemplateContainer : ComponentBase
{
    private readonly Dictionary<string, RenderFragment<FeatureAttributesControl.FieldRenderContext>> _fieldTemplates = new();

    /// <summary>
    /// The child content containing CustomFieldEditControl definitions.
    /// </summary>
    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    /// <summary>
    /// Gets the registered field templates as a dictionary.
    /// </summary>
    public IReadOnlyDictionary<string, RenderFragment<FeatureAttributesControl.FieldRenderContext>> FieldTemplates => _fieldTemplates;

    /// <summary>
    /// Registers a field template.
    /// </summary>
    internal void RegisterFieldTemplate(string fieldName, RenderFragment<FeatureAttributesControl.FieldRenderContext> template)
    {
        _fieldTemplates[fieldName] = template;
    }

    protected override void BuildRenderTree(Microsoft.AspNetCore.Components.Rendering.RenderTreeBuilder builder)
    {
        builder.OpenComponent<CascadingValue<FieldTemplateContainer>>(0);
        builder.AddAttribute(1, "Value", this);
        builder.AddAttribute(2, "IsFixed", true);
        builder.AddAttribute(3, "ChildContent", ChildContent);
        builder.CloseComponent();
    }
}

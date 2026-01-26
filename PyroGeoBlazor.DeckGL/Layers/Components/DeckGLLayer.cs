namespace PyroGeoBlazor.DeckGL.Components;

using Microsoft.AspNetCore.Components;
using PyroGeoBlazor.DeckGL.Models;

/// <summary>
/// Base component for all DeckGL layers.
/// Inherit from this to create specific layer types.
/// </summary>
public abstract class DeckGLLayer : ComponentBase
{
    /// <summary>
    /// Parent DeckGLView component that will contain this layer
    /// </summary>
    [CascadingParameter]
    public DeckGLView? Parent { get; set; }

    /// <summary>
    /// Unique identifier for this layer
    /// </summary>
    [Parameter]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    /// <summary>
    /// Whether this layer is visible
    /// </summary>
    [Parameter]
    public bool Visible { get; set; } = true;

    /// <summary>
    /// Layer opacity (0-1)
    /// </summary>
    [Parameter]
    public double Opacity { get; set; } = 1.0;

    /// <summary>
    /// Whether features in this layer can be selected
    /// </summary>
    [Parameter]
    public bool Pickable { get; set; } = true;

    /// <summary>
    /// Minimum zoom level at which this layer is visible
    /// </summary>
    [Parameter]
    public double? MinZoom { get; set; }

    /// <summary>
    /// Base feature style applied to all features in this layer
    /// </summary>
    [Parameter]
    public FeatureStyle? FeatureStyle { get; set; }

    /// <summary>
    /// Style applied to selected features
    /// </summary>
    [Parameter]
    public FeatureStyle? SelectionStyle { get; set; }

    /// <summary>
    /// Style applied to hovered features
    /// </summary>
    [Parameter]
    public FeatureStyle? HoverStyle { get; set; }

    /// <summary>
    /// Tooltip configuration for this layer
    /// </summary>
    [Parameter]
    public TooltipConfig? TooltipConfig { get; set; }

    /// <summary>
    /// Property name to use as unique identifier for features
    /// </summary>
    [Parameter]
    public string? UniqueIdProperty { get; set; }

    /// <summary>
    /// Property name to display in UI for features
    /// </summary>
    [Parameter]
    public string? DisplayProperty { get; set; }

    /// <summary>
    /// Whether this layer supports editing
    /// </summary>
    [Parameter]
    public bool IsEditable { get; set; }

    /// <summary>
    /// Properties to exclude from attribute display
    /// </summary>
    [Parameter]
    public List<string>? ExcludedProperties { get; set; }

    /// <summary>
    /// Field configurations for editable attributes
    /// </summary>
    [Parameter]
    public List<AttributeFieldConfig>? EditableFields { get; set; }

    /// <summary>
    /// Creates the LayerConfig object for this layer
    /// </summary>
    /// <returns>A LayerConfig object that will be passed to JavaScript</returns>
    protected abstract LayerConfig CreateLayerConfig();

    protected override void OnInitialized()
    {
        if (Parent == null)
        {
            throw new InvalidOperationException(
                $"{GetType().Name} must be a child of a DeckGLView component or inside a <Layers> component within DeckGLView. " +
                "Ensure your layer is nested properly:\n" +
                "Option 1: <DeckGLView><Layers><{GetType().Name} .../></Layers></DeckGLView>\n" +
                "Option 2: <DeckGLView><{GetType().Name} .../></DeckGLView>");
        }

        // Register this layer with the parent
        Parent.RegisterLayer(this);
    }

    /// <summary>
    /// Gets the layer configuration for this component
    /// </summary>
    public LayerConfig GetLayerConfig()
    {
        var config = CreateLayerConfig();
        
        // Apply common properties
        config.Id = Id;
        config.Visible = Visible;
        config.Opacity = Opacity;
        config.Pickable = Pickable;
        config.MinZoom = MinZoom;
        config.FeatureStyle = FeatureStyle;
        config.SelectionStyle = SelectionStyle;
        config.HoverStyle = HoverStyle;
        config.TooltipConfig = TooltipConfig;
        config.UniqueIdProperty = UniqueIdProperty;
        config.DisplayProperty = DisplayProperty;
        config.IsEditable = IsEditable;
        config.ExcludedProperties = ExcludedProperties?.ToArray();
        config.EditableFields = EditableFields ?? [];

        return config;
    }

    /// <summary>
    /// Notifies the parent that this layer's configuration has changed
    /// </summary>
    protected async Task NotifyLayerChanged()
    {
        if (Parent != null)
        {
            await Parent.UpdateLayers();
        }
    }
}

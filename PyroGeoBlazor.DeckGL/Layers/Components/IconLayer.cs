namespace PyroGeoBlazor.DeckGL.Components;

using Microsoft.AspNetCore.Components;
using PyroGeoBlazor.DeckGL.Models;

/// <summary>
/// An icon layer component for rendering icons/markers at point locations in DeckGL.
/// Supports custom icons and provides a default Google Maps-style pin marker.
/// <see href="https://deck.gl/docs/api-reference/layers/icon-layer"/>
/// </summary>
public class IconLayer : DeckGLLayer
{
    /// <summary>
    /// URL to fetch point data from
    /// </summary>
    [Parameter]
    public string? DataUrl { get; set; }

    /// <summary>
    /// Inline point data (alternative to DataUrl)
    /// </summary>
    [Parameter]
    public object? Data { get; set; }

    /// <summary>
    /// URL to the icon atlas image containing all icons
    /// If not provided, uses the default map pin icon
    /// </summary>
    [Parameter]
    public string? IconAtlas { get; set; }

    /// <summary>
    /// Icon mapping that defines the position and size of each icon in the atlas
    /// If not provided, uses the default pin icon mapping
    /// </summary>
    [Parameter]
    public object? IconMapping { get; set; }

    /// <summary>
    /// Size multiplier for the icon
    /// </summary>
    [Parameter]
    public double SizeScale { get; set; } = 1.0;

    /// <summary>
    /// Minimum icon size in pixels
    /// </summary>
    [Parameter]
    public double SizeMinPixels { get; set; } = 0;

    /// <summary>
    /// Maximum icon size in pixels
    /// </summary>
    [Parameter]
    public double SizeMaxPixels { get; set; } = double.MaxValue;

    /// <summary>
    /// Whether to render icons as billboards (always facing camera)
    /// </summary>
    [Parameter]
    public bool Billboard { get; set; } = true;

    /// <summary>
    /// Anchor position of the icon relative to its coordinate
    /// Options: "start", "middle", "end"
    /// </summary>
    [Parameter]
    public string AlphaCutoff { get; set; } = "0.05";

    /// <summary>
    /// Color tint for the icon as RGBA array [r, g, b, a] (0-255)
    /// Default is red [255, 0, 0, 255] for map pin style
    /// </summary>
    [Parameter]
    public int[]? Color { get; set; }

    /// <summary>
    /// Icon size in pixels (width of the icon)
    /// </summary>
    [Parameter]
    public double IconSize { get; set; } = 32;

    /// <summary>
    /// The name of the icon to use from the icon atlas
    /// Default is "marker" which uses the built-in map pin
    /// </summary>
    [Parameter]
    public string IconName { get; set; } = "marker";

    /// <summary>
    /// Whether to hide this layer from the LayerContentsControl.
    /// When true, the layer won't appear in the layer list UI.
    /// Defaults to false.
    /// </summary>
    [Parameter]
    public bool HideFromLayerControl { get; set; } = false;

    protected override LayerConfig CreateLayerConfig()
    {
        var config = new IconLayerConfig
        {
            DataUrl = DataUrl,
            Data = Data,
            Pickable = Pickable,
            Visible = Visible,
            UniqueIdProperty = UniqueIdProperty,
            DisplayProperty = DisplayProperty,
            HideFromLayerControl = HideFromLayerControl
        };

        // Set icon properties
        config.SizeScale = SizeScale;
        config.SizeMinPixels = SizeMinPixels;
        config.SizeMaxPixels = SizeMaxPixels;
        config.Billboard = Billboard;
        config.IconName = IconName;
        config.IconSize = IconSize;

        // Set icon atlas and mapping (or use defaults)
        if (!string.IsNullOrEmpty(IconAtlas))
        {
            config.Props["iconAtlas"] = IconAtlas;
        }

        if (IconMapping != null)
        {
            config.Props["iconMapping"] = IconMapping;
        }

        // Set color tint
        if (Color != null && Color.Length >= 3)
        {
            config.Props["getColor"] = Color;
        }

        return config;
    }
}

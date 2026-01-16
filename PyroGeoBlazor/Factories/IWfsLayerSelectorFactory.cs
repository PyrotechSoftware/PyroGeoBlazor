using Microsoft.AspNetCore.Components;
using PyroGeoBlazor.Models;

namespace PyroGeoBlazor.Factories;

/// <summary>
/// Factory interface for creating WFS Layer Selector components.
/// Allows replacement of the default component with custom implementations.
/// </summary>
public interface IWfsLayerSelectorFactory
{
    /// <summary>
    /// Creates a WFS Layer Selector component with optional parameters.
    /// </summary>
    /// <param name="onConfigGenerated">Optional callback for when a configuration is generated.</param>
    /// <param name="initialUrl">Optional initial GetCapabilities URL.</param>
    /// <param name="initialVersion">Optional initial WFS version (default: "2.0.0").</param>
    /// <returns>A RenderFragment that renders the WFS Layer Selector component.</returns>
    RenderFragment CreateComponent(
        EventCallback<WfsLayerConfig>? onConfigGenerated = null,
        string? initialUrl = null,
        string? initialVersion = null);
}

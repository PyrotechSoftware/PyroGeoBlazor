using Microsoft.AspNetCore.Components;
using PyroGeoBlazor.Models;

namespace PyroGeoBlazor.Factories;

/// <summary>
/// Factory interface for creating WMTS Layer Selector components.
/// Allows replacement of the default component with custom implementations.
/// </summary>
public interface IWmtsLayerSelectorFactory
{
    /// <summary>
    /// Creates a WMTS Layer Selector component with optional parameters.
    /// </summary>
    /// <param name="onUrlTemplateGenerated">Optional callback for when a URL template is generated.</param>
    /// <param name="initialUrl">Optional initial GetCapabilities URL.</param>
    /// <param name="initialVersion">Optional initial WMTS version (default: "1.0.0").</param>
    /// <returns>A RenderFragment that renders the WMTS Layer Selector component.</returns>
    RenderFragment CreateComponent(
        EventCallback<WmtsUrlTemplate>? onUrlTemplateGenerated = null,
        string? initialUrl = null,
        string? initialVersion = null);
}

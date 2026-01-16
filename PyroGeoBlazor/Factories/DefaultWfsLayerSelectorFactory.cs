using Microsoft.AspNetCore.Components;
using PyroGeoBlazor.Components;
using PyroGeoBlazor.Models;

namespace PyroGeoBlazor.Factories;

/// <summary>
/// Default factory implementation for creating WFS Layer Selector components.
/// </summary>
public class DefaultWfsLayerSelectorFactory : IWfsLayerSelectorFactory
{
    /// <inheritdoc/>
    public RenderFragment CreateComponent(
        EventCallback<WfsLayerConfig>? onConfigGenerated = null,
        string? initialUrl = null,
        string? initialVersion = null)
    {
        return builder =>
        {
            builder.OpenComponent<WfsLayerSelector>(0);
            
            if (onConfigGenerated.HasValue)
            {
                builder.AddAttribute(1, nameof(WfsLayerSelector.OnConfigGenerated), onConfigGenerated.Value);
            }
            
            if (!string.IsNullOrEmpty(initialUrl))
            {
                builder.AddAttribute(2, nameof(WfsLayerSelector.InitialUrl), initialUrl);
            }
            
            if (!string.IsNullOrEmpty(initialVersion))
            {
                builder.AddAttribute(3, nameof(WfsLayerSelector.InitialVersion), initialVersion);
            }
            
            builder.CloseComponent();
        };
    }
}

namespace PyroGeoBlazor.Factories;

using Microsoft.AspNetCore.Components;

using PyroGeoBlazor.Components;
using PyroGeoBlazor.Models;

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
            builder.OpenComponent<DefaultWfsLayerSelector>(0);
            
            if (onConfigGenerated.HasValue)
            {
                builder.AddAttribute(1, nameof(DefaultWfsLayerSelector.OnConfigGenerated), onConfigGenerated.Value);
            }
            
            if (!string.IsNullOrEmpty(initialUrl))
            {
                builder.AddAttribute(2, nameof(DefaultWfsLayerSelector.InitialUrl), initialUrl);
            }
            
            if (!string.IsNullOrEmpty(initialVersion))
            {
                builder.AddAttribute(3, nameof(DefaultWfsLayerSelector.InitialVersion), initialVersion);
            }
            
            builder.CloseComponent();
        };
    }
}

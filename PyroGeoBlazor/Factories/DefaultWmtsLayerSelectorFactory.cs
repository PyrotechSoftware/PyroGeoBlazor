using Microsoft.AspNetCore.Components;
using PyroGeoBlazor.Components;
using PyroGeoBlazor.Models;

namespace PyroGeoBlazor.Factories;

/// <summary>
/// Default factory implementation for creating WMTS Layer Selector components.
/// </summary>
public class DefaultWmtsLayerSelectorFactory : IWmtsLayerSelectorFactory
{
    /// <inheritdoc/>
    public RenderFragment CreateComponent(
        EventCallback<WmtsUrlTemplate>? onUrlTemplateGenerated = null,
        string? initialUrl = null,
        string? initialVersion = null)
    {
        return builder =>
        {
            builder.OpenComponent<WmtsLayerSelector>(0);
            
            if (onUrlTemplateGenerated.HasValue)
            {
                builder.AddAttribute(1, nameof(WmtsLayerSelector.OnUrlTemplateGenerated), onUrlTemplateGenerated.Value);
            }
            
            if (!string.IsNullOrEmpty(initialUrl))
            {
                builder.AddAttribute(2, nameof(WmtsLayerSelector.InitialUrl), initialUrl);
            }
            
            if (!string.IsNullOrEmpty(initialVersion))
            {
                builder.AddAttribute(3, nameof(WmtsLayerSelector.InitialVersion), initialVersion);
            }
            
            builder.CloseComponent();
        };
    }
}

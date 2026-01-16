namespace PyroGeoBlazor.Demo;

using Microsoft.AspNetCore.Components;

using PyroGeoBlazor.Demo.Components;
using PyroGeoBlazor.Factories;
using PyroGeoBlazor.Models;

public class MudBlazorWmtsFactory : IWmtsLayerSelectorFactory
{
    public RenderFragment CreateComponent(
        EventCallback<WmtsUrlTemplate>? onUrlTemplateGenerated = null,
        string? initialUrl = null,
        string? initialVersion = null)
    {
        return builder =>
        {
            builder.OpenComponent<CustomWMTSLayerSelector>(0);

            if (onUrlTemplateGenerated.HasValue)
            {
                builder.AddAttribute(1,
                    nameof(CustomWMTSLayerSelector.OnUrlTemplateGenerated),
                    onUrlTemplateGenerated.Value);
            }

            if (!string.IsNullOrEmpty(initialUrl))
            {
                builder.AddAttribute(2,
                    nameof(CustomWMTSLayerSelector.InitialUrl),
                    initialUrl);
            }

            if (!string.IsNullOrEmpty(initialVersion))
            {
                builder.AddAttribute(3,
                    nameof(CustomWMTSLayerSelector.InitialVersion),
                    initialVersion);
            }

            builder.CloseComponent();
        };
    }
}

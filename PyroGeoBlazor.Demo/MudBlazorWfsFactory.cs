namespace PyroGeoBlazor.Demo;

using Microsoft.AspNetCore.Components;

using PyroGeoBlazor.Demo.Components;
using PyroGeoBlazor.Factories;
using PyroGeoBlazor.Models;

public class MudBlazorWfsFactory : IWfsLayerSelectorFactory
{
    public RenderFragment CreateComponent(EventCallback<WfsLayerConfig>? onConfigGenerated = null, string? initialUrl = null, string? initialVersion = null)
    {
        return builder =>
        {
            builder.OpenComponent<CustomWfsLayerSelector>(0);
            if (onConfigGenerated.HasValue)
            {
                builder.AddAttribute(1, "OnConfigGenerated", onConfigGenerated);
            }
            if (initialUrl != null)
            {
                builder.AddAttribute(2, "InitialUrl", initialUrl);
            }
            if (initialVersion != null)
            {
                builder.AddAttribute(3, "InitialVersion", initialVersion);
            }

            builder.CloseComponent();
        };
    }
}

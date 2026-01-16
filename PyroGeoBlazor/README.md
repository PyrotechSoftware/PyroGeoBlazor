# PyroGeoBlazor - Layer Selector Components

PyroGeoBlazor is a Razor class library that provides reusable components for selecting layers from WMTS and WFS services.

## Features

- **WMTS Layer Selector**: Select layers from WMTS GetCapabilities and generate URL templates
- **WFS Layer Selector**: Select layers from WFS GetCapabilities and generate configuration objects
- **Factory Pattern**: Easy replacement with custom implementations while maintaining the same instantiation pattern
- **Dependency Injection**: Components are registered via DI for flexibility

## Installation

1. Reference the PyroGeoBlazor library in your project
2. Register the services in `Program.cs`:

```csharp
using PyroGeoBlazor.Extensions;

builder.Services.AddPyroGeoBlazor();
```

## Usage

### Using the Components

Simply add the components to your Razor pages. They automatically use the registered factory implementation:

```razor
@page "/layer-selectors"
@using PyroGeoBlazor.Components
@using PyroGeoBlazor.Models

<WmtsLayerSelector OnUrlTemplateGenerated="OnWmtsUrlGenerated" />
<WfsLayerSelector OnConfigGenerated="OnWfsConfigGenerated" />

@code {
    private void OnWmtsUrlGenerated(WmtsUrlTemplate template)
    {
        Console.WriteLine($"URL Template: {template.UrlTemplate}");
    }

    private void OnWfsConfigGenerated(WfsLayerConfig config)
    {
        Console.WriteLine($"Layer: {config.TypeName}");
    }
}
```

**Key Feature**: When you use `<WmtsLayerSelector />` or `<WfsLayerSelector />`, they automatically render the implementation registered via the factory. If you register a custom factory, your custom component is used. If you don't, the default Bootstrap-based component is used.

## Customization

### Creating a Custom Component

You can create custom components using any UI framework (MudBlazor, Blazorise, Radzen, etc.). Your custom component just needs to accept the same parameters:

1. Create your custom component:

```razor
@* Can use MudBlazor, Blazorise, or any other UI framework! *@
@using PyroGeoBlazor.Models
@using MudBlazor
@inject HttpClient HttpClient

<MudPaper Class="pa-4">
    <MudTextField @bind-Value="url" Label="WMTS URL" />
    <MudButton OnClick="Generate">Generate Template</MudButton>
</MudPaper>

@code {
    [Parameter]
    public EventCallback<WmtsUrlTemplate> OnUrlTemplateGenerated { get; set; }

    [Parameter]
    public string? InitialUrl { get; set; }

    [Parameter]
    public string? InitialVersion { get; set; }

    private string url = string.Empty;

    protected override void OnInitialized()
    {
        if (!string.IsNullOrEmpty(InitialUrl))
        {
            url = InitialUrl;
        }
    }

    // Your custom implementation using MudBlazor components
}
```

2. Create a custom factory:

```csharp
using Microsoft.AspNetCore.Components;
using PyroGeoBlazor.Factories;
using PyroGeoBlazor.Models;

public class MyCustomWmtsFactory : IWmtsLayerSelectorFactory
{
    public RenderFragment CreateComponent(
        EventCallback<WmtsUrlTemplate>? onUrlTemplateGenerated = null,
        string? initialUrl = null,
        string? initialVersion = null)
    {
        return builder =>
        {
            builder.OpenComponent<MyCustomWmtsSelector>(0);
            
            if (onUrlTemplateGenerated.HasValue)
            {
                builder.AddAttribute(1, nameof(MyCustomWmtsSelector.OnUrlTemplateGenerated), onUrlTemplateGenerated.Value);
            }
            
            if (!string.IsNullOrEmpty(initialUrl))
            {
                builder.AddAttribute(2, nameof(MyCustomWmtsSelector.InitialUrl), initialUrl);
            }
            
            if (!string.IsNullOrEmpty(initialVersion))
            {
                builder.AddAttribute(3, nameof(MyCustomWmtsSelector.InitialVersion), initialVersion);
            }
            
            builder.CloseComponent();
        };
    }
}
```

3. Register your custom factories in `Program.cs`:

```csharp
using PyroGeoBlazor.Extensions;

// Use custom factories for both WMTS and WFS
builder.Services.AddPyroGeoBlazor<MyCustomWmtsFactory, MyCustomWfsFactory>();

// Or keep one default and replace the other
// Note: You'll need to register them individually in this case:
builder.Services.AddSingleton<IWmtsLayerSelectorFactory, MyCustomWmtsFactory>();
builder.Services.AddSingleton<IWfsLayerSelectorFactory, DefaultWfsLayerSelectorFactory>();
```

4. Use the component - it automatically renders your custom implementation:

```razor
@* This now renders your MudBlazor component! *@
<WmtsLayerSelector OnUrlTemplateGenerated="OnWmtsUrlGenerated" />
```

**The key benefit**: You always use `<WmtsLayerSelector />` and `<WfsLayerSelector />` in your code, regardless of whether you're using the default Bootstrap components or custom components with MudBlazor, Blazorise, Radzen, or any other UI framework!

## Component Parameters

### WmtsLayerSelector

| Parameter | Type | Description |
|-----------|------|-------------|
| OnUrlTemplateGenerated | EventCallback<WmtsUrlTemplate> | Callback fired when a URL template is generated |
| InitialUrl | string? | Optional initial GetCapabilities URL |
| InitialVersion | string? | Optional initial WMTS version (default: "1.0.0") |

### WfsLayerSelector

| Parameter | Type | Description |
|-----------|------|-------------|
| OnConfigGenerated | EventCallback<WfsLayerConfig> | Callback fired when a configuration is generated |
| InitialUrl | string? | Optional initial GetCapabilities URL |
| InitialVersion | string? | Optional initial WFS version (default: "2.0.0") |

## Models

### WmtsUrlTemplate

Contains the generated WMTS URL template:
- `UrlTemplate`: The URL template string with placeholders
- `Layer`: Layer identifier
- `TileMatrixSet`: Tile matrix set identifier
- `Format`: Image format (e.g., "image/png")
- `Style`: Style identifier

### WfsLayerConfig

Contains the WFS layer configuration:
- `ServiceUrl`: Base URL for the WFS service
- `TypeName`: Layer name to request
- `Version`: WFS version
- `SrsName`: Coordinate reference system
- `BoundingBox`: Layer bounding box
- `MaxFeatures`: Maximum features to retrieve
- `AvailableLayers`: List of all available layers from the service

## License

See the LICENSE.txt file in the root of the repository.

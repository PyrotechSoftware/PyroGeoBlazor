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

### Using Default Components Directly

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

### Using Factory Wrappers (Recommended for Customization)

The factory wrappers allow you to use the default components or custom replacements with the same instantiation pattern:

```razor
@page "/custom-selectors"
@using PyroGeoBlazor.Components
@using PyroGeoBlazor.Models

<WmtsLayerSelectorWrapper 
    OnUrlTemplateGenerated="OnWmtsUrlGenerated"
    InitialUrl="https://server.com/wmts?REQUEST=GetCapabilities"
    InitialVersion="1.0.0" />

<WfsLayerSelectorWrapper 
    OnConfigGenerated="OnWfsConfigGenerated"
    InitialUrl="https://server.com/wfs?REQUEST=GetCapabilities"
    InitialVersion="2.0.0" />

@code {
    // Same event handlers as above
}
```

## Customization

### Creating a Custom Component

1. Create your custom component that accepts the same parameters:

```razor
@using PyroGeoBlazor.Models
@inject HttpClient HttpClient

<div class="my-custom-wmts-selector">
    <h3>My Custom WMTS Selector</h3>
    <!-- Your custom UI here -->
</div>

@code {
    [Parameter]
    public EventCallback<WmtsUrlTemplate> OnUrlTemplateGenerated { get; set; }

    [Parameter]
    public string? InitialUrl { get; set; }

    [Parameter]
    public string? InitialVersion { get; set; }

    // Your custom implementation
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

4. Use the wrapper components - they will automatically use your custom implementation:

```razor
<WmtsLayerSelectorWrapper OnUrlTemplateGenerated="OnWmtsUrlGenerated" />
```

**The key benefit**: The instantiation pattern remains identical whether you're using the default or custom components!

## Component Parameters

### WmtsLayerSelector / WmtsLayerSelectorWrapper

| Parameter | Type | Description |
|-----------|------|-------------|
| OnUrlTemplateGenerated | EventCallback<WmtsUrlTemplate> | Callback fired when a URL template is generated |
| InitialUrl | string? | Optional initial GetCapabilities URL |
| InitialVersion | string? | Optional initial WMTS version (default: "1.0.0") |

### WfsLayerSelector / WfsLayerSelectorWrapper

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

# WMTS and WFS Layer Selector Components - Usage Examples

This document provides practical examples of how to use the WMTS and WFS layer selector components in your Blazor application.

## Quick Start

### 1. Register Services

In your `Program.cs`:

```csharp
using PyroGeoBlazor.Extensions;

// Add PyroGeoBlazor services with default components
builder.Services.AddPyroGeoBlazor();
```

### 2. Basic Usage

```razor
@page "/map-with-selectors"
@using PyroGeoBlazor.Components
@using PyroGeoBlazor.Models

<h1>Select Map Layers</h1>

<div class="row">
    <div class="col-md-6">
        <WmtsLayerSelector OnUrlTemplateGenerated="OnWmtsUrlGenerated" />
    </div>
    
    <div class="col-md-6">
        <WfsLayerSelector OnConfigGenerated="OnWfsConfigGenerated" />
    </div>
</div>

@code {
    private void OnWmtsUrlGenerated(WmtsUrlTemplate template)
    {
        // Use the URL template to create a WMTS layer
        Console.WriteLine($"WMTS URL: {template.UrlTemplate}");
        // Example: Add to map as tile layer
    }

    private void OnWfsConfigGenerated(WfsLayerConfig config)
    {
        // Use the config to create a WFS layer
        Console.WriteLine($"WFS Layer: {config.TypeName}");
        // Example: Create WfsLayer instance
    }
}
```

## Advanced Usage

### Using Initial Values

Pre-populate the selectors with default values:

```razor
<WmtsLayerSelector 
    InitialUrl="https://your-geoserver.com/gwc/service/wmts?REQUEST=GetCapabilities"
    InitialVersion="1.0.0"
    OnUrlTemplateGenerated="OnWmtsUrlGenerated" />

<WfsLayerSelector 
    InitialUrl="https://your-geoserver.com/ows?SERVICE=WFS&REQUEST=GetCapabilities"
    InitialVersion="2.0.0"
    OnConfigGenerated="OnWfsConfigGenerated" />
```

### Integration with Leaflet Map

Complete example showing how to integrate the selectors with a Leaflet map:

```razor
@page "/interactive-map"
@using PyroGeoBlazor.Components
@using PyroGeoBlazor.Models
@using PyroGeoBlazor.Leaflet.Components
@using PyroGeoBlazor.Leaflet.Models

<div class="container-fluid">
    <div class="row">
        <div class="col-md-3">
            <h3>Layer Controls</h3>
            
            <div class="card mb-3">
                <div class="card-header">WMTS Layers</div>
                <div class="card-body">
                    <WmtsLayerSelector OnUrlTemplateGenerated="AddWmtsLayer" />
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">WFS Layers</div>
                <div class="card-body">
                    <WfsLayerSelector OnConfigGenerated="AddWfsLayer" />
                </div>
            </div>
        </div>
        
        <div class="col-md-9">
            <LeafletMap Map="@map" Height="800px" />
        </div>
    </div>
</div>

@code {
    private Map? map;

    protected override void OnInitialized()
    {
        map = new Map("interactive-map", new MapOptions
        {
            Center = new LatLng(0, 0),
            Zoom = 2
        }, autoInitialize: true);
    }

    private async Task AddWmtsLayer(WmtsUrlTemplate template)
    {
        if (map == null) return;
        
        // Create a tile layer from the WMTS URL template
        var tileLayer = new TileLayer(template.UrlTemplate, new TileLayerOptions
        {
            Attribution = $"Layer: {template.Layer}"
        });
        
        await tileLayer.AddTo(map);
        Console.WriteLine($"Added WMTS layer: {template.Layer}");
    }

    private async Task AddWfsLayer(WfsLayerConfig config)
    {
        if (map == null) return;
        
        // Create a WFS layer from the configuration
        var wfsLayer = new WfsLayer(config.ServiceUrl, new WfsLayerOptions
        {
            RequestParameters = new WfsRequestParameters
            {
                TypeName = config.TypeName,
                Version = config.Version,
                SrsName = config.SrsName,
                BBox = config.BoundingBox
            }
        });
        
        await wfsLayer.AddTo(map);
        await wfsLayer.LoadFeaturesAsync();
        Console.WriteLine($"Added WFS layer: {config.TypeName}");
    }
}
```

## Custom Component Implementation

### Step 1: Create Your Custom Component

```razor
@* MyCustomWmtsSelector.razor *@
@using PyroGeoBlazor.Models
@inject HttpClient HttpClient

<div class="custom-selector">
    <h4>🗺️ Custom WMTS Selector</h4>
    
    <input @bind="url" placeholder="WMTS GetCapabilities URL" class="form-control" />
    <button @onclick="LoadCapabilities" class="btn btn-success mt-2">
        Load Layers
    </button>
    
    @if (layers.Count > 0)
    {
        <select @bind="selectedLayer" class="form-control mt-2">
            @foreach (var layer in layers)
            {
                <option value="@layer">@layer</option>
            }
        </select>
        
        <button @onclick="Generate" class="btn btn-primary mt-2">
            Generate Template
        </button>
    }
</div>

@code {
    [Parameter]
    public EventCallback<WmtsUrlTemplate> OnUrlTemplateGenerated { get; set; }
    
    [Parameter]
    public string? InitialUrl { get; set; }
    
    [Parameter]
    public string? InitialVersion { get; set; }
    
    private string url = string.Empty;
    private string selectedLayer = string.Empty;
    private List<string> layers = new();
    
    protected override void OnInitialized()
    {
        if (!string.IsNullOrEmpty(InitialUrl))
        {
            url = InitialUrl;
        }
    }
    
    private async Task LoadCapabilities()
    {
        // Your custom implementation to parse WMTS capabilities
        // This is simplified - see the default component for full XML parsing
        layers = new List<string> { "layer1", "layer2", "layer3" };
    }
    
    private async Task Generate()
    {
        var template = new WmtsUrlTemplate
        {
            UrlTemplate = $"https://server.com/{selectedLayer}/{{z}}/{{x}}/{{y}}.png",
            Layer = selectedLayer,
            TileMatrixSet = "EPSG:3857",
            Format = "image/png",
            Style = "default"
        };
        
        await OnUrlTemplateGenerated.InvokeAsync(template);
    }
}
```

### Step 2: Create a Custom Factory

```csharp
// MyCustomWmtsFactory.cs
using Microsoft.AspNetCore.Components;
using PyroGeoBlazor.Factories;
using PyroGeoBlazor.Models;

namespace MyApp.Factories;

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
                builder.AddAttribute(1, nameof(MyCustomWmtsSelector.OnUrlTemplateGenerated), 
                    onUrlTemplateGenerated.Value);
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

### Step 3: Register Your Custom Factory

```csharp
// Program.cs
using PyroGeoBlazor.Extensions;
using MyApp.Factories;

// Replace WMTS factory, keep default WFS factory
builder.Services.AddPyroGeoBlazor<MyCustomWmtsFactory, DefaultWfsLayerSelectorFactory>();

// Or register individually for more control:
builder.Services.AddSingleton<IWmtsLayerSelectorFactory, MyCustomWmtsFactory>();
builder.Services.AddSingleton<IWfsLayerSelectorFactory, DefaultWfsLayerSelectorFactory>();
```

### Step 4: Use the Wrapper Component

```razor
@* Your usage stays the same! *@
<WmtsLayerSelectorWrapper 
    OnUrlTemplateGenerated="OnWmtsUrlGenerated"
    InitialUrl="https://example.com/wmts" />
```

**The key advantage**: Your custom component is now used automatically, but the instantiation code remains identical!

## Working with GeoServer

### Example: Connect to GeoServer WMTS

```razor
<WmtsLayerSelector 
    InitialUrl="https://your-geoserver.com/geoserver/gwc/service/wmts?REQUEST=GetCapabilities"
    OnUrlTemplateGenerated="@(template => AddGeoServerWmts(template))" />

@code {
    private void AddGeoServerWmts(WmtsUrlTemplate template)
    {
        // Template.UrlTemplate will be in format:
        // https://your-geoserver.com/geoserver/gwc/service/wmts/1.0.0/{Layer}/{Style}/{TileMatrixSet}/{z}/{y}/{x}.png
        Console.WriteLine($"Layer: {template.Layer}");
        Console.WriteLine($"Style: {template.Style}");
        Console.WriteLine($"Format: {template.Format}");
    }
}
```

### Example: Connect to GeoServer WFS

```razor
<WfsLayerSelector 
    InitialUrl="https://your-geoserver.com/geoserver/ows?SERVICE=WFS&REQUEST=GetCapabilities"
    OnConfigGenerated="@(config => AddGeoServerWfs(config))" />

@code {
    private void AddGeoServerWfs(WfsLayerConfig config)
    {
        // Config contains:
        // - ServiceUrl: Base URL
        // - TypeName: e.g., "workspace:layername"
        // - Version: e.g., "2.0.0"
        // - SrsName: e.g., "EPSG:4326"
        // - BoundingBox: WGS84 bounds
        // - AvailableLayers: All layers from GetCapabilities
        
        Console.WriteLine($"Adding WFS layer: {config.TypeName}");
        Console.WriteLine($"CRS: {config.SrsName}");
        Console.WriteLine($"Bounds: {config.BoundingBox?.MinX}, {config.BoundingBox?.MinY} to " +
                         $"{config.BoundingBox?.MaxX}, {config.BoundingBox?.MaxY}");
    }
}
```

## Styling

The components use Bootstrap CSS classes by default. You can add custom styling:

```css
/* In your app.css or component CSS */
.wmts-layer-selector,
.wfs-layer-selector {
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.custom-selector {
    border: 2px solid #007bff;
    padding: 1.5rem;
    border-radius: 8px;
}
```

## Error Handling

Both components display error messages automatically, but you can also handle errors programmatically:

```razor
<WfsLayerSelector OnConfigGenerated="OnWfsConfigGenerated" />

@if (!string.IsNullOrEmpty(errorMessage))
{
    <div class="alert alert-danger">@errorMessage</div>
}

@code {
    private string? errorMessage;
    
    private async Task OnWfsConfigGenerated(WfsLayerConfig config)
    {
        try
        {
            // Process the configuration
            await CreateWfsLayer(config);
            errorMessage = null;
        }
        catch (Exception ex)
        {
            errorMessage = $"Failed to create WFS layer: {ex.Message}";
        }
    }
}
```

## Tips and Best Practices

1. **Always provide InitialUrl in production** - Makes it easier for users
2. **Use the wrapper components** - They provide the flexibility of the factory pattern
3. **Cache GetCapabilities responses** - Consider caching if users frequently access the same services
4. **Validate URLs** - Add client-side validation for better UX
5. **Handle CORS** - Ensure your GeoServer has appropriate CORS headers configured
6. **Test with different WFS/WMTS versions** - Servers may support multiple protocol versions

## Troubleshooting

### Components not rendering
- Ensure `AddPyroGeoBlazor()` is called in Program.cs
- Check that you have the correct using statements

### GetCapabilities fails
- Verify the URL is accessible (try in browser)
- Check CORS configuration on the server
- Ensure proper URL format (include SERVICE and REQUEST parameters for WFS)

### Factory not using custom component
- Verify your factory is registered before `AddPyroGeoBlazor()`
- Check that your custom component implements the required parameters
- Ensure the wrapper component is used, not the direct component

For more information, see the [README.md](README.md) in the PyroGeoBlazor library.

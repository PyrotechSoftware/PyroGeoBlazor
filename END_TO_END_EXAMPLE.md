# End-to-End Example: From Setup to Custom Implementation

This guide walks through a complete implementation, from initial setup with default components to creating and using a custom MudBlazor implementation.

## Phase 1: Initial Setup with Default Components

### Step 1: Add NuGet References

```xml
<!-- YourProject.csproj -->
<ItemGroup>
    <ProjectReference Include="..\PyroGeoBlazor\PyroGeoBlazor.csproj" />
    <ProjectReference Include="..\PyroGeoBlazor.Leaflet\PyroGeoBlazor.Leaflet.csproj" />
</ItemGroup>
```

### Step 2: Register Services

```csharp
// Program.cs
using PyroGeoBlazor.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

builder.Services.AddPyroGeoBlazor();  // Register with defaults

var app = builder.Build();
// ... rest of app configuration
```

### Step 3: Create Your First Page

```razor
@* Pages/MapLayers.razor *@
@page "/map-layers"
@using PyroGeoBlazor.Components
@using PyroGeoBlazor.Models
@using PyroGeoBlazor.Leaflet.Components
@using PyroGeoBlazor.Leaflet.Models

<PageTitle>Map Layers</PageTitle>

<div class="container-fluid">
    <div class="row">
        <div class="col-md-4">
            <h3>Select WMTS Layer</h3>
            <WmtsLayerSelector OnUrlTemplateGenerated="AddWmtsLayer" />
        </div>
        
        <div class="col-md-8">
            <LeafletMap Map="@map" Height="600px" />
        </div>
    </div>
</div>

@code {
    private Map? map;

    protected override void OnInitialized()
    {
        map = new Map("map-container", new MapOptions
        {
            Center = new LatLng(0, 0),
            Zoom = 3
        }, autoInitialize: true);
        
        // Add base layer
        var baseLayer = new TileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            new TileLayerOptions
            {
                Attribution = "© OpenStreetMap contributors"
            });
        baseLayer.AddTo(map);
    }

    private async Task AddWmtsLayer(WmtsUrlTemplate template)
    {
        if (map == null) return;
        
        var wmtsLayer = new TileLayer(template.UrlTemplate, new TileLayerOptions
        {
            Attribution = $"WMTS: {template.Layer}"
        });
        
        await wmtsLayer.AddTo(map);
        Console.WriteLine($"Added WMTS layer: {template.Layer}");
    }
}
```

✅ **At this point, you have a working application with Bootstrap-based layer selectors!**

---

## Phase 2: Upgrading to MudBlazor

Your team decides to use MudBlazor for a more modern UI. Here's how to upgrade without changing your existing pages.

### Step 1: Add MudBlazor NuGet Package

```bash
dotnet add package MudBlazor
```

### Step 2: Create Custom MudBlazor Component

```razor
@* Components/MudBlazorWmtsSelector.razor *@
@using PyroGeoBlazor.Models
@using MudBlazor
@inject HttpClient HttpClient

<MudCard Elevation="3">
    <MudCardHeader>
        <CardHeaderContent>
            <MudText Typo="Typo.h6">
                <MudIcon Icon="@Icons.Material.Filled.Layers" Class="mr-2" />
                WMTS Layer Selector
            </MudText>
        </CardHeaderContent>
    </MudCardHeader>
    
    <MudCardContent>
        <MudTextField 
            @bind-Value="capabilitiesUrl"
            Label="GetCapabilities URL"
            Variant="Variant.Outlined"
            HelperText="Enter the WMTS GetCapabilities endpoint"
            Adornment="Adornment.Start"
            AdornmentIcon="@Icons.Material.Filled.Link"
            Class="mb-3" />
        
        <MudSelect 
            @bind-Value="selectedVersion"
            Label="WMTS Version"
            Variant="Variant.Outlined"
            Class="mb-3">
            <MudSelectItem Value="@("1.0.0")">1.0.0</MudSelectItem>
        </MudSelect>
        
        <MudButton 
            OnClick="FetchCapabilities"
            Variant="Variant.Filled"
            Color="Color.Primary"
            StartIcon="@Icons.Material.Filled.CloudDownload"
            FullWidth="true"
            Disabled="@isLoading">
            @if (isLoading)
            {
                <MudProgressCircular Size="Size.Small" Indeterminate="true" Class="mr-2" />
                <span>Loading...</span>
            }
            else
            {
                <span>Get Capabilities</span>
            }
        </MudButton>
        
        @if (!string.IsNullOrEmpty(errorMessage))
        {
            <MudAlert Severity="Severity.Error" Class="mt-3" Dense="true">
                @errorMessage
            </MudAlert>
        }
        
        @if (capabilities != null && capabilities.Layers.Count > 0)
        {
            <MudDivider Class="my-3" />
            
            <MudSelect 
                @bind-Value="selectedLayerIdentifier"
                Label="Available Layers"
                Variant="Variant.Outlined"
                AnchorOrigin="Origin.BottomCenter">
                @foreach (var layer in capabilities.Layers)
                {
                    <MudSelectItem Value="@layer.Identifier">
                        <MudText Typo="Typo.body2">@layer.Title</MudText>
                        <MudText Typo="Typo.caption">@layer.Identifier</MudText>
                    </MudSelectItem>
                }
            </MudSelect>
            
            @if (!string.IsNullOrEmpty(selectedLayerIdentifier))
            {
                var selectedLayer = capabilities.Layers.FirstOrDefault(l => l.Identifier == selectedLayerIdentifier);
                if (selectedLayer != null)
                {
                    <MudPaper Class="pa-3 mt-3" Outlined="true">
                        <MudText Typo="Typo.subtitle2" GutterBottom="true">Layer Details</MudText>
                        
                        @if (selectedLayer.TileMatrixSets.Count > 0)
                        {
                            <MudSelect 
                                @bind-Value="selectedTileMatrixSet"
                                Label="Tile Matrix Set"
                                Variant="Variant.Outlined"
                                Class="mb-2">
                                @foreach (var tms in selectedLayer.TileMatrixSets)
                                {
                                    <MudSelectItem Value="@tms">@tms</MudSelectItem>
                                }
                            </MudSelect>
                        }
                        
                        @if (selectedLayer.Formats.Count > 0)
                        {
                            <MudSelect 
                                @bind-Value="selectedFormat"
                                Label="Format"
                                Variant="Variant.Outlined"
                                Class="mb-2">
                                @foreach (var format in selectedLayer.Formats)
                                {
                                    <MudSelectItem Value="@format">@format</MudSelectItem>
                                }
                            </MudSelect>
                        }
                        
                        <MudButton 
                            OnClick="GenerateUrlTemplate"
                            Variant="Variant.Filled"
                            Color="Color.Success"
                            StartIcon="@Icons.Material.Filled.CheckCircle"
                            FullWidth="true"
                            Class="mt-2">
                            Generate URL Template
                        </MudButton>
                    </MudPaper>
                    
                    @if (generatedUrlTemplate != null)
                    {
                        <MudAlert Severity="Severity.Success" Class="mt-3">
                            <MudText Typo="Typo.subtitle2">✓ URL Template Generated!</MudText>
                            <MudText Typo="Typo.caption" Class="mt-2">
                                <code style="word-break: break-all;">@generatedUrlTemplate.UrlTemplate</code>
                            </MudText>
                        </MudAlert>
                    }
                }
            }
        }
    </MudCardContent>
</MudCard>

@code {
    [Parameter] public EventCallback<WmtsUrlTemplate> OnUrlTemplateGenerated { get; set; }
    [Parameter] public string? InitialUrl { get; set; }
    [Parameter] public string? InitialVersion { get; set; }

    private string capabilitiesUrl = string.Empty;
    private string selectedVersion = "1.0.0";
    private bool isLoading;
    private string? errorMessage;
    private WmtsCapabilities? capabilities;
    private string selectedLayerIdentifier = string.Empty;
    private string selectedTileMatrixSet = string.Empty;
    private string selectedFormat = string.Empty;
    private WmtsUrlTemplate? generatedUrlTemplate;

    protected override void OnInitialized()
    {
        if (!string.IsNullOrEmpty(InitialUrl))
            capabilitiesUrl = InitialUrl;
        if (!string.IsNullOrEmpty(InitialVersion))
            selectedVersion = InitialVersion;
    }

    private async Task FetchCapabilities()
    {
        isLoading = true;
        errorMessage = null;
        capabilities = null;
        StateHasChanged();

        try
        {
            var url = capabilitiesUrl;
            if (!url.Contains("REQUEST=GetCapabilities", StringComparison.OrdinalIgnoreCase))
            {
                var separator = url.Contains('?') ? '&' : '?';
                url = $"{url}{separator}SERVICE=WMTS&VERSION={selectedVersion}&REQUEST=GetCapabilities";
            }

            var response = await HttpClient.GetStringAsync(url);
            capabilities = ParseWmtsCapabilities(response, capabilitiesUrl);

            if (capabilities.Layers.Count == 0)
                errorMessage = "No layers found in the GetCapabilities response.";
        }
        catch (Exception ex)
        {
            errorMessage = $"Error: {ex.Message}";
        }
        finally
        {
            isLoading = false;
            StateHasChanged();
        }
    }

    private WmtsCapabilities ParseWmtsCapabilities(string xmlContent, string serviceUrl)
    {
        // Copy parsing logic from DefaultWmtsLayerSelector.razor
        // For brevity, simplified here - use the full implementation from the default component
        var capabilities = new WmtsCapabilities { ServiceUrl = serviceUrl };
        
        try
        {
            var doc = System.Xml.Linq.XDocument.Parse(xmlContent);
            var ns = doc.Root?.Name.Namespace ?? System.Xml.Linq.XNamespace.None;
            var owsNs = System.Xml.Linq.XNamespace.Get("http://www.opengis.net/ows/1.1");

            var contents = doc.Root?.Element(ns + "Contents");
            if (contents != null)
            {
                foreach (var layerElement in contents.Elements(ns + "Layer"))
                {
                    var layer = new WmtsLayerInfo
                    {
                        Identifier = layerElement.Element(owsNs + "Identifier")?.Value ?? string.Empty,
                        Title = layerElement.Element(owsNs + "Title")?.Value ?? string.Empty
                    };
                    
                    layer.Formats = layerElement.Elements(ns + "Format").Select(f => f.Value).ToList();
                    layer.TileMatrixSets = layerElement.Elements(ns + "TileMatrixSetLink")
                        .Select(tms => tms.Element(ns + "TileMatrixSet")?.Value ?? string.Empty)
                        .Where(tms => !string.IsNullOrEmpty(tms))
                        .ToList();
                    
                    capabilities.Layers.Add(layer);
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error parsing WMTS capabilities: {ex.Message}");
        }

        return capabilities;
    }

    private async Task GenerateUrlTemplate()
    {
        if (string.IsNullOrEmpty(selectedLayerIdentifier) || capabilities == null)
            return;

        var layer = capabilities.Layers.FirstOrDefault(l => l.Identifier == selectedLayerIdentifier);
        if (layer == null) return;

        var tileMatrixSet = !string.IsNullOrEmpty(selectedTileMatrixSet) 
            ? selectedTileMatrixSet 
            : layer.TileMatrixSets.FirstOrDefault() ?? string.Empty;
        var format = !string.IsNullOrEmpty(selectedFormat) 
            ? selectedFormat 
            : layer.Formats.FirstOrDefault() ?? "image/png";
        var extension = format.Contains("png") ? "png" : "jpg";

        var baseUrl = capabilities.ServiceUrl.Split('?')[0];
        var urlTemplate = $"{baseUrl}/1.0.0/{selectedLayerIdentifier}/default/{tileMatrixSet}/{{z}}/{{y}}/{{x}}.{extension}";

        generatedUrlTemplate = new WmtsUrlTemplate
        {
            UrlTemplate = urlTemplate,
            Layer = selectedLayerIdentifier,
            TileMatrixSet = tileMatrixSet,
            Format = format,
            Style = "default"
        };

        await OnUrlTemplateGenerated.InvokeAsync(generatedUrlTemplate);
        StateHasChanged();
    }
}
```

### Step 3: Create Factory

```csharp
// Factories/MudBlazorWmtsFactory.cs
using Microsoft.AspNetCore.Components;
using PyroGeoBlazor.Factories;
using PyroGeoBlazor.Models;
using YourApp.Components;

namespace YourApp.Factories;

public class MudBlazorWmtsFactory : IWmtsLayerSelectorFactory
{
    public RenderFragment CreateComponent(
        EventCallback<WmtsUrlTemplate>? onUrlTemplateGenerated = null,
        string? initialUrl = null,
        string? initialVersion = null)
    {
        return builder =>
        {
            builder.OpenComponent<MudBlazorWmtsSelector>(0);
            
            if (onUrlTemplateGenerated.HasValue)
            {
                builder.AddAttribute(1, 
                    nameof(MudBlazorWmtsSelector.OnUrlTemplateGenerated), 
                    onUrlTemplateGenerated.Value);
            }
            
            if (!string.IsNullOrEmpty(initialUrl))
            {
                builder.AddAttribute(2, 
                    nameof(MudBlazorWmtsSelector.InitialUrl), 
                    initialUrl);
            }
            
            if (!string.IsNullOrEmpty(initialVersion))
            {
                builder.AddAttribute(3, 
                    nameof(MudBlazorWmtsSelector.InitialVersion), 
                    initialVersion);
            }
            
            builder.CloseComponent();
        };
    }
}
```

### Step 4: Update Service Registration

```csharp
// Program.cs
using PyroGeoBlazor.Extensions;
using PyroGeoBlazor.Factories;
using YourApp.Factories;
using MudBlazor.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

builder.Services.AddMudServices();  // Add MudBlazor

// Register with custom MudBlazor WMTS, keep default WFS
builder.Services.AddPyroGeoBlazor<MudBlazorWmtsFactory, DefaultWfsLayerSelectorFactory>();

var app = builder.Build();
// ... rest of app configuration
```

### Step 5: Update Layout (Add MudBlazor)

```razor
@* App.razor or MainLayout.razor *@
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <base href="/" />
    <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" rel="stylesheet" />
    <link href="_content/MudBlazor/MudBlazor.min.css" rel="stylesheet" />
</head>
<body>
    <MudThemeProvider />
    <MudDialogProvider />
    <MudSnackbarProvider />
    
    @Body
    
    <script src="_content/MudBlazor/MudBlazor.min.js"></script>
</body>
</html>
```

### Step 6: YOUR EXISTING PAGE CODE DOESN'T CHANGE!

```razor
@* Pages/MapLayers.razor - EXACT SAME CODE AS BEFORE *@
@page "/map-layers"
@using PyroGeoBlazor.Components
@using PyroGeoBlazor.Models

<div class="container-fluid">
    <div class="row">
        <div class="col-md-4">
            <h3>Select WMTS Layer</h3>
            @* This now renders the MudBlazor component! *@
            <WmtsLayerSelector OnUrlTemplateGenerated="AddWmtsLayer" />
        </div>
        
        <div class="col-md-8">
            <LeafletMap Map="@map" Height="600px" />
        </div>
    </div>
</div>

@code {
    // ... EXACT SAME CODE AS BEFORE
}
```

✅ **Your page now uses MudBlazor components without any code changes!**

---

## Summary

**What Changed:**
1. Added MudBlazor NuGet package
2. Created `MudBlazorWmtsSelector.razor` component
3. Created `MudBlazorWmtsFactory.cs` factory
4. Updated one line in `Program.cs`
5. Added MudBlazor references to layout

**What Didn't Change:**
- ❌ No changes to `MapLayers.razor` page
- ❌ No changes to event handlers
- ❌ No changes to data models
- ❌ No changes to other pages using the selectors

**Result:**
- ✅ Modern MudBlazor UI
- ✅ Same component tags everywhere: `<WmtsLayerSelector />`
- ✅ Easy to switch back or try other frameworks (Blazorise, Radzen, etc.)
- ✅ Different projects can use different UI frameworks
- ✅ Type-safe and IntelliSense-friendly

This is the power of the factory pattern implementation!

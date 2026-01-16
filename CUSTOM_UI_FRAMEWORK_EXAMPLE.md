# Example: Creating a MudBlazor-based Custom Selector

This example shows how to create a custom WMTS Layer Selector using MudBlazor components, and have it automatically used when you write `<WmtsLayerSelector />` in your code.

## Step 1: Create the Custom MudBlazor Component

```razor
@* MyMudBlazorWmtsSelector.razor *@
@using PyroGeoBlazor.Models
@using MudBlazor
@inject HttpClient HttpClient

<MudPaper Class="pa-4" Elevation="2">
    <MudText Typo="Typo.h6" Class="mb-4">🗺️ WMTS Layer Selector</MudText>
    
    <MudTextField 
        @bind-Value="capabilitiesUrl" 
        Label="GetCapabilities URL"
        Variant="Variant.Outlined"
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
        Disabled="@isLoading"
        StartIcon="@Icons.Material.Filled.Download"
        FullWidth="true">
        @if (isLoading)
        {
            <MudProgressCircular Size="Size.Small" Indeterminate="true" />
            <MudText Class="ml-2">Loading...</MudText>
        }
        else
        {
            <MudText>Get Capabilities</MudText>
        }
    </MudButton>
    
    @if (!string.IsNullOrEmpty(errorMessage))
    {
        <MudAlert Severity="Severity.Error" Class="mt-3">@errorMessage</MudAlert>
    }
    
    @if (capabilities != null && capabilities.Layers.Count > 0)
    {
        <MudSelect 
            @bind-Value="selectedLayerIdentifier" 
            Label="Select Layer"
            Variant="Variant.Outlined"
            Class="mt-3">
            @foreach (var layer in capabilities.Layers)
            {
                <MudSelectItem Value="@layer.Identifier">
                    @layer.Title (@layer.Identifier)
                </MudSelectItem>
            }
        </MudSelect>
        
        @if (!string.IsNullOrEmpty(selectedLayerIdentifier))
        {
            var selectedLayer = capabilities.Layers.FirstOrDefault(l => l.Identifier == selectedLayerIdentifier);
            if (selectedLayer != null)
            {
                <MudPaper Class="pa-3 mt-3" Outlined="true">
                    <MudText Typo="Typo.subtitle2" Class="mb-2">Layer Details</MudText>
                    <MudText Typo="Typo.body2"><strong>Title:</strong> @selectedLayer.Title</MudText>
                    
                    @if (selectedLayer.TileMatrixSets.Count > 0)
                    {
                        <MudSelect 
                            @bind-Value="selectedTileMatrixSet" 
                            Label="Tile Matrix Set"
                            Variant="Variant.Outlined"
                            Class="mt-2">
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
                            Class="mt-2">
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
                        StartIcon="@Icons.Material.Filled.Check"
                        FullWidth="true"
                        Class="mt-3">
                        Generate URL Template
                    </MudButton>
                </MudPaper>
                
                @if (generatedUrlTemplate != null)
                {
                    <MudAlert Severity="Severity.Success" Class="mt-3">
                        <MudText Typo="Typo.subtitle2">URL Template Generated!</MudText>
                        <MudText Typo="Typo.body2" Class="mt-2">
                            <strong>Template:</strong><br/>
                            <code>@generatedUrlTemplate.UrlTemplate</code>
                        </MudText>
                    </MudAlert>
                }
            }
        }
    }
</MudPaper>

@code {
    [Parameter]
    public EventCallback<WmtsUrlTemplate> OnUrlTemplateGenerated { get; set; }

    [Parameter]
    public string? InitialUrl { get; set; }

    [Parameter]
    public string? InitialVersion { get; set; }

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
        {
            capabilitiesUrl = InitialUrl;
        }

        if (!string.IsNullOrEmpty(InitialVersion))
        {
            selectedVersion = InitialVersion;
        }
    }

    private async Task FetchCapabilities()
    {
        isLoading = true;
        errorMessage = null;
        capabilities = null;
        StateHasChanged();

        try
        {
            // Use the same parsing logic as DefaultWmtsLayerSelector
            var url = capabilitiesUrl;
            if (!url.Contains("REQUEST=GetCapabilities", StringComparison.OrdinalIgnoreCase))
            {
                var separator = url.Contains('?') ? '&' : '?';
                url = $"{url}{separator}SERVICE=WMTS&VERSION={selectedVersion}&REQUEST=GetCapabilities";
            }

            var response = await HttpClient.GetStringAsync(url);
            capabilities = ParseWmtsCapabilities(response, capabilitiesUrl);

            if (capabilities.Layers.Count == 0)
            {
                errorMessage = "No layers found in the GetCapabilities response.";
            }
        }
        catch (Exception ex)
        {
            errorMessage = $"Error fetching capabilities: {ex.Message}";
        }
        finally
        {
            isLoading = false;
            StateHasChanged();
        }
    }

    private WmtsCapabilities ParseWmtsCapabilities(string xmlContent, string serviceUrl)
    {
        // Copy the parsing logic from DefaultWmtsLayerSelector
        // This is omitted for brevity - use the same implementation
        return new WmtsCapabilities { ServiceUrl = serviceUrl };
    }

    private async Task GenerateUrlTemplate()
    {
        if (string.IsNullOrEmpty(selectedLayerIdentifier) || capabilities == null)
        {
            return;
        }

        var layer = capabilities.Layers.FirstOrDefault(l => l.Identifier == selectedLayerIdentifier);
        if (layer == null)
        {
            return;
        }

        var tileMatrixSet = !string.IsNullOrEmpty(selectedTileMatrixSet) ? selectedTileMatrixSet : layer.TileMatrixSets.FirstOrDefault() ?? string.Empty;
        var format = !string.IsNullOrEmpty(selectedFormat) ? selectedFormat : layer.Formats.FirstOrDefault() ?? "image/png";
        var extension = format.Contains("png") ? "png" : format.Contains("jpeg") || format.Contains("jpg") ? "jpg" : "png";

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

## Step 2: Create the Factory

```csharp
// MyMudBlazorWmtsFactory.cs
using Microsoft.AspNetCore.Components;
using PyroGeoBlazor.Factories;
using PyroGeoBlazor.Models;

namespace MyApp.Factories;

public class MyMudBlazorWmtsFactory : IWmtsLayerSelectorFactory
{
    public RenderFragment CreateComponent(
        EventCallback<WmtsUrlTemplate>? onUrlTemplateGenerated = null,
        string? initialUrl = null,
        string? initialVersion = null)
    {
        return builder =>
        {
            builder.OpenComponent<MyMudBlazorWmtsSelector>(0);
            
            if (onUrlTemplateGenerated.HasValue)
            {
                builder.AddAttribute(1, nameof(MyMudBlazorWmtsSelector.OnUrlTemplateGenerated), 
                    onUrlTemplateGenerated.Value);
            }
            
            if (!string.IsNullOrEmpty(initialUrl))
            {
                builder.AddAttribute(2, nameof(MyMudBlazorWmtsSelector.InitialUrl), initialUrl);
            }
            
            if (!string.IsNullOrEmpty(initialVersion))
            {
                builder.AddAttribute(3, nameof(MyMudBlazorWmtsSelector.InitialVersion), initialVersion);
            }
            
            builder.CloseComponent();
        };
    }
}
```

## Step 3: Register in Program.cs

```csharp
using PyroGeoBlazor.Extensions;
using PyroGeoBlazor.Factories;
using MyApp.Factories;

var builder = WebApplication.CreateBuilder(args);

// Register MudBlazor
builder.Services.AddMudServices();

// Register PyroGeoBlazor with custom MudBlazor WMTS selector and default WFS selector
builder.Services.AddPyroGeoBlazor<MyMudBlazorWmtsFactory, DefaultWfsLayerSelectorFactory>();

// Or register individually:
// builder.Services.AddSingleton<IWmtsLayerSelectorFactory, MyMudBlazorWmtsFactory>();
// builder.Services.AddSingleton<IWfsLayerSelectorFactory, DefaultWfsLayerSelectorFactory>();
```

## Step 4: Use the Component

Now you can use the component normally, and it will automatically render your MudBlazor version:

```razor
@page "/my-map-page"
@using PyroGeoBlazor.Components
@using PyroGeoBlazor.Models

<h1>My Map Application</h1>

@* This will render your MudBlazor component automatically! *@
<WmtsLayerSelector OnUrlTemplateGenerated="HandleWmtsUrl" />

@code {
    private void HandleWmtsUrl(WmtsUrlTemplate template)
    {
        Console.WriteLine($"Got WMTS template from MudBlazor component: {template.UrlTemplate}");
    }
}
```

## Key Benefits

1. **Same Component Tag**: You always use `<WmtsLayerSelector />` regardless of the implementation
2. **Different UI Frameworks**: Your custom component can use MudBlazor, Blazorise, Radzen, or any other framework
3. **Same Parameters**: All implementations accept the same parameters (OnUrlTemplateGenerated, InitialUrl, InitialVersion)
4. **Easy Switching**: Change the registered factory in one place (Program.cs) and all usages automatically update
5. **No Code Changes**: Existing code doesn't need to change when you switch between default and custom implementations

## Example with Blazorise

The same pattern works with Blazorise:

```razor
@* MyBlazoriseWfsSelector.razor *@
@using Blazorise
@using PyroGeoBlazor.Models

<Card>
    <CardHeader>
        <CardTitle>WFS Layer Selector</CardTitle>
    </CardHeader>
    <CardBody>
        <Field>
            <FieldLabel>GetCapabilities URL</FieldLabel>
            <TextEdit @bind-Text="url" Placeholder="Enter URL..." />
        </Field>
        
        <Field>
            <FieldLabel>Version</FieldLabel>
            <Select @bind-SelectedValue="version">
                <SelectItem Value="1.0.0">1.0.0</SelectItem>
                <SelectItem Value="1.1.0">1.1.0</SelectItem>
                <SelectItem Value="2.0.0">2.0.0</SelectItem>
            </Select>
        </Field>
        
        <Button Color="Color.Primary" Clicked="LoadCapabilities">
            <Icon Name="IconName.Download" /> Get Capabilities
        </Button>
    </CardBody>
</Card>

@code {
    [Parameter] public EventCallback<WfsLayerConfig> OnConfigGenerated { get; set; }
    [Parameter] public string? InitialUrl { get; set; }
    [Parameter] public string? InitialVersion { get; set; }
    
    // Implementation...
}
```

Then register and use the same way - the component tag `<WfsLayerSelector />` stays the same!

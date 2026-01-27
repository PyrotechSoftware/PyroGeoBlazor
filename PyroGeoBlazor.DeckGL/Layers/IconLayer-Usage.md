# IconLayer Usage

## Overview
The `IconLayer` component allows you to place custom icons or the default Google Maps-style pin markers at specific coordinates on your map.

## Basic Usage - Default Pin Marker

Place a red map pin at a location:

```razor
<DeckGLView @ref="deckGLView" InitialViewState="@initialViewState">
    <LayersContent>
        <IconLayer 
            Id="markers"
            Data="@markerData"
            Pickable="true"
            Visible="true" />
    </LayersContent>
</DeckGLView>

@code {
    private object markerData = new[]
    {
        new { coordinates = new[] { -122.45, 37.8 }, name = "San Francisco" },
        new { coordinates = new[] { -74.006, 40.7128 }, name = "New York" }
    };
    
    private ViewState initialViewState = new()
    {
        Longitude = -98.5,
        Latitude = 39.8,
        Zoom = 4
    };
}
```

## Customizing Pin Color

Change the pin color using the `Color` parameter (RGBA array):

```razor
<IconLayer 
    Id="markers"
    Data="@markerData"
    Color="@(new[] { 0, 128, 255, 255 })"  @* Blue pins *@
    Pickable="true" />
```

## Customizing Icon Size

```razor
<IconLayer 
    Id="markers"
    Data="@markerData"
    IconSize="48"           @* Larger icons *@
    SizeScale="1.5"         @* Additional scale multiplier *@
    Pickable="true" />
```

## Using Custom Icons

Provide your own icon atlas and mapping:

```razor
<IconLayer 
    Id="custom-markers"
    Data="@markerData"
    IconAtlas="path/to/your-icon-atlas.png"
    IconMapping="@customIconMapping"
    IconName="custom-pin"
    Pickable="true" />

@code {
    private object customIconMapping = new
    {
        custom_pin = new
        {
            x = 0,
            y = 0,
            width = 128,
            height = 128,
            mask = true,
            anchorY = 128
        }
    };
}
```

## Data Format

The data should contain coordinates and any additional properties:

```csharp
// Simple array of points
private object markerData = new[]
{
    new { coordinates = new[] { -122.45, 37.8 } },
    new { coordinates = new[] { -74.006, 40.7128 } }
};

// With additional properties for tooltips/styling
private object markerData = new[]
{
    new 
    { 
        coordinates = new[] { -122.45, 37.8 },
        name = "San Francisco",
        population = 881549
    },
    new 
    { 
        coordinates = new[] { -74.006, 40.7128 },
        name = "New York",
        population = 8336817
    }
};
```

## Programmatic Usage

You can also add markers programmatically:

```csharp
var layerConfig = new IconLayerConfig
{
    Id = "dynamic-markers",
    Data = new[]
    {
        new { coordinates = new[] { -122.45, 37.8 }, name = "Marker 1" },
        new { coordinates = new[] { -100.0, 40.0 }, name = "Marker 2" }
    },
    Pickable = true,
    Visible = true
};

layerConfig.Props["getColor"] = new[] { 255, 0, 0, 255 };  // Red
layerConfig.IconSize = 32;

await deckGLView.AddLayer(layerConfig, updateLayers: true);
```

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `Data` | `object` | - | Array of points with coordinates |
| `DataUrl` | `string` | - | URL to fetch point data from |
| `IconAtlas` | `string` | Default pin | URL to icon atlas image |
| `IconMapping` | `object` | Default pin mapping | Icon definitions |
| `IconName` | `string` | `"marker"` | Name of icon from mapping |
| `IconSize` | `double` | `32` | Icon size in pixels |
| `Color` | `int[]` | `[255, 0, 0, 255]` | RGBA color tint |
| `SizeScale` | `double` | `1.0` | Size multiplier |
| `SizeMinPixels` | `double` | `0` | Minimum icon size |
| `SizeMaxPixels` | `double` | `double.MaxValue` | Maximum icon size |
| `Billboard` | `bool` | `true` | Always face camera |
| `Pickable` | `bool` | `false` | Enable click/hover events |
| `Visible` | `bool` | `true` | Layer visibility |

## deck.gl Documentation

For more advanced usage, see the [deck.gl IconLayer documentation](https://deck.gl/docs/api-reference/layers/icon-layer).

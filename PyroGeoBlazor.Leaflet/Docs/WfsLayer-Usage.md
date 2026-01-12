# WfsLayer Usage Guide

The `WfsLayer` class simplifies loading features from GeoServer WFS endpoints.

## Basic Usage

```csharp
// Create WFS layer
var wfsLayer = new WfsLayer(
    wfsUrl: "https://lims.koleta.co.mz/geoserver/PlannerSpatial/ows",
    wfsParameters: new WfsRequestParameters
    {
        TypeName = "PlannerSpatial:Township",
        MaxFeatures = 5000  // Recommended for performance
    },
    options: new GeoJsonLayerOptions
    {
        MultipleFeatureSelection = true,
        SelectedFeatureStyle = new PathOptions
        {
            Fill = true,
            FillColor = "rgba(50,150,250,0.5)",
            FillOpacity = 0.5,
            Stroke = true,
            Weight = 3,
            Color = "rgba(50,150,250,0.9)"
        }
    }
);

// Subscribe to events
wfsLayer.OnFeatureClicked += (sender, args) =>
{
    Console.WriteLine($"Feature clicked: {args?.Feature?.Id}");
};

wfsLayer.OnFeatureSelected += (sender, args) =>
{
    Console.WriteLine($"Feature selected: {args?.Feature?.Id}");
};

// Add to map
await wfsLayer.AddTo(PositionMap);

// Load features from WFS
await wfsLayer.LoadFeaturesAsync();

// Add to layer control
await LayersControl.AddOverlay(wfsLayer, "Townships");
```

## With CQL Filter

```csharp
var wfsLayer = new WfsLayer(
    wfsUrl: "https://lims.koleta.co.mz/geoserver/PlannerSpatial/ows",
    wfsParameters: new WfsRequestParameters
    {
        TypeName = "PlannerSpatial:Township",
        MaxFeatures = 1000,
        CqlFilter = "population > 50000"  // Filter by attribute
    },
    options: new GeoJsonLayerOptions()
);

await wfsLayer.AddTo(PositionMap);
await wfsLayer.LoadFeaturesAsync();
```

## With Bounding Box Filter

```csharp
var wfsLayer = new WfsLayer(
    wfsUrl: "https://lims.koleta.co.mz/geoserver/PlannerSpatial/ows",
    wfsParameters: new WfsRequestParameters
    {
        TypeName = "PlannerSpatial:vwParcelsLayer",
        MaxFeatures = 10000,
        BBox = new WfsBoundingBox
        {
            MinX = 174.0,
            MinY = -43.0,
            MaxX = 175.0,
            MaxY = -42.0,
            Srs = "EPSG:4326"
        }
    },
    options: new GeoJsonLayerOptions()
);

await wfsLayer.AddTo(PositionMap);
await wfsLayer.LoadFeaturesAsync();
```

## With Custom Styling

```csharp
private PathOptions OnStyle(GeoJsonFeature feature)
{
    // Style based on properties
    if (feature.Properties?.TryGetValue("TownCode", out var code) == true 
        && code?.ToString() == "010")
    {
        return new PathOptions
        {
            Fill = true,
            FillColor = "red",
            FillOpacity = 0.5,
            Weight = 3
        };
    }
    
    return new PathOptions
    {
        Fill = true,
        FillColor = "blue",
        FillOpacity = 0.2,
        Weight = 1
    };
}

var wfsLayer = new WfsLayer(
    wfsUrl: "https://lims.koleta.co.mz/geoserver/PlannerSpatial/ows",
    wfsParameters: new WfsRequestParameters
    {
        TypeName = "PlannerSpatial:Township",
        MaxFeatures = 5000
    },
    options: new GeoJsonLayerOptions(
        onEachFeature: OnEachFeatureCreated,
        pointToLayer: OnPointToLayer,
        style: OnStyle,
        filter: OnFeatureFilter,
        coordsToLatLng: OnCoordsToLatLng
    )
    {
        MultipleFeatureSelection = true
    }
);

await wfsLayer.AddTo(PositionMap);
await wfsLayer.LoadFeaturesAsync();
```

## With Specific Properties

```csharp
// Only fetch specific attributes to reduce data transfer
var wfsLayer = new WfsLayer(
    wfsUrl: "https://lims.koleta.co.mz/geoserver/PlannerSpatial/ows",
    wfsParameters: new WfsRequestParameters
    {
        TypeName = "PlannerSpatial:Township",
        PropertyName = "TownCode,TownName,geometry",  // Only these fields
        MaxFeatures = 5000
    },
    options: new GeoJsonLayerOptions()
);

await wfsLayer.AddTo(PositionMap);
await wfsLayer.LoadFeaturesAsync();
```

## Error Handling

```csharp
var wfsLayer = new WfsLayer(
    wfsUrl: "https://lims.koleta.co.mz/geoserver/PlannerSpatial/ows",
    wfsParameters: new WfsRequestParameters
    {
        TypeName = "PlannerSpatial:Township",
        MaxFeatures = 5000
    },
    options: new GeoJsonLayerOptions()
);

try
{
    await wfsLayer.AddTo(PositionMap);
    await wfsLayer.LoadFeaturesAsync();
    await LayersControl.AddOverlay(wfsLayer, "Townships");
}
catch (HttpRequestException ex)
{
    Console.WriteLine($"Failed to load WFS data: {ex.Message}");
}
```

## WfsRequestParameters Reference

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `TypeName` | `string` | Feature type name (e.g., "workspace:layer") | ✅ Yes |
| `Version` | `string` | WFS version (default: "1.0.0") | No |
| `MaxFeatures` | `int?` | Maximum features to return | No (recommended) |
| `CqlFilter` | `string?` | CQL filter expression | No |
| `PropertyName` | `string?` | Comma-separated property names | No |
| `SrsName` | `string?` | Spatial reference system (e.g., "EPSG:4326") | No |
| `BBox` | `WfsBoundingBox?` | Bounding box filter | No |

## Performance Tips

1. **Always set `MaxFeatures`** - Prevents loading huge datasets
2. **Use `CqlFilter`** - Filter on the server side
3. **Use `PropertyName`** - Only fetch needed attributes
4. **Use `BBox`** - Load only visible features

## When to Use WfsLayer vs VectorTileLayer

| Use Case | Solution | Max Features |
|----------|----------|--------------|
| Small datasets | `WfsLayer` | < 5,000 |
| Medium datasets | `SlicerVectorTileLayer` | 5K - 50K |
| Large datasets | `ProtobufVectorTileLayer` | > 50K |

## Complete Example

```csharp
public async Task AddWfsLayerAsync()
{
    if (PositionMap is null) return;

    var wfsLayer = new WfsLayer(
        wfsUrl: "https://lims.koleta.co.mz/geoserver/PlannerSpatial/ows",
        wfsParameters: new WfsRequestParameters
        {
            TypeName = "PlannerSpatial:Township",
            MaxFeatures = 5000,
            SrsName = "EPSG:4326"
        },
        options: new GeoJsonLayerOptions
        {
            MultipleFeatureSelection = true,
            SelectedFeatureStyle = new PathOptions
            {
                Fill = true,
                FillColor = "rgba(50,150,250,0.5)",
                FillOpacity = 0.5,
                Stroke = true,
                Weight = 3,
                Color = "rgba(50,150,250,0.9)"
            }
        }
    );

    // Subscribe to events
    wfsLayer.OnFeatureSelected += (sender, args) =>
    {
        if (args?.Feature?.Properties is not null)
        {
            var json = JsonSerializer.Serialize(args.Feature.Properties);
            Console.WriteLine($"Selected: {json}");
        }
    };

    // Add to map and load data
    try
    {
        await wfsLayer.AddTo(PositionMap);
        await wfsLayer.LoadFeaturesAsync();
        await LayersControl.AddOverlay(wfsLayer, "WFS Townships");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error: {ex.Message}");
    }
}
```

# ExcludedProperties Feature Documentation

## Overview
The `ExcludedProperties` feature allows you to hide specific properties from being displayed in the `FeatureAttributesControl` when users select features on the map. This is useful for hiding technical fields, internal identifiers, or redundant data that users don't need to see.

## How It Works

### 1. Configure ExcludedProperties in LayerConfig

You can now set the `ExcludedProperties` property directly on any `LayerConfig` object:

```csharp
var geoJsonLayer = new GeoJsonLayerConfig
{
    Id = "my-layer",
    DataUrl = "/api/features",
    Pickable = true,
    IsEditable = true,
    
    // Exclude specific properties from being displayed in the attributes panel
    ExcludedProperties = new[] { "geometry", "bbox", "internalId", "timestamp" },
    
    EditableFields =
    [
        new AttributeFieldConfig
        {
            FieldName = "name",
            DisplayName = "Feature Name",
            DataType = AttributeDataType.String,
            IsReadOnly = false
        }
    ]
};
```

### 2. Property Precedence

The `FeatureSelectionControl` uses a hierarchical approach to determine which properties to exclude:

1. **Explicit Parameter** (highest priority): If you pass `ExcludedProperties` directly to `FeatureSelectionControl`, it will use that.
2. **Layer Config** (fallback): If no explicit parameter is provided, it will use the `ExcludedProperties` from the layer's configuration.
3. **No Exclusions** (default): If neither is set, all properties are displayed.

```razor
@* Option 1: Use layer config (recommended) *@
<FeatureSelectionControl SelectionResult="@selectionResult" 
                         LayerConfigs="@layerConfigsDict" />

@* Option 2: Override with explicit parameter *@
<FeatureSelectionControl SelectionResult="@selectionResult" 
                         LayerConfigs="@layerConfigsDict"
                         ExcludedProperties="@(new[] { "customField1", "customField2" })" />
```

## Common Use Cases

### Hide Technical Fields
```csharp
ExcludedProperties = new[] { "geometry", "bbox", "id", "objectid", "globalid" }
```

### Hide Internal Metadata
```csharp
ExcludedProperties = new[] { "createdBy", "createdDate", "modifiedBy", "modifiedDate", "version" }
```

### Hide Redundant Display Properties
When you've configured `DisplayProperty` or `UniqueIdProperty`, you might want to exclude those from the detailed attributes:
```csharp
var layer = new GeoJsonLayerConfig
{
    Id = "parcels",
    UniqueIdProperty = "parcelId",
    DisplayProperty = "address",
    
    // Hide these since they're already shown in the feature name
    ExcludedProperties = new[] { "parcelId", "address" }
};
```

### Performance Optimization
Exclude large text fields or complex data that's not useful in the UI:
```csharp
ExcludedProperties = new[] { "fullDescription", "legalText", "rawData" }
```

## Example: Complete Layer Configuration

Here's a complete example showing how to configure a parcel layer with excluded properties:

```csharp
var parcelsLayer = new GeoJsonLayerConfig
{
    Id = "parcels",
    DataUrl = "/api/parcels",
    Pickable = true,
    IsEditable = true,
    
    // Display configuration
    UniqueIdProperty = "geoPropertyId",
    DisplayProperty = "customIdentifier",
    
    // Hide technical and redundant fields from the attributes panel
    ExcludedProperties = new[]
    {
        "geoPropertyId",        // Already used as unique ID
        "customIdentifier",     // Already shown in feature name
        "locationLatitude",     // Redundant with map display
        "locationLongitude",    // Redundant with map display
        "geometry"              // Not useful to display as text
    },
    
    // Tooltip configuration (these CAN be excluded from attributes but still show in tooltips)
    TooltipConfig = TooltipConfig.ForProperties("customIdentifier", "propertyId"),
    
    // Editable fields (independent of ExcludedProperties)
    EditableFields =
    [
        new AttributeFieldConfig
        {
            FieldName = "propertyId",
            DisplayName = "Property ID",
            DataType = AttributeDataType.Integer,
            IsReadOnly = false,
            Order = 1
        },
        new AttributeFieldConfig
        {
            FieldName = "source",
            DisplayName = "Data Source",
            DataType = AttributeDataType.String,
            IsReadOnly = true,
            Order = 2
        },
        new AttributeFieldConfig
        {
            FieldName = "lpi",
            DisplayName = "Legal Property Identifier",
            DataType = AttributeDataType.String,
            IsReadOnly = false,
            Order = 3
        }
    ]
};
```

## Important Notes

### ExcludedProperties vs EditableFields
- **`ExcludedProperties`**: Controls which properties are **hidden** from the attributes display
- **`EditableFields`**: Controls which properties are **shown and how they can be edited**

These work together:
1. First, `EditableFields` defines which fields to show and make editable
2. Then, `ExcludedProperties` filters out unwanted properties from everything else
3. Only properties that are:
   - In `EditableFields` (if IsEditable = true), OR
   - Not in `ExcludedProperties` (for display-only fields)
   
   will be visible in the attributes panel.

### Case Sensitivity
Property names in `ExcludedProperties` are **case-sensitive**. Make sure they match the exact property names from your GeoJSON data:

```csharp
// ✅ Correct
ExcludedProperties = new[] { "geoPropertyId", "customIdentifier" }

// ❌ Wrong (if actual property is "geoPropertyId")
ExcludedProperties = new[] { "GeoPropertyId", "CUSTOMIDENTIFIER" }
```

### Performance Impact
Excluding properties has minimal performance impact. The filtering happens on the client-side after data is loaded, so it doesn't reduce data transfer size. If you need to reduce data transfer, configure that on the server-side API endpoint instead.

## Integration with MapWorkspacePage

Here's how it's used in the Demo project's `MapWorkspacePage.razor`:

```csharp
private async Task OnDeckInitialized()
{
    var geoJsonLayer = new GeoJsonLayerConfig
    {
        Id = "geojson-layer",
        DataUrl = "https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/geojson/vancouver-blocks.json",
        Pickable = true,
        IsEditable = true,
        
        // Exclude the "growth" property from display
        ExcludedProperties = new[] { "growth" },
        
        EditableFields =
        [
            new AttributeFieldConfig
            {
                FieldName = "id",
                DisplayName = "ID",
                DataType = AttributeDataType.String,
                IsReadOnly = true,
                Order = 1
            },
            new AttributeFieldConfig
            {
                FieldName = "valuePerSqm",
                DisplayName = "Value per Sqm",
                DataType = AttributeDataType.Integer,
                IsReadOnly = false,
                Order = 2
            }
            // Note: "growth" is excluded via ExcludedProperties,
            // so it won't appear even if it's in the data
        ]
    };
    
    layers.Add(geoJsonLayer);
}
```

## Testing the Feature

1. **Run the Demo application**
2. **Navigate to the Map Workspace page** (`/map-workspace`)
3. **Select a feature** on the map
4. **View the Attributes Panel** on the right
5. **Verify** that excluded properties are not displayed

## API Reference

### LayerConfig.ExcludedProperties
```csharp
/// <summary>
/// Optional list of property names to exclude from the attributes display.
/// These properties will not be shown in the FeatureAttributesControl.
/// Example: new[] { "geometry", "bbox", "id" }
/// </summary>
[JsonIgnore]
public string[]? ExcludedProperties { get; set; }
```

### FeatureSelectionControl.GetEffectiveExcludedProperties()
```csharp
/// <summary>
/// Gets the effective excluded properties list, combining the explicit parameter with layer config.
/// If ExcludedProperties parameter is set, it takes precedence.
/// Otherwise, uses the ExcludedProperties from the layer config.
/// </summary>
private string[]? GetEffectiveExcludedProperties()
```

## Related Features

- **EditableFields**: Define which fields can be edited and their configuration
- **IsEditable**: Control whether the layer allows attribute editing
- **TooltipConfig**: Configure what properties appear in tooltips (independent of ExcludedProperties)
- **DisplayProperty**: Set the property used for feature names in the UI
- **UniqueIdProperty**: Set the property used for unique feature identification

## Troubleshooting

### Properties Still Showing
1. Check that property names match exactly (case-sensitive)
2. Verify `LayerConfigs` dictionary is being passed to `FeatureSelectionControl`
3. Check if properties are in `EditableFields` (they will show even if excluded)

### All Properties Hidden
1. Verify you haven't excluded too many properties
2. Check that `EditableFields` is configured if `IsEditable = true`
3. Ensure the layer has actual data with properties

### Layer Config Not Applied
1. Verify the layer ID in `LayerConfigs` dictionary matches the layer's actual ID
2. Ensure `LayerConfigs` is properly initialized before use
3. Check that `StateHasChanged()` is called after updating configurations

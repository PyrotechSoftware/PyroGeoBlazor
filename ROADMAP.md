# PyroGeoBlazor.DeckGL - Roadmap

## Feature Renderers & Styling

This document outlines planned enhancements for layer styling and rendering capabilities. These features will extend the current `UniqueValueRenderer` to provide a comprehensive suite of data-driven visualization options similar to ArcGIS and other GIS platforms.

---

## Planned Features

### 1. ClassBreaksRenderer
**Status:** 📋 Planned  
**Priority:** High  
**Complexity:** Medium

**Description:**  
Render features with different styles based on numeric ranges (class breaks). Ideal for continuous numeric data like population density, temperature, elevation, or any quantitative attribute.

**Use Cases:**
- Population density by census tract (0-100, 100-500, 500-1000, 1000+)
- Property values by ranges ($0-250k, $250k-500k, $500k-1M, $1M+)
- Temperature zones (below 0°C, 0-10°C, 10-20°C, 20°C+)
- Elevation ranges for topographic visualization

**Proposed API:**
```csharp
var renderer = new ClassBreaksRenderer
{
    Attribute = "population_density",
    ClassificationMethod = ClassificationMethod.NaturalBreaks, // or EqualInterval, Quantile, Manual
    ClassBreaks = new List<ClassBreak>
    {
        new() { MinValue = 0, MaxValue = 100, Style = FeatureStyle.Green, Label = "Low" },
        new() { MinValue = 100, MaxValue = 500, Style = FeatureStyle.Yellow, Label = "Medium" },
        new() { MinValue = 500, MaxValue = 1000, Style = FeatureStyle.Orange, Label = "High" },
        new() { MinValue = 1000, MaxValue = double.MaxValue, Style = FeatureStyle.Red, Label = "Very High" }
    },
    DefaultStyle = FeatureStyle.Gray
};
```

**Technical Considerations:**
- Support common classification methods (Jenks/Natural Breaks, Equal Interval, Quantile, Standard Deviation)
- Handle edge cases (null values, values outside all ranges)
- Provide utility methods to auto-calculate breaks from data
- Support inclusive/exclusive range boundaries

---

### 2. HeatmapRenderer
**Status:** 📋 Planned  
**Priority:** Medium  
**Complexity:** High

**Description:**  
Render continuous numeric values as a smooth color gradient (heat map). Uses interpolation between colors to show gradual transitions across the full value range.

**Use Cases:**
- Temperature maps with smooth color transitions
- Risk assessment visualizations
- Pollution concentration levels
- Age of buildings or infrastructure
- Any continuous scalar field

**Proposed API:**
```csharp
var renderer = new HeatmapRenderer
{
    Attribute = "temperature",
    ColorRamp = ColorRamp.RedYellowBlue, // Pre-defined ramps
    // Or custom:
    ColorStops = new List<ColorStop>
    {
        new() { Value = -10, Color = "#0000FF" },  // Blue for cold
        new() { Value = 0, Color = "#00FFFF" },    // Cyan
        new() { Value = 15, Color = "#00FF00" },   // Green
        new() { Value = 25, Color = "#FFFF00" },   // Yellow
        new() { Value = 35, Color = "#FF0000" }    // Red for hot
    },
    InterpolationMethod = InterpolationMethod.Linear, // or Cubic, Step
    NullStyle = FeatureStyle.Gray
};
```

**Technical Considerations:**
- Color interpolation in RGB or HSL space
- Support for predefined color ramps (Viridis, Plasma, Inferno, Turbo, etc.)
- Handle data normalization (min-max scaling)
- Support reverse color ramps
- Optional opacity interpolation

---

### 3. ProportionalSymbolRenderer
**Status:** 📋 Planned  
**Priority:** Medium  
**Complexity:** Medium

**Description:**  
Vary the size (radius/scale) of point symbols based on a numeric attribute value. Commonly used for point data where size represents magnitude.

**Use Cases:**
- City populations (larger circles = more people)
- Earthquake magnitudes
- Sales by store location
- Number of incidents by location
- Tree diameter in forest inventories

**Proposed API:**
```csharp
var renderer = new ProportionalSymbolRenderer
{
    Attribute = "population",
    MinSize = 5,      // Minimum radius in pixels
    MaxSize = 50,     // Maximum radius in pixels
    MinValue = 0,     // Data value for min size (optional - auto-calculated)
    MaxValue = 1000000, // Data value for max size (optional - auto-calculated)
    ScalingMethod = ScalingMethod.Linear, // or Logarithmic, SquareRoot, Exponential
    BaseStyle = new FeatureStyle
    {
        FillColor = "#4169E1",
        FillOpacity = 0.6,
        LineColor = "#1E3A8A",
        LineWidth = 2
    },
    NullStyle = new FeatureStyle
    {
        FillColor = "#868E96",
        RadiusScale = 0.5
    }
};
```

**Technical Considerations:**
- Support multiple scaling functions (linear, log, sqrt, power)
- Auto-calculate min/max from data if not specified
- Configurable size clamping (min/max radius limits)
- Option to combine with color styling (size + color = bivariate visualization)
- Handle zero and negative values appropriately

---

### 4. Visual Legend Component
**Status:** 📋 Planned  
**Priority:** High  
**Complexity:** Medium

**Description:**  
Auto-generate interactive legend UI components from any renderer configuration. Displays the symbology with labels, supports filtering/highlighting features by legend item.

**Use Cases:**
- Display unique value categories with color swatches
- Show class break ranges with gradient bars
- Present proportional symbol size references
- Allow users to toggle visibility by legend item
- Support interactive selection of features by category

**Proposed API:**
```razor
<!-- Auto-generates legend from renderer -->
<LegendControl LayerId="parcels-layer" 
               Position="LegendPosition.BottomRight"
               Title="Zoning Classification"
               Collapsible="true"
               AllowToggle="true"
               OnItemToggled="@OnLegendItemToggled" />

<!-- Manual legend definition -->
<LegendControl Title="Custom Legend">
    <LegendItems>
        <LegendItem Color="#FFE4B5" Label="Residential" Value="Residential" />
        <LegendItem Color="#FF6B6B" Label="Commercial" Value="Commercial" />
        <LegendItem Color="#A78BFA" Label="Industrial" Value="Industrial" />
    </LegendItems>
</LegendControl>
```

**Component Features:**
- **Auto-generation** - Parse renderer config to build legend
- **Interactive** - Click legend items to filter/highlight features
- **Toggleable** - Show/hide categories
- **Responsive** - Adapts to different screen sizes
- **Themed** - Respects MudBlazor theme colors
- **Exportable** - Generate legend images for reports

**Supported Renderer Types:**
- ✅ `UniqueValueRenderer` - Show each unique value with its color
- 🔲 `ClassBreaksRenderer` - Show ranges with gradient or discrete swatches
- 🔲 `HeatmapRenderer` - Show continuous color ramp with value labels
- 🔲 `ProportionalSymbolRenderer` - Show size scale with sample circles

**Technical Considerations:**
- Parse renderer configuration to extract styles and labels
- Generate appropriate legend symbols (patches, lines, points)
- Support multiple legend positions (corners, docked)
- Handle responsive layout (horizontal/vertical)
- Implement selection/filtering via legend interaction
- Export as SVG or PNG for reports

---

## Additional Future Enhancements

### 5. BiVariateRenderer (Future)
**Status:** 💡 Idea  
Combine two attributes in a single visualization (e.g., size by population + color by income).

### 6. DotDensityRenderer (Future)
**Status:** 💡 Idea  
Represent aggregate data with random dot placement (e.g., 1 dot = 100 people).

### 7. PictureMarkerSymbols (Future)
**Status:** 💡 Idea  
Use custom images/icons instead of simple circles for point features.

### 8. 3D/Extrusion Renderers (Future)
**Status:** 💡 Idea  
Extrude polygons to 3D based on attribute values (e.g., building heights).

### 9. Temporal/Animation Renderers (Future)
**Status:** 💡 Idea  
Animate features over time based on timestamp attributes.

### 10. Clustering Renderer (Future)
**Status:** 💡 Idea  
Aggregate nearby points into clusters with count indicators.

---

## Implementation Priority

### Phase 1 (Current)
- ✅ UniqueValueRenderer - **COMPLETED**
- ✅ Dynamic layer styling - **COMPLETED**
- ✅ Selection styling - **COMPLETED**

### Phase 2 (Next)
- 🎯 **Visual Legend Component** (enables users to understand existing visualizations)
- 🎯 **ClassBreaksRenderer** (most commonly requested numeric visualization)

### Phase 3 (Future)
- 📋 **HeatmapRenderer**
- 📋 **ProportionalSymbolRenderer**

### Phase 4 (Ideas)
- 💡 BiVariate, DotDensity, PictureMarker, 3D, Temporal, Clustering

---

## Contributing

Interested in implementing any of these features? Here's how to contribute:

1. **Check the status** - Ensure the feature isn't already in progress
2. **Open an issue** - Discuss the design and API before coding
3. **Follow patterns** - Use existing renderers as templates
4. **Write tests** - Include unit tests for C# and TypeScript
5. **Add examples** - Include demo pages showing the feature
6. **Document** - Update this roadmap and add XML docs

---

## Notes

- All renderers should support **selection override** (selected features show selection style)
- All renderers should support **hover styling** (optional hover highlights)
- All renderers should be **serializable** (work with Blazor state management)
- All renderers should integrate with the **legend component**
- TypeScript implementations should be **GPU-friendly** (use deck.gl accessors)

---

**Last Updated:** January 2025  
**Maintainer:** PyrotechSoftware  
**License:** MIT

---

## Attribute Editing Features

### Custom Field Renderers - Dictionary Approach

**Status:** 📋 Deferred for future implementation  
**Priority:** Low  
**Complexity:** Low (infrastructure already exists)

#### Description

Add support for programmatically defining custom field renderers using a dictionary-based approach, as an alternative to the declarative `<EditTemplates>` syntax currently implemented.

#### Background

The declarative approach is currently implemented and working:
```razor
<FeatureSelectionControl ...>
    <EditTemplates>
        <CustomFieldEditControl T="int" FieldName="valuePerSqm">
            <Template Context="ctx">
                <MudSlider ... />
            </Template>
        </CustomFieldEditControl>
    </EditTemplates>
</FeatureSelectionControl>
```

#### Use Cases for Dictionary Approach

- **Dynamic field generation** - When field configurations are loaded from a database or API
- **Reusable renderer libraries** - Shared renderers across multiple pages/applications
- **Runtime customization** - Field renderers that change based on user preferences or roles
- **Programmatic control** - Complex logic for determining which renderer to use

#### Proposed API

```csharp
@code {
    private Dictionary<string, RenderFragment<FeatureAttributesControl.FieldRenderContext>>? customFieldRenderers;

    protected override void OnInitialized()
    {
        customFieldRenderers = new()
        {
            ["valuePerSqm"] = context => @<div>
                <MudSlider T="int" 
                           Value="@((context.CurrentValue as int?) ?? 0)"
                           ValueChanged="@(v => context.SetValue(v))"
                           Min="0" Max="10000" Step="100" />
            </div>,
            
            ["status"] = context => @<MudChipSet>
                <MudChip Text="Active" OnClick="@(() => context.SetValue("Active"))" />
                <MudChip Text="Inactive" OnClick="@(() => context.SetValue("Inactive"))" />
            </MudChipSet>
        };
    }
}
```

```razor
<FeatureSelectionControl 
    CustomFieldRenderers="@customFieldRenderers"
    ... />
```

#### Implementation Notes

- The infrastructure already exists internally
- `GetMergedCustomRenderers()` method merges both approaches
- Just needs public API documentation and examples
- Declarative approach should always take precedence when both are provided

#### Alternative Considered

**Razor-based dictionary values:**
```csharp
customFieldRenderers = new()
{
    ["valuePerSqm"] = context => 
        @<MudSlider T="int" 
                   Value="@((context.CurrentValue as int?) ?? 0)"
                   ValueChanged="@(v => context.SetValue(v))" />
};
```

This is cleaner than `RenderTreeBuilder` but may have scope issues with the `context` variable.

---

### Other Attribute Editing Enhancements

#### 1. Batch Attribute Editing
**Status:** 💡 Idea  
Edit attributes for multiple selected features at once.

#### 2. Attribute Edit History
**Status:** 💡 Idea  
Track changes with undo/redo capability.

#### 3. Conditional Field Visibility
**Status:** 💡 Idea  
Show/hide fields based on other field values.

#### 4. Field Groups
**Status:** 💡 Idea  
Organize fields into collapsible sections.

#### 5. Inline Validation Rules
**Status:** 💡 Idea  
Define custom validation rules in field configuration.

#### 6. Async Field Loaders
**Status:** 💡 Idea  
Load field options asynchronously (e.g., from an API).

#### 7. Field Dependencies
**Status:** 💡 Idea  
Update field options based on other field values.

#### 8. Rich Text Fields
**Status:** 💡 Idea  
Built-in rich text editor for long text fields.

#### 9. Geometry Editing
**Status:** 💡 Idea  
Edit feature geometry in addition to attributes.

#### 10. Bulk Import/Export
**Status:** 💡 Idea  
Import/export attribute data from CSV/Excel.

---

*This roadmap is subject to change based on user feedback and project priorities.*

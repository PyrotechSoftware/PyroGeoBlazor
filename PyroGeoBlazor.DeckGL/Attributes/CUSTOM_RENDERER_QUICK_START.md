## Custom Field Renderers - Quick Start

Define custom edit controls for feature attributes using **declarative Razor syntax**.

### Basic Example

Add custom renderers to your `FeatureSelectionControl`:

```razor
<FeatureSelectionControl SelectionResult="@selectionResult" 
                         LayerConfigs="@layerConfigsDict"
                         OnFeatureClicked="@OnFeatureClickedInList"
                         OnFlashFeature="@OnFlashFeature"
                         OnZoomToFeature="@OnZoomToFeature"
                         OnUnselectFeature="@OnUnselectFeature"
                         OnZoomToLayerFeatures="@OnZoomToLayerFeatures"
                         OnClearLayerSelection="@OnClearLayerSelection"
                         OnAttributesSaved="@OnAttributesSaved"
                         OnAttributesReset="@OnAttributesReset">
    <EditTemplates>
        <!-- Custom slider for valuePerSqm field -->
        <CustomFieldEditControl T="int" FieldName="valuePerSqm">
            <Template Context="context">
                <div style="padding: 4px 0;">
                    <MudStack Spacing="1">
                        <MudText Typo="Typo.caption" Color="Color.Primary">
                            <strong>$@(context.Value?.ToString("N0") ?? "0")</strong> per sqm
                        </MudText>
                        <MudSlider T="int" 
                                   Value="@(context.Value ?? 0)"
                                   ValueChanged="@(value => context.SetValue(value))"
                                   Min="0"
                                   Max="10000"
                                   Step="100"
                                   Color="Color.Primary"
                                   Size="Size.Small" />
                        @if (context.HasError)
                        {
                            <MudAlert Severity="Severity.Error" Dense="true">
                                @context.ErrorText
                            </MudAlert>
                        }
                    </MudStack>
                </div>
            </Template>
        </CustomFieldEditControl>

        <!-- Custom rating for growth field -->
        <CustomFieldEditControl T="double" FieldName="growth">
            <Template Context="context">
                <div>
                    <MudRating SelectedValue="@(Convert.ToInt32(context.Value ?? 0))"
                               SelectedValueChanged="@(value => context.SetValue((double)value))"
                               MaxValue="5"
                               Color="Color.Success"
                               Size="Size.Small"
                               ReadOnly="@(context.Config?.IsReadOnly ?? false)" />
                    <MudText Typo="Typo.caption">
                        @context.Value growth rate
                    </MudText>
                </div>
            </Template>
        </CustomFieldEditControl>
    </EditTemplates>
</FeatureSelectionControl>
```

### That's it! No code-behind needed.

### How It Works

1. **Define custom controls** using `<CustomFieldEditControl>` inside `<EditTemplates>`
2. **Specify the field name** and type parameter
3. **Use the template context** to access current value and setter
4. **Fields without custom renderers** automatically use default controls based on their data type

### Context Properties Available

Inside the `<Template>` you have access to:

- `Value` (T?) - Current typed value
- `SetValue(object?)` - Method to update the value
- `FieldName` (string) - Field property name  
- `DisplayName` (string) - Display label
- `Config` (AttributeFieldConfig?) - Full field configuration
- `HasError` (bool) - Whether field has validation errors
- `ErrorText` (string?) - Error message if any

### More Examples

```razor
<EditTemplates>
    <!-- Color Picker -->
    <CustomFieldEditControl T="string" FieldName="color">
        <Template Context="ctx">
            <MudColorPicker Value="@(new MudColor(ctx.Value ?? "#FFFFFF"))"
                            ValueChanged="@(c => ctx.SetValue(c.ToString(MudColorOutputFormats.Hex)))"
                            Label="Choose Color" />
        </Template>
    </CustomFieldEditControl>

    <!-- Status Chip Selector -->
    <CustomFieldEditControl T="string" FieldName="status">
        <Template Context="ctx">
            <MudChipSet>
                <MudChip Text="Active" 
                         Color="Color.Success"
                         Variant="@(ctx.Value == "Active" ? Variant.Filled : Variant.Outlined)"
                         OnClick="@(() => ctx.SetValue("Active"))" />
                <MudChip Text="Inactive" 
                         Color="Color.Error"
                         Variant="@(ctx.Value == "Inactive" ? Variant.Filled : Variant.Outlined)"
                         OnClick="@(() => ctx.SetValue("Inactive"))" />
                <MudChip Text="Pending" 
                         Color="Color.Warning"
                         Variant="@(ctx.Value == "Pending" ? Variant.Filled : Variant.Outlined)"
                         OnClick="@(() => ctx.SetValue("Pending"))" />
            </MudChipSet>
        </Template>
    </CustomFieldEditControl>

    <!-- File Upload -->
    <CustomFieldEditControl T="string" FieldName="attachment">
        <Template Context="ctx">
            <MudFileUpload T="IBrowserFile" 
                           FilesChanged="@(file => ctx.SetValue(file?.Name))">
                <ButtonTemplate>
                    <MudButton HtmlTag="label"
                               Variant="Variant.Filled"
                               Color="Color.Primary"
                               StartIcon="@Icons.Material.Filled.CloudUpload"
                               for="@context.Id">
                        Upload File
                    </MudButton>
                </ButtonTemplate>
            </MudFileUpload>
            @if (!string.IsNullOrEmpty(ctx.Value))
            {
                <MudChip Text="@ctx.Value" Icon="@Icons.Material.Filled.AttachFile" />
            }
        </Template>
    </CustomFieldEditControl>
</EditTemplates>
```

### Benefits

✅ **Clean Syntax** - Standard Razor markup  
✅ **IntelliSense** - Full IDE support  
✅ **Type-Safe** - Generic parameter ensures type safety  
✅ **No Code-Behind** - Define everything in markup  
✅ **Selective** - Only customize fields you need  

### Result

When you click on a feature:
1. Fields with custom renderers use your custom controls
2. Other fields automatically use default controls (text input, numeric input, checkbox, etc.)
3. All changes are tracked and validated
4. Save/Reset buttons appear when changes are made

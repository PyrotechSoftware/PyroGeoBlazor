# Custom Field Renderers - Comprehensive Guide

## Overview

The `FeatureAttributesControl` supports custom render templates for specific fields using declarative Razor syntax. This allows you to provide completely custom UI for any field while using default controls for others.

## Architecture

### Components

- **`CustomFieldEditControl<T>`** - Defines a custom renderer for a specific field
- **`FieldTemplateContainer`** - Collects and registers field templates (internal)
- **`CustomFieldContext<T>`** - Context passed to custom templates

### How It Works

1. Define `<CustomFieldEditControl>` components inside `<EditTemplates>`
2. Each control specifies a field name and type parameter
3. Templates are collected via cascading parameters
4. At render time, custom templates override default controls
5. Fields without custom templates use built-in controls automatically

## Basic Example

```razor
<FeatureSelectionControl SelectionResult="@selectionResult" 
                         LayerConfigs="@layerConfigsDict"
                         ...>
    <EditTemplates>
        <CustomFieldEditControl T="int" FieldName="price">
            <Template Context="ctx">
                <MudSlider T="int" 
                           Value="@(ctx.Value ?? 0)"
                           ValueChanged="@(v => ctx.SetValue(v))"
                           Min="0" Max="1000000" Step="1000" />
            </Template>
        </CustomFieldEditControl>
    </EditTemplates>
</FeatureSelectionControl>
```

## Template Context

The `<Template>` receives a `CustomFieldContext<T>` with these properties:

| Property | Type | Description |
|----------|------|-------------|
| `Value` | `T?` | Current typed value |
| `SetValue` | `Action<object?>` | Method to update value |
| `FieldName` | `string` | Field property name |
| `DisplayName` | `string` | Display label from config |
| `Config` | `AttributeFieldConfig?` | Full field configuration |
| `HasError` | `bool` | Validation error state |
| `ErrorText` | `string?` | Error message if any |

## Common Patterns

### 1. Slider for Numeric Values

```razor
<CustomFieldEditControl T="int" FieldName="valuePerSqm">
    <Template Context="ctx">
        <div>
            <MudText Typo="Typo.caption">
                $@(ctx.Value?.ToString("N0") ?? "0") per sqm
            </MudText>
            <MudSlider T="int" 
                       Value="@(ctx.Value ?? 0)"
                       ValueChanged="@(v => ctx.SetValue(v))"
                       Min="0" Max="10000" Step="100"
                       Color="Color.Primary" />
            @if (ctx.HasError)
            {
                <MudAlert Severity="Severity.Error" Dense="true">
                    @ctx.ErrorText
                </MudAlert>
            }
        </div>
    </Template>
</CustomFieldEditControl>
```

### 2. Rating Component

```razor
<CustomFieldEditControl T="int" FieldName="rating">
    <Template Context="ctx">
        <div>
            <MudRating SelectedValue="@(ctx.Value ?? 0)"
                       SelectedValueChanged="@(v => ctx.SetValue(v))"
                       MaxValue="5"
                       Color="Color.Warning"
                       Size="Size.Large"
                       ReadOnly="@(ctx.Config?.IsReadOnly ?? false)" />
            @if (ctx.Value.HasValue)
            {
                <MudText Typo="Typo.caption">
                    @ctx.Value.Value stars
                </MudText>
            }
        </div>
    </Template>
</CustomFieldEditControl>
```

### 3. Color Picker

```razor
<CustomFieldEditControl T="string" FieldName="color">
    <Template Context="ctx">
        <MudColorPicker Value="@(new MudColor(ctx.Value ?? "#FFFFFF"))"
                        ValueChanged="@(c => ctx.SetValue(c.ToString(MudColorOutputFormats.Hex)))"
                        Label="@ctx.DisplayName"
                        Variant="Variant.Outlined"
                        Margin="Margin.Dense" />
    </Template>
</CustomFieldEditControl>
```

### 4. Chip Selector (Status Field)

```razor
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
```

### 5. Switch/Toggle

```razor
<CustomFieldEditControl T="bool" FieldName="isActive">
    <Template Context="ctx">
        <MudSwitch T="bool" 
                   Checked="@(ctx.Value ?? false)"
                   CheckedChanged="@(v => ctx.SetValue(v))"
                   Label="@ctx.DisplayName"
                   Color="Color.Success"
                   ThumbIcon="@(ctx.Value == true ? Icons.Material.Filled.Check : Icons.Material.Filled.Close)" />
    </Template>
</CustomFieldEditControl>
```

### 6. File Upload

```razor
<CustomFieldEditControl T="string" FieldName="attachment">
    <Template Context="ctx">
        <div>
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
                <MudChip Text="@ctx.Value" 
                         Icon="@Icons.Material.Filled.AttachFile"
                         OnClose="@(() => ctx.SetValue(null))" />
            }
        </div>
    </Template>
</CustomFieldEditControl>
```

### 7. Rich Text Editor

```razor
<CustomFieldEditControl T="string" FieldName="description">
    <Template Context="ctx">
        <MudTextField T="string"
                      Value="@ctx.Value"
                      ValueChanged="@(v => ctx.SetValue(v))"
                      Label="@ctx.DisplayName"
                      Lines="5"
                      Variant="Variant.Outlined"
                      Error="@ctx.HasError"
                      ErrorText="@ctx.ErrorText" />
    </Template>
</CustomFieldEditControl>
```

## Advanced Scenarios

### Conditional Options Based on Other Fields

You can access the parent component's state or other context:

```razor
<CustomFieldEditControl T="string" FieldName="subcategory">
    <Template Context="ctx">
        <MudSelect T="string"
                   Value="@ctx.Value"
                   ValueChanged="@(v => ctx.SetValue(v))"
                   Label="@ctx.DisplayName">
            @foreach (var option in GetSubcategoryOptions(ctx.Config))
            {
                <MudSelectItem T="string" Value="@option">@option</MudSelectItem>
            }
        </MudSelect>
    </Template>
</CustomFieldEditControl>

@code {
    private IEnumerable<string> GetSubcategoryOptions(AttributeFieldConfig? config)
    {
        // Logic to determine options based on other field values
        // You can access your component's state here
        return new[] { "Option1", "Option2", "Option3" };
    }
}
```

### Custom Validation Display

```razor
<CustomFieldEditControl T="string" FieldName="email">
    <Template Context="ctx">
        <MudTextField T="string"
                      Value="@ctx.Value"
                      ValueChanged="@(v => ctx.SetValue(v))"
                      Label="@ctx.DisplayName"
                      Adornment="Adornment.Start"
                      AdornmentIcon="@Icons.Material.Filled.Email"
                      Error="@ctx.HasError"
                      HelperText="@(ctx.HasError ? ctx.ErrorText : "Enter a valid email address")" />
    </Template>
</CustomFieldEditControl>
```

### Formatted Display with Input

```razor
<CustomFieldEditControl T="decimal" FieldName="price">
    <Template Context="ctx">
        <MudStack Spacing="1">
            <MudText Typo="Typo.h6" Color="Color.Primary">
                @ctx.Value?.ToString("C2") ?? "$0.00"
            </MudText>
            <MudNumericField T="decimal"
                             Value="@(ctx.Value ?? 0)"
                             ValueChanged="@(v => ctx.SetValue(v))"
                             Label="@ctx.DisplayName"
                             Min="0"
                             Step="0.01M"
                             Format="N2"
                             Variant="Variant.Outlined"
                             Margin="Margin.Dense" />
        </MudStack>
    </Template>
</CustomFieldEditControl>
```

## Multiple Custom Fields Example

```razor
<FeatureSelectionControl ...>
    <EditTemplates>
        <!-- Slider -->
        <CustomFieldEditControl T="int" FieldName="valuePerSqm">
            <Template Context="ctx">
                <MudSlider ... />
            </Template>
        </CustomFieldEditControl>

        <!-- Color Picker -->
        <CustomFieldEditControl T="string" FieldName="color">
            <Template Context="ctx">
                <MudColorPicker ... />
            </Template>
        </CustomFieldEditControl>

        <!-- Chip Selector -->
        <CustomFieldEditControl T="string" FieldName="status">
            <Template Context="ctx">
                <MudChipSet>...</MudChipSet>
            </Template>
        </CustomFieldEditControl>

        <!-- Rating -->
        <CustomFieldEditControl T="int" FieldName="rating">
            <Template Context="ctx">
                <MudRating ... />
            </Template>
        </CustomFieldEditControl>
    </EditTemplates>
</FeatureSelectionControl>
```

## Benefits

✅ **Declarative** - Standard Razor syntax  
✅ **Type-Safe** - Generic type parameter  
✅ **IntelliSense** - Full IDE support  
✅ **No Code-Behind** - Everything in markup  
✅ **Selective** - Only customize what you need  
✅ **Flexible** - Any Blazor component works  
✅ **Maintainable** - Easy to read and modify  

## Notes

- **Type Parameter** - Must match the field's data type in the feature
- **Field Name** - Must match the property name in the feature's properties object
- **Multiple Templates** - Can define as many custom fields as needed
- **Default Fallback** - Fields without custom templates use built-in controls
- **Validation** - Automatic validation from field configuration
- **Error Display** - Access validation errors via context

# PyroGeoBlazor Layer Selectors - Implementation Summary

## Overview

This implementation provides WMTS and WFS layer selector components for PyroGeoBlazor, with a powerful factory pattern that allows complete customization while maintaining a consistent API.

## Key Features

### 1. Simple Usage
```razor
<WmtsLayerSelector OnUrlTemplateGenerated="HandleUrl" />
<WfsLayerSelector OnConfigGenerated="HandleConfig" />
```

### 2. Automatic Factory Resolution
The components automatically use the registered factory implementation:
- Default: Bootstrap-based UI components
- Custom: Can use any UI framework (MudBlazor, Blazorise, Radzen, etc.)

### 3. Same Component Tags Everywhere
Whether you're using the default implementation or a custom MudBlazor implementation, you always use:
```razor
<WmtsLayerSelector ... />
<WfsLayerSelector ... />
```

No changes to component usage when switching implementations!

## Architecture

### Component Hierarchy

```
WmtsLayerSelector.razor (Factory-aware wrapper)
    ↓ (injected via IWmtsLayerSelectorFactory)
    ↓
DefaultWmtsLayerSelector.razor (Default Bootstrap implementation)
    OR
MyCustomWmtsSelector.razor (Your custom MudBlazor/Blazorise implementation)
```

### Factory Pattern

```
IWmtsLayerSelectorFactory (Interface)
    ↓
DefaultWmtsLayerSelectorFactory → DefaultWmtsLayerSelector
    OR
MyCustomWmtsFactory → MyCustomWmtsSelector
```

## Implementation Details

### Default Components
- **DefaultWmtsLayerSelector**: Bootstrap-based WMTS selector with full GetCapabilities parsing
- **DefaultWfsLayerSelector**: Bootstrap-based WFS selector with version-aware parsing

### Factory Interfaces
- **IWmtsLayerSelectorFactory**: Factory for creating WMTS components
- **IWfsLayerSelectorFactory**: Factory for creating WFS components

Both accept optional parameters:
- `EventCallback` for generated results
- `InitialUrl` for pre-populating URLs
- `InitialVersion` for pre-selecting protocol version

### Service Registration
```csharp
// Use defaults
builder.Services.AddPyroGeoBlazor();

// Use custom implementations
builder.Services.AddPyroGeoBlazor<MyWmtsFactory, MyWfsFactory>();

// Mix and match
builder.Services.AddSingleton<IWmtsLayerSelectorFactory, MyWmtsFactory>();
builder.Services.AddSingleton<IWfsLayerSelectorFactory, DefaultWfsLayerSelectorFactory>();
```

## Custom Implementation Guide

### Step 1: Create Custom Component
Create a component using any UI framework, accepting these parameters:
- `EventCallback<WmtsUrlTemplate>` or `EventCallback<WfsLayerConfig>`
- `string? InitialUrl`
- `string? InitialVersion`

### Step 2: Create Factory
Implement `IWmtsLayerSelectorFactory` or `IWfsLayerSelectorFactory`:
```csharp
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
            // Add attributes...
            builder.CloseComponent();
        };
    }
}
```

### Step 3: Register Factory
```csharp
builder.Services.AddPyroGeoBlazor<MyMudBlazorWmtsFactory, DefaultWfsLayerSelectorFactory>();
```

### Step 4: Use Component
```razor
@* Automatically uses your MudBlazor implementation! *@
<WmtsLayerSelector OnUrlTemplateGenerated="HandleUrl" />
```

## Benefits

1. **Consistent API**: Same component tags regardless of implementation
2. **Framework Agnostic**: Use any UI framework for custom components
3. **Easy Migration**: Switch implementations without changing usage code
4. **Type Safe**: Full IntelliSense and compile-time checking
5. **Flexible**: Mix default and custom implementations as needed
6. **Clean**: No wrapper components or conditional rendering needed

## Use Cases

### Use Case 1: Start with Default, Migrate Later
```razor
@* Initially - uses default Bootstrap components *@
<WmtsLayerSelector OnUrlTemplateGenerated="HandleUrl" />

@* Later - register custom factory in Program.cs *@
@* Same code, now uses MudBlazor! No changes needed here *@
<WmtsLayerSelector OnUrlTemplateGenerated="HandleUrl" />
```

### Use Case 2: Team A uses Bootstrap, Team B uses MudBlazor
Both teams use the same component tags in their codebase. The implementation is configured per project in `Program.cs`.

### Use Case 3: White-Label Applications
Different clients get different UI implementations, but the codebase remains the same.

## Technical Notes

### Component Resolution
1. Component `<WmtsLayerSelector />` is rendered
2. Factory `IWmtsLayerSelectorFactory` is injected
3. Factory's `CreateComponent()` method is called with parameters
4. Factory returns `RenderFragment` for actual implementation
5. Implementation (default or custom) is rendered

### Parameter Flow
```
Razor Usage → WmtsLayerSelector → Factory.CreateComponent() → DefaultWmtsLayerSelector
   ↓              ↓                           ↓                          ↓
Parameters  Pass Through              Pass Through                  Received
```

### Dependency Injection Scope
- Factories are registered as **Singleton** (stateless)
- Components are transient (created per usage)
- HttpClient is typically registered as Scoped or Typed client

## Testing

The implementation includes comprehensive tests:
- **ServiceRegistrationTests**: Verify DI registration
- **ModelTests**: Validate data models
- **Component Tests**: (Can be added) Test rendering and interaction

## Documentation

- **README.md**: Quick start and basic usage
- **USAGE_EXAMPLES.md**: Detailed examples and patterns
- **CUSTOM_UI_FRAMEWORK_EXAMPLE.md**: Complete MudBlazor/Blazorise examples
- **This file**: Architecture and implementation details

## Compatibility

- **.NET**: 10.0
- **Blazor**: Server and WebAssembly
- **UI Frameworks**: Framework-agnostic (default uses Bootstrap, but supports any framework)

## Future Enhancements

Potential additions:
1. Caching of GetCapabilities responses
2. Offline mode with local capabilities
3. Advanced filtering and search
4. Layer preview thumbnails
5. Batch layer selection
6. Export/import of configurations

## Conclusion

This implementation provides a robust, flexible foundation for WMTS and WFS layer selection in PyroGeoBlazor applications. The factory pattern ensures that applications can start simple with default components and easily upgrade to custom implementations without code changes, making it ideal for evolving requirements and multi-tenant scenarios.

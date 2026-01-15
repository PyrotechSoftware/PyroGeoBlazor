# GitHub Copilot Instructions for PyroGeoBlazor

## Project Overview
PyroGeoBlazor.Leaflet is a Blazor wrapper library for Leaflet.js that enables interactive maps in Blazor applications.

## Development Guidelines

### Code Style
- Use C# 10+ features including implicit usings and nullable reference types
- Follow Microsoft's C# coding conventions
- Use meaningful variable and method names
- Add XML documentation comments to public APIs
- Use async/await for all asynchronous operations

### Architecture
- Components are located in `PyroGeoBlazor.Leaflet/Components`
- Models are located in `PyroGeoBlazor.Leaflet/Models`
- JavaScript interop is handled through `LeafletMapJSBinder`
- All Leaflet objects inherit from `InteropObject` base class

### Testing
- Write unit tests for all new components and features
- Use xUnit as the testing framework
- Use bUnit for Blazor component testing
- Use FluentAssertions for assertions
- Mock JavaScript interop using bUnit's JSInterop features
- Tests are located in `tests/PyroGeoBlazor.Leaflet.Tests.Unit`
- Integration tests are in `tests/PyroGeoBlazor.IntegrationTests`

### JavaScript Interop
- All JS calls should be made through `IJSRuntime`
- Use `IJSObjectReference` for module imports
- Always implement `IAsyncDisposable` for classes that use JS interop
- Guard against null JS bindings using `GuardAgainstNullBinding`

### Naming Conventions
- Use PascalCase for classes, methods, and public properties
- Use camelCase for private fields and local variables
- Prefix private fields with underscore (e.g., `_leafletMapModule`)
- Use descriptive names that reflect the Leaflet API when wrapping functionality

### Building and Testing
- Build the project using `dotnet build`
- Run unit tests with `dotnet test tests/PyroGeoBlazor.Leaflet.Tests.Unit`
- The TypeScript/JavaScript is built using `npm run build` (automatically runs before .NET build)

### Dependencies
- Target .NET 10.0
- Use Microsoft.AspNetCore.App framework reference
- Key dependencies: Blazor, bUnit, xUnit, FluentAssertions

### Pull Requests
- Keep changes focused and minimal
- Update tests for any changed functionality
- Add XML documentation for new public APIs
- Ensure all tests pass before submitting
- Follow the existing code structure and patterns

## Common Patterns

### Creating a New Component
```csharp
namespace PyroGeoBlazor.Leaflet.Components;

public class NewComponent : ComponentBase
{
    [Inject] public IJSRuntime JSRuntime { get; set; } = default!;
    [Parameter] public string SomeParameter { get; set; } = string.Empty;
}
```

### Creating a New Model
```csharp
namespace PyroGeoBlazor.Leaflet.Models;

public class NewModel : InteropObject
{
    protected override async Task<IJSObjectReference> CreateJsObjectRef()
    {
        GuardAgainstNullBinding("Error message");
        var module = await JSBinder!.GetLeafletMapModule();
        return await module.InvokeAsync<IJSObjectReference>("methodName", parameters);
    }
}
```

### Writing Unit Tests
```csharp
public class NewComponentTests : TestContext
{
    [Fact]
    public void ComponentName_Scenario_ExpectedBehavior()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("module-path");
        
        // Act
        var cut = RenderComponent<NewComponent>();
        
        // Assert
        cut.Markup.Should().Contain("expected-content");
    }
}
```

## Important Notes
- Always dispose of JS object references properly
- Test both the C# code and the JS interop calls
- Consider edge cases and null values
- Follow the existing patterns in the codebase
- Update README.md if adding major features

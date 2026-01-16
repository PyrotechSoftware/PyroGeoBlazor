# GitHub Copilot Instructions for PyroGeoBlazor

## Project Overview
PyroGeoBlazor.Leaflet is a Blazor wrapper library for Leaflet.js that enables interactive maps in Blazor applications. This is a hybrid .NET/TypeScript project that requires both .NET 10 SDK and Node.js for development.

## Commands

### Building
```bash
# Build TypeScript/JavaScript (from PyroGeoBlazor.Leaflet directory)
npm install
npm run build          # Production build
npm run dev           # Development mode with hot reload
npm run preview       # Preview production build

# Build .NET solution (automatically builds TypeScript first)
dotnet restore
dotnet build          # Build entire solution
dotnet build -c Release --no-restore
```

### Testing
```bash
# TypeScript/JavaScript tests (from PyroGeoBlazor.Leaflet directory)
npm test              # Run Vitest tests
npm test -- --watch   # Watch mode
npm run test:ui       # Interactive UI
npm run test:coverage # Generate coverage report

# .NET tests
dotnet test           # Run all tests
dotnet test tests/PyroGeoBlazor.Leaflet.Tests.Unit  # Run unit tests only
dotnet test -c Release --no-build --verbosity normal
```

### Linting
```bash
# TypeScript/JavaScript linting (from PyroGeoBlazor.Leaflet directory)
# ESLint is configured - check package.json for available scripts

# .NET uses .editorconfig for code style
# Verify code style with build warnings
```

## Project Structure

### Directory Layout
```
PyroGeoBlazor/
├── .github/
│   ├── copilot-instructions.md   # This file
│   └── workflows/                # CI/CD pipelines
├── PyroGeoBlazor.Leaflet/        # Main library
│   ├── Components/               # Blazor components
│   ├── Models/                   # Leaflet API models
│   ├── Scripts/                  # TypeScript source files
│   │   └── __tests__/           # TypeScript unit tests
│   ├── Services/                 # Service classes
│   ├── EventArgs/                # Event argument classes
│   ├── wwwroot/                  # Static assets (built JS)
│   ├── InteropObject.cs          # Base class for JS interop
│   ├── LeafletMapJSBinder.cs     # Main JS interop bridge
│   ├── package.json              # NPM configuration
│   ├── vite.config.ts            # Vite bundler config
│   └── vitest.config.ts          # Vitest test config
├── PyroGeoBlazor.Demo/           # Demo application
├── tests/
│   ├── PyroGeoBlazor.Leaflet.Tests.Unit/      # C# unit tests
│   └── PyroGeoBlazor.IntegrationTests/        # Integration tests
└── README.md
```

### Important Files
- `InteropObject.cs` - Abstract base class for all objects that interact with JavaScript
- `LeafletMapJSBinder.cs` - Central service for JavaScript interop, manages module loading
- `Scripts/index.ts` - Entry point for TypeScript code
- `.editorconfig` - Code formatting rules (4 spaces for indentation)

## Code Style

### C# Guidelines
- **Target Framework**: .NET 10.0
- **Language Features**: Use C# 10+ features including implicit usings and nullable reference types
- **Naming Conventions**:
  - PascalCase for classes, methods, public properties
  - camelCase for private fields and local variables
  - Prefix private fields with underscore (e.g., `_leafletMapModule`)
  - Use descriptive names that reflect the Leaflet API when wrapping functionality
- **Async/Await**: Always use async/await for asynchronous operations
- **Documentation**: Add XML documentation comments to all public APIs
- **Conventions**: Follow Microsoft's C# coding conventions
- **Formatting**: 4 spaces for indentation (enforced by .editorconfig)

### TypeScript Guidelines
- Use TypeScript for all JavaScript interop code
- Follow existing patterns in `Scripts/` directory
- Use Vite for bundling (outputs to `wwwroot/leafletMap.js`)
- Write tests using Vitest in `Scripts/__tests__/`
- 4 spaces for indentation (enforced by .editorconfig)

## Testing Guidelines

### C# Testing
- **Framework**: xUnit
- **Component Testing**: bUnit for Blazor components
- **Assertions**: FluentAssertions
- **Location**: `tests/PyroGeoBlazor.Leaflet.Tests.Unit`
- **Integration Tests**: `tests/PyroGeoBlazor.IntegrationTests`
- **JS Interop Mocking**: Use bUnit's JSInterop.SetupModule() for mocking JavaScript calls
- **Test Naming**: `MethodName_Scenario_ExpectedBehavior`
- **Test Structure**: Arrange-Act-Assert pattern

### TypeScript Testing
- **Framework**: Vitest
- **Location**: `PyroGeoBlazor.Leaflet/Scripts/__tests__/`
- **Configuration**: `vitest.config.ts`
- Write tests for all TypeScript functions that interact with Leaflet.js

### Testing Requirements
- Write unit tests for all new components and features
- Test both C# code and JavaScript interop calls
- Mock JavaScript interop using bUnit's JSInterop features
- Consider edge cases and null values
- Ensure all tests pass before submitting PRs

## Architecture Patterns

### Component Structure
- Components inherit from `ComponentBase` or custom base classes
- Use `[Parameter]` attribute for component parameters
- Use `[Inject]` attribute for dependency injection
- Components are located in `PyroGeoBlazor.Leaflet/Components`

### Model Structure
- All Leaflet objects inherit from `InteropObject` base class
- Models are located in `PyroGeoBlazor.Leaflet/Models`
- Each model represents a Leaflet.js API object or concept

### JavaScript Interop Pattern
- All JS calls go through `IJSRuntime` or `IJSObjectReference`
- Use `IJSObjectReference` for module imports
- Always implement `IAsyncDisposable` for classes that use JS interop
- Guard against null JS bindings using `GuardAgainstNullBinding` method
- JavaScript interop is centralized through `LeafletMapJSBinder`
- Handle `JSDisconnectedException` gracefully (page refreshes)

## Common Patterns

### Creating a New Component
```csharp
namespace PyroGeoBlazor.Leaflet.Components;

/// <summary>
/// Description of what this component does.
/// </summary>
public class NewComponent : ComponentBase
{
    /// <summary>
    /// Description of the JSRuntime dependency.
    /// </summary>
    [Inject] public IJSRuntime JSRuntime { get; set; } = default!;
    
    /// <summary>
    /// Description of the parameter.
    /// </summary>
    [Parameter] public string SomeParameter { get; set; } = string.Empty;
}
```

### Creating a New Model (InteropObject)
```csharp
namespace PyroGeoBlazor.Leaflet.Models;

/// <summary>
/// Description of the model and link to Leaflet.js documentation.
/// <see href="https://leafletjs.com/reference.html#..."/>
/// </summary>
public class NewModel : InteropObject
{
    /// <summary>
    /// Creates the JavaScript object reference for this model.
    /// </summary>
    protected override async Task<IJSObjectReference> CreateJsObjectRef()
    {
        GuardAgainstNullBinding("Cannot create NewModel before JavaScript binding is initialized.");
        var module = await JSBinder!.GetLeafletMapModule();
        return await module.InvokeAsync<IJSObjectReference>("LeafletMap.NewModel.create", parameters);
    }
    
    /// <inheritdoc />
    public override async ValueTask DisposeAsync()
    {
        if (JSObjectReference is not null)
        {
            try
            {
                await JSObjectReference.DisposeAsync();
            }
            catch (JSDisconnectedException)
            {
                // Swallow this. Page is being refreshed possibly.
            }
        }
    }
}
```

### Writing Unit Tests (bUnit)
```csharp
using Bunit;
using FluentAssertions;
using Microsoft.JSInterop;
using PyroGeoBlazor.Leaflet.Components;
using Xunit;

namespace PyroGeoBlazor.Leaflet.Tests.Unit.Components;

public class NewComponentTests : TestContext
{
    [Fact]
    public void ComponentName_Scenario_ExpectedBehavior()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.Leaflet/leafletMap.js");
        jsModule.SetupModule("LeafletMap.Method.name", _ => true);
        
        // Act
        var cut = RenderComponent<NewComponent>(parameters => parameters
            .Add(p => p.SomeParameter, "test-value"));
        
        // Assert
        cut.Markup.Should().Contain("expected-content");
    }
}
```

### TypeScript Module Structure
```typescript
// Follow existing patterns in Scripts/ directory
import L from 'leaflet';

export namespace NewModule {
    export function createSomething(params: any): L.SomeType {
        // Implementation
        return result;
    }
}
```

## Git Workflow

### Branch Strategy
- Main development branch: `dev`
- Feature branches: create from `dev`
- Pull requests target: `dev` branch

### Commit Guidelines
- Keep commits focused and atomic
- Write clear, descriptive commit messages
- Ensure code builds and tests pass before committing

### Pull Request Guidelines
- Keep changes focused and minimal
- Update tests for any changed functionality
- Add XML documentation for new public APIs
- Ensure all tests pass before submitting
- Follow the existing code structure and patterns
- CI runs on all PRs targeting `dev` branch

## Boundaries and Restrictions

### What NOT to Modify
- **Do not** modify `node_modules/` or `package-lock.json` directly
- **Do not** modify generated files in `wwwroot/` (they are build outputs)
- **Do not** change the target framework from .NET 10.0
- **Do not** introduce breaking changes to public APIs without discussion
- **Do not** remove or significantly alter existing tests unless fixing bugs
- **Do not** commit secrets, API keys, or sensitive data

### Security Considerations
- Always dispose of JS object references properly to prevent memory leaks
- Handle `JSDisconnectedException` when disposing JS interop objects
- Validate all inputs from JavaScript interop
- Use `GuardAgainstNullBinding` before accessing JS objects

### Performance Considerations
- Be mindful of JavaScript interop overhead (calls are expensive)
- Batch JS operations when possible
- Properly implement `IAsyncDisposable` to clean up resources

## Dependencies

### .NET Dependencies
- **Target**: .NET 10.0
- **Framework**: Microsoft.AspNetCore.App
- **Testing**: xUnit, bUnit, FluentAssertions
- **Key Package Versions**: See individual `.csproj` files

### JavaScript Dependencies
- **Build Tool**: Vite 6.0
- **Testing**: Vitest 2.1
- **Type Definitions**: @types/leaflet 1.9
- **Other**: See `package.json` in PyroGeoBlazor.Leaflet directory

## Documentation
- Update README.md when adding major features
- Add XML documentation to all public APIs
- Link to Leaflet.js documentation where applicable
- Document any breaking changes clearly

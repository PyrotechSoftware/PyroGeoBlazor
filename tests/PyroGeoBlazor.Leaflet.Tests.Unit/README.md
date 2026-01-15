# PyroGeoBlazor.Leaflet.Tests.Unit

This project contains unit tests for the PyroGeoBlazor.Leaflet library.

## Overview

The unit tests use the following testing frameworks and libraries:
- **xUnit**: Test framework
- **bUnit**: Blazor component testing framework
- **FluentAssertions**: Fluent assertion library for better test readability

## Project Structure

```
PyroGeoBlazor.Leaflet.Tests.Unit/
├── Components/
│   └── LeafletMapTests.cs         # Tests for LeafletMap component
├── Models/
│   └── MapTests.cs                 # Tests for Map model
└── LeafletMapJSBinderTests.cs     # Tests for JS interop functionality
```

## Running the Tests

### Using the .NET CLI

```bash
cd tests/PyroGeoBlazor.Leaflet.Tests.Unit
dotnet test
```

### Using Visual Studio

Open the solution and use the Test Explorer to run the tests.

## Test Structure

Tests follow the Arrange-Act-Assert (AAA) pattern:

```csharp
[Fact]
public void Map_Constructor_InitializesProperties()
{
    // Arrange
    var elementId = "test-map";
    var options = new MapOptions();

    // Act
    var map = new Map(elementId, options);

    // Assert
    map.ElementId.Should().Be(elementId);
    map.Options.Should().Be(options);
}
```

## Mocking JavaScript Interop

JavaScript interop calls are mocked using bUnit's JSInterop features:

```csharp
// Setup JS module mock
var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.Leaflet/leafletMap.js");
jsModule.SetupModule("LeafletMap.Map.createMap", _ => true);

// Render component with mocked JS interop
var cut = Render<LeafletMap>(parameters => parameters
    .Add(p => p.Map, map));
```

## Writing New Tests

When adding new tests:

1. Follow the existing test structure and naming conventions
2. Use descriptive test method names that explain what is being tested
3. Mock JavaScript interop calls appropriately
4. Use FluentAssertions for better test readability
5. Group related tests in the same test class

## Test Coverage

Current test coverage includes:

- **LeafletMap Component**: Rendering with different heights, element IDs, and child content
- **Map Model**: Constructor behavior, property initialization, and event subscriptions
- **JavaScript Interop**: Module initialization and component lifecycle

## Future Enhancements

- Add more comprehensive tests for all components
- Add tests for event handlers and callbacks
- Add tests for more complex map interactions
- Consider adding integration tests for full component workflows

using Bunit;
using FluentAssertions;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using PyroGeoBlazor.Leaflet.Components;
using PyroGeoBlazor.Leaflet.Models;
using Xunit;

namespace PyroGeoBlazor.Leaflet.Tests.Unit.Components;

public class LeafletMapTests : BunitContext
{
    [Fact]
    public void LeafletMap_RendersWithDefaultHeight()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.Leaflet/leafletMap.js");
        jsModule.SetupModule("LeafletMap.Map.createMap", _ => true);
        
        var map = new Map("test-map", new MapOptions());

        // Act
        var cut = Render<LeafletMap>(parameters => parameters
            .Add(p => p.Map, map));

        // Assert
        cut.Find("div.leafletMap").Should().NotBeNull();
        cut.Markup.Should().Contain("height: 400px");
    }

    [Fact]
    public void LeafletMap_RendersWithCustomHeight()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.Leaflet/leafletMap.js");
        jsModule.SetupModule("LeafletMap.Map.createMap", _ => true);
        
        var map = new Map("test-map", new MapOptions());

        // Act
        var cut = Render<LeafletMap>(parameters => parameters
            .Add(p => p.Map, map)
            .Add(p => p.Height, "600px"));

        // Assert
        cut.Markup.Should().Contain("height: 600px");
    }

    [Fact]
    public void LeafletMap_RendersWithPercentageHeight()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.Leaflet/leafletMap.js");
        jsModule.SetupModule("LeafletMap.Map.createMap", _ => true);
        
        var map = new Map("test-map", new MapOptions());

        // Act
        var cut = Render<LeafletMap>(parameters => parameters
            .Add(p => p.Map, map)
            .Add(p => p.Height, "100%"));

        // Assert
        cut.Markup.Should().Contain("height: 100%");
    }

    [Fact]
    public void LeafletMap_RendersWithNumericHeight()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.Leaflet/leafletMap.js");
        jsModule.SetupModule("LeafletMap.Map.createMap", _ => true);
        
        var map = new Map("test-map", new MapOptions());

        // Act
        var cut = Render<LeafletMap>(parameters => parameters
            .Add(p => p.Map, map)
            .Add(p => p.Height, "500"));

        // Assert
        cut.Markup.Should().Contain("height: 500px");
    }

    [Fact]
    public void LeafletMap_RendersWithViewportHeight()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.Leaflet/leafletMap.js");
        jsModule.SetupModule("LeafletMap.Map.createMap", _ => true);
        
        var map = new Map("test-map", new MapOptions());

        // Act
        var cut = Render<LeafletMap>(parameters => parameters
            .Add(p => p.Map, map)
            .Add(p => p.Height, "50vh"));

        // Assert
        cut.Markup.Should().Contain("height: 50vh");
    }

    [Fact]
    public void LeafletMap_UsesCorrectElementId()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.Leaflet/leafletMap.js");
        jsModule.SetupModule("LeafletMap.Map.createMap", _ => true);
        
        var map = new Map("custom-element-id", new MapOptions());

        // Act
        var cut = Render<LeafletMap>(parameters => parameters
            .Add(p => p.Map, map));

        // Assert
        cut.Markup.Should().Contain("id=\"custom-element-id\"");
    }

    [Fact]
    public void LeafletMap_RendersChildContent()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.Leaflet/leafletMap.js");
        jsModule.SetupModule("LeafletMap.Map.createMap", _ => true);
        
        var map = new Map("test-map", new MapOptions());

        // Act
        var cut = Render<LeafletMap>(parameters => parameters
            .Add(p => p.Map, map)
            .Add(p => p.ChildContent, builder =>
            {
                builder.OpenElement(0, "div");
                builder.AddAttribute(1, "class", "custom-control");
                builder.AddContent(2, "Custom Control");
                builder.CloseElement();
            }));

        // Assert
        cut.Markup.Should().Contain("class=\"custom-control\"");
        cut.Markup.Should().Contain("Custom Control");
    }

    [Fact]
    public void LeafletMap_DoesNotRenderMapWhenNull()
    {
        // Act
        var cut = Render<LeafletMap>(parameters => parameters
            .Add(p => p.Map, (Map?)null));

        // Assert
        cut.FindAll("div.leafletMap").Should().BeEmpty();
    }
}

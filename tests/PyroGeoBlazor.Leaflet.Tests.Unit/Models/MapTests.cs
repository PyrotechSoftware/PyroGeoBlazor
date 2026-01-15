using FluentAssertions;
using PyroGeoBlazor.Leaflet.Models;
using Xunit;

namespace PyroGeoBlazor.Leaflet.Tests.Unit.Models;

public class MapTests
{
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

    [Fact]
    public void Map_Constructor_WithEventsDisabled_InitializesSuccessfully()
    {
        // Arrange
        var elementId = "test-map";
        var options = new MapOptions();

        // Act
        var map = new Map(elementId, options, enableEvents: false);

        // Assert
        map.ElementId.Should().Be(elementId);
        map.Options.Should().Be(options);
    }

    [Fact]
    public void Map_Constructor_WithEventsEnabled_InitializesSuccessfully()
    {
        // Arrange
        var elementId = "test-map";
        var options = new MapOptions
        {
            EventOptions = new MapEventOptions
            {
                Click = true,
                DoubleClick = true,
                Resize = true
            }
        };

        // Act
        var map = new Map(elementId, options, enableEvents: true);

        // Assert
        map.ElementId.Should().Be(elementId);
        map.Options.Should().Be(options);
        map.Options.EventOptions.Click.Should().BeTrue();
        map.Options.EventOptions.DoubleClick.Should().BeTrue();
        map.Options.EventOptions.Resize.Should().BeTrue();
    }

    [Fact]
    public void Map_Constructor_WithCustomElementId_StoresElementId()
    {
        // Arrange
        var customId = "my-custom-map-id";
        var options = new MapOptions();

        // Act
        var map = new Map(customId, options);

        // Assert
        map.ElementId.Should().Be(customId);
    }

    [Fact]
    public void Map_Constructor_WithMapOptions_StoresOptions()
    {
        // Arrange
        var elementId = "test-map";
        var options = new MapOptions
        {
            Center = new LatLng(51.505, -0.09),
            Zoom = 13
        };

        // Act
        var map = new Map(elementId, options);

        // Assert
        map.Options.Should().Be(options);
        map.Options.Center.Should().NotBeNull();
        map.Options.Center!.Lat.Should().Be(51.505);
        map.Options.Center.Lng.Should().Be(-0.09);
        map.Options.Zoom.Should().Be(13);
    }

    [Fact]
    public void Map_OnClick_CanSubscribeToEvent()
    {
        // Arrange
        var elementId = "test-map";
        var options = new MapOptions
        {
            EventOptions = new MapEventOptions { Click = true }
        };
        var map = new Map(elementId, options, enableEvents: true);

        // Act
        map.OnClick += (sender, args) => { };

        // Assert - just verify subscription doesn't throw
        // Events can be subscribed to
    }

    [Fact]
    public void Map_OnDoubleClick_CanSubscribeToEvent()
    {
        // Arrange
        var elementId = "test-map";
        var options = new MapOptions
        {
            EventOptions = new MapEventOptions { DoubleClick = true }
        };
        var map = new Map(elementId, options, enableEvents: true);

        // Act
        map.OnDoubleClick += (sender, args) => { };

        // Assert - just verify subscription doesn't throw
        // Events can be subscribed to
    }

    [Fact]
    public void Map_OnZoomEnd_CanSubscribeToEvent()
    {
        // Arrange
        var elementId = "test-map";
        var options = new MapOptions();
        var map = new Map(elementId, options, enableEvents: true);

        // Act
        map.OnZoomEnd += (sender, args) => { };

        // Assert - just verify subscription doesn't throw
        // Events can be subscribed to
    }
}

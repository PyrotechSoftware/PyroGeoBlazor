namespace PyroGeoBlazor.DeckGL.Tests.Unit.Map.Components;

using Bunit;
using FluentAssertions;
using PyroGeoBlazor.DeckGL.Components;
using PyroGeoBlazor.DeckGL.Models;
using Xunit;

public class MapStatusBarTests : BunitContext
{
    [Fact]
    public void MapStatusBar_WithViewState_DisplaysCorrectInformation()
    {
        // Arrange
        var viewState = new ViewState
        {
            Longitude = -122.45678,
            Latitude = 37.78901,
            Zoom = 12.34
        };

        // Act
        var cut = Render<MapStatusBar>(parameters => parameters
            .Add(p => p.CurrentViewState, viewState));

        // Assert
        cut.Markup.Should().Contain("Lon:");
        cut.Markup.Should().Contain("122"); // Just check the number is there, regardless of culture
        cut.Markup.Should().Contain("Lat:");
        cut.Markup.Should().Contain("37");
        cut.Markup.Should().Contain("Zoom:");
        cut.Markup.Should().Contain("12");
    }

    [Fact]
    public void MapStatusBar_WithPitchAndBearing_DisplaysAllValues()
    {
        // Arrange
        var viewState = new ViewState
        {
            Longitude = -122.45678,
            Latitude = 37.78901,
            Zoom = 12.34,
            Pitch = 45.5,
            Bearing = 90.2
        };

        // Act
        var cut = Render<MapStatusBar>(parameters => parameters
            .Add(p => p.CurrentViewState, viewState));

        // Assert
        cut.Markup.Should().Contain("Pitch:");
        cut.Markup.Should().Contain("45");
        cut.Markup.Should().Contain("Bearing:");
        cut.Markup.Should().Contain("90");
    }

    [Fact]
    public void MapStatusBar_WithoutViewState_RendersNothing()
    {
        // Act
        var cut = Render<MapStatusBar>();

        // Assert
        cut.Markup.Should().BeEmpty();
    }

    [Fact]
    public void MapStatusBar_WithCustomHeight_AppliesCorrectHeight()
    {
        // Arrange
        var viewState = new ViewState
        {
            Longitude = -122.45,
            Latitude = 37.78,
            Zoom = 12
        };

        // Act
        var cut = Render<MapStatusBar>(parameters => parameters
            .Add(p => p.CurrentViewState, viewState)
            .Add(p => p.Height, 45));

        // Assert
        cut.Markup.Should().Contain("height: 45px;");
    }

    [Fact]
    public void MapStatusBar_WithCustomCssClass_AppliesClass()
    {
        // Arrange
        var viewState = new ViewState
        {
            Longitude = -122.45,
            Latitude = 37.78,
            Zoom = 12
        };

        // Act
        var cut = Render<MapStatusBar>(parameters => parameters
            .Add(p => p.CurrentViewState, viewState)
            .Add(p => p.CssClass, "custom-status-bar"));

        // Assert
        cut.Markup.Should().Contain("custom-status-bar");
    }
}

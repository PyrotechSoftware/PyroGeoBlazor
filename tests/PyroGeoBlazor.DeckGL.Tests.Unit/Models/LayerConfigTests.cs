namespace PyroGeoBlazor.DeckGL.Tests.Unit.Models;

using FluentAssertions;
using PyroGeoBlazor.DeckGL.Models;

public class LayerConfigTests
{
    [Fact]
    public void GeoJsonLayerConfig_HasCorrectType()
    {
        // Arrange & Act
        var layer = new GeoJsonLayerConfig();

        // Assert
        layer.Type.Should().Be("GeoJsonLayer");
    }

    [Fact]
    public void GeoJsonLayerConfig_DefaultsToStroked()
    {
        // Arrange & Act
        var layer = new GeoJsonLayerConfig();

        // Assert
        layer.Stroked.Should().BeTrue();
    }

    [Fact]
    public void GeoJsonLayerConfig_CanSetFillColor()
    {
        // Arrange
        var layer = new GeoJsonLayerConfig();
        var color = new[] { 255, 0, 0, 200 };

        // Act
        layer.FillColor = color;

        // Assert
        layer.FillColor.Should().BeEquivalentTo(color);
        layer.Props.Should().ContainKey("getFillColor");
    }

    [Fact]
    public void ScatterplotLayerConfig_HasCorrectType()
    {
        // Arrange & Act
        var layer = new ScatterplotLayerConfig();

        // Assert
        layer.Type.Should().Be("ScatterplotLayer");
    }

    [Fact]
    public void ArcLayerConfig_HasCorrectType()
    {
        // Arrange & Act
        var layer = new ArcLayerConfig();

        // Assert
        layer.Type.Should().Be("ArcLayer");
    }

    [Fact]
    public void LayerConfig_CanSetDataUrl()
    {
        // Arrange
        var layer = new GeoJsonLayerConfig();

        // Act
        layer.DataUrl = "https://api.example.com/data.geojson";

        // Assert
        layer.DataUrl.Should().Be("https://api.example.com/data.geojson");
    }

    [Fact]
    public void LayerConfig_CanSetPickable()
    {
        // Arrange
        var layer = new GeoJsonLayerConfig();

        // Act
        layer.Pickable = true;

        // Assert
        layer.Pickable.Should().BeTrue();
        layer.Props.Should().ContainKey("pickable");
    }

    [Fact]
    public void LayerConfig_GeneratesUniqueId()
    {
        // Arrange & Act
        var layer1 = new GeoJsonLayerConfig();
        var layer2 = new GeoJsonLayerConfig();

        // Assert
        layer1.Id.Should().NotBe(layer2.Id);
    }

    [Fact]
    public void LayerConfig_IsEditable_DefaultsToFalse()
    {
        // Arrange & Act
        var layer = new GeoJsonLayerConfig();

        // Assert
        layer.IsEditable.Should().BeFalse("layers should be locked by default for safety");
    }

    [Fact]
    public void LayerConfig_IsEditable_CanBeSetToTrue()
    {
        // Arrange
        var layer = new GeoJsonLayerConfig();

        // Act
        layer.IsEditable = true;

        // Assert
        layer.IsEditable.Should().BeTrue();
    }

    [Fact]
    public void LayerConfig_IsEditable_CanBeSetToFalse()
    {
        // Arrange
        var layer = new GeoJsonLayerConfig { IsEditable = true };

        // Act
        layer.IsEditable = false;

        // Assert
        layer.IsEditable.Should().BeFalse();
    }
}

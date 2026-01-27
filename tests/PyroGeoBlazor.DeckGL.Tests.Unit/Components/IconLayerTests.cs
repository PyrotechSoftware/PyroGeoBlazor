namespace PyroGeoBlazor.DeckGL.Tests.Unit.Components;

using Bunit;
using FluentAssertions;
using PyroGeoBlazor.DeckGL.Components;
using PyroGeoBlazor.DeckGL.Models;

public class IconLayerTests : MudBlazorTestContext
{
    [Fact]
    public void IconLayer_CreatesValidConfig()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.DeckGL/deckGL.js");
        jsModule.SetupModule("DeckGL.DeckGLView.createDeckGLView");

        // Act
        var cut = Render<DeckGLView>(parameters => parameters
            .AddChildContent<IconLayer>(icon => icon
                .Add(p => p.Id, "test-icons")
                .Add(p => p.Data, new[] { new { coordinates = new[] { -122.45, 37.8 } } })
                .Add(p => p.IconSize, 48.0)
                .Add(p => p.Color, new[] { 255, 0, 0, 255 })
                .Add(p => p.Pickable, true)));

        // Assert
        cut.Instance.Layers.Should().ContainSingle(l => l.Id == "test-icons");
        var layer = cut.Instance.Layers.First(l => l.Id == "test-icons");
        layer.Type.Should().Be("IconLayer");
        layer.Pickable.Should().BeTrue();
    }

    [Fact]
    public void IconLayer_DefaultsToMarkerIcon()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.DeckGL/deckGL.js");
        jsModule.SetupModule("DeckGL.DeckGLView.createDeckGLView");

        // Act
        var cut = Render<DeckGLView>(parameters => parameters
            .AddChildContent<IconLayer>(icon => icon
                .Add(p => p.Id, "markers")
                .Add(p => p.Data, new[] { new { coordinates = new[] { 0.0, 0.0 } } })));

        // Assert
        var layer = cut.Instance.Layers.First(l => l.Id == "markers");
        var iconLayer = layer as IconLayerConfig;
        iconLayer.Should().NotBeNull();
        iconLayer!.IconName.Should().Be("marker");
    }

    [Fact]
    public void IconLayer_AcceptsCustomIconSize()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.DeckGL/deckGL.js");
        jsModule.SetupModule("DeckGL.DeckGLView.createDeckGLView");

        // Act
        var cut = Render<DeckGLView>(parameters => parameters
            .AddChildContent<IconLayer>(icon => icon
                .Add(p => p.Id, "large-markers")
                .Add(p => p.Data, new[] { new { coordinates = new[] { 0.0, 0.0 } } })
                .Add(p => p.IconSize, 64.0)
                .Add(p => p.SizeScale, 2.0)));

        // Assert
        var layer = cut.Instance.Layers.First(l => l.Id == "large-markers");
        var iconLayer = layer as IconLayerConfig;
        iconLayer.Should().NotBeNull();
        iconLayer!.IconSize.Should().Be(64.0);
        iconLayer.SizeScale.Should().Be(2.0);
    }

    [Fact]
    public void IconLayerConfig_HasCorrectType()
    {
        // Arrange
        var config = new IconLayerConfig
        {
            Id = "test",
            Data = new[] { new { coordinates = new[] { 0.0, 0.0 } } }
        };

        // Assert
        config.Type.Should().Be("IconLayer");
    }

    [Fact]
    public void IconLayerConfig_DefaultBillboardTrue()
    {
        // Arrange
        var config = new IconLayerConfig
        {
            Id = "test"
        };

        // Assert
        config.Billboard.Should().BeTrue();
    }
}

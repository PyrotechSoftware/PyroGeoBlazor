namespace PyroGeoBlazor.DeckGL.Tests.Unit.Components;

using Bunit;
using FluentAssertions;
using Microsoft.JSInterop;
using PyroGeoBlazor.DeckGL.Components;
using PyroGeoBlazor.DeckGL.Models;

public class DeckGLViewTests : BunitContext
{
    [Fact]
    public void DeckGLView_RendersContainerElement()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.DeckGL/deckGL.js");
        
        // Mock the createDeckGLView method
        jsModule.SetupModule("DeckGL.DeckGLView.createDeckGLView", _ => true);

        // Act
        var cut = Render<DeckGLView>(parameters => parameters
            .Add(p => p.ContainerId, "test-container")
            .Add(p => p.InitialViewState, new ViewState
            {
                Longitude = -122.45,
                Latitude = 37.8,
                Zoom = 12
            }));

        // Assert
        cut.Markup.Should().Contain("id=\"test-container\"");
    }

    [Fact]
    public void DeckGLView_UsesDefaultContainerId_WhenNotProvided()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.DeckGL/deckGL.js");
        jsModule.SetupModule("DeckGL.DeckGLView.createDeckGLView", _ => true);

        // Act
        var cut = Render<DeckGLView>();

        // Assert
        cut.Markup.Should().Contain("id=\"deckgl-");
    }

    [Fact]
    public void DeckGLView_AppliesContainerStyles()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.DeckGL/deckGL.js");
        jsModule.SetupModule("DeckGL.DeckGLView.createDeckGLView", _ => true);

        // Act
        var cut = Render<DeckGLView>();

        // Assert
        cut.Markup.Should().Contain("width: 100%");
        cut.Markup.Should().Contain("height: 100%");
        cut.Markup.Should().Contain("position: relative");
    }
}

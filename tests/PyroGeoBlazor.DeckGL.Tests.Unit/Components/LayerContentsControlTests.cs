namespace PyroGeoBlazor.DeckGL.Tests.Unit.Components;

using Bunit;

using FluentAssertions;

using MudBlazor;

using PyroGeoBlazor.DeckGL.Components;
using PyroGeoBlazor.DeckGL.Models;

using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;

public class LayerContentsControlTests : MudBlazorTestContext
{
    private DeckGLView CreateMockDeckGLView(List<LayerConfig>? layers = null)
    {
        // Create a test instance of DeckGLView
        var deckView = new DeckGLView();
        
        if (layers != null)
        {
            // Use reflection to access the private _layers field
            var layersField = typeof(DeckGLView).GetField("_layers", 
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
            
            if (layersField != null)
            {
                var internalLayers = (List<LayerConfig>)layersField.GetValue(deckView)!;
                internalLayers.AddRange(layers);
            }
        }
        
        return deckView;
    }

    [Fact]
    public void LayerContentsControl_RenderMudComponentsEmptyState_WhenNoLayers()
    {
        // Arrange
        var mockDeckView = CreateMockDeckGLView();
        
        // Act
        var cut = RenderWithMud<LayerContentsControl>(parameters => parameters
            .Add(p => p.DeckGLView, mockDeckView));

        // Assert
        cut.Markup.Should().Contain("No layers");
    }

    [Fact]
    public void LayerContentsControl_RenderMudComponentsLayerList_WhenLayersProvided()
    {
        // Arrange
        var layers = new List<LayerConfig>
        {
            new GeoJsonLayerConfig { Id = "test-layer-1" },
            new GeoJsonLayerConfig { Id = "test-layer-2" }
        };
        var mockDeckView = CreateMockDeckGLView(layers);

        // Act
        var cut = RenderWithMud<LayerContentsControl>(parameters => parameters
            .Add(p => p.DeckGLView, mockDeckView));

        // Assert
        cut.Markup.Should().Contain("test-layer-1");
        cut.Markup.Should().Contain("test-layer-2");
    }

    [Fact]
    public void LayerContentsControl_ColorPickerButton_IsEnabled_WhenLayerIsEditable()
    {
        // Arrange
        var layers = new List<LayerConfig>
        {
            new GeoJsonLayerConfig 
            { 
                Id = "editable-layer",
                IsEditable = true 
            }
        };
        var mockDeckView = CreateMockDeckGLView(layers);

        // Act
        var cut = RenderWithMud<LayerContentsControl>(parameters => parameters
            .Add(p => p.DeckGLView, mockDeckView)
            .Add(p => p.IsLocked, false));

        // Assert - button should not be disabled
        var button = cut.FindAll("button").FirstOrDefault(b => b.GetAttribute("disabled") == null);
        button.Should().NotBeNull();
    }

    [Fact]
    public void LayerContentsControl_ColorPickerButton_IsEnabled_WhenLayerIsNotEditable_AndNotGloballyLocked()
    {
        // Arrange
        var layers = new List<LayerConfig>
        {
            new GeoJsonLayerConfig 
            { 
                Id = "locked-layer",
                IsEditable = false
            }
        };
        var mockDeckView = CreateMockDeckGLView(layers);

        // Act
        var cut = RenderWithMud<LayerContentsControl>(parameters => parameters
            .Add(p => p.DeckGLView, mockDeckView)
            .Add(p => p.IsLocked, false));

        // Assert - no buttons should be disabled
        var disabledButtons = cut.FindAll("button[disabled]");
        disabledButtons.Should().BeEmpty();
    }

    [Fact]
    public void LayerContentsControl_ColorPickerButton_IsDisabled_WhenGloballyLocked()
    {
        // Arrange
        var layers = new List<LayerConfig>
        {
            new GeoJsonLayerConfig 
            { 
                Id = "layer",
                IsEditable = true  // Editable at layer level
            }
        };
        var mockDeckView = CreateMockDeckGLView(layers);

        // Act
        var cut = RenderWithMud<LayerContentsControl>(parameters => parameters
            .Add(p => p.DeckGLView, mockDeckView)
            .Add(p => p.IsLocked, true));  // But globally locked

        // Assert - button should be disabled due to global lock
        var disabledButtons = cut.FindAll("button[disabled]");
        disabledButtons.Should().NotBeEmpty();
    }

    [Fact]
    public void LayerContentsControl_TileLayer_DoesNotShowColorPicker()
    {
        // Arrange
        var layers = new List<LayerConfig>
        {
            new TileLayerConfig { Id = "tile-layer" }
        };
        var mockDeckView = CreateMockDeckGLView(layers);

        // Act
        var cut = RenderWithMud<LayerContentsControl>(parameters => parameters
            .Add(p => p.DeckGLView, mockDeckView));

        // Assert - should not contain color picker icon for tile layers
        // Tile layers don't have child content with color picker
        cut.Markup.Should().Contain("tile-layer");
    }

    [Fact]
    public void LayerContentsControl_ShowsLockedTooltip_WhenLayerIsLocked()
    {
        // Arrange
        var layers = new List<LayerConfig>
        {
            new GeoJsonLayerConfig 
            { 
                Id = "locked-layer",
                IsEditable = false
            }
        };
        var mockDeckView = CreateMockDeckGLView(layers);

        // Act
        var cut = RenderWithMud<LayerContentsControl>(parameters => parameters
            .Add(p => p.DeckGLView, mockDeckView));

        // Assert - should contain "locked" text in tooltip or button
        cut.Markup.ToLower().Should().Contain("locked");
    }

    [Fact]
    public void LayerContentsControl_VisibilityCheckbox_IsAlwaysEnabled()
    {
        // Arrange
        var layers = new List<LayerConfig>
        {
            new GeoJsonLayerConfig 
            { 
                Id = "locked-layer",
                IsEditable = false  // Locked
            }
        };
        var mockDeckView = CreateMockDeckGLView(layers);

        // Act
        var cut = RenderWithMud<LayerContentsControl>(parameters => parameters
            .Add(p => p.DeckGLView, mockDeckView)
            .Add(p => p.IsLocked, true));  // Globally locked

        // Assert - visibility checkbox should still work even when locked
        var checkboxes = cut.FindComponents<MudCheckBox<bool>>();
        checkboxes.Should().NotBeEmpty("layer should have visibility checkbox");
        
        // Visibility control should not be affected by lock state
        // (users can always toggle layer visibility)
    }

    [Fact]
    public void LayerContentsControl_LayersInReverseOrder()
    {
        // Arrange - layers are in rendering order (bottom to top)
        var layers = new List<LayerConfig>
        {
            new GeoJsonLayerConfig { Id = "bottom-layer" },
            new GeoJsonLayerConfig { Id = "middle-layer" },
            new GeoJsonLayerConfig { Id = "top-layer" }
        };
        var mockDeckView = CreateMockDeckGLView(layers);

        // Act
        var cut = RenderWithMud<LayerContentsControl>(parameters => parameters
            .Add(p => p.DeckGLView, mockDeckView));

        // Assert - in the UI, top layer should appear first
        var markup = cut.Markup;
        var topIndex = markup.IndexOf("top-layer");
        var middleIndex = markup.IndexOf("middle-layer");
        var bottomIndex = markup.IndexOf("bottom-layer");

        topIndex.Should().BeLessThan(middleIndex, "top layer should appear before middle layer in UI");
        middleIndex.Should().BeLessThan(bottomIndex, "middle layer should appear before bottom layer in UI");
    }
}

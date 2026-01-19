namespace PyroGeoBlazor.Leaflet.Tests.Unit.Models;

using Bunit;

using FluentAssertions;

using PyroGeoBlazor.Leaflet.Components;
using PyroGeoBlazor.Leaflet.Models;

using Xunit;

public class MapManagedLayerTests : BunitContext
{
    [Fact]
    public async Task AddLayerManaged_AddsLayerToRegistry_WithGeneratedId()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.Leaflet/leafletMap.js");
        jsModule.SetupModule("LeafletMap.Map.createMap", _ => true);
        jsModule.SetupModule("LeafletMap.TileLayer.createTileLayer", _ => true);
        jsModule.SetupVoid("LeafletMap.Layer.addTo", _ => true).SetVoidResult();

        var map = new Map("test-map", new MapOptions());
        var layer = new TileLayer("http://example/{z}/{x}/{y}.png");

        var cut = Render<LeafletMap>(parameters => parameters.Add(p => p.Map, map));

        // Act
        await map.AddLayerManaged(layer);

        // Assert
        map.ManagedLayerOrder.Should().HaveCount(1);
        var layerId = map.GetLayerId(layer);
        layerId.Should().NotBeNullOrEmpty();
        map.GetManagedLayer(layerId!).Should().BeSameAs(layer);
    }

    [Fact]
    public async Task AddLayerManaged_AddsLayerToRegistry_WithCustomId()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.Leaflet/leafletMap.js");
        jsModule.SetupModule("LeafletMap.Map.createMap", _ => true);
        jsModule.SetupModule("LeafletMap.TileLayer.createTileLayer", _ => true);
        jsModule.SetupVoid("LeafletMap.Layer.addTo", _ => true).SetVoidResult();

        var map = new Map("test-map", new MapOptions());
        var layer = new TileLayer("http://example/{z}/{x}/{y}.png");

        var cut = Render<LeafletMap>(parameters => parameters.Add(p => p.Map, map));

        // Act
        await map.AddLayerManaged(layer, "custom-id");

        // Assert
        map.ManagedLayerOrder.Should().HaveCount(1);
        map.ManagedLayerOrder[0].Should().Be("custom-id");
        map.GetManagedLayer("custom-id").Should().BeSameAs(layer);
    }

    [Fact]
    public async Task AddLayerManaged_ReplacesDuplicateId()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.Leaflet/leafletMap.js");
        jsModule.SetupModule("LeafletMap.Map.createMap", _ => true);
        jsModule.SetupModule("LeafletMap.TileLayer.createTileLayer", _ => true);
        jsModule.SetupVoid("LeafletMap.Layer.addTo", _ => true).SetVoidResult();
        jsModule.SetupVoid("LeafletMap.Layer.remove", _ => true).SetVoidResult();

        var map = new Map("test-map", new MapOptions());
        var layer1 = new TileLayer("http://example1/{z}/{x}/{y}.png");
        var layer2 = new TileLayer("http://example2/{z}/{x}/{y}.png");

        var cut = Render<LeafletMap>(parameters => parameters.Add(p => p.Map, map));

        // Act
        await map.AddLayerManaged(layer1, "duplicate-id");
        await map.AddLayerManaged(layer2, "duplicate-id");

        // Assert
        map.ManagedLayerOrder.Should().HaveCount(1);
        map.GetManagedLayer("duplicate-id").Should().BeSameAs(layer2);
    }

    [Fact]
    public async Task RemoveLayerManaged_ByLayerId_RemovesFromRegistry()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.Leaflet/leafletMap.js");
        jsModule.SetupModule("LeafletMap.Map.createMap", _ => true);
        jsModule.SetupModule("LeafletMap.TileLayer.createTileLayer", _ => true);
        jsModule.SetupVoid("LeafletMap.Layer.addTo", _ => true).SetVoidResult();
        jsModule.SetupVoid("LeafletMap.Layer.remove", _ => true).SetVoidResult();

        var map = new Map("test-map", new MapOptions());
        var layer = new TileLayer("http://example/{z}/{x}/{y}.png");

        var cut = Render<LeafletMap>(parameters => parameters.Add(p => p.Map, map));

        await map.AddLayerManaged(layer, "test-id");

        // Act
        await map.RemoveLayerManaged("test-id");

        // Assert
        map.ManagedLayerOrder.Should().BeEmpty();
        map.GetManagedLayer("test-id").Should().BeNull();
    }

    [Fact]
    public async Task RemoveLayerManaged_ByLayerInstance_RemovesFromRegistry()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.Leaflet/leafletMap.js");
        jsModule.SetupModule("LeafletMap.Map.createMap", _ => true);
        jsModule.SetupModule("LeafletMap.TileLayer.createTileLayer", _ => true);
        jsModule.SetupVoid("LeafletMap.Layer.addTo", _ => true).SetVoidResult();
        jsModule.SetupVoid("LeafletMap.Layer.remove", _ => true).SetVoidResult();

        var map = new Map("test-map", new MapOptions());
        var layer = new TileLayer("http://example/{z}/{x}/{y}.png");

        var cut = Render<LeafletMap>(parameters => parameters.Add(p => p.Map, map));

        await map.AddLayerManaged(layer, "test-id");

        // Act
        await map.RemoveLayerManaged(layer);

        // Assert
        map.ManagedLayerOrder.Should().BeEmpty();
        map.GetLayerId(layer).Should().BeNull();
    }

    [Fact]
    public async Task ReorderLayer_MovesLayerToNewIndex()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.Leaflet/leafletMap.js");
        jsModule.SetupModule("LeafletMap.Map.createMap", _ => true);
        jsModule.SetupModule("LeafletMap.TileLayer.createTileLayer", _ => true);
        jsModule.SetupVoid("LeafletMap.Layer.addTo", _ => true).SetVoidResult();
        jsModule.SetupVoid("LeafletMap.Layer.remove", _ => true).SetVoidResult();

        var map = new Map("test-map", new MapOptions());
        var layer1 = new TileLayer("http://example1/{z}/{x}/{y}.png");
        var layer2 = new TileLayer("http://example2/{z}/{x}/{y}.png");
        var layer3 = new TileLayer("http://example3/{z}/{x}/{y}.png");

        var cut = Render<LeafletMap>(parameters => parameters.Add(p => p.Map, map));

        await map.AddLayerManaged(layer1, "layer-1");
        await map.AddLayerManaged(layer2, "layer-2");
        await map.AddLayerManaged(layer3, "layer-3");

        // Act - move layer-3 to position 1 (between layer-1 and layer-2)
        await map.ReorderLayer("layer-3", 1);

        // Assert
        map.ManagedLayerOrder.Should().HaveCount(3);
        map.ManagedLayerOrder[0].Should().Be("layer-1");
        map.ManagedLayerOrder[1].Should().Be("layer-3");
        map.ManagedLayerOrder[2].Should().Be("layer-2");
    }

    [Fact]
    public async Task ReorderLayer_WithLayerInstance_MovesLayerToNewIndex()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.Leaflet/leafletMap.js");
        jsModule.SetupModule("LeafletMap.Map.createMap", _ => true);
        jsModule.SetupModule("LeafletMap.TileLayer.createTileLayer", _ => true);
        jsModule.SetupVoid("LeafletMap.Layer.addTo", _ => true).SetVoidResult();
        jsModule.SetupVoid("LeafletMap.Layer.remove", _ => true).SetVoidResult();

        var map = new Map("test-map", new MapOptions());
        var layer1 = new TileLayer("http://example1/{z}/{x}/{y}.png");
        var layer2 = new TileLayer("http://example2/{z}/{x}/{y}.png");
        var layer3 = new TileLayer("http://example3/{z}/{x}/{y}.png");

        var cut = Render<LeafletMap>(parameters => parameters.Add(p => p.Map, map));

        await map.AddLayerManaged(layer1, "layer-1");
        await map.AddLayerManaged(layer2, "layer-2");
        await map.AddLayerManaged(layer3, "layer-3");

        // Act
        await map.ReorderLayer(layer3, 0);

        // Assert
        map.ManagedLayerOrder[0].Should().Be("layer-3");
        map.ManagedLayerOrder[1].Should().Be("layer-1");
        map.ManagedLayerOrder[2].Should().Be("layer-2");
    }

    [Fact]
    public async Task MoveLayerManagedToTop_MovesLayerToLastIndex()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.Leaflet/leafletMap.js");
        jsModule.SetupModule("LeafletMap.Map.createMap", _ => true);
        jsModule.SetupModule("LeafletMap.TileLayer.createTileLayer", _ => true);
        jsModule.SetupVoid("LeafletMap.Layer.addTo", _ => true).SetVoidResult();
        jsModule.SetupVoid("LeafletMap.Layer.remove", _ => true).SetVoidResult();

        var map = new Map("test-map", new MapOptions());
        var layer1 = new TileLayer("http://example1/{z}/{x}/{y}.png");
        var layer2 = new TileLayer("http://example2/{z}/{x}/{y}.png");
        var layer3 = new TileLayer("http://example3/{z}/{x}/{y}.png");

        var cut = Render<LeafletMap>(parameters => parameters.Add(p => p.Map, map));

        await map.AddLayerManaged(layer1, "layer-1");
        await map.AddLayerManaged(layer2, "layer-2");
        await map.AddLayerManaged(layer3, "layer-3");

        // Act
        await map.MoveLayerManagedToTop(layer1);

        // Assert
        map.ManagedLayerOrder[0].Should().Be("layer-2");
        map.ManagedLayerOrder[1].Should().Be("layer-3");
        map.ManagedLayerOrder[2].Should().Be("layer-1");
    }

    [Fact]
    public async Task MoveLayerManagedToBottom_MovesLayerToIndexZero()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.Leaflet/leafletMap.js");
        jsModule.SetupModule("LeafletMap.Map.createMap", _ => true);
        jsModule.SetupModule("LeafletMap.TileLayer.createTileLayer", _ => true);
        jsModule.SetupVoid("LeafletMap.Layer.addTo", _ => true).SetVoidResult();
        jsModule.SetupVoid("LeafletMap.Layer.remove", _ => true).SetVoidResult();

        var map = new Map("test-map", new MapOptions());
        var layer1 = new TileLayer("http://example1/{z}/{x}/{y}.png");
        var layer2 = new TileLayer("http://example2/{z}/{x}/{y}.png");
        var layer3 = new TileLayer("http://example3/{z}/{x}/{y}.png");

        var cut = Render<LeafletMap>(parameters => parameters.Add(p => p.Map, map));

        await map.AddLayerManaged(layer1, "layer-1");
        await map.AddLayerManaged(layer2, "layer-2");
        await map.AddLayerManaged(layer3, "layer-3");

        // Act
        await map.MoveLayerManagedToBottom(layer3);

        // Assert
        map.ManagedLayerOrder[0].Should().Be("layer-3");
        map.ManagedLayerOrder[1].Should().Be("layer-1");
        map.ManagedLayerOrder[2].Should().Be("layer-2");
    }

    [Fact]
    public async Task LayerConvenienceMethods_AddToManaged_AddsLayerToRegistry()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.Leaflet/leafletMap.js");
        jsModule.SetupModule("LeafletMap.Map.createMap", _ => true);
        jsModule.SetupModule("LeafletMap.TileLayer.createTileLayer", _ => true);
        jsModule.SetupVoid("LeafletMap.Layer.addTo", _ => true).SetVoidResult();

        var map = new Map("test-map", new MapOptions());
        var layer = new TileLayer("http://example/{z}/{x}/{y}.png");

        var cut = Render<LeafletMap>(parameters => parameters.Add(p => p.Map, map));

        // Act
        await layer.AddToManaged(map, "test-id");

        // Assert
        map.ManagedLayerOrder.Should().Contain("test-id");
        map.GetManagedLayer("test-id").Should().BeSameAs(layer);
    }

    [Fact]
    public async Task LayerConvenienceMethods_RemoveFromManaged_RemovesLayerFromRegistry()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.Leaflet/leafletMap.js");
        jsModule.SetupModule("LeafletMap.Map.createMap", _ => true);
        jsModule.SetupModule("LeafletMap.TileLayer.createTileLayer", _ => true);
        jsModule.SetupVoid("LeafletMap.Layer.addTo", _ => true).SetVoidResult();
        jsModule.SetupVoid("LeafletMap.Layer.remove", _ => true).SetVoidResult();

        var map = new Map("test-map", new MapOptions());
        var layer = new TileLayer("http://example/{z}/{x}/{y}.png");

        var cut = Render<LeafletMap>(parameters => parameters.Add(p => p.Map, map));

        await layer.AddToManaged(map, "test-id");

        // Act
        await layer.RemoveFromManaged(map);

        // Assert
        map.ManagedLayerOrder.Should().NotContain("test-id");
    }

    [Fact]
    public async Task LayerConvenienceMethods_MoveToTopManaged_MovesLayerToTop()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.Leaflet/leafletMap.js");
        jsModule.SetupModule("LeafletMap.Map.createMap", _ => true);
        jsModule.SetupModule("LeafletMap.TileLayer.createTileLayer", _ => true);
        jsModule.SetupVoid("LeafletMap.Layer.addTo", _ => true).SetVoidResult();
        jsModule.SetupVoid("LeafletMap.Layer.remove", _ => true).SetVoidResult();

        var map = new Map("test-map", new MapOptions());
        var layer1 = new TileLayer("http://example1/{z}/{x}/{y}.png");
        var layer2 = new TileLayer("http://example2/{z}/{x}/{y}.png");

        var cut = Render<LeafletMap>(parameters => parameters.Add(p => p.Map, map));

        await layer1.AddToManaged(map, "layer-1");
        await layer2.AddToManaged(map, "layer-2");

        // Act
        await layer1.MoveToTopManaged(map);

        // Assert
        map.ManagedLayerOrder[1].Should().Be("layer-1");
    }

    [Fact]
    public void ReorderLayer_ThrowsException_ForUnmanagedLayer()
    {
        // Arrange
        var map = new Map("test-map", new MapOptions());
        var layer = new TileLayer("http://example/{z}/{x}/{y}.png");

        // Act & Assert
        var act = async () => await map.ReorderLayer(layer, 0);
        act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("*not in the managed layer registry*");
    }

    [Fact]
    public async Task MoveLayerManagedUp_MovesLayerUpOnePosition()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.Leaflet/leafletMap.js");
        jsModule.SetupModule("LeafletMap.Map.createMap", _ => true);
        jsModule.SetupModule("LeafletMap.TileLayer.createTileLayer", _ => true);
        jsModule.SetupVoid("LeafletMap.Layer.addTo", _ => true).SetVoidResult();
        jsModule.SetupVoid("LeafletMap.Layer.remove", _ => true).SetVoidResult();

        var map = new Map("test-map", new MapOptions());
        var layer1 = new TileLayer("http://example1/{z}/{x}/{y}.png");
        var layer2 = new TileLayer("http://example2/{z}/{x}/{y}.png");
        var layer3 = new TileLayer("http://example3/{z}/{x}/{y}.png");

        var cut = Render<LeafletMap>(parameters => parameters.Add(p => p.Map, map));

        await map.AddLayerManaged(layer1, "layer-1");
        await map.AddLayerManaged(layer2, "layer-2");
        await map.AddLayerManaged(layer3, "layer-3");

        // Act - move layer-1 up (from index 0 to index 1)
        await map.MoveLayerManagedUp("layer-1");

        // Assert
        map.ManagedLayerOrder[0].Should().Be("layer-2");
        map.ManagedLayerOrder[1].Should().Be("layer-1");
        map.ManagedLayerOrder[2].Should().Be("layer-3");
    }

    [Fact]
    public async Task MoveLayerManagedUp_AtTop_DoesNothing()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.Leaflet/leafletMap.js");
        jsModule.SetupModule("LeafletMap.Map.createMap", _ => true);
        jsModule.SetupModule("LeafletMap.TileLayer.createTileLayer", _ => true);
        jsModule.SetupVoid("LeafletMap.Layer.addTo", _ => true).SetVoidResult();

        var map = new Map("test-map", new MapOptions());
        var layer1 = new TileLayer("http://example1/{z}/{x}/{y}.png");
        var layer2 = new TileLayer("http://example2/{z}/{x}/{y}.png");

        var cut = Render<LeafletMap>(parameters => parameters.Add(p => p.Map, map));

        await map.AddLayerManaged(layer1, "layer-1");
        await map.AddLayerManaged(layer2, "layer-2");

        // Act - layer-2 is already at top
        await map.MoveLayerManagedUp(layer2);

        // Assert - order unchanged
        map.ManagedLayerOrder[0].Should().Be("layer-1");
        map.ManagedLayerOrder[1].Should().Be("layer-2");
    }

    [Fact]
    public async Task MoveLayerManagedDown_MovesLayerDownOnePosition()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.Leaflet/leafletMap.js");
        jsModule.SetupModule("LeafletMap.Map.createMap", _ => true);
        jsModule.SetupModule("LeafletMap.TileLayer.createTileLayer", _ => true);
        jsModule.SetupVoid("LeafletMap.Layer.addTo", _ => true).SetVoidResult();
        jsModule.SetupVoid("LeafletMap.Layer.remove", _ => true).SetVoidResult();

        var map = new Map("test-map", new MapOptions());
        var layer1 = new TileLayer("http://example1/{z}/{x}/{y}.png");
        var layer2 = new TileLayer("http://example2/{z}/{x}/{y}.png");
        var layer3 = new TileLayer("http://example3/{z}/{x}/{y}.png");

        var cut = Render<LeafletMap>(parameters => parameters.Add(p => p.Map, map));

        await map.AddLayerManaged(layer1, "layer-1");
        await map.AddLayerManaged(layer2, "layer-2");
        await map.AddLayerManaged(layer3, "layer-3");

        // Act - move layer-3 down (from index 2 to index 1)
        await map.MoveLayerManagedDown("layer-3");

        // Assert
        map.ManagedLayerOrder[0].Should().Be("layer-1");
        map.ManagedLayerOrder[1].Should().Be("layer-3");
        map.ManagedLayerOrder[2].Should().Be("layer-2");
    }

    [Fact]
    public async Task MoveLayerManagedDown_AtBottom_DoesNothing()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.Leaflet/leafletMap.js");
        jsModule.SetupModule("LeafletMap.Map.createMap", _ => true);
        jsModule.SetupModule("LeafletMap.TileLayer.createTileLayer", _ => true);
        jsModule.SetupVoid("LeafletMap.Layer.addTo", _ => true).SetVoidResult();

        var map = new Map("test-map", new MapOptions());
        var layer1 = new TileLayer("http://example1/{z}/{x}/{y}.png");
        var layer2 = new TileLayer("http://example2/{z}/{x}/{y}.png");

        var cut = Render<LeafletMap>(parameters => parameters.Add(p => p.Map, map));

        await map.AddLayerManaged(layer1, "layer-1");
        await map.AddLayerManaged(layer2, "layer-2");

        // Act - layer-1 is already at bottom
        await map.MoveLayerManagedDown(layer1);

        // Assert - order unchanged
        map.ManagedLayerOrder[0].Should().Be("layer-1");
        map.ManagedLayerOrder[1].Should().Be("layer-2");
    }

    [Fact]
    public async Task LayerConvenienceMethods_MoveUpManaged_MovesLayerUp()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.Leaflet/leafletMap.js");
        jsModule.SetupModule("LeafletMap.Map.createMap", _ => true);
        jsModule.SetupModule("LeafletMap.TileLayer.createTileLayer", _ => true);
        jsModule.SetupVoid("LeafletMap.Layer.addTo", _ => true).SetVoidResult();
        jsModule.SetupVoid("LeafletMap.Layer.remove", _ => true).SetVoidResult();

        var map = new Map("test-map", new MapOptions());
        var layer1 = new TileLayer("http://example1/{z}/{x}/{y}.png");
        var layer2 = new TileLayer("http://example2/{z}/{x}/{y}.png");

        var cut = Render<LeafletMap>(parameters => parameters.Add(p => p.Map, map));

        await layer1.AddToManaged(map, "layer-1");
        await layer2.AddToManaged(map, "layer-2");

        // Act
        await layer1.MoveUpManaged(map);

        // Assert
        map.ManagedLayerOrder[1].Should().Be("layer-1");
    }

    [Fact]
    public async Task LayerConvenienceMethods_MoveDownManaged_MovesLayerDown()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.Leaflet/leafletMap.js");
        jsModule.SetupModule("LeafletMap.Map.createMap", _ => true);
        jsModule.SetupModule("LeafletMap.TileLayer.createTileLayer", _ => true);
        jsModule.SetupVoid("LeafletMap.Layer.addTo", _ => true).SetVoidResult();
        jsModule.SetupVoid("LeafletMap.Layer.remove", _ => true).SetVoidResult();

        var map = new Map("test-map", new MapOptions());
        var layer1 = new TileLayer("http://example1/{z}/{x}/{y}.png");
        var layer2 = new TileLayer("http://example2/{z}/{x}/{y}.png");

        var cut = Render<LeafletMap>(parameters => parameters.Add(p => p.Map, map));

        await layer1.AddToManaged(map, "layer-1");
        await layer2.AddToManaged(map, "layer-2");

        // Act
        await layer2.MoveDownManaged(map);

        // Assert
        map.ManagedLayerOrder[0].Should().Be("layer-2");
    }
}


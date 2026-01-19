namespace PyroGeoBlazor.Leaflet.Tests.Unit.Models;

using Bunit;

using FluentAssertions;

using PyroGeoBlazor.Leaflet.Components;
using PyroGeoBlazor.Leaflet.EventArgs;
using PyroGeoBlazor.Leaflet.Models;

using Xunit;

public class MapMoveLayerTests : BunitContext
{
    [Fact]
    public async Task MoveLayerToIndex_InvokesJsInterop_WithCorrectArgs()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.Leaflet/leafletMap.js");
        jsModule.SetupModule("LeafletMap.Map.createMap", _ => true);
        jsModule.SetupModule("LeafletMap.TileLayer.createTileLayer", _ => true);
        // Expect the moveLayerToIndex call (void)
        jsModule.SetupVoid("LeafletMap.Map.moveLayerToIndex", _ => true).SetVoidResult();

        var map = new Map("test-map", new MapOptions());

        var layer = new TileLayer("http://example/{z}/{x}/{y}.png");

        // Act
        var cut = Render<LeafletMap>(parameters => parameters
            .Add(p => p.Map, map));

        // Call MoveLayerToIndex
        var result = await map.MoveLayerToIndex(layer, 1);

        // Assert - call completed and returned the map instance
        result.Should().Be(map);
        // Verify JS module invocation contains expected index argument
        JSInterop.Invocations.Should().Contain(inv =>
            inv.Identifier == "LeafletMap.Map.moveLayerToIndex" &&
            inv.Arguments.Count > 2 &&
            inv.Arguments[2] is int && (int)inv.Arguments[2] == 1);
    }

    [Fact]
    public async Task MoveLayerToTop_InvokesJsInterop_WithExpectedIndex()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.Leaflet/leafletMap.js");
        jsModule.SetupModule("LeafletMap.Map.createMap", _ => true);
        jsModule.SetupModule("LeafletMap.TileLayer.createTileLayer", _ => true);
        jsModule.SetupVoid("LeafletMap.Map.moveLayerToIndex", _ => true).SetVoidResult();

        var map = new Map("test-map", new MapOptions());
        var layer = new TileLayer("http://example/{z}/{x}/{y}.png");

        // Act - render component to initialize JS binder
        var cut = Render<LeafletMap>(parameters => parameters.Add(p => p.Map, map));


        // Simulate layeradd events to build LayerOrder: [GeoJson(id=1), TileLayer(id=2), Polyline(id=3)]
        await map.LayerAdd(new LeafletLayerEventArgs { Layer = new LayerInfo { LeafletId = 1, Type = "GeoJsonLayer" } });
        await map.LayerAdd(new LeafletLayerEventArgs { Layer = new LayerInfo { LeafletId = 2, Type = "TileLayer" } });
        await map.LayerAdd(new LeafletLayerEventArgs { Layer = new LayerInfo { LeafletId = 3, Type = "Polyline" } });

        // Call MoveLayerToTop - expects index = count-1 = 2
        await map.MoveLayerToTop(layer);

        // Assert - verify a module void invocation with index 2 occurred
        JSInterop.Invocations.Should().Contain(inv =>
            inv.Identifier == "LeafletMap.Map.moveLayerToIndex" &&
            inv.Arguments.Count > 2 &&
            inv.Arguments[2] is int && (int)inv.Arguments[2] == 2);
    }

    [Fact]
    public async Task MoveLayerToBottom_InvokesJsInterop_WithExpectedIndex()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.Leaflet/leafletMap.js");
        jsModule.SetupModule("LeafletMap.Map.createMap", _ => true);
        jsModule.SetupModule("LeafletMap.TileLayer.createTileLayer", _ => true);
        jsModule.SetupVoid("LeafletMap.Map.moveLayerToIndex", _ => true).SetVoidResult();

        var map = new Map("test-map", new MapOptions());
        var layer = new TileLayer("http://example/{z}/{x}/{y}.png");

        // Act - render component to initialize JS binder
        var cut = Render<LeafletMap>(parameters => parameters.Add(p => p.Map, map));

        // Simulate layeradd events to build LayerOrder: [GeoJson(id=1), TileLayer(id=2), Polyline(id=3)]
        await map.LayerAdd(new LeafletLayerEventArgs { Layer = new LayerInfo { LeafletId = 1, Type = "GeoJsonLayer" } });
        await map.LayerAdd(new LeafletLayerEventArgs { Layer = new LayerInfo { LeafletId = 2, Type = "TileLayer" } });
        await map.LayerAdd(new LeafletLayerEventArgs { Layer = new LayerInfo { LeafletId = 3, Type = "Polyline" } });

        // Call MoveLayerToBottom - expects index = 0
        await map.MoveLayerToBottom(layer);

        // Assert - verify a module void invocation with index 0 occurred
        JSInterop.Invocations.Should().Contain(inv =>
            inv.Identifier == "LeafletMap.Map.moveLayerToIndex" &&
            inv.Arguments.Count > 2 &&
            inv.Arguments[2] is int && (int)inv.Arguments[2] == 0);
    }
}


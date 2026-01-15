using Bunit;
using FluentAssertions;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using PyroGeoBlazor.Leaflet.Components;
using PyroGeoBlazor.Leaflet.Models;
using Xunit;

namespace PyroGeoBlazor.Leaflet.Tests.Unit;

/// <summary>
/// Tests for JavaScript interop functionality through the component layer.
/// Since LeafletMapJSBinder is internal, we test JS interop through the public API.
/// </summary>
public class JSInteropTests : BunitContext
{
    [Fact]
    public void LeafletMapBase_InitializesWithInjectedJSRuntime()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.Leaflet/leafletMap.js");
        jsModule.SetupModule("LeafletMap.Map.createMap", _ => true);
        
        var map = new Map("test-map", new MapOptions());

        // Act
        var cut = Render<LeafletMap>(parameters => parameters
            .Add(p => p.Map, map));

        // Assert
        cut.Instance.JSRuntime.Should().NotBeNull();
        cut.Instance.Map.Should().NotBeNull();
    }

    [Fact]
    public void LeafletMap_HasMapReadyProperty()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.Leaflet/leafletMap.js");
        jsModule.SetupModule("LeafletMap.Map.createMap", _ => true);
        
        var map = new Map("test-map", new MapOptions());

        // Act
        var cut = Render<LeafletMap>(parameters => parameters
            .Add(p => p.Map, map)
            .Add(p => p.OnMapReady, EventCallback.Factory.Create(this, () => { })));

        // Assert
        cut.Instance.MapReady.Should().BeTrue();
        // Note: In unit tests, OnAfterRenderAsync may not execute automatically
    }
}

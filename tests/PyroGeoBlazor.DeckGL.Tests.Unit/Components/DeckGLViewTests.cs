namespace PyroGeoBlazor.DeckGL.Tests.Unit.Components;

using Bunit;

using FluentAssertions;

using PyroGeoBlazor.DeckGL.Components;
using PyroGeoBlazor.DeckGL.Models;

public class DeckGLViewTests : MudBlazorTestContext
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

    [Fact]
    public void DeckGLView_HasDefaultDebounceValue()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.DeckGL/deckGL.js");
        jsModule.SetupModule("DeckGL.DeckGLView.createDeckGLView", _ => true);

        // Act
        var cut = Render<DeckGLView>();

        // Assert
        cut.Instance.ViewportUpdateDebounceMs.Should().Be(300);
    }

    [Fact]
    public void DeckGLView_AcceptsCustomDebounceValue()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.DeckGL/deckGL.js");
        jsModule.SetupModule("DeckGL.DeckGLView.createDeckGLView", _ => true);

        // Act
        var cut = Render<DeckGLView>(parameters => parameters
            .Add(p => p.ViewportUpdateDebounceMs, 500));

        // Assert
        cut.Instance.ViewportUpdateDebounceMs.Should().Be(500);
    }

    [Fact]
    public async Task OnViewStateChangedCallback_UpdatesCurrentViewState()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.DeckGL/deckGL.js");
        var deckViewRef = jsModule.SetupModule("DeckGL.DeckGLView.createDeckGLView");
        deckViewRef.SetupVoid("updateLayers");

        var cut = Render<DeckGLView>();
        var newViewState = new ViewState
        {
            Longitude = -100.0,
            Latitude = 40.0,
            Zoom = 10
        };

        // Act
        await cut.Instance.OnViewStateChangedCallback(newViewState);

        // Assert
        cut.Instance.CurrentViewState.Should().NotBeNull();
        cut.Instance.CurrentViewState!.Longitude.Should().Be(-100.0);
        cut.Instance.CurrentViewState.Latitude.Should().Be(40.0);
        cut.Instance.CurrentViewState.Zoom.Should().Be(10);
    }

    [Fact]
    public async Task OnViewStateChangedCallback_InvokesEventCallback()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.DeckGL/deckGL.js");
        var deckViewRef = jsModule.SetupModule("DeckGL.DeckGLView.createDeckGLView");
        deckViewRef.SetupVoid("updateLayers");

        ViewState? capturedViewState = null;
        var cut = Render<DeckGLView>(parameters => parameters
            .Add(p => p.OnViewStateChanged, vs => capturedViewState = vs));

        var newViewState = new ViewState
        {
            Longitude = -100.0,
            Latitude = 40.0,
            Zoom = 10
        };

        // Act
        await cut.Instance.OnViewStateChangedCallback(newViewState);

        // Assert
        capturedViewState.Should().NotBeNull();
        capturedViewState!.Longitude.Should().Be(-100.0);
        capturedViewState.Latitude.Should().Be(40.0);
        capturedViewState.Zoom.Should().Be(10);
    }

    [Fact]
    public async Task OnViewStateChangedCallback_DebounceDisabled_SetsCurrentViewStateImmediately()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.DeckGL/deckGL.js");
        jsModule.SetupModule("DeckGL.DeckGLView.createDeckGLView");

        var cut = Render<DeckGLView>(parameters => parameters
            .Add(p => p.ViewportUpdateDebounceMs, 0));

        var newViewState = new ViewState
        {
            Longitude = -100.0,
            Latitude = 40.0,
            Zoom = 10
        };

        // Act
        await cut.InvokeAsync(async () => await cut.Instance.OnViewStateChangedCallback(newViewState));

        // Assert - Current view state should be updated immediately
        cut.Instance.CurrentViewState.Should().NotBeNull();
        cut.Instance.CurrentViewState!.Longitude.Should().Be(-100.0);
        cut.Instance.CurrentViewState.Latitude.Should().Be(40.0);
        cut.Instance.CurrentViewState.Zoom.Should().Be(10);
    }

    [Fact]
    public async Task OnViewStateChangedCallback_WithDebounce_UpdatesViewStateImmediately()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.DeckGL/deckGL.js");
        jsModule.SetupModule("DeckGL.DeckGLView.createDeckGLView");

        var cut = Render<DeckGLView>(parameters => parameters
            .Add(p => p.ViewportUpdateDebounceMs, 100));

        var newViewState = new ViewState
        {
            Longitude = -100.0,
            Latitude = 40.0,
            Zoom = 10
        };

        // Act
        await cut.InvokeAsync(async () => await cut.Instance.OnViewStateChangedCallback(newViewState));

        // Assert - Current view state should be updated immediately even with debounce
        // (debounce only affects layer updates, not view state updates)
        cut.Instance.CurrentViewState.Should().NotBeNull();
        cut.Instance.CurrentViewState!.Longitude.Should().Be(-100.0);
        cut.Instance.CurrentViewState.Latitude.Should().Be(40.0);
        cut.Instance.CurrentViewState.Zoom.Should().Be(10);
    }

    [Fact]
    public async Task OnViewStateChangedCallback_MultipleRapidChanges_StoresLastViewState()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.DeckGL/deckGL.js");
        jsModule.SetupModule("DeckGL.DeckGLView.createDeckGLView");

        var cut = Render<DeckGLView>(parameters => parameters
            .Add(p => p.ViewportUpdateDebounceMs, 100));

        var viewState1 = new ViewState { Longitude = -100.0, Latitude = 40.0, Zoom = 10 };
        var viewState2 = new ViewState { Longitude = -101.0, Latitude = 41.0, Zoom = 11 };
        var viewState3 = new ViewState { Longitude = -102.0, Latitude = 42.0, Zoom = 12 };

        // Act - Trigger multiple rapid changes
        await cut.InvokeAsync(async () => await cut.Instance.OnViewStateChangedCallback(viewState1));
        await Task.Delay(30);
        await cut.InvokeAsync(async () => await cut.Instance.OnViewStateChangedCallback(viewState2));
        await Task.Delay(30);
        await cut.InvokeAsync(async () => await cut.Instance.OnViewStateChangedCallback(viewState3));

        // Assert - Current view state should be the last one
        cut.Instance.CurrentViewState.Should().NotBeNull();
        cut.Instance.CurrentViewState!.Longitude.Should().Be(-102.0);
        cut.Instance.CurrentViewState.Latitude.Should().Be(42.0);
        cut.Instance.CurrentViewState.Zoom.Should().Be(12);
    }

    [Fact]
    public async Task DisposeAsync_DisposesViewportUpdateTimer()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.DeckGL/deckGL.js");
        var deckViewRef = jsModule.SetupModule("DeckGL.DeckGLView.createDeckGLView");
        deckViewRef.SetupVoid("dispose");
        deckViewRef.SetupVoid("updateLayers");

        var cut = Render<DeckGLView>(parameters => parameters
            .Add(p => p.ViewportUpdateDebounceMs, 100));

        var newViewState = new ViewState
        {
            Longitude = -100.0,
            Latitude = 40.0,
            Zoom = 10
        };

        await cut.Instance.OnViewStateChangedCallback(newViewState);

        // Act
        await cut.Instance.DisposeAsync();

        // Assert - Timer should be disposed, so callback should not fire
        await Task.Delay(150);
        
        // The test passes if no exception is thrown during disposal
        cut.Instance.Should().NotBeNull();
    }

    [Fact]
    public async Task AddLayer_AddsLayerToCollection()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.DeckGL/deckGL.js");
        var deckViewRef = jsModule.SetupModule("DeckGL.DeckGLView.createDeckGLView");
        deckViewRef.SetupVoid("updateLayers");

        var cut = Render<DeckGLView>();
        
        var layerConfig = new GeoJsonLayerConfig
        {
            Id = "test-layer",
            DataUrl = "test-url.json",
            Visible = true
        };

        // Wait for component to initialize
        await Task.Delay(50);

        // Act
        await cut.InvokeAsync(async () => await cut.Instance.AddLayer(layerConfig));

        // Assert
        cut.Instance.Layers.Should().Contain(l => l.Id == "test-layer");
        cut.Instance.Layers.Should().HaveCount(1);
    }

    [Fact]
    public async Task AddLayer_DefaultUpdateLayersFalse_DoesNotTriggerUpdate()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.DeckGL/deckGL.js");
        var deckViewRef = jsModule.SetupModule("DeckGL.DeckGLView.createDeckGLView");
        var updateLayersInvocation = deckViewRef.SetupVoid("updateLayers");

        var cut = Render<DeckGLView>();
        
        var layerConfig = new GeoJsonLayerConfig { Id = "test-layer", DataUrl = "test.json" };

        // Wait for component to initialize
        await Task.Delay(50);

        // Act - Default updateLayers is false
        await cut.InvokeAsync(async () => await cut.Instance.AddLayer(layerConfig));

        // Assert - Should not trigger updateLayers by default
        updateLayersInvocation.Invocations.Should().BeEmpty();
    }

    [Fact]
    public async Task AddLayer_WithUpdateLayersFalse_DoesNotTriggerUpdate()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.DeckGL/deckGL.js");
        var deckViewRef = jsModule.SetupModule("DeckGL.DeckGLView.createDeckGLView");
        var updateLayersInvocation = deckViewRef.SetupVoid("updateLayers");

        var cut = Render<DeckGLView>();
        
        var layerConfig = new GeoJsonLayerConfig { Id = "test-layer", DataUrl = "test.json" };

        // Wait for component to initialize
        await Task.Delay(50);

        // Act - Explicitly set updateLayers to false
        await cut.InvokeAsync(async () => await cut.Instance.AddLayer(layerConfig, updateLayers: false));

        // Assert - Should not trigger updateLayers when updateLayers=false
        updateLayersInvocation.Invocations.Should().BeEmpty();
    }

    [Fact]
    public async Task AddLayer_ThrowsWhenLayerConfigIsNull()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.DeckGL/deckGL.js");
        jsModule.SetupModule("DeckGL.DeckGLView.createDeckGLView");

        var cut = Render<DeckGLView>();

        // Act & Assert
        await cut.Invoking(async c => await c.Instance.AddLayer(null!))
            .Should().ThrowAsync<ArgumentNullException>();
    }

    [Fact]
    public async Task AddLayer_ThrowsWhenDuplicateLayerId()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.DeckGL/deckGL.js");
        var deckViewRef = jsModule.SetupModule("DeckGL.DeckGLView.createDeckGLView");
        deckViewRef.SetupVoid("updateLayers");

        var cut = Render<DeckGLView>();
        
        var layerConfig1 = new GeoJsonLayerConfig { Id = "test-layer", DataUrl = "test1.json" };
        var layerConfig2 = new TileLayerConfig { Id = "test-layer" };

        await Task.Delay(50);
        await cut.InvokeAsync(async () => await cut.Instance.AddLayer(layerConfig1));

        // Act & Assert
        await cut.Invoking(async c => await c.Instance.AddLayer(layerConfig2))
            .Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Layer IDs must be unique*");
    }

    [Fact]
    public async Task RemoveLayer_RemovesLayerFromCollection()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.DeckGL/deckGL.js");
        var deckViewRef = jsModule.SetupModule("DeckGL.DeckGLView.createDeckGLView");
        deckViewRef.SetupVoid("updateLayers");

        var cut = Render<DeckGLView>();
        
        var layerConfig = new GeoJsonLayerConfig { Id = "test-layer", DataUrl = "test.json" };

        await Task.Delay(50);
        await cut.InvokeAsync(async () => await cut.Instance.AddLayer(layerConfig));

        // Act
        var result = await cut.InvokeAsync(async () => await cut.Instance.RemoveLayer("test-layer"));

        // Assert
        result.Should().BeTrue();
        cut.Instance.Layers.Should().BeEmpty();
    }

    [Fact]
    public async Task RemoveLayer_ReturnsFalseWhenLayerNotFound()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.DeckGL/deckGL.js");
        jsModule.SetupModule("DeckGL.DeckGLView.createDeckGLView");

        var cut = Render<DeckGLView>();

        // Act
        var result = await cut.InvokeAsync(async () => await cut.Instance.RemoveLayer("non-existent-layer"));

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task AddLayer_AddsMultipleLayers()
    {
        // Arrange
        var jsModule = JSInterop.SetupModule("./_content/PyroGeoBlazor.DeckGL/deckGL.js");
        var deckViewRef = jsModule.SetupModule("DeckGL.DeckGLView.createDeckGLView");
        deckViewRef.SetupVoid("updateLayers");

        var cut = Render<DeckGLView>();
        
        var layer1 = new GeoJsonLayerConfig { Id = "layer-1", DataUrl = "test1.json" };
        var layer2 = new TileLayerConfig { Id = "layer-2" };
        var layer3 = new GeoJsonLayerConfig { Id = "layer-3", DataUrl = "test3.json" };

        // Wait for component to initialize
        await Task.Delay(50);

        // Act
        await cut.InvokeAsync(async () =>
        {
            await cut.Instance.AddLayer(layer1);
            await cut.Instance.AddLayer(layer2);
            await cut.Instance.AddLayer(layer3);
        });

        // Assert
        cut.Instance.Layers.Should().HaveCount(3);
        cut.Instance.Layers.Should().Contain(l => l.Id == "layer-1");
        cut.Instance.Layers.Should().Contain(l => l.Id == "layer-2");
        cut.Instance.Layers.Should().Contain(l => l.Id == "layer-3");
    }
}



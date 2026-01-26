namespace PyroGeoBlazor.DeckGL.Tests.Unit.Components;

using Bunit;

using FluentAssertions;

using PyroGeoBlazor.DeckGL.Components;
using PyroGeoBlazor.DeckGL.Models;

using System.Text.Json;

public class FeatureSelectionControlTests : MudBlazorTestContext
{
    private DeckGLView CreateMockDeckGLView(FeatureSelectionResult? selectionResult = null, List<LayerConfig>? layers = null)
    {
        var deckView = new DeckGLView();
        
        // Set SelectionResult using reflection
        if (selectionResult != null)
        {
            var selectionField = typeof(DeckGLView).GetProperty("SelectionResult");
            selectionField?.SetValue(deckView, selectionResult);
        }
        
        // Add layers using reflection
        if (layers != null)
        {
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
    public void FeatureSelectionControl_ShowsEmptyState_WhenNoFeaturesSelected()
    {
        // Arrange
        var mockDeckView = CreateMockDeckGLView();
        
        // Act
        var cut = RenderWithMud<FeatureSelectionControl>(parameters => parameters
            .Add(p => p.DeckGLView, mockDeckView));

        // Assert
        cut.Markup.Should().Contain("No features selected");
    }

    [Fact]
    public void FeatureSelectionControl_DisplaysSelectedFeatures()
    {
        // Arrange
        var featureJson = """
        {
            "type": "Feature",
            "properties": {
                "name": "Test Feature"
            }
        }
        """;
        
        var feature = JsonSerializer.Deserialize<JsonElement>(featureJson);
        var selectionResult = new FeatureSelectionResult
        {
            Features =
            [
                new SelectedFeature
                {
                    LayerId = "test-layer",
                    Feature = feature
                }
            ]
        };
        
        var mockDeckView = CreateMockDeckGLView(selectionResult);

        // Act
        var cut = RenderWithMud<FeatureSelectionControl>(parameters => parameters
            .Add(p => p.DeckGLView, mockDeckView));

        // Assert
        cut.Markup.Should().Contain("test-layer");
    }

    [Fact]
    public void FeatureSelectionControl_PassesLockedState_WhenLayerIsNotEditable()
    {
        // Arrange
        var featureJson = """
        {
            "type": "Feature",
            "properties": {
                "name": "Test"
            }
        }
        """;
        
        var feature = JsonSerializer.Deserialize<JsonElement>(featureJson);
        var selectedFeature = new SelectedFeature
        {
            LayerId = "locked-layer",
            Feature = feature
        };
        
        var selectionResult = new FeatureSelectionResult
        {
            Features = [selectedFeature]
        };

        var layerConfigs = new List<LayerConfig>
        {
            new GeoJsonLayerConfig { Id = "locked-layer", IsEditable = false }
        };
        
        var mockDeckView = CreateMockDeckGLView(selectionResult, layerConfigs);

        // Act
        var cut = RenderWithMud<FeatureSelectionControl>(parameters => parameters
            .Add(p => p.DeckGLView, mockDeckView));

        // Click the feature to populate clickedFeature
        var featureItem = cut.Find("div[style*='cursor: pointer']");
        featureItem.Click();

        // Assert - should contain locked indicator from FeatureAttributesControl
        cut.Markup.ToLower().Should().Contain("locked");
    }

    [Fact]
    public void FeatureSelectionControl_DoesNotPassLockedState_WhenLayerIsEditable()
    {
        // Arrange
        var featureJson = """
        {
            "type": "Feature",
            "properties": {
                "name": "Test"
            }
        }
        """;
        
        var feature = JsonSerializer.Deserialize<JsonElement>(featureJson);
        var selectedFeature = new SelectedFeature
        {
            LayerId = "editable-layer",
            Feature = feature
        };
        
        var selectionResult = new FeatureSelectionResult
        {
            Features = [selectedFeature]
        };

        var layerConfigs = new List<LayerConfig>
        {
            new GeoJsonLayerConfig { Id = "editable-layer", IsEditable = true }
        };
        
        var mockDeckView = CreateMockDeckGLView(selectionResult, layerConfigs);

        // Act
        var cut = RenderWithMud<FeatureSelectionControl>(parameters => parameters
            .Add(p => p.DeckGLView, mockDeckView));

        // Click the feature to populate clickedFeature
        var featureItem = cut.Find("div[style*='cursor: pointer']");
        featureItem.Click();

        // Assert - should NOT contain locked indicator
        cut.Markup.ToLower().Should().NotContain("locked");
    }

    [Fact]
    public void FeatureSelectionControl_DefaultsToLocked_WhenLayerConfigNotFound()
    {
        // Arrange
        var featureJson = """
        {
            "type": "Feature",
            "properties": {
                "name": "Test"
            }
        }
        """;
        
        var feature = JsonSerializer.Deserialize<JsonElement>(featureJson);
        var selectedFeature = new SelectedFeature
        {
            LayerId = "unknown-layer",
            Feature = feature
        };
        
        var selectionResult = new FeatureSelectionResult
        {
            Features = [selectedFeature]
        };

        var layerConfigs = new List<LayerConfig>();  // Empty - layer not found
        
        var mockDeckView = CreateMockDeckGLView(selectionResult, layerConfigs);

        // Act
        var cut = RenderWithMud<FeatureSelectionControl>(parameters => parameters
            .Add(p => p.DeckGLView, mockDeckView));

        // Click the feature to populate clickedFeature
        var featureItem = cut.Find("div[style*='cursor: pointer']");
        featureItem.Click();

        // Assert - should be locked by default for safety
        cut.Markup.ToLower().Should().Contain("locked");
    }

    [Fact]
    public void FeatureSelectionControl_GroupsFeaturesByLayer()
    {
        // Arrange
        var feature1Json = """{"type": "Feature", "properties": {"name": "Feature 1"}}""";
        var feature2Json = """{"type": "Feature", "properties": {"name": "Feature 2"}}""";
        
        var selectionResult = new FeatureSelectionResult
        {
            Features =
            [
                new SelectedFeature 
                { 
                    LayerId = "layer-1", 
                    Feature = JsonSerializer.Deserialize<JsonElement>(feature1Json) 
                },
                new SelectedFeature 
                { 
                    LayerId = "layer-2", 
                    Feature = JsonSerializer.Deserialize<JsonElement>(feature2Json) 
                }
            ]
        };

        var mockDeckView = CreateMockDeckGLView(selectionResult);

        // Act
        var cut = RenderWithMud<FeatureSelectionControl>(parameters => parameters
            .Add(p => p.DeckGLView, mockDeckView));

        // Assert
        cut.Markup.Should().Contain("layer-1");
        cut.Markup.Should().Contain("layer-2");
        cut.Markup.Should().Contain("(1)");  // Feature count for each layer
    }

    [Fact]
    public void FeatureSelectionControl_DisplaysFeatureName_FromDisplayProperty()
    {
        // Arrange
        var featureJson = """
        {
            "type": "Feature",
            "properties": {
                "customName": "Custom Display Name",
                "id": "feature-123"
            }
        }
        """;
        
        var feature = JsonSerializer.Deserialize<JsonElement>(featureJson);
        var selectionResult = new FeatureSelectionResult
        {
            Features =
            [
                new SelectedFeature
                {
                    LayerId = "test-layer",
                    Feature = feature
                }
            ]
        };

        var layerConfigs = new List<LayerConfig>
        {
            new GeoJsonLayerConfig 
            { 
                Id = "test-layer", 
                DisplayProperty = "customName" 
            }
        };
        
        var mockDeckView = CreateMockDeckGLView(selectionResult, layerConfigs);

        // Act
        var cut = RenderWithMud<FeatureSelectionControl>(parameters => parameters
            .Add(p => p.DeckGLView, mockDeckView));

        // Assert
        cut.Markup.Should().Contain("Custom Display Name");
    }

    [Fact]
    public void FeatureSelectionControl_FallsBackToId_WhenDisplayPropertyNotFound()
    {
        // Arrange
        var featureJson = """
        {
            "type": "Feature",
            "properties": {
                "id": "feature-123"
            }
        }
        """;
        
        var feature = JsonSerializer.Deserialize<JsonElement>(featureJson);
        var selectionResult = new FeatureSelectionResult
        {
            Features =
            [
                new SelectedFeature
                {
                    LayerId = "test-layer",
                    Feature = feature
                }
            ]
        };

        var layerConfigs = new List<LayerConfig>
        {
            new GeoJsonLayerConfig 
            { 
                Id = "test-layer", 
                DisplayProperty = "nonexistent" 
            }
        };
        
        var mockDeckView = CreateMockDeckGLView(selectionResult, layerConfigs);

        // Act
        var cut = RenderWithMud<FeatureSelectionControl>(parameters => parameters
            .Add(p => p.DeckGLView, mockDeckView));

        // Assert
        cut.Markup.Should().Contain("feature-123");
    }

    [Fact]
    public void FeatureSelectionControl_LockedState_UpdatesWhenDifferentFeatureClicked()
    {
        // Arrange
        var feature1Json = """{"type": "Feature", "properties": {"name": "Feature 1"}}""";
        var feature2Json = """{"type": "Feature", "properties": {"name": "Feature 2"}}""";
        
        var selectionResult = new FeatureSelectionResult
        {
            Features =
            [
                new SelectedFeature 
                { 
                    LayerId = "layer-a", 
                    Feature = JsonSerializer.Deserialize<JsonElement>(feature1Json) 
                },
                new SelectedFeature 
                { 
                    LayerId = "layer-b", 
                    Feature = JsonSerializer.Deserialize<JsonElement>(feature2Json) 
                }
            ]
        };

        var layerConfigs = new List<LayerConfig>
        {
            new GeoJsonLayerConfig { Id = "layer-a", IsEditable = false },
            new GeoJsonLayerConfig { Id = "layer-b", IsEditable = true }
        };
        
        var mockDeckView = CreateMockDeckGLView(selectionResult, layerConfigs);

        // Act
        var cut = RenderWithMud<FeatureSelectionControl>(parameters => parameters
            .Add(p => p.DeckGLView, mockDeckView));

        // Initial state - no feature clicked yet, so should not show locked chip
        cut.Markup.Should().NotContain("mud-chip-content", "no feature is clicked initially");

        // Find and click the first feature (non-editable layer)
        var feature1Element = cut.Find("div[style*='cursor: pointer']:has(p:contains('Feature 1'))");
        feature1Element.Click();
        
        // Assert - should show locked chip
        cut.Markup.Should().Contain("mud-chip-content");
        cut.Markup.Should().Contain("Locked");
        cut.Markup.Should().Contain("Feature 1");

        // Find and click the second feature (editable layer)
        var feature2Element = cut.Find("div[style*='cursor: pointer']:has(p:contains('Feature 2'))");
        feature2Element.Click();
        
        // Assert - should NOT show locked chip anymore and should show Feature 2
        cut.Markup.Should().Contain("Feature 2");
        cut.Markup.Should().NotContain("mud-chip-content", "clicking a feature from an editable layer should remove the locked chip");
    }
}

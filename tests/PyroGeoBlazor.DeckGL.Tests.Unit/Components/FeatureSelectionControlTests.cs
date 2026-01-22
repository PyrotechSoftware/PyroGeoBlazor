namespace PyroGeoBlazor.DeckGL.Tests.Unit.Components;

using Bunit;

using FluentAssertions;

using PyroGeoBlazor.DeckGL.Components;
using PyroGeoBlazor.DeckGL.Models;

using System.Text.Json;

public class FeatureSelectionControlTests : MudBlazorTestContext
{

    [Fact]
    public void FeatureSelectionControl_ShowsEmptyState_WhenNoFeaturesSelected()
    {
        // Arrange & Act
        var cut = Render<FeatureSelectionControl>(parameters => parameters
            .Add(p => p.SelectionResult, null));

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

        // Act
        var cut = Render<FeatureSelectionControl>(parameters => parameters
            .Add(p => p.SelectionResult, selectionResult));

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

        var layerConfigs = new Dictionary<string, LayerConfig>
        {
            { "locked-layer", new GeoJsonLayerConfig { Id = "locked-layer", IsEditable = false } }
        };

        // Act
        var cut = Render<FeatureSelectionControl>(parameters => parameters
            .Add(p => p.SelectionResult, selectionResult)
            .Add(p => p.LayerConfigs, layerConfigs));

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

        var layerConfigs = new Dictionary<string, LayerConfig>
        {
            { "editable-layer", new GeoJsonLayerConfig { Id = "editable-layer", IsEditable = true } }
        };

        // Act
        var cut = Render<FeatureSelectionControl>(parameters => parameters
            .Add(p => p.SelectionResult, selectionResult)
            .Add(p => p.LayerConfigs, layerConfigs));

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

        var layerConfigs = new Dictionary<string, LayerConfig>();  // Empty - layer not found

        // Act
        var cut = Render<FeatureSelectionControl>(parameters => parameters
            .Add(p => p.SelectionResult, selectionResult)
            .Add(p => p.LayerConfigs, layerConfigs));

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

        // Act
        var cut = Render<FeatureSelectionControl>(parameters => parameters
            .Add(p => p.SelectionResult, selectionResult));

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

        var layerConfigs = new Dictionary<string, LayerConfig>
        {
            { 
                "test-layer", 
                new GeoJsonLayerConfig 
                { 
                    Id = "test-layer", 
                    DisplayProperty = "customName" 
                } 
            }
        };

        // Act
        var cut = Render<FeatureSelectionControl>(parameters => parameters
            .Add(p => p.SelectionResult, selectionResult)
            .Add(p => p.LayerConfigs, layerConfigs));

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

        var layerConfigs = new Dictionary<string, LayerConfig>
        {
            { 
                "test-layer", 
                new GeoJsonLayerConfig 
                { 
                    Id = "test-layer", 
                    DisplayProperty = "nonexistent" 
                } 
            }
        };

        // Act
        var cut = Render<FeatureSelectionControl>(parameters => parameters
            .Add(p => p.SelectionResult, selectionResult)
            .Add(p => p.LayerConfigs, layerConfigs));

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
                    LayerId = "locked-layer", 
                    Feature = JsonSerializer.Deserialize<JsonElement>(feature1Json) 
                },
                new SelectedFeature 
                { 
                    LayerId = "editable-layer", 
                    Feature = JsonSerializer.Deserialize<JsonElement>(feature2Json) 
                }
            ]
        };

        var layerConfigs = new Dictionary<string, LayerConfig>
        {
            { "locked-layer", new GeoJsonLayerConfig { Id = "locked-layer", IsEditable = false } },
            { "editable-layer", new GeoJsonLayerConfig { Id = "editable-layer", IsEditable = true } }
        };

        // Act
        var cut = Render<FeatureSelectionControl>(parameters => parameters
            .Add(p => p.SelectionResult, selectionResult)
            .Add(p => p.LayerConfigs, layerConfigs));

        // Click first feature (locked layer)
        var featureItems = cut.FindAll("div[style*='cursor: pointer']");
        featureItems[0].Click();
        
        // Assert - should be locked
        cut.Markup.ToLower().Should().Contain("locked");

        // Click second feature (editable layer)
        cut.Render();  // Re-render to get updated markup
        featureItems = cut.FindAll("div[style*='cursor: pointer']");
        featureItems[1].Click();
        
        // Assert - should NOT be locked
        cut.Markup.ToLower().Should().NotContain("locked");
    }
}

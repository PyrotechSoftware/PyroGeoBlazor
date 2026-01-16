using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using PyroGeoBlazor.Extensions;
using PyroGeoBlazor.Factories;
using Xunit;

namespace PyroGeoBlazor.Tests.Unit;

public class ServiceRegistrationTests
{
    [Fact]
    public void AddPyroGeoBlazor_RegistersDefaultFactories()
    {
        // Arrange
        var services = new ServiceCollection();

        // Act
        services.AddPyroGeoBlazor();
        var serviceProvider = services.BuildServiceProvider();

        // Assert
        var wmtsFactory = serviceProvider.GetService<IWmtsLayerSelectorFactory>();
        var wfsFactory = serviceProvider.GetService<IWfsLayerSelectorFactory>();

        wmtsFactory.Should().NotBeNull();
        wmtsFactory.Should().BeOfType<DefaultWmtsLayerSelectorFactory>();

        wfsFactory.Should().NotBeNull();
        wfsFactory.Should().BeOfType<DefaultWfsLayerSelectorFactory>();
    }

    [Fact]
    public void DefaultWmtsLayerSelectorFactory_CreatesComponent()
    {
        // Arrange
        var factory = new DefaultWmtsLayerSelectorFactory();

        // Act
        var component = factory.CreateComponent();

        // Assert
        component.Should().NotBeNull();
    }

    [Fact]
    public void DefaultWfsLayerSelectorFactory_CreatesComponent()
    {
        // Arrange
        var factory = new DefaultWfsLayerSelectorFactory();

        // Act
        var component = factory.CreateComponent();

        // Assert
        component.Should().NotBeNull();
    }
}

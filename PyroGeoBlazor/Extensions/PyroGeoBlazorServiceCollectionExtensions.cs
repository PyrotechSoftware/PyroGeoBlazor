using Microsoft.Extensions.DependencyInjection;
using PyroGeoBlazor.Factories;

namespace PyroGeoBlazor.Extensions;

/// <summary>
/// Extension methods for registering PyroGeoBlazor services.
/// </summary>
public static class PyroGeoBlazorServiceCollectionExtensions
{
    /// <summary>
    /// Adds PyroGeoBlazor services to the service collection.
    /// Registers default factories for WMTS and WFS layer selectors that can be replaced with custom implementations.
    /// </summary>
    /// <param name="services">The service collection.</param>
    /// <returns>The service collection for chaining.</returns>
    public static IServiceCollection AddPyroGeoBlazor(this IServiceCollection services)
    {
        // Register default factories as singletons since they don't hold state
        services.AddSingleton<IWmtsLayerSelectorFactory, DefaultWmtsLayerSelectorFactory>();
        services.AddSingleton<IWfsLayerSelectorFactory, DefaultWfsLayerSelectorFactory>();

        return services;
    }

    /// <summary>
    /// Adds PyroGeoBlazor services with custom factory implementations.
    /// </summary>
    /// <typeparam name="TWmtsFactory">Custom WMTS layer selector factory type.</typeparam>
    /// <typeparam name="TWfsFactory">Custom WFS layer selector factory type.</typeparam>
    /// <param name="services">The service collection.</param>
    /// <returns>The service collection for chaining.</returns>
    public static IServiceCollection AddPyroGeoBlazor<TWmtsFactory, TWfsFactory>(this IServiceCollection services)
        where TWmtsFactory : class, IWmtsLayerSelectorFactory
        where TWfsFactory : class, IWfsLayerSelectorFactory
    {
        services.AddSingleton<IWmtsLayerSelectorFactory, TWmtsFactory>();
        services.AddSingleton<IWfsLayerSelectorFactory, TWfsFactory>();

        return services;
    }
}

namespace PyroGeoBlazor.Leaflet;

using Microsoft.Extensions.DependencyInjection;

public static class LeafletServiceCollectionExtensions
{
    public static IServiceCollection AddLeafletMap(this IServiceCollection services)
    {
        services.AddRazorComponents()
                .AddInteractiveServerComponents();

        return services;
    }
}

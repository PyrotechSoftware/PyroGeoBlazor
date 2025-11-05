namespace PyroGeoBlazor.Leaflet;

using Microsoft.Extensions.DependencyInjection;

using PyroGeoBlazor.Leaflet.Services;

public static class LeafletServiceCollectionExtensions
{
    public static IServiceCollection AddLeafletMap(this IServiceCollection services)
    {
        services.AddRazorComponents()
                .AddInteractiveServerComponents();

        services.AddScoped<ILeafletCrs, LeafletCrs>();

        return services;
    }
}

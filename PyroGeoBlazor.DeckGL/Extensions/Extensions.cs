namespace PyroGeoBlazor.DeckGL.Extensions;

using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

using MudBlazor.Extensions;

public static class Extensions
{
    extension(IServiceCollection services)
    {
        public IServiceCollection AddPyroGeoBlazorDeckGL()
        {
            // Add MudServices and the MudServices.Extensions
            services.AddMudServicesWithExtensions(c =>
            {
                c.WithDefaultDialogOptions(ex =>
                {
                    ex.Position = MudBlazor.DialogPosition.TopRight;
                    ex.Animation = MudBlazor.Extensions.Options.AnimationType.SlideIn;
                });
            });

            return services;
        }
    }

    extension(IApplicationBuilder app)
    {
        public IApplicationBuilder UsePyroGeoBlazorDeckGL()
        {
            app.Use(MudExWebApp.MudExMiddleware);

            return app;
        }
    }
}

using MudBlazor.Services;

using PyroGeoBlazor.DeckGL.Extensions;
using PyroGeoBlazor.Demo;
using PyroGeoBlazor.Demo.Components;
using PyroGeoBlazor.Extensions;
using PyroGeoBlazor.Factories;
using PyroGeoBlazor.Leaflet;

var builder = WebApplication.CreateBuilder(args);

var services = builder.Services;

// Register controllers for test endpoints
services.AddControllers();

// Add services to the container.
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

builder.Services.AddPyroGeoBlazorDeckGL();

builder.Services.AddLeafletMap();
builder.Services.AddPyroGeoBlazor<MudBlazorWmtsFactory, MudBlazorWfsFactory>();

var app = builder.Build();

// Configure exception handler middleware to ensure consistent behavior for integration tests
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "text/plain";
        await context.Response.WriteAsync("An error occurred.");
    });
});

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();



app.MapStaticAssets();
app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode();
app.UseRouting();
app.UseAntiforgery();
app.MapControllers();
app.MapFallback(() => Results.Content("PyroGeoBlazor Demo running"));

app.UsePyroGeoBlazorDeckGL();

app.Run();

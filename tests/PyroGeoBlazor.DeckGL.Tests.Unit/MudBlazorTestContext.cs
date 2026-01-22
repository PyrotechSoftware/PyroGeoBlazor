using Bunit;

using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;

using MudBlazor;
using MudBlazor.Services;

public abstract class MudBlazorTestContext : BunitContext, IAsyncDisposable
{
    private bool _disposed;

    protected MudBlazorTestContext()
    {
        // Register MudBlazor services
        Services.AddMudServices();

        // Mock MudBlazor's JSInterop calls
        JSInterop.SetupVoid("mudPopover.initialize", _ => true);
        JSInterop.SetupVoid("mudPopover.update", _ => true);
        JSInterop.SetupVoid("mudPopover.show", _ => true);
        JSInterop.SetupVoid("mudPopover.hide", _ => true);
        JSInterop.SetupVoid("mudPopover.connect", _ => true);
        JSInterop.SetupVoid("mudKeyInterceptor.connect", _ => true);
        JSInterop.SetupVoid("mudDragAndDrop.initDropZone", _ => true);
        JSInterop.Setup<int>("mudpopoverHelper.countProviders").SetResult(0);
    }

    public IRenderedComponent<TComponent> RenderWithMud<TComponent>(Action<ComponentParameterCollectionBuilder<TComponent>>? parameterBuilder = null)
        where TComponent : IComponent
    {
        var host = Render<MudTestHost>(ps => ps.AddChildContent<TComponent>(parameterBuilder));

        return host.FindComponent<TComponent>();
    }

    protected override void Dispose(bool disposing)
    {
        // Do not call base.Dispose() because MudBlazor services only implement IAsyncDisposable
        // xUnit will call DisposeAsync() instead
        if (disposing && !_disposed)
        {
            _disposed = true;
        }
    }

    public new async ValueTask DisposeAsync()
    {
        if (!_disposed)
        {
            await base.DisposeAsync();
            _disposed = true;
        }
        GC.SuppressFinalize(this);
    }
}

public class MudTestHost : ComponentBase
{
    [Parameter] public RenderFragment? ChildContent { get; set; }

    protected override void BuildRenderTree(RenderTreeBuilder builder)
    {
        builder.OpenComponent<MudPopoverProvider>(0);
        builder.CloseComponent();

        builder.AddContent(1, ChildContent);
    }
}

using Bunit;

using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;

using MudBlazor;
using MudBlazor.Services;

public abstract class MudBlazorTestContext : BunitContext
{
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
        JSInterop.Setup<int>("mudpopoverHelper.countProviders");
    }

    public override IRenderedComponent<TComponent> Render<TComponent>(Action<ComponentParameterCollectionBuilder<TComponent>>? parameterBuilder = null)
    {
        var host = base.Render<MudTestHost>(p => p.AddChildContent<TComponent>(parameterBuilder));

        return host.FindComponent<TComponent>();
    }
    public override IRenderedComponent<TComponent> Render<TComponent>(RenderFragment renderFragment)
    {
        var host = base.Render<MudTestHost>(p => p.AddChildContent(renderFragment));

        return host.FindComponent<TComponent>();
    }

    protected override async void Dispose(bool disposing)
    {
        await base.DisposeAsync();
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

namespace PyroGeoBlazor.Leaflet.Components;

using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

using PyroGeoBlazor.Leaflet.Models;

using System.Threading.Tasks;

/// <summary>
/// The LeafletMap Razor component used to render a <see cref="Map"/> and <see cref="TileLayer"/>.
/// </summary>
public class LeafletMapBase : ComponentBase
{
    /// <summary>
    /// The JavaScript runtime instance used to create the <see cref="Map"/>.
    /// </summary>
    [Inject] public IJSRuntime JSRuntime { get; set; } = default!;

    /// <summary>
    /// The Leaflet <see cref="Map"/> to be rendered by the component.
    /// </summary>
    [Parameter] public Map? Map { get; set; }

    /// <summary>
    /// The <see cref="TileLayer"/> to be added when the <see cref="Map"/> is rendered.
    /// </summary>
    [Parameter] public TileLayer? TileLayer { get; set; }

    /// <summary>
    /// The controls to be added to the map.
    /// </summary>
    [Parameter] public List<Control> Controls { get; set; } = [];

    /// <summary>
    /// Callback invoked when the map has been fully initialized and is ready for use.
    /// </summary>
    [Parameter] public EventCallback OnMapReady { get; set; }

    /// <summary>
    /// Gets a value indicating whether the map has been initialized and is ready for use.
    /// </summary>
    public bool MapReady { get; private set; }

    /// <inheritdoc/>
    protected async override Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender)
        {
            if (Map is not null)
            {
                await Map.BindJsObjectReference(new LeafletMapJSBinder(JSRuntime));

                foreach (var control in Controls)
                {
                    await Map.AddControl(control);
                }

                var layersControl = Controls.OfType<LayersControl>().FirstOrDefault();
                if (TileLayer is not null && layersControl is not null)
                {
                    await TileLayer.AddTo(Map);
                    await layersControl.AddBaseLayer(TileLayer, "Base Layer");
                }

                // Mark map as ready and invoke callback
                MapReady = true;
                if (OnMapReady.HasDelegate)
                {
                    await OnMapReady.InvokeAsync();
                }
            }
        }
    }
}

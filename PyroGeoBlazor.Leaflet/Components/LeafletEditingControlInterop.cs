namespace PyroGeoBlazor.Leaflet.Components;

using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

/// <summary>
/// A Leaflet-native editing control that integrates with Leaflet's event system.
/// </summary>
public class LeafletEditingControlInterop : IAsyncDisposable
{
    private readonly IJSRuntime _js;
    private readonly DotNetObjectReference<LeafletEditingControlInterop> _dotNetRef;
    private IJSObjectReference? _controlInstance;
    private string? _mapElementId;

    public EventCallback OnPolygonClick { get; set; }
    public EventCallback OnLineClick { get; set; }
    public EventCallback OnConfirmClick { get; set; }
    public EventCallback OnCancelClick { get; set; }
    public EventCallback OnDeleteClick { get; set; }

    public LeafletEditingControlInterop(IJSRuntime js)
    {
        _js = js;
        _dotNetRef = DotNetObjectReference.Create(this);
    }

    public async Task CreateAndAddToMap(string mapElementId, string position = "bottomleft")
    {
        _mapElementId = mapElementId;

        try
        {
            Console.WriteLine($"LeafletEditingControlInterop: CreateAndAddToMap called with mapElementId={mapElementId}, position={position}");
            
            // Check if LeafletMap is available
            var leafletMapAvailable = await _js.InvokeAsync<bool>("eval", "typeof LeafletMap !== 'undefined'");
            Console.WriteLine($"LeafletMap available: {leafletMapAvailable}");
            
            if (!leafletMapAvailable)
            {
                throw new InvalidOperationException("LeafletMap is not defined in JavaScript");
            }
            
            // Check if LeafletEditingControl is available
            var editingControlAvailable = await _js.InvokeAsync<bool>("eval", "typeof LeafletMap.LeafletEditingControl !== 'undefined'");
            Console.WriteLine($"LeafletMap.LeafletEditingControl available: {editingControlAvailable}");
            
            if (!editingControlAvailable)
            {
                throw new InvalidOperationException("LeafletMap.LeafletEditingControl is not defined in JavaScript");
            }

            Console.WriteLine("Creating control via JS interop...");
            // Create the control
            _controlInstance = await _js.InvokeAsync<IJSObjectReference>(
                "LeafletMap.LeafletEditingControl.create",
                mapElementId,
                new
                {
                    position = position,
                    dotNetRef = _dotNetRef
                });

            Console.WriteLine($"Control instance created: {_controlInstance != null}");

            // Add to map
            Console.WriteLine("Adding control to map...");
            await _js.InvokeVoidAsync(
                "LeafletMap.LeafletEditingControl.addToMap",
                _controlInstance,
                mapElementId);

            Console.WriteLine("✅ Leaflet editing control created and added to map");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error creating Leaflet control: {ex.Message}");
            Console.WriteLine($"Exception type: {ex.GetType().Name}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
            }
            throw;
        }
    }

    public async Task SetDrawing(bool isDrawing)
    {
        if (_controlInstance != null)
        {
            await _js.InvokeVoidAsync(
                "LeafletMap.LeafletEditingControl.setDrawing",
                _controlInstance,
                isDrawing);
        }
    }

    public async Task SetSelectedCount(int count)
    {
        if (_controlInstance != null)
        {
            await _js.InvokeVoidAsync(
                "LeafletMap.LeafletEditingControl.setSelectedCount",
                _controlInstance,
                count);
        }
    }

    [JSInvokable]
    public async Task OnControlPolygonClick()
    {
        Console.WriteLine("C#: OnControlPolygonClick");
        if (OnPolygonClick.HasDelegate)
        {
            await OnPolygonClick.InvokeAsync();
        }
    }

    [JSInvokable]
    public async Task OnControlLineClick()
    {
        Console.WriteLine("C#: OnControlLineClick");
        if (OnLineClick.HasDelegate)
        {
            await OnLineClick.InvokeAsync();
        }
    }

    [JSInvokable]
    public async Task OnControlConfirmClick()
    {
        Console.WriteLine("C#: OnControlConfirmClick");
        if (OnConfirmClick.HasDelegate)
        {
            await OnConfirmClick.InvokeAsync();
        }
    }

    [JSInvokable]
    public async Task OnControlCancelClick()
    {
        Console.WriteLine("C#: OnControlCancelClick");
        if (OnCancelClick.HasDelegate)
        {
            await OnCancelClick.InvokeAsync();
        }
    }

    [JSInvokable]
    public async Task OnControlDeleteClick()
    {
        Console.WriteLine("C#: OnControlDeleteClick");
        if (OnDeleteClick.HasDelegate)
        {
            await OnDeleteClick.InvokeAsync();
        }
    }

    public async ValueTask DisposeAsync()
    {
        if (_controlInstance != null)
        {
            try
            {
                await _js.InvokeVoidAsync("LeafletMap.LeafletEditingControl.remove", _controlInstance);
                await _controlInstance.DisposeAsync();
            }
            catch
            {
                // Ignore disposal errors
            }
        }

        _dotNetRef?.Dispose();
    }
}

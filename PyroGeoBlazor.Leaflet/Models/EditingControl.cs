namespace PyroGeoBlazor.Leaflet.Models;

using Microsoft.JSInterop;

/// <summary>
/// A Leaflet control for editing GeoJSON features with drawing tools.
/// </summary>
public class EditingControl : Control
{
    private readonly DotNetObjectReference<EditingControl>? _dotNetRef;
    private readonly EditingControlOptions _controlOptions;
    
    public event EventHandler? OnPolygonClick;
    public event EventHandler? OnLineClick;
    public event EventHandler? OnConfirmClick;
    public event EventHandler? OnCancelClick;
    public event EventHandler? OnDeleteClick;

    private bool _isDrawing;
    private int _selectedCount;

    /// <summary>
    /// Creates a new editing control with default options.
    /// </summary>
    /// <param name="position">Position of the control on the map. Default is "bottomleft".</param>
    public EditingControl(string position = "bottomleft") 
        : this(new EditingControlOptions { Position = position })
    {
    }

    /// <summary>
    /// Creates a new editing control with custom options.
    /// </summary>
    /// <param name="options">Configuration options for the control.</param>
    public EditingControl(EditingControlOptions options) 
        : base(new ControlOptions { Position = options.Position })
    {
        _controlOptions = options;
        _dotNetRef = DotNetObjectReference.Create(this);
    }

    protected override async Task<IJSObjectReference> CreateJsObjectRef()
    {
        GuardAgainstNullBinding("Cannot create EditingControl. No JavaScript binding has been set up for this object.");
        var module = await JSBinder!.GetLeafletMapModule();
        return await module.InvokeAsync<IJSObjectReference>(
            "LeafletMap.LeafletEditingControl.create",
            "",  // mapElementId not needed when using addControl
            new
            {
                position = Options.Position,
                dotNetRef = _dotNetRef,
                // Pass icon and tooltip options to JavaScript
                polygonIcon = _controlOptions.PolygonIcon,
                lineIcon = _controlOptions.LineIcon,
                deleteIcon = _controlOptions.DeleteIcon,
                confirmIcon = _controlOptions.ConfirmIcon,
                cancelIcon = _controlOptions.CancelIcon,
                polygonTooltip = _controlOptions.PolygonTooltip,
                lineTooltip = _controlOptions.LineTooltip,
                deleteTooltip = _controlOptions.DeleteTooltip,
                confirmTooltip = _controlOptions.ConfirmTooltip,
                cancelTooltip = _controlOptions.CancelTooltip,
                buttonSize = _controlOptions.ButtonSize,
                iconSize = _controlOptions.IconSize
            });
    }

    public async Task SetDrawing(bool isDrawing)
    {
        _isDrawing = isDrawing;
        if (JSObjectReference != null)
        {
            var module = await JSBinder!.GetLeafletMapModule();
            await module.InvokeVoidAsync("LeafletMap.LeafletEditingControl.setDrawing", JSObjectReference, isDrawing);
        }
    }

    public async Task SetSelectedCount(int count)
    {
        _selectedCount = count;
        if (JSObjectReference != null)
        {
            var module = await JSBinder!.GetLeafletMapModule();
            await module.InvokeVoidAsync("LeafletMap.LeafletEditingControl.setSelectedCount", JSObjectReference, count);
        }
    }

    [JSInvokable]
    public Task OnControlPolygonClick()
    {
        Console.WriteLine("C#: OnControlPolygonClick");
        OnPolygonClick?.Invoke(this, System.EventArgs.Empty);
        return Task.CompletedTask;
    }

    [JSInvokable]
    public Task OnControlLineClick()
    {
        Console.WriteLine("C#: OnControlLineClick");
        OnLineClick?.Invoke(this, System.EventArgs.Empty);
        return Task.CompletedTask;
    }

    [JSInvokable]
    public Task OnControlConfirmClick()
    {
        Console.WriteLine("C#: OnControlConfirmClick");
        OnConfirmClick?.Invoke(this, System.EventArgs.Empty);
        return Task.CompletedTask;
    }

    [JSInvokable]
    public Task OnControlCancelClick()
    {
        Console.WriteLine("C#: OnControlCancelClick");
        OnCancelClick?.Invoke(this, System.EventArgs.Empty);
        return Task.CompletedTask;
    }

    [JSInvokable]
    public Task OnControlDeleteClick()
    {
        Console.WriteLine("C#: OnControlDeleteClick");
        OnDeleteClick?.Invoke(this, System.EventArgs.Empty);
        return Task.CompletedTask;
    }
}

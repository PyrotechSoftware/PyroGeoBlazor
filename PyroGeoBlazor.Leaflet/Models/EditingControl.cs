namespace PyroGeoBlazor.Leaflet.Models;

using Microsoft.JSInterop;

/// <summary>
/// A Leaflet control for editing GeoJSON features with drawing tools.
/// </summary>
public class EditingControl : Control
{
    private readonly DotNetObjectReference<EditingControl>? _dotNetRef;
    protected new EditingControlOptions Options { get; }

    public event EventHandler? OnPolygonClick;
    public event EventHandler? OnLineClick;
    public event EventHandler? OnConfirmClick;
    public event EventHandler? OnCancelClick;
    public event EventHandler? OnDeleteClick;
    public event EventHandler? OnEditClick;
    public event EventHandler? OnAddVertexClick;
    public event EventHandler? OnRemoveVertexClick;
    public event EventHandler? OnMoveVertexClick;

    private bool _isDrawing;
    private int _selectedCount;
    private bool _isEditing;
    private bool _isAddingVertices;
    private bool _isRemovingVertices;
    private bool _isMovingVertices;

    /// <summary>
    /// Creates a new editing control with default options.
    /// </summary>
    /// <param name="position">Position of the control on the map. Default is "bottomleft".</param>
    public EditingControl()
        : this(new EditingControlOptions())
    {
    }

    /// <summary>
    /// Creates a new editing control with custom options.
    /// </summary>
    /// <param name="options">Configuration options for the control.</param>
    public EditingControl(EditingControlOptions options)
        : base(options)
    {
        Options = options;
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
                polygonIcon = Options.PolygonIcon,
                lineIcon = Options.LineIcon,
                editIcon = Options.EditIcon,
                deleteIcon = Options.DeleteIcon,
                confirmIcon = Options.ConfirmIcon,
                cancelIcon = Options.CancelIcon,
                addVertexIcon = Options.AddVertexIcon,
                removeVertexIcon = Options.RemoveVertexIcon,
                moveVertexIcon = Options.MoveVertexIcon,
                polygonTooltip = Options.PolygonTooltip,
                lineTooltip = Options.LineTooltip,
                editTooltip = Options.EditTooltip,
                deleteTooltip = Options.DeleteTooltip,
                confirmTooltip = Options.ConfirmTooltip,
                cancelTooltip = Options.CancelTooltip,
                addVertexTooltip = Options.AddVertexTooltip,
                removeVertexTooltip = Options.RemoveVertexTooltip,
                moveVertexTooltip = Options.MoveVertexTooltip,
                buttonSize = Options.ButtonSize,
                iconSize = Options.IconSize
            });
    }

    #region Methods

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

    public async Task SetEditing(bool isEditing)
    {
        _isEditing = isEditing;
        if (JSObjectReference != null)
        {
            var module = await JSBinder!.GetLeafletMapModule();
            await module.InvokeVoidAsync("LeafletMap.LeafletEditingControl.setEditing", JSObjectReference, isEditing);
        }
    }

    public async Task SetAddingVertices(bool isAddingVertices)
    {
        _isAddingVertices = isAddingVertices;
        if (JSObjectReference != null)
        {
            var module = await JSBinder!.GetLeafletMapModule();
            await module.InvokeVoidAsync("LeafletMap.LeafletEditingControl.setAddingVertices", JSObjectReference, isAddingVertices);
        }
    }

    public async Task SetRemovingVertices(bool isRemovingVertices)
    {
        _isRemovingVertices = isRemovingVertices;
        if (JSObjectReference != null)
        {
            var module = await JSBinder!.GetLeafletMapModule();
            await module.InvokeVoidAsync("LeafletMap.LeafletEditingControl.setRemovingVertices", JSObjectReference, isRemovingVertices);
        }
    }

    public async Task SetMovingVertices(bool isMovingVertices)
    {
        _isMovingVertices = isMovingVertices;
        if (JSObjectReference != null)
        {
            var module = await JSBinder!.GetLeafletMapModule();
            await module.InvokeVoidAsync("LeafletMap.LeafletEditingControl.setMovingVertices", JSObjectReference, isMovingVertices);
        }
    }

    #endregion

    #region Events

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

    [JSInvokable]
    public Task OnControlEditClick()
    {
        Console.WriteLine("C#: OnControlEditClick");
        OnEditClick?.Invoke(this, System.EventArgs.Empty);
        return Task.CompletedTask;
    }

    [JSInvokable]
    public Task OnControlAddVertexClick()
    {
        Console.WriteLine("C#: OnControlAddVertexClick");
        OnAddVertexClick?.Invoke(this, System.EventArgs.Empty);
        return Task.CompletedTask;
    }

    [JSInvokable]
    public Task OnControlRemoveVertexClick()
    {
        Console.WriteLine("C#: OnControlRemoveVertexClick");
        OnRemoveVertexClick?.Invoke(this, System.EventArgs.Empty);
        return Task.CompletedTask;
    }

    [JSInvokable]
    public Task OnControlMoveVertexClick()
    {
        Console.WriteLine("C#: OnControlMoveVertexClick");
        OnMoveVertexClick?.Invoke(this, System.EventArgs.Empty);
        return Task.CompletedTask;
    }

    #endregion
}

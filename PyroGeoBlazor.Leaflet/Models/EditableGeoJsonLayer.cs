namespace PyroGeoBlazor.Leaflet.Models;

using Microsoft.JSInterop;
using PyroGeoBlazor.Leaflet.EventArgs;

/// <summary>
/// An editable GeoJSON layer that allows users to draw and modify polygons and polylines.
/// </summary>
public class EditableGeoJsonLayer : GeoJsonLayer
{
    protected new readonly DomEventHandlerMapping<EditableGeoJsonLayer>? EventHandlerMapping;
    protected new EditableGeoJsonLayerOptions? Options { get; }

    /// <summary>
    /// Gets a value indicating whether the layer is currently in edit mode.
    /// </summary>
    public bool IsEditing { get; private set; }

    /// <summary>
    /// Fired when a new feature (polygon or polyline) is created.
    /// </summary>
    public event EventHandler<GeoJsonFeatureEventArgs>? OnFeatureCreated;

    /// <summary>
    /// Fired when a feature is modified.
    /// </summary>
    public event EventHandler<GeoJsonFeatureEventArgs>? OnFeatureModified;

    /// <summary>
    /// Fired before a feature is deleted. Set Cancel property to true to prevent deletion.
    /// </summary>
    public event EventHandler<FeatureDeletingEventArgs>? OnFeatureDeleting;

    /// <summary>
    /// Fired when a feature is deleted.
    /// </summary>
    public event EventHandler<GeoJsonFeatureEventArgs>? OnFeatureDeleted;

    /// <summary>
    /// Fired when drawing is cancelled.
    /// </summary>
    public event EventHandler? OnDrawingCancelled;

    public EditableGeoJsonLayer(object? data, EditableGeoJsonLayerOptions? options)
        : base(data, options)
    {
        Options = options;
        if (Options is null || Options.EventsEnabled)
        {
            var dotNetObjectRef = DotNetObjectReference.Create(this);
            EventHandlerMapping = new DomEventHandlerMapping<EditableGeoJsonLayer>(dotNetObjectRef, new Dictionary<string, string>
            {
                { "featurecreated", nameof(this.FeatureCreatedAsync) },
                { "featuremodified", nameof(this.FeatureModifiedAsync) },
                { "featuredeleting", nameof(this.FeatureDeletingAsync) },
                { "featuredeleted", nameof(this.FeatureDeletedAsync) },
                { "drawingcancelled", nameof(this.DrawingCancelledAsync) }
            });
            if (base.EventHandlerMapping != null)
            {
                foreach (var eventMapping in base.EventHandlerMapping.Events)
                {
                    EventHandlerMapping.Events.Add(eventMapping.Key, eventMapping.Value);
                }
            }
        }
    }

    /// <inheritdoc />
    protected override async Task<IJSObjectReference> CreateJsObjectRef()
    {
        if (JSBinder == null)
        {
            throw new InvalidOperationException("JavaScript binder is not set.");
        }

        var module = await JSBinder.GetLeafletMapModule();
        return await module.InvokeAsync<IJSObjectReference>("LeafletMap.EditableGeoJsonLayer.createEditableGeoJsonLayer", Data, Options, EventHandlerMapping);
    }

    #region Methods

    /// <summary>
    /// Starts edit mode and enables drawing.
    /// </summary>
    public async Task<EditableGeoJsonLayer> StartEditing()
    {
        if (JSObjectReference == null)
        {
            throw new InvalidOperationException("JavaScript object reference is not set.");
        }

        await JSObjectReference.InvokeVoidAsync("startEditing");
        IsEditing = true;
        return this;
    }

    /// <summary>
    /// Stops edit mode and disables drawing.
    /// </summary>
    public async Task<EditableGeoJsonLayer> StopEditing()
    {
        if (JSObjectReference == null)
        {
            throw new InvalidOperationException("JavaScript object reference is not set.");
        }

        await JSObjectReference.InvokeVoidAsync("stopEditing");
        IsEditing = false;
        return this;
    }

    /// <summary>
    /// Starts drawing a new polygon.
    /// </summary>
    public async Task<EditableGeoJsonLayer> AddPolygon()
    {
        if (JSObjectReference == null)
        {
            throw new InvalidOperationException("JavaScript object reference is not set.");
        }

        await JSObjectReference.InvokeVoidAsync("addPolygon");
        return this;
    }

    /// <summary>
    /// Starts drawing a new polyline.
    /// </summary>
    public async Task<EditableGeoJsonLayer> AddLine()
    {
        if (JSObjectReference == null)
        {
            throw new InvalidOperationException("JavaScript object reference is not set.");
        }

        await JSObjectReference.InvokeVoidAsync("addLine");
        return this;
    }

    /// <summary>
    /// Confirms the current drawing operation and adds it to the layer.
    /// </summary>
    public async Task<EditableGeoJsonLayer> ConfirmDrawing()
    {
        if (JSObjectReference == null)
        {
            throw new InvalidOperationException("JavaScript object reference is not set.");
        }

        await JSObjectReference.InvokeVoidAsync("confirmDrawing");
        return this;
    }

    /// <summary>
    /// Cancels the current drawing operation.
    /// </summary>
    public async Task<EditableGeoJsonLayer> CancelDrawing()
    {
        if (JSObjectReference == null)
        {
            throw new InvalidOperationException("JavaScript object reference is not set.");
        }

        await JSObjectReference.InvokeVoidAsync("cancelDrawing");
        return this;
    }

    /// <summary>
    /// Enables edit mode for selected features.
    /// </summary>
    public async Task<EditableGeoJsonLayer> EditSelectedFeatures()
    {
        if (JSObjectReference == null)
        {
            throw new InvalidOperationException("JavaScript object reference is not set.");
        }

        await JSObjectReference.InvokeVoidAsync("editSelectedFeatures");
        return this;
    }

    /// <summary>
    /// Disables edit mode for features currently being edited.
    /// </summary>
    public async Task<EditableGeoJsonLayer> DisableEditingFeatures()
    {
        if (JSObjectReference == null)
        {
            throw new InvalidOperationException("JavaScript object reference is not set.");
        }

        await JSObjectReference.InvokeVoidAsync("disableEditingFeatures");
        return this;
    }

    /// <summary>
    /// Confirms editing changes and commits them to the features.
    /// </summary>
    public async Task<EditableGeoJsonLayer> ConfirmEditing()
    {
        if (JSObjectReference == null)
        {
            throw new InvalidOperationException("JavaScript object reference is not set.");
        }

        await JSObjectReference.InvokeVoidAsync("confirmEditing");
        return this;
    }

    /// <summary>
    /// Cancels editing changes and restores the original geometry of features.
    /// </summary>
    public async Task<EditableGeoJsonLayer> CancelEditing()
    {
        if (JSObjectReference == null)
        {
            throw new InvalidOperationException("JavaScript object reference is not set.");
        }

        await JSObjectReference.InvokeVoidAsync("cancelEditing");
        return this;
    }

    /// <summary>
    /// Enables or disables add vertex mode for editing features.
    /// </summary>
    public async Task<EditableGeoJsonLayer> SetAddVertexMode(bool enabled)
    {
        if (JSObjectReference == null)
        {
            throw new InvalidOperationException("JavaScript object reference is not set.");
        }

        await JSObjectReference.InvokeVoidAsync("setAddVertexMode", enabled);
        return this;
    }

    /// <summary>
    /// Enables or disables remove vertex mode for editing features.
    /// </summary>
    public async Task<EditableGeoJsonLayer> SetRemoveVertexMode(bool enabled)
    {
        if (JSObjectReference == null)
        {
            throw new InvalidOperationException("JavaScript object reference is not set.");
        }

        await JSObjectReference.InvokeVoidAsync("setRemoveVertexMode", enabled);
        return this;
    }

    /// <summary>
    /// Enables or disables move vertex mode for editing features.
    /// </summary>
    public async Task<EditableGeoJsonLayer> SetMoveVertexMode(bool enabled)
    {
        if (JSObjectReference == null)
        {
            throw new InvalidOperationException("JavaScript object reference is not set.");
        }

        await JSObjectReference.InvokeVoidAsync("setMoveVertexMode", enabled);
        return this;
    }

    /// <summary>
    /// Deletes the selected features from the layer.
    /// </summary>
    public async Task<EditableGeoJsonLayer> DeleteSelectedFeatures()
    {
        if (JSObjectReference == null)
        {
            throw new InvalidOperationException("JavaScript object reference is not set.");
        }

        await JSObjectReference.InvokeVoidAsync("deleteSelectedFeatures");
        return this;
    }

    /// <summary>
    /// Gets the current GeoJSON data including all features.
    /// </summary>
    public async Task<object> GetGeoJson()
    {
        if (JSObjectReference == null)
        {
            throw new InvalidOperationException("JavaScript object reference is not set.");
        }

        return await JSObjectReference.InvokeAsync<object>("toGeoJSON");
    }

    #endregion

    #region Events

    [JSInvokable]
    public async Task FeatureCreatedAsync(GeoJsonFeatureEventArgs? args)
    {
        OnFeatureCreated?.Invoke(this, args ?? new GeoJsonFeatureEventArgs());
        await Task.CompletedTask;
    }

    [JSInvokable]
    public async Task FeatureModifiedAsync(GeoJsonFeatureEventArgs? args)
    {
        OnFeatureModified?.Invoke(this, args ?? new GeoJsonFeatureEventArgs());
        await Task.CompletedTask;
    }

    [JSInvokable]
    public async Task<FeatureDeletingEventArgs> FeatureDeletingAsync(FeatureDeletingEventArgs? args)
    {
        var eventArgs = args ?? new FeatureDeletingEventArgs();
        OnFeatureDeleting?.Invoke(this, eventArgs);
        await Task.CompletedTask;
        return eventArgs;
    }

    [JSInvokable]
    public async Task FeatureDeletedAsync(GeoJsonFeatureEventArgs? args)
    {
        OnFeatureDeleted?.Invoke(this, args ?? new GeoJsonFeatureEventArgs());
        await Task.CompletedTask;
    }

    [JSInvokable]
    public async Task DrawingCancelledAsync()
    {
        OnDrawingCancelled?.Invoke(this, System.EventArgs.Empty);
        await Task.CompletedTask;
    }

    #endregion
}

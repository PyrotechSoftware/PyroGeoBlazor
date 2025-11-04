namespace PyroGeoBlazor.Leaflet.Models;

using Microsoft.JSInterop;

public abstract class Control(ControlOptions? options = null) : InteropObject
{
    public ControlOptions? Options { get; } = options;

    #region Methods

    /// <summary>
    /// Returns the position of the control.
    /// </summary>
    /// <returns>The position of the control.</returns>
    public async Task<string> GetPosition()
    {
        GuardAgainstNullBinding("Cannot get control position. JavaScript object reference is null.");
        return await JSObjectReference!.InvokeAsync<string>("getPosition");
    }

    /// <summary>
    /// Sets the position of the control.
    /// </summary>
    /// <param name="position">The position.</param>
    public async Task<Control> SetPosition(string position)
    {
        GuardAgainstNullBinding("Cannot set control position. JavaScript object reference is null.");
        await JSObjectReference!.InvokeVoidAsync("setPosition", position);
        return this;
    }

    /// <summary>
    /// Gets the HTMLElement that contains the control.
    /// </summary>
    /// <remarks>
    /// See if this can return a more specific type than object.
    /// </remarks>
    /// <returns>The element</returns>
    public async Task<object> GetContainer()
    {
        GuardAgainstNullBinding("Cannot get control container. JavaScript object reference is null.");
        return await JSObjectReference!.InvokeAsync<object>("getContainer");
    }

    /// <summary>
    /// Adds the control to a <see cref="Map"/>.
    /// </summary>
    /// <param name="map">The map to add the control to.</param>
    public async Task<Control> AddTo(Map map)
    {
        GuardAgainstNullBinding("Cannot add control to map. JavaScript object reference is null.");
        await JSObjectReference!.InvokeVoidAsync("addTo", map.JSObjectReference);
        return this;
    }

    /// <summary>
    /// Removes the control from the map it is currently active on.
    /// </summary>
    public async Task Remove()
    {
        GuardAgainstNullBinding("Cannot remove control. JavaScript object reference is null.");
        await JSObjectReference!.InvokeVoidAsync("remove");
    }

    #region Extension Methods

    /// <summary>
    /// Should return the container DOM element for the control and add listeners on relevant map events.
    /// Called on Control.AddTo(map).
    /// </summary>
    /// <param name="map">The Map.</param>
    //public abstract Task<object> OnAdd(Map map);

    /// <summary>
    /// Optional method. Should contain all clean up code that removes the listeners previously added in onAdd.
    /// Called on Control.Remove().
    /// </summary>
    /// <param name="map">The Map to remove the control from.</param>
    //public abstract Task OnRemove(Map map);

    #endregion

    #endregion
}

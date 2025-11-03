namespace PyroGeoBlazor.Leaflet;

using Microsoft.JSInterop;

using System;
using System.Threading.Tasks;

public abstract class InteropObject : IAsyncDisposable
{
    /// <summary>
    /// The JavaScript binder used to talk to the interop layer.
    /// </summary>
    internal LeafletMapJSBinder? JSBinder;

    /// <summary>
    /// The JavaScript runtime object reference.
    /// </summary>
    internal IJSObjectReference? JSObjectReference;

    /// <summary>
    /// Creates the JavaScript object, stores a reference to it and the
    /// JavaScript runtime object used to create it.
    /// </summary>
    /// <param name="jSBinder">The JavaScript binder used to talk to the interop layer.</param>
    /// <returns>A task that represents the async create operation.</returns>
    internal async Task BindJsObjectReference(LeafletMapJSBinder jSBinder)
    {
        JSBinder = jSBinder;
        JSObjectReference = await CreateJsObjectRef();
    }

    protected abstract Task<IJSObjectReference> CreateJsObjectRef();

    /// <inheritdoc />
    public virtual async ValueTask DisposeAsync()
    {
        if (JSObjectReference is not null)
        {
            try
            {
                await JSObjectReference.DisposeAsync();
            }
            catch (JSDisconnectedException)
            {
                // Swallow this. Page is being refreshed possibly.
            }
        }
    }

    /// <summary>
    /// Throws an <see cref="InvalidOperationException"/> if the JavaScript binding has not been
    /// set up for this object.
    /// </summary>
    /// <param name="nullBindingMessage">The error message to be used when an exception is thrown.</param>
    internal void GuardAgainstNullBinding(string nullBindingMessage)
    {
        if (JSBinder is null)
        {
            throw new InvalidOperationException(nullBindingMessage);
        }
    }
}

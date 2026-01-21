namespace PyroGeoBlazor.DeckGL;

using Microsoft.JSInterop;

/// <summary>
/// Base class for all objects that interact with the deck.gl JavaScript library.
/// Provides common JavaScript interop functionality and lifecycle management.
/// </summary>
public abstract class DeckGLInteropObject : IAsyncDisposable
{
    /// <summary>
    /// The JavaScript binder used to communicate with the deck.gl interop layer.
    /// </summary>
    internal DeckGLJSBinder? JSBinder;

    /// <summary>
    /// The JavaScript runtime object reference for this instance.
    /// </summary>
    internal IJSObjectReference? JSObjectReference;

    /// <summary>
    /// Creates the JavaScript object, stores a reference to it and the
    /// JavaScript runtime object used to create it.
    /// </summary>
    /// <param name="jsBinder">The JavaScript binder used to talk to the interop layer.</param>
    /// <returns>A task that represents the async create operation.</returns>
    internal async Task BindJsObjectReference(DeckGLJSBinder jsBinder)
    {
        JSBinder = jsBinder;
        JSObjectReference = await CreateJsObjectRef();
    }

    /// <summary>
    /// Creates the JavaScript object reference for this instance.
    /// Derived classes must implement this to create their specific JS object.
    /// </summary>
    /// <returns>A JavaScript object reference.</returns>
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
                // Swallow this exception - page is being refreshed or connection lost
            }
        }

        GC.SuppressFinalize(this);
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

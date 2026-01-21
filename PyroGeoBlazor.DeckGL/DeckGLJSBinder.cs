namespace PyroGeoBlazor.DeckGL;

using Microsoft.JSInterop;

/// <summary>
/// Manages JavaScript module loading and provides access to the deck.gl interop layer.
/// This class is the bridge between C# code and the JavaScript deck.gl library.
/// </summary>
internal class DeckGLJSBinder(IJSRuntime jsRuntime) : IAsyncDisposable
{
    internal IJSRuntime JSRuntime = jsRuntime;
    private Task<IJSObjectReference>? _deckGLModule;

    /// <summary>
    /// Gets the deck.gl JavaScript module reference, loading it if necessary.
    /// The module is cached after first load.
    /// </summary>
    /// <returns>A reference to the deck.gl JavaScript module.</returns>
    internal async Task<IJSObjectReference> GetDeckGLModule()
    {
        return await (_deckGLModule ??= JSRuntime.InvokeAsync<IJSObjectReference>(
            "import",
            "./_content/PyroGeoBlazor.DeckGL/deckGL.js"
        ).AsTask());
    }

    /// <inheritdoc />
    public async ValueTask DisposeAsync()
    {
        if (_deckGLModule is not null)
        {
            var module = await _deckGLModule;
            try
            {
                await module.DisposeAsync();
            }
            catch (JSDisconnectedException)
            {
                // Swallow this exception - page is being refreshed or connection lost
            }
        }

        GC.SuppressFinalize(this);
    }
}

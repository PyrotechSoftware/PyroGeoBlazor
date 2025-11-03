namespace PyroGeoBlazor.Leaflet.Models;

using Microsoft.JSInterop;

using System.Collections.Generic;

public class InteractionOptions<T>
    where T : class
{
    public DotNetObjectReference<T> DotNetRef { get; }

    /// <summary>
    /// Mapping of DOM/Leaflet event name (e.g. "click", "dblclick", "contextmenu")
    /// to the .NET instance method name to invoke on the DotNetRef.
    /// </summary>
    public Dictionary<string, string> Events { get; } = [];

    public InteractionOptions(DotNetObjectReference<T> dotNetRef, Dictionary<string, string>? events = null)
    {
        DotNetRef = dotNetRef;

        if (events is not null)
        {
            foreach (var kv in events)
            {
                Events[kv.Key] = kv.Value;
            }
        }
    }

    public void AddEvent(string eventName, string methodName)
    {
        Events[eventName] = methodName;
    }
}

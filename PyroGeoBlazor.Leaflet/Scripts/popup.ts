declare const L: typeof import('leaflet');

import { EventHandlerMapping } from './eventHandling';

export const Popup = {
    createPopup(
        latLng: L.LatLng,
        options?: L.PopupOptions,
        handlerMappings?: EventHandlerMapping
    ): L.Popup {
        const popup = L.popup(latLng, options);

        // Attach event handlers if provided
        if (handlerMappings && handlerMappings.dotNetRef && handlerMappings.events) {
            const keys = Object.keys(handlerMappings.events);
            for (let i = 0; i < keys.length; i++) {
                const eventName = keys[i];
                const methodName = handlerMappings.events[eventName];

                popup.on(eventName, function (ev: any) {
                    try {
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, ev);
                    } catch (e) {
                        console.error(`Error invoking dotnet handler for event ${eventName}`, e);
                    }
                });
            }
        }

        return popup;
    }
};

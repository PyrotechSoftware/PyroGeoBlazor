declare const L: typeof import('leaflet');

import { EventHandlerMapping } from './eventHandling';
import { LeafletEvents } from './events';

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

            if (keys.indexOf('click') > -1) {
                var methodName = handlerMappings.events['click'];
                popup.on('click', function (ev: L.LeafletMouseEvent) {
                    try {
                        let payload = LeafletEvents.LeafletMouseEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error(`Error invoking dotnet handler for popup click event`, e);
                    }
                });
            }
        }

        return popup;
    }
};

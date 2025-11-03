import { InteractionOptions } from './InteractionOptions';

declare const L: typeof import('leaflet');

export const Map = {
    createMap(
        elementId: string,
        options: L.MapOptions | undefined,
        interactionOptions?: InteractionOptions
    ): L.Map {
        const map = L.map(elementId, options);

        if (interactionOptions && interactionOptions.dotNetRef && interactionOptions.events) {
            const keys = Object.keys(interactionOptions.events);
            for (let i = 0; i < keys.length; i++) {
                const eventName = keys[i];
                const methodName = interactionOptions.events[eventName];

                map.on(eventName, function (ev: any) {
                    try {
                        // create a minimal payload depending on event
                        let payload: any = {};

                        if (ev && ev.latlng) {
                            payload = new L.LatLng(ev.latlng.lat, ev.latlng.lng);
                        } else if (ev && ev.target && ev.target.getCenter) {
                            // some events expose target with center
                            const c = ev.target.getCenter();
                            payload = { lat: c.lat, lng: c.lng };
                        } else {
                            payload = { event: eventName, object: ev };
                        }

                        interactionOptions.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error(`Error invoking dotnet handler for event ${eventName}`, e);
                    }
                });
            }
        }

        return map;
    },

    setView(
        map: L.Map,
        center: L.LatLng | any,
        zoom: number,
        options: L.ZoomPanOptions | undefined
    ): void {
        map.setView(center, zoom);
    },

    panTo(map: L.Map, center: L.LatLng, options: L.PanOptions | undefined): void {
        map.panTo(center, options);
    },

    setMaxBounds(map: L.Map, bounds: L.LatLngBounds): void {
        map.setMaxBounds(bounds);
    },

    flyTo(
        map: L.Map,
        center: L.LatLng | any,
        zoom: number,
        options: L.ZoomPanOptions | undefined
    ): void {
        map.flyTo(center, zoom, options);
    },

    locate(map: L.Map, options: L.LocateOptions | undefined): void {
        map.locate(options);
    }
};

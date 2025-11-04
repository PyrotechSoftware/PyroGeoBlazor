declare const L: typeof import('leaflet');

import { EventHandlerMapping } from './eventHandling';
import { LeafletEvents } from './events';

export const Tooltip = {
    createTooltip(
        latLng: L.LatLng,
        options?: L.TooltipOptions,
        handlerMappings?: EventHandlerMapping
    ): L.Tooltip {
        const tooltip = L.tooltip(latLng, options);
        // Attach event handlers if provided
        if (handlerMappings && handlerMappings.dotNetRef && handlerMappings.events) {
            const keys = Object.keys(handlerMappings.events);

            if (keys.indexOf('contentupdate') > -1) {
                tooltip.on('contentupdate', function (ev: any) {
                    var methodName = handlerMappings.events!['contentupdate'];
                    try {
                        var payload = LeafletEvents.LeafletEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error(`Error invoking dotnet handler for event contentupdate`, e);
                    }
                });
            }
            if (keys.indexOf('click') > -1) {
                tooltip.on('click', function (ev: L.LeafletMouseEvent) {
                    var methodName = handlerMappings.events!['click'];
                    try {
                        var payload = LeafletEvents.LeafletMouseEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error(`Error invoking dotnet handler for event click`, e);
                    }
                });
            }
            if (keys.indexOf('dblclick') > -1) {
                tooltip.on('dblclick', function (ev: L.LeafletMouseEvent) {
                    var methodName = handlerMappings.events!['dblclick'];
                    try {
                        var payload = LeafletEvents.LeafletMouseEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error(`Error invoking dotnet handler for event dblclick`, e);
                    }
                });
            }
            if (keys.indexOf('mousedown') > -1) {
                tooltip.on('mousedown', function (ev: L.LeafletMouseEvent) {
                    var methodName = handlerMappings.events!['mousedown'];
                    try {
                        var payload = LeafletEvents.LeafletMouseEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error(`Error invoking dotnet handler for event mousedown`, e);
                    }
                });
            }
            if (keys.indexOf('mouseup') > -1) {
                tooltip.on('mouseup', function (ev: L.LeafletMouseEvent) {
                    var methodName = handlerMappings.events!['mouseup'];
                    try {
                        var payload = LeafletEvents.LeafletMouseEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error(`Error invoking dotnet handler for event mouseup`, e);
                    }
                });
            }
            if (keys.indexOf('mouseover') > -1) {
                tooltip.on('mouseover', function (ev: L.LeafletMouseEvent) {
                    var methodName = handlerMappings.events!['mouseover'];
                    try {
                        var payload = LeafletEvents.LeafletMouseEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error(`Error invoking dotnet handler for event mouseover`, e);
                    }
                });
            }
            if (keys.indexOf('mouseout') > -1) {
                tooltip.on('mouseout', function (ev: L.LeafletMouseEvent) {
                    var methodName = handlerMappings.events!['mouseout'];
                    try {
                        var payload = LeafletEvents.LeafletMouseEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error(`Error invoking dotnet handler for event mouseout`, e);
                    }
                });
            }
            if (keys.indexOf('contextmenu') > -1) {
                tooltip.on('contextmenu', function (ev: L.LeafletMouseEvent) {
                    var methodName = handlerMappings.events!['contextmenu'];
                    try {
                        var payload = LeafletEvents.LeafletMouseEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error(`Error invoking dotnet handler for event contextmenu`, e);
                    }
                });
            }
            if (keys.indexOf('add') > -1) {
                tooltip.on('add', function (ev: any) {
                    var methodName = handlerMappings.events!['add'];
                    try {
                        var payload = LeafletEvents.LeafletEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error(`Error invoking dotnet handler for event add`, e);
                    }
                });
            }
            if (keys.indexOf('remove') > -1) {
                tooltip.on('remove', function (ev: any) {
                    var methodName = handlerMappings.events!['remove'];
                    try {
                        var payload = LeafletEvents.LeafletEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error(`Error invoking dotnet handler for event remove`, e);
                    }
                });
            }
            if (keys.indexOf('popupopen') > -1) {
                tooltip.on('popupopen', function (ev: L.PopupEvent) {
                    var methodName = handlerMappings.events!['popupopen'];
                    try {
                        var payload = LeafletEvents.LeafletPopupEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error(`Error invoking dotnet handler for event popupopen`, e);
                    }
                });
            }
            if (keys.indexOf('popupclose') > -1) {
                tooltip.on('popupclose', function (ev: L.PopupEvent) {
                    var methodName = handlerMappings.events!['popupclose'];
                    try {
                        var payload = LeafletEvents.LeafletPopupEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error(`Error invoking dotnet handler for event popupclose`, e);
                    }
                });
            }
            if (keys.indexOf('tooltipopen') > -1) {
                tooltip.on('tooltipopen', function (ev: L.TooltipEvent) {
                    var methodName = handlerMappings.events!['tooltipopen'];
                    try {
                        var payload = LeafletEvents.LeafletTooltipEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error(`Error invoking dotnet handler for event tooltipopen`, e);
                    }
                });
            }
            if (keys.indexOf('tooltipclose') > -1) {
                tooltip.on('tooltipclose', function (ev: L.TooltipEvent) {
                    var methodName = handlerMappings.events!['tooltipclose'];
                    try {
                        var payload = LeafletEvents.LeafletTooltipEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error(`Error invoking dotnet handler for event tooltipclose`, e);
                    }
                });
            }
        }

        return tooltip;
    }
}

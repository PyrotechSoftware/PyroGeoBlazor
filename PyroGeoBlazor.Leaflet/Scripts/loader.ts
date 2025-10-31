declare const L: typeof import("leaflet");

export function ensureLeafletLoaded(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (typeof L !== "undefined") {
            resolve();
            return;
        }

        const leafletCss = document.createElement("link");
        leafletCss.rel = "stylesheet";
        leafletCss.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(leafletCss);

        const leafletScript = document.createElement("script");
        leafletScript.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        leafletScript.onload = () => {
            if (typeof L !== "undefined") {
                resolve();
            } else {
                reject(new Error("Leaflet failed to load."));
            }
        };
        leafletScript.onerror = () => reject(new Error("Leaflet script failed to load."));
        document.body.appendChild(leafletScript);
    });
}
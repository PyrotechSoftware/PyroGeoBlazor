namespace PyroGeoBlazor.DeckGL.Icons;

/// <summary>
/// Default SVG icons for PyroGeoBlazor.DeckGL components
/// </summary>
public static class DefaultIcons
{
    /// <summary>
    /// Mouse pointer icon for Select Feature mode
    /// </summary>
    public const string MousePointer = """
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M3 2l8.5 19 2.2-7.3 7.3-2.2L3 2z" />
        </svg>
        """;

    /// <summary>
    /// Polygon selection icon (similar to ArcGIS Pro)
    /// </summary>
    public const string SelectByPolygon = """
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <polygon points="5,4 15,5 18,10 13,16 6,14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 2" stroke-linejoin="round" />
          <path d="M6 6l5 12 1.5-4 4-1.5L6 6z" fill="currentColor" />
        </svg>
        """;

    /// <summary>
    /// Hand icon for Explore/Pan mode
    /// </summary>
    public const string Hand = """
        
        <?xml version="1.0" encoding="UTF-8"?>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="24" height="24" fill="currentColor" aria-hidden="true">
          <path d="M188 40
            a28.2 28.2 0 0 0-12 2.7
            V36
            a28 28 0 0 0-54.6-8.6
            A27.8 27.8 0 0 0 108 24
            A28.1 28.1 0 0 0 80 52
            v75.4
            l-7-12.1
            A28 28 0 0 0 24.3 143
            c32.5 68.4 54.1 97 103.7 97
            a88.1 88.1 0 0 0 88-88
            V68
            A28.1 28.1 0 0 0 188 40
            Z

            M200 152
            a72.1 72.1 0 0 1-72 72
            c-20.2 0-34.2-5.5-47-18.2
            S56.3 173 38.7 135.9
            l-.3-.6
            a11.6 11.6 0 0 1-1.2-9.1
            a11.8 11.8 0 0 1 5.6-7.3
            a12 12 0 0 1 9.1-1.2
            a11.6 11.6 0 0 1 7.2 5.6
            l22 38
            a8.1 8.1 0 0 0 9 3.7
            a7.9 7.9 0 0 0 5.9-7.7
            V52
            a12 12 0 0 1 24 0
            v68
            a8 8 0 0 0 16 0
            V36
            a12 12 0 0 1 24 0
            v84
            a8 8 0 0 0 16 0
            V68
            a12 12 0 0 1 24 0
            Z"/>
        </svg>
        """;

    /// <summary>
    /// Alternative hand/pan icon (open palm style)
    /// </summary>
    public const string HandOpen = """
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="24" height="24" fill="currentColor" aria-hidden="true">
          <path d="M80 52 a28 28 0 0 1 56 0 v16 a28 28 0 0 1 56 0 v40 a28 28 0 0 1 56 0 v44 a88 88 0 0 1-88 88 c-49.6 0-71.2-28.6-103.7-97 a28 28 0 1 1 48.7-27.7 l7 12.1 V52 Z"/>
        </svg>
        """;
}

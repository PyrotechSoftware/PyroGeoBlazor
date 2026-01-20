namespace PyroGeoBlazor.Utilities;

/// <summary>
/// Utility class for color generation and conversion operations.
/// </summary>
public static class ColorUtilities
{
    private static readonly Random Random = new();

    /// <summary>
    /// Generates a random color for layer styling in HEX format.
    /// </summary>
    /// <returns>A random color in HEX format (e.g., "#3388ff")</returns>
    public static string GenerateRandomColor()
    {
        var hue = Random.Next(0, 360);
        var saturation = Random.Next(40, 70);
        var lightness = Random.Next(50, 75);

        return HslToHex(hue, saturation, lightness);
    }

    /// <summary>
    /// Converts HSL color values to HEX format.
    /// </summary>
    /// <param name="h">Hue (0-360)</param>
    /// <param name="s">Saturation (0-100)</param>
    /// <param name="l">Lightness (0-100)</param>
    /// <returns>HEX color string (e.g., "#3388ff")</returns>
    public static string HslToHex(int h, int s, int l)
    {
        var hNorm = h / 360.0;
        var sNorm = s / 100.0;
        var lNorm = l / 100.0;

        double r, g, b;

        if (s == 0)
        {
            r = g = b = lNorm; // achromatic
        }
        else
        {
            var q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
            var p = 2 * lNorm - q;
            r = HueToRgb(p, q, hNorm + 1.0 / 3.0);
            g = HueToRgb(p, q, hNorm);
            b = HueToRgb(p, q, hNorm - 1.0 / 3.0);
        }

        var rByte = (int)Math.Round(r * 255);
        var gByte = (int)Math.Round(g * 255);
        var bByte = (int)Math.Round(b * 255);

        return $"#{rByte:X2}{gByte:X2}{bByte:X2}";
    }

    /// <summary>
    /// Helper method to convert hue to RGB component.
    /// </summary>
    /// <param name="p">The first parameter from HSL to RGB conversion</param>
    /// <param name="q">The second parameter from HSL to RGB conversion</param>
    /// <param name="t">The normalized hue value adjusted for the RGB component</param>
    /// <returns>RGB component value (0.0-1.0)</returns>
    private static double HueToRgb(double p, double q, double t)
    {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1.0 / 6.0) return p + (q - p) * 6 * t;
        if (t < 1.0 / 2.0) return q;
        if (t < 2.0 / 3.0) return p + (q - p) * (2.0 / 3.0 - t) * 6;
        return p;
    }
}

namespace PyroGeoBlazor.Leaflet.Models;

using System.Text.Json.Serialization;

public class PathOptions : InteractiveLayerOptions
{
    /// <summary>
    /// Whether to draw stroke along the path. Set it to false to disable borders on polygons or circles.
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public bool Stroke { get; set; } = true;

    /// <summary>
    /// Stroke color
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public string Color { get; set; } = "#3388ff";

    /// <summary>
    /// Stroke width in pixels
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public double Weight { get; set; } = 3;

    /// <summary>
    /// Stroke opacity
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public double Opacity { get; set; } = 1.0;

    /// <summary>
    /// A string that defines shape to be used at the end of the stroke.
    /// </summary>
    /// <remarks>
    /// <see href="https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/stroke-linecap"/>
    /// </remarks>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public string LineCap { get; set; } = "round";

    /// <summary>
    /// A string that defines shape to be used at the corners of the stroke.
    /// </summary>
    /// <remarks>
    /// <see href="https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/stroke-linejoin"/>
    /// </remarks>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public string LineJoin { get; set; } = "round";

    /// <summary>
    /// A string that defines the stroke dash pattern.
    /// Doesn't work on Canvas-powered layers in some old browsers.
    /// </summary>
    /// <remarks>
    /// <see href="https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash"/>
    /// </remarks>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public string? DashArray { get; set; }

    /// <summary>
    /// A string that defines the distance into the dash pattern to start the dash.
    /// Doesn't work on Canvas-powered layers in some old browsers.
    /// </summary>
    /// <remarks>
    /// <see href="https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash"/>
    /// </remarks>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public string? DashOffset { get; set; }

    /// <summary>
    /// Whether to fill the path with color. Set it to false to disable filling on polygons or circles.
    /// Defaults to true for polygons, false for polylines.
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public bool? Fill { get; set; }

    /// <summary>
    /// Fill color. Defaults to the value of the color option
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public string FillColor { get; set; } = "*";

    /// <summary>
    /// Fill opacity
    /// </summary>
    public double FillOpacity { get; set; } = 0.2;

    /// <summary>
    /// A string that defines how the inside of a shape is determined.
    /// </summary>
    /// <remarks>
    /// <see href="https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/fill-rule"/>
    /// </remarks>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public string FillRule { get; set; } = "evenodd";

    /// <summary>
    /// When true, a mouse event on this path will trigger the same event on the map (unless L.DomEvent.stopPropagation is used).
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public new bool BubblingMouseEvents { get; set; } = true;

    /// <summary>
    /// Custom class name set on an element. Only for SVG renderer.
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public string? ClassName { get; set; }
}

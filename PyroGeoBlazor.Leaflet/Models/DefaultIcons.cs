namespace PyroGeoBlazor.Leaflet.Models;

/// <summary>
/// Provides default SVG icons for the editing control buttons and cursors.
/// </summary>
public static class DefaultIcons
{
    /// <summary>
    /// Default polygon drawing icon with node handles and plus badge.
    /// </summary>
    public const string Polygon = @"
<svg xmlns=""http://www.w3.org/2000/svg"" width=""24"" height=""24""
     viewBox=""0 0 24 24"" fill=""none"" stroke=""currentColor"" stroke-width=""1.5""
     stroke-linecap=""round"" stroke-linejoin=""round"" role=""img""
     style=""pointer-events: none;"">
  <path d=""M5 8 L10 5 L17 7 L19 13 L13 18 L6 16 Z"" />
  <circle cx=""5"" cy=""8"" r=""1.2"" fill=""currentColor"" />
  <circle cx=""10"" cy=""5"" r=""1.2"" fill=""currentColor"" />
  <circle cx=""17"" cy=""7"" r=""1.2"" fill=""currentColor"" />
  <circle cx=""19"" cy=""13"" r=""1.2"" fill=""currentColor"" />
  <circle cx=""13"" cy=""18"" r=""1.2"" fill=""currentColor"" />
  <circle cx=""6"" cy=""16"" r=""1.2"" fill=""currentColor"" />
  <circle cx=""19"" cy=""5"" r=""3.2"" fill=""white"" stroke=""currentColor""/>
  <path d=""M19 3.6v2.8M17.6 5h2.8"" />
</svg>";

    /// <summary>
    /// Default line drawing icon with node handles and plus badge.
    /// </summary>
    public const string Line = @"
<svg xmlns=""http://www.w3.org/2000/svg"" width=""24"" height=""24""
     viewBox=""0 0 24 24"" fill=""none"" stroke=""currentColor"" stroke-width=""1.5""
     stroke-linecap=""round"" stroke-linejoin=""round"" role=""img""
     style=""pointer-events: none;"">
  <path d=""M5 19 L19 5"" />
  <circle cx=""5"" cy=""19"" r=""1.2"" fill=""currentColor"" />
  <circle cx=""19"" cy=""5"" r=""1.2"" fill=""currentColor"" />
  <circle cx=""19"" cy=""5"" r=""3.2"" fill=""white"" stroke=""currentColor""/>
  <path d=""M19 3.6v2.8M17.6 5h2.8"" />
</svg>";

    /// <summary>
    /// Default edit icon (pencil with vertex handles).
    /// </summary>
    public const string Edit = @"
<svg xmlns=""http://www.w3.org/2000/svg"" width=""24"" height=""24""
     viewBox=""0 0 24 24"" fill=""none"" stroke=""currentColor"" stroke-width=""1.5""
     stroke-linecap=""round"" stroke-linejoin=""round"" role=""img""
     style=""pointer-events: none;"">
  <path d=""M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7""/>
  <path d=""M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z""/>
  <circle cx=""12"" cy=""15"" r=""1"" fill=""currentColor"" />
  <circle cx=""17"" cy=""7"" r=""1"" fill=""currentColor"" />
</svg>";

    /// <summary>
    /// Default delete icon (trash bin).
    /// </summary>
    public const string Delete = @"
<svg xmlns=""http://www.w3.org/2000/svg"" width=""24"" height=""24""
     viewBox=""0 0 24 24"" fill=""none"" stroke=""currentColor"" stroke-width=""1.5""
     stroke-linecap=""round"" stroke-linejoin=""round"" role=""img""
     style=""pointer-events: none;"">
  <path d=""M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z""/>
  <path d=""M10 11v6M14 11v6""/>
</svg>";

    /// <summary>
    /// Default confirm icon (checkmark).
    /// </summary>
    public const string Confirm = @"
<svg xmlns=""http://www.w3.org/2000/svg"" width=""24"" height=""24""
     viewBox=""0 0 24 24"" fill=""none"" stroke=""currentColor"" stroke-width=""2""
     stroke-linecap=""round"" stroke-linejoin=""round"" role=""img""
     style=""pointer-events: none;"">
  <path d=""M20 6L9 17l-5-5""/>
</svg>";

    /// <summary>
    /// Default cancel icon (X mark).
    /// </summary>
    public const string Cancel = @"
<svg xmlns=""http://www.w3.org/2000/svg"" width=""24"" height=""24""
     viewBox=""0 0 24 24"" fill=""none"" stroke=""currentColor"" stroke-width=""2""
     stroke-linecap=""round"" stroke-linejoin=""round"" role=""img""
     style=""pointer-events: none;"">
  <path d=""M18 6L6 18M6 6l12 12""/>
</svg>";

    /// <summary>
    /// Default add vertex icon (node with plus).
    /// </summary>
    public const string AddVertex = @"
<svg xmlns=""http://www.w3.org/2000/svg"" width=""24"" height=""24""
     viewBox=""0 0 24 24"" fill=""none"" stroke=""currentColor"" stroke-width=""1.5""
     stroke-linecap=""round"" stroke-linejoin=""round"" role=""img""
     style=""pointer-events: none;"">
  <path d=""M6 12 L18 12"" />
  <circle cx=""6"" cy=""12"" r=""2"" fill=""currentColor"" />
  <circle cx=""18"" cy=""12"" r=""2"" fill=""currentColor"" />
  <circle cx=""12"" cy=""12"" r=""4"" fill=""white"" stroke=""currentColor""/>
  <path d=""M12 10v4M10 12h4"" />
</svg>";

    /// <summary>
    /// Default remove vertex icon (node with minus).
    /// </summary>
    public const string RemoveVertex = @"
<svg xmlns=""http://www.w3.org/2000/svg"" width=""24"" height=""24""
     viewBox=""0 0 24 24"" fill=""none"" stroke=""currentColor"" stroke-width=""1.5""
     stroke-linecap=""round"" stroke-linejoin=""round"" role=""img""
     style=""pointer-events: none;"">
  <circle cx=""12"" cy=""12"" r=""7"" />
  <path d=""M8 12h8"" stroke-width=""2"" />
  <circle cx=""5"" cy=""12"" r=""1.5"" fill=""currentColor"" />
  <circle cx=""19"" cy=""12"" r=""1.5"" fill=""currentColor"" />
</svg>";

    /// <summary>
    /// Default move vertex icon (hand/cursor with arrows).
    /// </summary>
    public const string MoveVertex = @"
<svg xmlns=""http://www.w3.org/2000/svg"" width=""24"" height=""24""
     viewBox=""0 0 24 24"" fill=""none"" stroke=""currentColor"" stroke-width=""1.5""
     stroke-linecap=""round"" stroke-linejoin=""round"" role=""img""
     style=""pointer-events: none;"">
  <circle cx=""12"" cy=""12"" r=""7"" fill=""white"" />
  <path d=""M12 8v8M8 12h8"" stroke-width=""2"" />
  <path d=""M9 9l3-3 3 3M15 15l-3 3-3-3"" />
</svg>";

    /// <summary>
    /// Default cursor for adding vertices (pointer with + badge).
    /// </summary>
    public const string AddCursor = """
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <path d="M2 2 L2 18 L8 14 L12 22 L15 21 L11 13 L18 12 Z" fill="black" stroke="white" stroke-width="1"/>
  <circle cx="24" cy="8" r="6" fill="white" stroke="black" stroke-width="1.5"/>
  <path d="M24 5v6M21 8h6" stroke="black" stroke-width="2" stroke-linecap="round"/>
</svg>
""";

    /// <summary>
    /// Default cursor for removing vertices (pointer with - badge).
    /// </summary>
    public const string RemoveCursor = """
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <path d="M2 2 L2 18 L8 14 L12 22 L15 21 L11 13 L18 12 Z" fill="black" stroke="white" stroke-width="1"/>
  <circle cx="24" cy="8" r="6" fill="white" stroke="black" stroke-width="1.5"/>
  <path d="M21 8h6" stroke="black" stroke-width="2" stroke-linecap="round"/>
</svg>
""";
}

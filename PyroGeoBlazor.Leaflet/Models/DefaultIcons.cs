namespace PyroGeoBlazor.Leaflet.Models;

/// <summary>
/// Provides default SVG icons for the editing control buttons.
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
}

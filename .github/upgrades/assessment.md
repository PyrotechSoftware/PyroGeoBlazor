# Projects and dependencies analysis

This document provides a comprehensive overview of the projects and their dependencies in the context of upgrading to .NETCoreApp,Version=v10.0.

## Table of Contents

- [Executive Summary](#executive-Summary)
  - [Highlevel Metrics](#highlevel-metrics)
  - [Projects Compatibility](#projects-compatibility)
  - [Package Compatibility](#package-compatibility)
  - [API Compatibility](#api-compatibility)
- [Aggregate NuGet packages details](#aggregate-nuget-packages-details)
- [Top API Migration Challenges](#top-api-migration-challenges)
  - [Technologies and Features](#technologies-and-features)
  - [Most Frequent API Issues](#most-frequent-api-issues)
- [Projects Relationship Graph](#projects-relationship-graph)
- [Project Details](#project-details)

  - [PyroGeoBlazor.Demo\PyroGeoBlazor.Demo.csproj](#pyrogeoblazordemopyrogeoblazordemocsproj)
  - [PyroGeoBlazor.Leaflet\PyroGeoBlazor.Leaflet.csproj](#pyrogeoblazorleafletpyrogeoblazorleafletcsproj)


## Executive Summary

### Highlevel Metrics

| Metric | Count | Status |
| :--- | :---: | :--- |
| Total Projects | 2 | All require upgrade |
| Total NuGet Packages | 4 | All compatible |
| Total Code Files | 81 |  |
| Total Code Files with Incidents | 3 |  |
| Total Lines of Code | 4081 |  |
| Total Number of Issues | 3 |  |
| Estimated LOC to modify | 1+ | at least 0,0% of codebase |

### Projects Compatibility

| Project | Target Framework | Difficulty | Package Issues | API Issues | Est. LOC Impact | Description |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| [PyroGeoBlazor.Demo\PyroGeoBlazor.Demo.csproj](#pyrogeoblazordemopyrogeoblazordemocsproj) | net9.0 | 🟢 Low | 0 | 1 | 1+ | AspNetCore, Sdk Style = True |
| [PyroGeoBlazor.Leaflet\PyroGeoBlazor.Leaflet.csproj](#pyrogeoblazorleafletpyrogeoblazorleafletcsproj) | net9.0 | 🟢 Low | 0 | 0 |  | ClassLibrary, Sdk Style = True |

### Package Compatibility

| Status | Count | Percentage |
| :--- | :---: | :---: |
| ✅ Compatible | 4 | 100,0% |
| ⚠️ Incompatible | 0 | 0,0% |
| 🔄 Upgrade Recommended | 0 | 0,0% |
| ***Total NuGet Packages*** | ***4*** | ***100%*** |

### API Compatibility

| Category | Count | Impact |
| :--- | :---: | :--- |
| 🔴 Binary Incompatible | 0 | High - Require code changes |
| 🟡 Source Incompatible | 0 | Medium - Needs re-compilation and potential conflicting API error fixing |
| 🔵 Behavioral change | 1 | Low - Behavioral changes that may require testing at runtime |
| ✅ Compatible | 3418 |  |
| ***Total APIs Analyzed*** | ***3419*** |  |

## Aggregate NuGet packages details

| Package | Current Version | Suggested Version | Projects | Description |
| :--- | :---: | :---: | :--- | :--- |
| NetTopologySuite | 2.6.0 |  | [PyroGeoBlazor.Demo.csproj](#pyrogeoblazordemopyrogeoblazordemocsproj) | ✅Compatible |
| NetTopologySuite.Features | 2.2.0 |  | [PyroGeoBlazor.Demo.csproj](#pyrogeoblazordemopyrogeoblazordemocsproj) | ✅Compatible |
| NetTopologySuite.IO.Esri.Shapefile | 1.2.0 |  | [PyroGeoBlazor.Demo.csproj](#pyrogeoblazordemopyrogeoblazordemocsproj) | ✅Compatible |
| NetTopologySuite.IO.GeoJSON | 4.0.0 |  | [PyroGeoBlazor.Demo.csproj](#pyrogeoblazordemopyrogeoblazordemocsproj) | ✅Compatible |

## Top API Migration Challenges

### Technologies and Features

| Technology | Issues | Percentage | Migration Path |
| :--- | :---: | :---: | :--- |

### Most Frequent API Issues

| API | Count | Percentage | Category |
| :--- | :---: | :---: | :--- |
| M:Microsoft.AspNetCore.Builder.ExceptionHandlerExtensions.UseExceptionHandler(Microsoft.AspNetCore.Builder.IApplicationBuilder,System.String,System.Boolean) | 1 | 100,0% | Behavioral Change |

## Projects Relationship Graph

Legend:
📦 SDK-style project
⚙️ Classic project

```mermaid
flowchart LR
    P1["<b>📦&nbsp;PyroGeoBlazor.Demo.csproj</b><br/><small>net9.0</small>"]
    P2["<b>📦&nbsp;PyroGeoBlazor.Leaflet.csproj</b><br/><small>net9.0</small>"]
    P1 --> P2
    click P1 "#pyrogeoblazordemopyrogeoblazordemocsproj"
    click P2 "#pyrogeoblazorleafletpyrogeoblazorleafletcsproj"

```

## Project Details

<a id="pyrogeoblazordemopyrogeoblazordemocsproj"></a>
### PyroGeoBlazor.Demo\PyroGeoBlazor.Demo.csproj

#### Project Info

- **Current Target Framework:** net9.0
- **Proposed Target Framework:** net10.0
- **SDK-style**: True
- **Project Kind:** AspNetCore
- **Dependencies**: 1
- **Dependants**: 0
- **Number of Files**: 13
- **Number of Files with Incidents**: 2
- **Lines of Code**: 319
- **Estimated LOC to modify**: 1+ (at least 0,3% of the project)

#### Dependency Graph

Legend:
📦 SDK-style project
⚙️ Classic project

```mermaid
flowchart TB
    subgraph current["PyroGeoBlazor.Demo.csproj"]
        MAIN["<b>📦&nbsp;PyroGeoBlazor.Demo.csproj</b><br/><small>net9.0</small>"]
        click MAIN "#pyrogeoblazordemopyrogeoblazordemocsproj"
    end
    subgraph downstream["Dependencies (1"]
        P2["<b>📦&nbsp;PyroGeoBlazor.Leaflet.csproj</b><br/><small>net9.0</small>"]
        click P2 "#pyrogeoblazorleafletpyrogeoblazorleafletcsproj"
    end
    MAIN --> P2

```

### API Compatibility

| Category | Count | Impact |
| :--- | :---: | :--- |
| 🔴 Binary Incompatible | 0 | High - Require code changes |
| 🟡 Source Incompatible | 0 | Medium - Needs re-compilation and potential conflicting API error fixing |
| 🔵 Behavioral change | 1 | Low - Behavioral changes that may require testing at runtime |
| ✅ Compatible | 650 |  |
| ***Total APIs Analyzed*** | ***651*** |  |

<a id="pyrogeoblazorleafletpyrogeoblazorleafletcsproj"></a>
### PyroGeoBlazor.Leaflet\PyroGeoBlazor.Leaflet.csproj

#### Project Info

- **Current Target Framework:** net9.0
- **Proposed Target Framework:** net10.0
- **SDK-style**: True
- **Project Kind:** ClassLibrary
- **Dependencies**: 0
- **Dependants**: 1
- **Number of Files**: 93
- **Number of Files with Incidents**: 1
- **Lines of Code**: 3762
- **Estimated LOC to modify**: 0+ (at least 0,0% of the project)

#### Dependency Graph

Legend:
📦 SDK-style project
⚙️ Classic project

```mermaid
flowchart TB
    subgraph upstream["Dependants (1)"]
        P1["<b>📦&nbsp;PyroGeoBlazor.Demo.csproj</b><br/><small>net9.0</small>"]
        click P1 "#pyrogeoblazordemopyrogeoblazordemocsproj"
    end
    subgraph current["PyroGeoBlazor.Leaflet.csproj"]
        MAIN["<b>📦&nbsp;PyroGeoBlazor.Leaflet.csproj</b><br/><small>net9.0</small>"]
        click MAIN "#pyrogeoblazorleafletpyrogeoblazorleafletcsproj"
    end
    P1 --> MAIN

```

### API Compatibility

| Category | Count | Impact |
| :--- | :---: | :--- |
| 🔴 Binary Incompatible | 0 | High - Require code changes |
| 🟡 Source Incompatible | 0 | Medium - Needs re-compilation and potential conflicting API error fixing |
| 🔵 Behavioral change | 0 | Low - Behavioral changes that may require testing at runtime |
| ✅ Compatible | 2768 |  |
| ***Total APIs Analyzed*** | ***2768*** |  |


# Upgrade Plan: .NET 10 Migration

## Table of Contents

- [1. Executive Summary](#executive-summary)
- [2. Migration Strategy](#migration-strategy)
- [3. Detailed Dependency Analysis](#detailed-dependency-analysis)
- [4. Project-by-Project Plans](#project-by-project-plans)
- [5. Package Update Reference](#package-update-reference)
- [6. Breaking Changes Catalog](#breaking-changes-catalog)
- [7. Testing & Validation Strategy](#testing--validation-strategy)
- [8. Risk Management](#risk-management)
- [9. Complexity & Effort Assessment](#complexity--effort-assessment)
- [10. Source Control Strategy](#source-control-strategy)
- [11. Success Criteria](#success-criteria)
- [12. Appendices & Next Steps](#appendices--next-steps)


## 1. Executive Summary

Selected Strategy
**All-At-Once Strategy** — All projects upgraded simultaneously in a single atomic operation.

Rationale
- Solution size: 2 projects (small). Fits All-At-Once criteria.
- Dependency depth: 1 (`PyroGeoBlazor.Demo` → `PyroGeoBlazor.Leaflet`).
- Package compatibility: All 4 NuGet packages marked compatible; no security vulnerabilities reported in assessment.
- Code changes expected: minimal. Assessment estimates 1+ LOC to modify (behavioral change in Demo).

Scope
- Projects: `PyroGeoBlazor.Demo` (Blazor demo app) and `PyroGeoBlazor.Leaflet` (class library).
- Current target: `net9.0` for all projects.
- Target framework: `net10.0` for all projects (Proposed Target Framework in assessment).
- Branch: work will be performed on branch `upgrade-to-NET10-1` (created).

Critical Issues
- Behavioral change detected in `PyroGeoBlazor.Demo` related to `UseExceptionHandler` usage. Requires code review and runtime validation.
- No NuGet security vulnerabilities reported in the assessment; plan includes conditional handling if restore surfaces vulnerabilities.

Deliverable
- A single atomic upgrade producing a repository state where all projects target `net10.0`, solution builds with 0 errors, and automated tests (if present) pass.


## 2. Migration Strategy

Approach
- All projects will be upgraded simultaneously in one atomic operation (no intermediate mixed-target states).
- The atomic operation will: update `TargetFramework` elements, update package references where required, restore packages, build solution, and fix compilation errors discovered during build — all as part of one coordinated pass.

Prerequisites (Phase 0)
- Ensure .NET 10 SDK is installed on developer and CI machines. Validate SDK presence and compatibility with any `global.json` files and update `global.json` if needed.
- Update CI pipeline definitions to use the .NET 10 SDK image/runtime (example: GitHub Actions runner, Azure DevOps pool, etc.).
- Confirm branch `upgrade-to-NET10-1` is checked out and clean (no pending changes).
- Take a backup branch/tag of `upgrade-to-NET10` if desired for safety.

Atomic Upgrade (Phase 1)
- Update project files: set `TargetFramework` to `net10.0` for all projects. If any project is multi-targeted, append `net10.0` to the `TargetFrameworks` list.
- Update MSBuild import files (`Directory.Build.props`, `Directory.Build.targets`, `Directory.Packages.props`) if they define framework or package versions.
- Update NuGet package references as indicated in §5 Package Update Reference (assessment shows no required package version changes; still confirm compatibility after build).
- Restore dependencies and build solution to identify compilation issues.
- Fix compilation errors introduced by framework/package upgrade in the same operation.

Testing & Validation (Phase 2)
- Run available unit/integration tests and address failures.
- For the Blazor demo app, perform runtime validation focusing on exception handling behavior (see §6 Breaking Changes Catalog).

Commit and PR
- Use a single atomic commit for the upgrade changes (project file edits, package version updates, any code changes) and open a PR from `upgrade-to-NET10-1` to the source branch for review.


## 3. Detailed Dependency Analysis

Summary
- Project graph: `PyroGeoBlazor.Demo` → `PyroGeoBlazor.Leaflet`.
- Leaf nodes: `PyroGeoBlazor.Leaflet` (no project dependencies).
- Root nodes: `PyroGeoBlazor.Demo` (application).

Migration ordering note (informational)
- Although this plan performs an All-At-Once upgrade, the dependency graph indicates that `PyroGeoBlazor.Leaflet` is a dependency of the Demo app. During troubleshooting, check `PyroGeoBlazor.Leaflet` build and APIs first because it is a common dependency.

Topological order (for reference)
1. `PyroGeoBlazor.Leaflet` (leaf)
2. `PyroGeoBlazor.Demo` (root)

Circular dependencies
- None found.


## 4. Project-by-Project Plans

### Project: `PyroGeoBlazor.Leaflet` (Class Library)

Current State
- Path: `PyroGeoBlazor.Leaflet\PyroGeoBlazor.Leaflet.csproj`
- Current TargetFramework: `net9.0`
- Project type: ClassLibrary (SDK-style)
- LOC: 3762 (assessment)
- Estimated LOC to modify: 0+
- Dependencies: none (project-level)

Target State
- TargetFramework: `net10.0`

Migration Steps
1. Update `TargetFramework` element to `net10.0` in `PyroGeoBlazor.Leaflet.csproj`.
2. Inspect `Directory.Build.props` / imported MSBuild files for conditional framework or package version properties; update if necessary.
3. Confirm package compatibility after build; no package updates expected per assessment.
4. Build to detect any API compilation errors.
5. If compilation errors occur, resolve them as part of the atomic upgrade (fix usages, update APIs).

Validation Checklist
- [ ] `TargetFramework` set to `net10.0` in `PyroGeoBlazor.Leaflet.csproj`.
- [ ] Solution builds with 0 errors after changes.
- [ ] No new package vulnerabilities introduced.

Risk
- Low. Assessment lists no API issues.


### Project: `PyroGeoBlazor.Demo` (Blazor Demo App)

Current State
- Path: `PyroGeoBlazor.Demo\PyroGeoBlazor.Demo.csproj`
- Current TargetFramework: `net9.0`
- Project type: AspNetCore (Blazor demo)
- LOC: 319 (assessment)
- Estimated LOC to modify: 1+
- Dependencies: `PyroGeoBlazor.Leaflet`

Target State
- TargetFramework: `net10.0`

Migration Steps
1. Update `TargetFramework` element to `net10.0` in `PyroGeoBlazor.Demo.csproj`.
2. Code-check: inspect `Program.cs` (or `Startup` equivalent) for `UseExceptionHandler` usage and middleware ordering. The assessment flagged a behavioral change for `Microsoft.AspNetCore.Builder.ExceptionHandlerExtensions.UseExceptionHandler(IApplicationBuilder, string, bool)`.
   - If the app uses the `UseExceptionHandler` overload with a `bool` parameter, replace with an explicit lambda-based handler or the recommended .NET 10 pattern to preserve previous behavior.
   - Add a focused integration test that triggers an error path to validate exception handling behavior.
3. Update any package references if build indicates mismatches (assessment shows no required updates but verify).
4. Build and validate runtime behavior (exception handler, routing, DI).

Validation Checklist
- [ ] `TargetFramework` set to `net10.0` in `PyroGeoBlazor.Demo.csproj`.
- [ ] Project and solution build with 0 errors.
- [ ] App starts and main pages render and remain interactive (Blazor rendering/hydration checks).
- [ ] Exception handling behavior validated via the added integration test and manual smoke test.

Risk
- Low, with a focused behavioral-change risk related to exception handling. Requires runtime validation.


## 5. Package Update Reference

All packages listed in assessment are marked compatible. No forced upgrades were suggested by the assessment. Still validate after build.

Common packages (affecting one project):

- `NetTopologySuite` — current: `2.6.0` — Projects: `PyroGeoBlazor.Demo` — Compatible
- `NetTopologySuite.Features` — current: `2.2.0` — Projects: `PyroGeoBlazor.Demo` — Compatible
- `NetTopologySuite.IO.Esri.Shapefile` — current: `1.2.0` — Projects: `PyroGeoBlazor.Demo` — Compatible
- `NetTopologySuite.IO.GeoJSON` — current: `4.0.0` — Projects: `PyroGeoBlazor.Demo` — Compatible

Notes
- If `dotnet restore` surfaces security vulnerabilities or incompatible transitive versions, select specific remediation versions and document them in the upgrade commit before merging.
- Do not use ambiguous `latest` values; include explicit version numbers for any package changes.


## 6. Breaking Changes Catalog

Summary of known/expected breaking changes for .NET 10 (from assessment):

- Behavioral change: `Microsoft.AspNetCore.Builder.ExceptionHandlerExtensions.UseExceptionHandler(IApplicationBuilder, string, bool)`
  - Impact: May alter behavior of the exception handling middleware registration. The Demo app uses an overload that includes a `bool` parameter; validate runtime exception handling behavior and update code to the recommended pattern if necessary.
  - Mitigation: Review `Program.cs`/`Startup` registration for `UseExceptionHandler`. Prefer explicit lambda-based handlers or the recommended `UseExceptionHandler` overload for .NET 10, and add a small focused integration test that triggers an exception path to validate behavior.

Other categories
- No binary or source-incompatible API changes were detected in the assessment.

⚠️ Requires validation: Exception handling behavior in `PyroGeoBlazor.Demo`.


## 7. Testing & Validation Strategy

Levels
1. Build Verification (automated)
   - Run `dotnet restore` and `dotnet build` for the solution.
   - Expected: 0 build errors.

2. Automated Tests (if present)
   - Discover and run test projects. (None were reported in the assessment; discover via `dotnet test` or test discovery tool if added.)

3. Runtime Validation (manual/automated)
   - Start the Blazor demo app and perform smoke checks of main pages and interactions:
     - Navigate to main pages and verify components render and interactivity works (clicks, forms, maps).
     - Verify client-side rendering/hydration for Blazor components.
     - Trigger a known error route or action to validate `UseExceptionHandler` behavior (exception path).

Validation Checklist (per solution)
- [ ] Solution builds without errors.
- [ ] All automated tests pass (if present).
- [ ] Exception handler behavior validated for Demo app via automated integration test and manual check.
- [ ] No warnings that indicate deprecated APIs in use.

Note on manual steps
- Manual runtime validation is recommended for the Blazor UI and exception handling scenarios. If integration automation exists, include it in Phase 2 validation.


## 8. Risk Management

Identified risks
- Behavioral change in exception handling (Demo) — Medium likelihood of requiring code tweak; Low overall project impact.
- Build regressions after package or framework changes — Low (packages compatible per assessment).
- Unanticipated runtime differences in Blazor lifecycle or middleware — Low, but requires manual verification.

Mitigations
- Keep changes atomic and in single commit to enable easy revert.
- Run full build and automated tests before PR.
- Add focused integration test for exception handling path in Demo.
- If blocking or high-impact issues are discovered, revert to pre-upgrade branch and investigate specifically.

Rollback plan
- If upgrade introduces critical regressions that cannot be resolved quickly, revert the branch by resetting or abandoning `upgrade-to-NET10-1` and reopening a new branch after addressing root causes.


## 9. Complexity & Effort Assessment

Per-project complexity (relative)
- `PyroGeoBlazor.Leaflet`: Low — class library, no API issues reported.
- `PyroGeoBlazor.Demo`: Low → Medium — small behavioral change to validate (exception handling), otherwise minor.

Overall classification: Simple solution (2 projects, depth 1). All-At-Once upgrade appropriate.


## 10. Source Control Strategy

Branching
- Upgrade branch created: `upgrade-to-NET10-1` (work will be done here).

Commit strategy
- Produce a single atomic commit that contains the following changed files (exact paths):
  - `PyroGeoBlazor.Demo\PyroGeoBlazor.Demo.csproj`
  - `PyroGeoBlazor.Leaflet\PyroGeoBlazor.Leaflet.csproj`
  - Any of: `Directory.Build.props`, `Directory.Build.targets`, `Directory.Packages.props` (if present and modified)
  - `PyroGeoBlazor.Demo\Program.cs` (if exception-handler code changes are required)

Pull request
- Open PR from `upgrade-to-NET10-1` to the source branch (`upgrade-to-NET10`).
- Include in PR description: list of projects migrated, package changes (if any), note about behavioral change and tests performed.

Review requirements
- Ensure at least one code review and CI build run before merging.


## 11. Success Criteria

The upgrade is complete when the following are met:
- All projects target `net10.0`.
- All package updates from assessment (none required) are applied or explicitly documented and approved.
- Solution builds with 0 errors.
- All automated tests pass (if any exist).
- Exception handling behavior validated for `PyroGeoBlazor.Demo`.
- No NuGet package security vulnerabilities remain (none reported by assessment).


## 12. Appendices & Next Steps

Immediate next actions for execution team (planning-only, do not execute here):
1. Validate .NET 10 SDK installed on CI/dev machines and update `global.json` if present.
2. Update CI pipelines to use .NET 10 SDK/runtime where applicable.
3. On branch `upgrade-to-NET10-1`:
   - Update `TargetFramework` to `net10.0` for both projects (`PyroGeoBlazor.Demo\PyroGeoBlazor.Demo.csproj`, `PyroGeoBlazor.Leaflet\PyroGeoBlazor.Leaflet.csproj`).
   - Inspect and update any imported MSBuild files if they pin SDK/framework versions (`Directory.Build.props`, `Directory.Build.targets`, `Directory.Packages.props`).
   - Update `Program.cs` if exception-handler changes are required.
   - Run `dotnet restore` and `dotnet build`.
   - If `dotnet restore` surfaces security vulnerabilities, choose explicit remediation versions and document them in the commit before merging.
   - Fix compilation issues and include fixes in the same atomic commit.
4. Run automated tests and perform Blazor runtime smoke tests, focusing on exception handling and component rendering.
5. Open PR with single atomic commit for review. Reference the task list at `.github/upgrades/tasks.md` in the PR description.

Notes and assumptions
- Assumes no hidden projects or external build scripts that were not present in the assessment.
- Assumes all package compatibility information in assessment remains valid at execution time.
- If new security vulnerabilities are discovered during restore, address them as part of this upgrade.

Contact
- If additional investigation is required (e.g., deeper runtime issues, third-party package problems), escalate to a subject-matter expert on ASP.NET Core/Blazor.

---
*Plan generated from assessment data in `.github/upgrades/assessment.md`. This document is planning-only and does not modify code or execute changes.*

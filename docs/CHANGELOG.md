# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).



## Table of contents

- [[Unreleased]](#unreleased)
- [[1.4.0] - 2026-08-04](#140---2026-08-04)
  - [Added](#added)
  - [Changed](#changed)
  - [Fixed](#fixed)
  - [Removed](#removed)
- [[1.3.0] - 2026-07-29](#130---2026-07-29)
  - [Added](#added-1)
  - [Changed](#changed-1)
- [[1.2.0] - 2026-07-16](#120---2026-07-16)
  - [Removed](#removed-1)
  - [Changed](#changed-2)
- [[1.1.1] - 2026-07-16](#111---2026-07-16)
  - [Added](#added-2)
  - [Changed](#changed-3)
- [[1.1.0] - 2026-07-09](#110---2026-07-09)
  - [Added](#added-3)
  - [Changed](#changed-4)
  - [Fixed](#fixed-1)
- [[1.0.2] - 2026-07-02](#102---2026-07-02)
  - [Added](#added-4)
  - [Changed](#changed-5)
  - [Fixed](#fixed-2)
- [[1.0.1] - 2026-04-15](#101---2026-04-15)
  - [Added](#added-5)
  - [Changed](#changed-6)
- [[1.0.0] - 2026-04-01](#100---2026-04-01)
  - [Added](#added-6)

## [Unreleased]

## [1.4.0] - 2026-08-04

### Added
- **REQ-TWIG-004:** require `twig/extra-bundle` + `twig/string-extra`; `make check-twig-extra` in `release-check`; demos register `TwigExtraBundle`.
- **Twig-CS-Fixer:** `vincentlanglet/twig-cs-fixer`, `.twig-cs-fixer.php`, `composer twig:lint` / `twig:fix`.

### Changed

### Fixed

### Removed

[1.4.0]: https://github.com/nowo-tech/OtpInputBundle/releases/tag/v1.4.0

## [1.3.0] - 2026-07-29

### Added

- Named Symfony asset package `nowo_otp_input` (`base_path` `/bundles/nowootpinput`) via DI `prepend` when FrameworkBundle is present.
- FrankenPHP worker-mode friendliness: README banner, `nowo-tech/phpstan-frankenphp` rulesets (classic + worker).
- Demo `FRANKENPHP_MODE` (`worker` / `classic`) with entrypoint switching; FrankenPHP PHP 8.5 demo image.
- `make demo-smoke` / `demo/Makefile` `release-verify` (HTTP smoke before teardown).
- `make coverage-check` (fail under 99% PHP coverage) and `make check-open-prs`.
- Dependabot npm ecosystem for Vite/TypeScript assets.
- Docs: asset package usage, Twig template overrides, translation overrides, demo mode switching.

### Changed

- README: declare FrankenPHP worker-mode friendly (replaces previous “not supported” note).
- CI / PHPUnit: `SYMFONY_DEPRECATIONS_HELPER=max[direct]=0`.
- Makefile: prefer Docker Compose V2; optional `-include` for monorepo `update-deps` helpers; `release-check` runs `check-open-prs` and `coverage-check`.
- PHP-CS-Fixer: `fully_qualified_strict_types.import_symbols`.

## [1.2.0] - 2026-07-16

### Removed

- Demo application `demo/symfony7` (Symfony 7). Use `demo/symfony8` instead.

### Changed

- Demo aggregate Makefile and [Demo notes](DEMO-FRANKENPHP.md): only `demo/symfony8` remains.
- Demo dependency lock / `config/reference.php` sync for `demo/symfony8`.

## [1.1.1] - 2026-07-16

### Added

- [Contributor Covenant Code of Conduct](../CODE_OF_CONDUCT.md).
- [GitHub Actions CI requirements](GITHUB_CI.md) documenting **REQ-GIT-001** (no Cursor co-author trailers).
- Git hooks (`.githooks/commit-msg`), Makefile targets (`setup-hooks`, `check-no-cursor-coauthor`, `strip-cursor-coauthor-from-history`), and CI job `git-hygiene`.
- Cursor rule `.cursor/rules/01-git-commits.mdc` (always apply).

### Changed

- `release-check` runs `check-no-cursor-coauthor` first.
- Contributing and Release docs: hook setup and post-tag hygiene notes.
- README: links to Code of Conduct and GitHub CI docs.
- Composer lock sync (bundle and demos).

## [1.1.0] - 2026-07-09

### Added

- Bundle translations for **German**, **French**, **Italian**, **Dutch**, and **Portuguese** (`NowoOtpInputBundle.{de,fr,it,nl,pt}.yaml`).
- [GitHub Spec Kit](SPEC-KIT.md) manual, baseline spec ([`specs/001-baseline/`](../../specs/001-baseline/)), Cursor Agent skills (`.cursor/skills/speckit-*`), and `.specify/` scaffolding.
- CodeRabbit integration (`.coderabbit.yaml`, `.github/workflows/coderabbit.yml`).

### Changed

- Spanish placeholder translation corrected (`Introduce el código OTP`).
- [Spec-driven development](SPEC-DRIVEN-DEVELOPMENT.md): user stories aligned with OTP product scope; Spec Kit layer and maintainer workflow.
- README: link to Spec Kit documentation.
- Demo Dockerfiles (`symfony7`, `symfony8`): install PHP `intl` extension for locale-aware demos.
- CI / release workflows: `codecov/codecov-action` v6, `softprops/action-gh-release` v3, `actions/github-script` v9.

### Fixed

## [1.0.2] - 2026-07-02

### Added

- Makefile `update-deps` at bundle root and `update-deps-all` / per-demo `update-deps` (REQ-MAKE-008) to update Composer dependencies in the bundle and demos.
- [Spec-driven development](SPEC-DRIVEN-DEVELOPMENT.md): product scope, user stories, and `REQ-*` traceability conventions.
- CI matrix entries for Symfony **7.4** and **8.1** (alongside 7.0 and 8.0).

### Changed

- `composer.json`: corrected `homepage` and `support` repository URLs.
- README: Symfony compatibility badge wording; link to spec-driven development doc.
- Demo **symfony7**: Symfony `require` `7.0.*` → `7.4.*` with dependency sync.
- Demo **symfony8**: Symfony `require` `8.0.*` → `8.1.*` with dependency sync.
- Dev toolchain bumps: Symfony polyfills (v1.35.0), `@types/node`, rebuilt `otp-input.js` (build timestamp only; no runtime behaviour change).

### Fixed

- Demo Makefiles (`symfony7`, `symfony8`): corrected `Makefile.demo-update-deps.mk` include (missing `)`), and set `COMPOSE` / `SERVICE_PHP` so `make update-deps` runs reliably.

## [1.0.1] - 2026-04-15

### Added

- GitHub Actions: semantic PR title check (`.github/workflows/pr-lint.yml`) and scheduled stale issue/PR handling (`.github/workflows/stale.yml`).
- `.github/copilot-instructions.md` with AI contribution guidelines for this bundle.

### Changed

- Dependabot: grouped updates for Symfony (`symfony/*`) and PHPStan (`phpstan/*`) packages.
- Demo Docker Compose (`demo/symfony7`, `demo/symfony8`): optional DNS servers (`8.8.8.8`, `8.8.4.4`) to reduce Composer DNS failures on Docker/WSL.
- Demo `translations/.gitignore`: ignore common archive extensions under demo translation dirs.

## [1.0.0] - 2026-04-01

First stable release of `OtpInputBundle`.

### Added

- `OtpType` form type with `OtpCodeToStringTransformer` mapping multiple visible inputs to one string value.
- Twig form themes for div, table, Bootstrap 3–5, Foundation 5–6, and Tailwind 2 layouts.
- TypeScript behavior in `src/Resources/assets` and built asset `src/Resources/public/otp-input.js`.
- Bundle configuration under `nowo_otp_input` (`length`, `numeric_only`, `uppercase`, `form_theme`).
- Symfony Flex recipe (`.symfony/recipe/nowo-tech/otp-input-bundle/1.0/`).
- Documentation: Installation, Configuration, Usage, Security, Contributing, Release, Engram, and demo notes.
- Demo applications under `demo/symfony7` and `demo/symfony8` (with `composer test` / `test-coverage` smoke scripts using `bin/console about`).
- PHPUnit and Vitest suites with high coverage; Makefile targets for QA (`release-check`, tests, CS, PHPStan, Rector).
- Makefile `validate-translations` target that parses translation YAML without requiring `bin/console` in the bundle root.
- Development Docker image: `git config safe.directory /app` so Composer does not hit “dubious ownership” on the mounted repo.
- README demo screenshot (`docs/images/otp-demo.png`).

[1.3.0]: https://github.com/nowo-tech/OtpInputBundle/releases/tag/v1.3.0
[1.2.0]: https://github.com/nowo-tech/OtpInputBundle/releases/tag/v1.2.0
[1.1.1]: https://github.com/nowo-tech/OtpInputBundle/releases/tag/v1.1.1
[1.1.0]: https://github.com/nowo-tech/OtpInputBundle/releases/tag/v1.1.0
[1.0.2]: https://github.com/nowo-tech/OtpInputBundle/releases/tag/v1.0.2
[1.0.1]: https://github.com/nowo-tech/OtpInputBundle/releases/tag/v1.0.1
[1.0.0]: https://github.com/nowo-tech/OtpInputBundle/releases/tag/v1.0.0

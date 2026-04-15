# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added

### Changed

### Fixed

### Removed

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

[1.0.1]: https://github.com/nowo-tech/OtpInputBundle/releases/tag/v1.0.1
[1.0.0]: https://github.com/nowo-tech/OtpInputBundle/releases/tag/v1.0.0

# Upgrading

This document describes upgrade notes for `OtpInputBundle`.

## Current compatibility baseline

- PHP: `>=8.1 <8.6`
- Symfony components: `^6.0 || ^7.0 || ^8.0`

## Public API reminders

- Main form type: `Nowo\OtpInputBundle\Form\OtpType`
- Root config key: `nowo_otp_input`
- Config options:
  - `length` (3..12, default `6`)
  - `numeric_only` (default `true`)
  - `uppercase` (default `true`)
  - `form_theme` (default `form_div_layout.html.twig`)

## 1.0.1 (2026-04-15)

Repository and demo tooling only (CI, Dependabot groups, Copilot guidelines, demo Docker DNS and translation ignores). The bundle API, configuration, and runtime behaviour are unchanged. Upgrade from `1.0.0` with no application code changes.

## 1.0.0 (2026-04-01)

Initial public release. There is no earlier tagged version to migrate from.

If you adopted code from an older scaffold that used another bundle name, ensure your app references `Nowo\OtpInputBundle\NowoOtpInputBundle`, `nowo_otp_input` configuration, and `OtpType` as described in [Installation](INSTALLATION.md) and [Configuration](CONFIGURATION.md).

## Breaking changes

No breaking changes are documented after `1.0.0`.

When a future release introduces BC breaks, this file will include:

- affected version
- old behavior vs new behavior
- migration steps

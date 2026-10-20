# Code inventory — 100% traceability

**Baseline spec**: [`spec.md`](spec.md)  
**Package**: `nowo-tech/otp-input-bundle`  
**Last audited**: 2026-10-20

This file proves that **every source artifact** under `src/` is referenced by the baseline specification. Co-located Vitest files enforce frontend contracts; PHPUnit covers PHP under `tests/`. FrankenPHP sticky-kernel guarantee: [`docs/FRANKENPHP-WORKER-AUDIT.md`](../../docs/FRANKENPHP-WORKER-AUDIT.md) (REQ-FP-001).

## PHP classes (`src/**/*.php`)

| Source file | Spec section | Requirement IDs |
| --- | --- | --- |
| `NowoOtpInputBundle.php` | Bundle entry | FR-BUNDLE-001 |
| `DependencyInjection/Configuration.php` | Config tree | FR-CFG-001 |
| `DependencyInjection/NowoOtpInputExtension.php` | DI extension | FR-CFG-002 |
| `DependencyInjection/Compiler/TwigPathsPass.php` | Twig namespace | FR-TWIG-001 |
| `Form/OtpType.php` | OTP form type | FR-FORM-001 |
| `Form/DataTransformer/OtpCodeToStringTransformer.php` | Model/view transform | FR-XFORM-001 |

## TypeScript production (`src/Resources/assets/src/`)

| Source file | Spec section | Requirement IDs |
| --- | --- | --- |
| `otp-input.ts` | Standalone IIFE entry (multi-digit widget init) | FR-UI-001, FR-LEGACY-001 |
| `otp-input-lib.ts` | Shared OTP library: digit inputs ↔ hidden field sync, paste, sanitizing, events | FR-UI-001 |
| `nowo-otp-input-element.ts` | Autonomous custom element `<nowo-otp-input>` used by the default theme | FR-UI-003 |
| `logger.ts` | Debug logging | FR-UI-002 |

## Vitest co-located (`src/Resources/assets/src/`)

| Source file | Spec section | Requirement IDs |
| --- | --- | --- |
| `otp-input.test.ts` | Widget contract tests | FR-UI-001 |
| `otp-input-lib.test.ts` | Library contract tests | FR-UI-001 |
| `nowo-otp-input-element.test.ts` | Custom element tests | FR-UI-003 |

## Legacy JavaScript (`src/Resources/public/`)

| Source file | Spec section | Requirement IDs |
| --- | --- | --- |
| `Resources/public/otp-input.js` | Pre-built IIFE fallback | FR-LEGACY-001 |

## Symfony config (`src/Resources/config/`)

| Source file | Spec section | Requirement IDs |
| --- | --- | --- |
| `Resources/config/services.yaml` | Service wiring | FR-DI-001 |

## Twig form themes (`src/Resources/views/Form/`)

| Source file | Spec section | Requirement IDs |
| --- | --- | --- |
| `otp_input_theme.html.twig` | Default div layout | FR-TWIG-002 |
| `otp_input_theme_bootstrap3.html.twig` | Bootstrap 3 | FR-TWIG-003 |
| `otp_input_theme_bootstrap3_horizontal.html.twig` | Bootstrap 3 horizontal | FR-TWIG-003 |
| `otp_input_theme_bootstrap4.html.twig` | Bootstrap 4 | FR-TWIG-003 |
| `otp_input_theme_bootstrap4_horizontal.html.twig` | Bootstrap 4 horizontal | FR-TWIG-003 |
| `otp_input_theme_bootstrap5.html.twig` | Bootstrap 5 | FR-TWIG-003 |
| `otp_input_theme_bootstrap5_horizontal.html.twig` | Bootstrap 5 horizontal | FR-TWIG-003 |
| `otp_input_theme_foundation5.html.twig` | Foundation 5 | FR-TWIG-004 |
| `otp_input_theme_foundation6.html.twig` | Foundation 6 | FR-TWIG-004 |
| `otp_input_theme_table.html.twig` | Table layout | FR-TWIG-005 |
| `otp_input_theme_tailwind2.html.twig` | Tailwind 2 | FR-TWIG-006 |

## Translations (`src/Resources/translations/`)

| Source file | Spec section | Requirement IDs |
| --- | --- | --- |
| `NowoOtpInputBundle.en.yaml` | i18n | FR-I18N-001 |
| `NowoOtpInputBundle.es.yaml` | i18n | FR-I18N-001 |
| `NowoOtpInputBundle.de.yaml` | i18n | FR-I18N-001 |
| `NowoOtpInputBundle.fr.yaml` | i18n | FR-I18N-001 |
| `NowoOtpInputBundle.it.yaml` | i18n | FR-I18N-001 |
| `NowoOtpInputBundle.nl.yaml` | i18n | FR-I18N-001 |
| `NowoOtpInputBundle.pt.yaml` | i18n | FR-I18N-001 |

## Coverage summary

| Category | Files | Mapped |
| --- | ---: | ---: |
| PHP classes | 6 | 6 |
| TypeScript production | 4 | 4 |
| Vitest co-located | 3 | 3 |
| Legacy JavaScript | 1 | 1 |
| Symfony config | 1 | 1 |
| Twig form themes | 11 | 11 |
| Translations | 7 | 7 |
| **Total production sources** | **33** | **33** |

Audit command (production count): `git ls-files src | wc -l` → **33** (2026-10-20; co-located Vitest files are counted in their own category).

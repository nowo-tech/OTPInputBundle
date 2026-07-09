# Feature Specification: OtpInputBundle baseline (100% code coverage)

**Feature Branch**: `001-baseline`  
**Created**: 2026-07-07  
**Status**: Active  
**Input**: Backfill GitHub Spec Kit baseline documenting 100% of production code in `src/`.

**Related docs**: [`docs/SPEC-DRIVEN-DEVELOPMENT.md`](../../docs/SPEC-DRIVEN-DEVELOPMENT.md), [`docs/CONFIGURATION.md`](../../docs/CONFIGURATION.md), [`docs/USAGE.md`](../../docs/USAGE.md)  
**Code inventory (traceability)**: [`code-inventory.md`](code-inventory.md)

---

## Summary

**Package**: `nowo-tech/otp-input-bundle`  
**Configuration root**: `nowo_otp_input`

Symfony `OtpType` form field rendering multiple single-character inputs synchronized to one hidden model value, with paste/autofill support, numeric or alphanumeric modes, and multi-framework Twig themes.

---

## User Scenarios & Testing

### User Story 1 — Multi-box OTP entry (Priority: P1)

As a form author, I use `OtpType` so users enter one-time codes in separate boxes while Symfony receives a single string value.

**Independent Test**: Render 6-digit OTP field → type digits → hidden input value becomes concatenated string; form submits standard string.

**Acceptance Scenarios**:

1. **Given** `length=6`, **When** widget renders, **Then** six digit inputs plus hidden field with `data-controller="nowo-otp-input"` appear.
2. **Given** user types in box N, **When** character entered, **Then** focus advances to N+1 and hidden value updates.
3. **Given** form submitted, **When** model bound, **Then** `OtpCodeToStringTransformer::reverseTransform` returns normalized string.

---

### User Story 2 — Paste and autofill (Priority: P1)

As a user on mobile or desktop, I paste a full code and all boxes fill correctly.

**Acceptance Scenarios**:

1. **Given** user pastes `123456` into any box, **When** paste handled, **Then** digits distribute across inputs and hidden field emits `input`/`change` events.
2. **Given** pasted content includes spaces/dashes, **When** sanitized, **Then** non-code characters stripped before fill.
3. **Given** paste shorter than length, **When** applied, **Then** only available positions filled and focus moves to last filled index.

---

### User Story 3 — Configure length and charset (Priority: P2)

As an integrator, I configure global defaults and per-field overrides for length, numeric-only, and uppercase normalization.

**Acceptance Scenarios**:

1. **Given** `numeric_only=true`, **When** user types letters, **Then** input rejected client- and server-side.
2. **Given** `uppercase=true` and alphanumeric mode, **When** lowercase entered, **Then** transformed to uppercase in view and model.
3. **Given** `length` outside 3–12, **When** form options validated, **Then** `OptionsResolver` rejects invalid value.

---

### User Story 4 — Multi-framework themes (Priority: P3)

As an integrator, I pick a Twig form theme matching Bootstrap, Foundation, Tailwind, or table layouts.

**Acceptance Scenarios**:

1. **Given** `form_theme` in bundle config, **When** matches app themes, **Then** correct OTP markup block renders digit grid and gap separators.
2. **Given** custom `container_class`, `input_class`, `gap_class`, **When** set on field, **Then** passed to Twig vars for styling hooks.

---

### Edge Cases

- Backspace on empty box: focus moves to previous digit.
- Disabled field: all digit inputs respect `otp_disabled` var.
- Empty submission: transformer returns empty string (required validation handled by Symfony).
- Hidden field missing or zero digit inputs: JS logs warning and skips init (graceful no-op).

---

## Requirements

### Bundle & DI

- **FR-BUNDLE-001**: `NowoOtpInputBundle` MUST register `TwigPathsPass` and expose alias `nowo_otp_input`.
- **FR-DI-001**: `services.yaml` MUST wire `OtpType` with default length/charset parameters from config.
- **FR-CFG-001**: `Configuration` MUST define: `length` (3–12, default 6), `numeric_only` (default true), `uppercase` (default true), `form_theme`.
- **FR-CFG-002**: Extension MUST load services, inject config defaults into form type, and register Twig paths.
- **FR-TWIG-001**: `TwigPathsPass` MUST add bundle views namespace for theme overrides.

### Form type & transformer

- **FR-FORM-001**: `OtpType` MUST extend `TextType`, add `OtpCodeToStringTransformer`, expose OTP vars (`otp_length`, `otp_digits`, classes, autofocus), and set Stimulus-style `data-nowo-otp-input-*` values on hidden input.
- **FR-XFORM-001**: `OtpCodeToStringTransformer` MUST convert model string ↔ view char array, normalize charset (numeric/alphanumeric), uppercase when enabled, and truncate to configured length.

### Frontend (TypeScript)

- **FR-UI-001**: `otp-input.ts` MUST initialize per container: sync digit inputs with hidden field, handle input/backspace/paste, sanitize chars, dispatch bubbling events, and support autofocus.
- **FR-UI-002**: `logger.ts` MUST provide namespaced debug logger with build-time metadata.
- **FR-LEGACY-001**: Committed `otp-input.js` MUST remain loadable without Vite build for downstream consumers.

### Twig themes

- **FR-TWIG-002**: Base `otp_input_theme.html.twig` MUST render hidden input, digit grid, gap elements, and load JS asset.
- **FR-TWIG-003**: Bootstrap 3/4/5 (+ horizontal) themes MUST wrap OTP grid with framework form markup.
- **FR-TWIG-004**: Foundation 5/6 themes MUST align with foundation form patterns.
- **FR-TWIG-005**: Table theme MUST render OTP row in table layout.
- **FR-TWIG-006**: Tailwind 2 theme MUST expose utility-class hooks for digit inputs and gaps.

### Internationalization

- **FR-I18N-001**: Translation YAML files MUST provide accessible labels and validation messages for shipped locales under domain `NowoOtpInputBundle`.

---

## Success Criteria

- **SC-001**: **29/29** files under `src/` mapped in [`code-inventory.md`](code-inventory.md).
- **SC-002**: Config keys match `Configuration.php` and `docs/CONFIGURATION.md`.
- **SC-003**: PHPUnit + PHPStan + Vitest pass (`composer qa`, `make test-ts`).
- **SC-004**: Pasted codes fill all boxes and produce correct hidden value in browser tests.
- **SC-005**: Model always receives normalized string independent of visual box count.

---

## Configuration reference (normative defaults)

| Key | Default | Behavior |
| --- | --- | --- |
| `length` | `6` | Number of digit boxes (3–12) |
| `numeric_only` | `true` | Digits 0–9 only |
| `uppercase` | `true` | Uppercase alphanumeric when not numeric-only |
| `form_theme` | `form_div_layout.html.twig` | Must match app Twig form themes |

Per-field options (`container_class`, `input_class`, `gap_class`, `autofocus`, `placeholder_char`) are defined on `OtpType` — see `docs/USAGE.md`.

---

## Explicit non-goals

- OTP generation, delivery (SMS/email), or TOTP algorithm.
- Server-side OTP verification logic (application responsibility).
- Rate limiting or brute-force protection.
- Demo-only behavior unless documented as stable API.

---

## Validation

| Check | Command |
| --- | --- |
| Full QA | `composer qa` or `make release-check` |
| PHP tests | `vendor/bin/phpunit` |
| TS tests | `make test-ts` |
| Code inventory | `find src -type f \| wc -l` equals inventory total |

When changing behavior, update this spec, `code-inventory.md`, tests, and integrator docs.

# Configuration

## Table of contents

- [YAML](#yaml)
- [form_theme](#form_theme)
- [Translations](#translations)
- [Translation overrides](#translation-overrides)

## YAML

```yaml
# config/packages/nowo_otp_input.yaml
nowo_otp_input:
  length: 6
  numeric_only: true
  uppercase: true
  form_theme: 'bootstrap_5_layout.html.twig'
```

## form_theme

Supported values:

- `form_div_layout.html.twig`
- `form_table_layout.html.twig`
- `bootstrap_5_layout.html.twig`
- `bootstrap_5_horizontal_layout.html.twig`
- `bootstrap_4_layout.html.twig`
- `bootstrap_4_horizontal_layout.html.twig`
- `bootstrap_3_layout.html.twig`
- `bootstrap_3_horizontal_layout.html.twig`
- `foundation_5_layout.html.twig`
- `foundation_6_layout.html.twig`
- `tailwind_2_layout.html.twig`

## Translations

The bundle ships placeholder strings under `src/Resources/translations/` for:

- `en`, `es`, `de`, `fr`, `it`, `nl`, `pt`

Symfony loads them from the `NowoOtpInputBundle` domain when the Translator component is enabled in your application. No extra bundle configuration is required.

## Translation overrides

To override catalogue entries in the host application:

1. Use the same domain: **`NowoOtpInputBundle`**.
2. Create an app file such as `translations/NowoOtpInputBundle.es.yaml` (or `.xlf`).
3. Override only the keys you need. Missing keys fall back to the bundle catalogue.

Example:

```yaml
# translations/NowoOtpInputBundle.es.yaml
otp.placeholder: 'Tu código'
```

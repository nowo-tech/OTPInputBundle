# Usage

## Table of contents

- [Form type](#form-type)
- [Frontend script](#frontend-script)
- [Customization](#customization)
- [Twig template overrides](#twig-template-overrides)

## Form type

Use `OtpType` in any Symfony form:

```php
use Nowo\OtpInputBundle\Form\OtpType;

$builder->add('otpCode', OtpType::class, [
    'length' => 6,
    'numeric_only' => true,
    'uppercase' => true,
    'container_class' => 'd-flex gap-2',
    'input_class' => 'form-control text-center',
    'gap_class' => 'otp-input-grid',
    'placeholder_char' => '•',
]);
```

The field value is a single string, for example `123456`.

## Frontend script

Include the built OTP script in your layout (after `assets:install`):

```twig
<script src="{{ asset('otp-input.js', 'nowo_otp_input') }}"></script>
```

The `nowo_otp_input` package maps to `/bundles/nowootpinput` (the path created by `assets:install`).

## Customization

- `length`: number of OTP characters (3-12)
- `numeric_only`: only digits when true
- `uppercase`: normalize alpha chars to uppercase
- `container_class`, `input_class`, `gap_class`: full CSS control
- `autofocus`: autofocus first OTP digit

## Twig template overrides

The bundle registers its Twig views so that `@NowoOtpInputBundle/...` works, and it adds its view path **after** the application paths. Overrides under **`templates/bundles/NowoOtpInputBundle/`** are therefore checked first. Place a file there with the **same relative path** as in the bundle; Twig will use your template instead of the bundle’s.

Use the directory name **`NowoOtpInputBundle`** (matches `Bundle::getName()`).

| Bundle path under `src/Resources/views/` | Application override |
| ---------------------------------------- | -------------------- |
| `Form/otp_input_theme.html.twig` | `templates/bundles/NowoOtpInputBundle/Form/otp_input_theme.html.twig` |
| `Form/otp_input_theme_table.html.twig` | `templates/bundles/NowoOtpInputBundle/Form/otp_input_theme_table.html.twig` |
| `Form/otp_input_theme_bootstrap5.html.twig` | `templates/bundles/NowoOtpInputBundle/Form/otp_input_theme_bootstrap5.html.twig` |
| `Form/otp_input_theme_bootstrap5_horizontal.html.twig` | `templates/bundles/NowoOtpInputBundle/Form/otp_input_theme_bootstrap5_horizontal.html.twig` |
| `Form/otp_input_theme_bootstrap4.html.twig` | `templates/bundles/NowoOtpInputBundle/Form/otp_input_theme_bootstrap4.html.twig` |
| `Form/otp_input_theme_bootstrap4_horizontal.html.twig` | `templates/bundles/NowoOtpInputBundle/Form/otp_input_theme_bootstrap4_horizontal.html.twig` |
| `Form/otp_input_theme_bootstrap3.html.twig` | `templates/bundles/NowoOtpInputBundle/Form/otp_input_theme_bootstrap3.html.twig` |
| `Form/otp_input_theme_bootstrap3_horizontal.html.twig` | `templates/bundles/NowoOtpInputBundle/Form/otp_input_theme_bootstrap3_horizontal.html.twig` |
| `Form/otp_input_theme_foundation5.html.twig` | `templates/bundles/NowoOtpInputBundle/Form/otp_input_theme_foundation5.html.twig` |
| `Form/otp_input_theme_foundation6.html.twig` | `templates/bundles/NowoOtpInputBundle/Form/otp_input_theme_foundation6.html.twig` |
| `Form/otp_input_theme_tailwind2.html.twig` | `templates/bundles/NowoOtpInputBundle/Form/otp_input_theme_tailwind2.html.twig` |

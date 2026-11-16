# Usage

## Screenshots

| Overview | Interaction |
|----------|-------------|
| ![Empty 6-digit OTP input cells](images/demo/overview.webp) | ![OTP cells filled with a verification code](images/demo/interaction.webp) |

Regenerate with `make -C demo/symfony8 demo-screenshots` (REQ-DEMO-013).


## Table of contents

- [Screenshots](#screenshots)

- [Form type](#form-type)
- [Frontend script](#frontend-script)
- [Without JavaScript (progressive enhancement)](#without-javascript-progressive-enhancement)
- [Customization](#customization)
- [Using it from a DDD / hexagonal application](#using-it-from-a-ddd--hexagonal-application)
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

`placeholder_char` (default `''`) is rendered as the `placeholder` attribute of every box.

Autofill: the no-JS field and the first box have `autocomplete="one-time-code"` (the first box has no `maxlength`), so iOS/Android SMS code suggestions fill the whole code; the script then spreads it across all boxes. Custom themes that override `nowo_otp_input_widget` should keep this pattern.

## Frontend script

Include the built OTP script in your layout (after `assets:install`):

```twig
<script src="{{ asset('otp-input.js', 'nowo_otp_input') }}"></script>
```

The `nowo_otp_input` package maps to `/bundles/nowootpinput` (the path created by `assets:install`).

The script defines the `<nowo-otp-input>` custom element (light DOM: the Symfony input + the digit boxes) and still initializes legacy `[data-nowo-otp-container="1"]` wrappers. Load it early (in `<head>` with `defer`): it reduces the flash of the no-JS field before the boxes replace it.

## Without JavaScript (progressive enhancement)

Since 1.9.0 the field works with JavaScript disabled or when the script fails to load:

| | Server-rendered (no JS) | After `otp-input.js` runs |
| --- | --- | --- |
| Named field (`name`/`id` of the form field) | visible `<input type="text">`, `inputmode`, `autocomplete="one-time-code"`, `maxlength` = 2 × `length`, class `nowo-otp-input__fallback` | `type="hidden"`, value kept in sync with the boxes |
| Digit boxes | in a `role="group"` inside a class-less `<div data-nowo-otp-boxes="1" hidden>`, no `name` | visible; the label points at the first box, the group is labelled by the field label |
| Host `<nowo-otp-input>` | no `data-nowo-otp-init` | `data-nowo-otp-init="1"` |

- One visible label (the form label, `for` the field). Help text and errors are linked with `aria-describedby`, and
  `aria-invalid` is set, on the field and on the boxes. Each box has a translated `aria-label`
  (`otp.digit_label`, "Character 1 of 6"); the group falls back to `otp.placeholder`. Both always use the
  `NowoOtpInputBundle` domain, whatever `translation_domain` the field has.
- With JavaScript on, only the boxes are focusable: the hidden field is out of the focus order and the accessibility
  tree.
- The fallback field is rendered by your form theme's own text widget (`form-control`, `nowo-ui-input`, …): no raw
  `<input>` is needed in your templates (REQ-TWIG-005). `attr` you pass to the field goes to it and wins over the
  defaults.
- The server normalizes what is typed (spaces, dashes and other separators are dropped, letters uppercased with
  `uppercase: true`) and keeps `length` characters, so `123 456` or `123-456` typed without JavaScript submits
  `123456`. The field's `maxlength` is 2 × `length` to leave room for separators; set `attr: {maxlength: ...}` to
  change it.
- Validate on the server: the field does not reject a short or empty code by itself, and `required` has no effect
  once the field is `type="hidden"`. Add `NotBlank` and `Length(exactly: <length>)` to the host form or DTO.
- If your theme's text widget wraps the `<input>` (input group, floating label, …), the wrapper stays in the page after
  the script hides the field; style it with `nowo-otp-input[data-nowo-otp-init] …` if it shows borders or spacing.
- Showing and hiding use the `hidden` attribute and the input type only (no stylesheet rule), so CSS frameworks that
  put `[hidden]` in a cascade layer (Tailwind v4) or give `gap_class` a `display` value do not change the behaviour.
- **Stable CSS hook:** `data-nowo-otp-init="1"` on the host means "enhanced". Themes that need to hide something until
  then can rely on it, e.g. `nowo-otp-input:not([data-nowo-otp-init]) [data-nowo-otp-boxes] { display: none; }`.
- No inline script or style is added; the CSP rules are the same as before (load `otp-input.js` with your nonce if
  your policy requires one).

## Customization

- `length`: number of OTP characters (3-12)
- `numeric_only`: only digits when true
- `uppercase`: normalize alpha chars to uppercase
- `container_class`, `input_class`, `gap_class`: full CSS control
- `autofocus`: autofocus the field (no JS) / the first empty box (JS)

## Using it from a DDD / hexagonal application

`OtpType` is a **presentation** component: a form field that renders N boxes and submits one normalized string. It has
no entities, no Doctrine mapping, no events, and it does not generate, send or verify codes. Your domain never
depends on the bundle.

- Bind the field to a string property of your form DTO or command (for example `VerifyLoginCode::$code`); the value is
  digits only (or `A-Z0-9` with `numeric_only: false`), uppercased with `uppercase: true`, and at most `length`
  characters.
- Generating, storing, rate-limiting and verifying the code stays in your application/domain (or in your 2FA library).
- The bundle does not enforce the minimum length: add the constraint on your DTO.

```php
use Symfony\Component\Validator\Constraints as Assert;

final class VerifyLoginCode
{
    #[Assert\NotBlank]
    #[Assert\Length(exactly: 6)]
    public string $code = '';
}
```

If you want a domain value object instead of a string, add your own model transformer to the field; it runs after the
bundle's one:

```php
$builder->add('code', OtpType::class, ['length' => 6]);
$builder->get('code')->addModelTransformer(new CallbackTransformer(
    static fn (?OneTimeCode $code): string => $code?->value() ?? '',
    static fn (string $code): ?OneTimeCode => '' === $code ? null : new OneTimeCode($code),
));
```

Known limitations: a code shorter than `length` is not rejected by the field itself.

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

Each file is the form theme for one CSS framework (`otp_input_theme.html.twig` is the framework-neutral default used by `OtpType`; `_table`, `_bootstrap*`, `_foundation*`, `_tailwind2` mirror Symfony's own form themes).

Procedure: copy the vendor file to the override path above (same relative path and filename), clear the cache in dev (`php bin/console cache:clear`), and treat the copy as a fork.

**Override vs upgrade (freeze rule).** An application file at the override path always wins and will not pick up vendor changes for that path until removed or merged. A full-file override is an escape hatch: that `<subpath>` stays frozen on every `composer update` while the rest of the bundle keeps upgrading.

Prefer the upgrade-safe path: the field options (`container_class`, `input_class`, `gap_class`, `length`, `numeric_only`, …), the translations and CSS on the `nowo-otp-*` classes cover most needs without a Twig fork. If you only need different markup for one framework, override that single theme file, not all of them.

**Recovering upstream after a freeze:** delete (or rename aside) the application override, clear the cache (`php bin/console cache:clear`), and re-apply only the customisation you still need. Diff your copy against the new vendor file under `vendor/nowo-tech/otp-input-bundle/src/Resources/views/` before re-copying.


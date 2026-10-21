# OTP Input Bundle

[![CI](https://github.com/nowo-tech/OTPInputBundle/actions/workflows/ci.yml/badge.svg)](https://github.com/nowo-tech/OTPInputBundle/actions/workflows/ci.yml) [![Packagist Version](https://img.shields.io/packagist/v/nowo-tech/otp-input-bundle.svg?style=flat)](https://packagist.org/packages/nowo-tech/otp-input-bundle) [![Packagist Downloads](https://img.shields.io/packagist/dt/nowo-tech/otp-input-bundle.svg)](https://packagist.org/packages/nowo-tech/otp-input-bundle) [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE) [![PHP](https://img.shields.io/badge/PHP-8.2%2B-777BB4?logo=php)](https://php.net) [![Symfony](https://img.shields.io/badge/Symfony-6.4%2B%20%7C%207.4%2B%20%7C%208.0%20%7C%208.1%2B-000000?logo=symfony)](https://symfony.com) [![GitHub stars](https://img.shields.io/github/stars/nowo-tech/otp-input-bundle.svg?style=social&label=Star)](https://github.com/nowo-tech/OTPInputBundle) [![Coverage](https://img.shields.io/badge/Coverage-100%25-brightgreen)](#tests-and-coverage)

> Star **Found this useful?** Install it from Packagist and support the project on GitHub.

Customizable Symfony OTP `FormType` with multiple visible inputs that map to a single field value.

![FrankenPHP Friendly Worker Mode](docs/images/frankenphp-friendly.png)

This bundle is **FrankenPHP worker mode friendly**.

## Table of contents

- [Features](#features)
- [Quick usage](#quick-usage)
- [Demo preview](#demo-preview)
- [Documentation](#documentation)
- [Tests and coverage](#tests-and-coverage)

## Features

- `OtpType::class` for verification codes (2FA, email confirmation, magic code).
- Multi-input UI rendered in Twig form themes.
- Stores data as one string value in your DTO/entity.
- Customizable length, classes, numeric/alphanumeric mode, and uppercase normalization.
- TypeScript + Vite assets in `src/Resources/assets` (named package `nowo_otp_input`).
- Paste / SMS autofill (`autocomplete="one-time-code"` on the first box); translations **de, en, es, fr, it, nl, pt**.
- Multi-framework Twig themes (Bootstrap, Tailwind, Foundation, Symfony default).
- FrankenPHP worker mode verified with `FRANKENPHP_RESET_KERNEL=false` (sticky Kernel); see the [worker audit](docs/FRANKENPHP-WORKER-AUDIT.md).

## Quick usage

```php
use Nowo\OtpInputBundle\Form\OtpType;

$builder->add('otpCode', OtpType::class, [
    'length' => 6,
    'numeric_only' => true,
    'container_class' => 'd-flex gap-2',
    'input_class' => 'form-control text-center',
    'gap_class' => 'otp-grid',
]);
```

The value received in `otpCode` is a single string like `123456`.

## Demo preview

<table>
  <tr>
    <td align="center" width="50%">
      <img src="docs/images/demo/overview.webp" alt="Empty 6-digit OTP input cells" />
      <br /><sub>Empty OTP digit cells</sub>
    </td>
    <td align="center" width="50%">
      <img src="docs/images/demo/interaction.webp" alt="OTP cells filled with a verification code" />
      <br /><sub>Code entered across digit cells</sub>
    </td>
  </tr>
</table>

## Documentation

- [Installation](docs/INSTALLATION.md)
- [Configuration](docs/CONFIGURATION.md)
- [Usage](docs/USAGE.md)
- [Contributing](docs/CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Changelog](docs/CHANGELOG.md)
- [Upgrading](docs/UPGRADING.md)
- [Release](docs/RELEASE.md)
- [Security](docs/SECURITY.md)
- [Engram](docs/ENGRAM.md)
- [Spec-driven development](docs/SPEC-DRIVEN-DEVELOPMENT.md)
- [GitHub Spec Kit](docs/SPEC-KIT.md)

### Additional documentation

- [GitHub Actions CI requirements](docs/GITHUB_CI.md)
- [PSR evaluation (REQ-CS-007)](docs/PSR.md)
- [FrankenPHP worker audit (`reset_kernel: false`)](docs/FRANKENPHP-WORKER-AUDIT.md)
- [Demo notes](docs/DEMO-FRANKENPHP.md)

## Tests and coverage

- PHP: 100%
- TS/JS: 97.33% (Vitest; lowest of statements/branches/functions/lines — lines 100%, branches 97.33%; CI gate 90%)
- Python: N/A

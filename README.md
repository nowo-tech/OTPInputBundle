# OTP Input Bundle
[![CI](https://github.com/nowo-tech/OtpInputBundle/actions/workflows/ci.yml/badge.svg)](https://github.com/nowo-tech/OtpInputBundle/actions/workflows/ci.yml)
[![Packagist Version](https://img.shields.io/packagist/v/nowo-tech/otp-input-bundle.svg?style=flat)](https://packagist.org/packages/nowo-tech/otp-input-bundle)
[![Packagist Downloads](https://img.shields.io/packagist/dt/nowo-tech/otp-input-bundle.svg)](https://packagist.org/packages/nowo-tech/otp-input-bundle)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PHP](https://img.shields.io/badge/PHP-8.1%2B-777BB4?logo=php)](https://php.net)
[![Symfony](https://img.shields.io/badge/Symfony-6%20%7C%207%20%7C%208-000000?logo=symfony)](https://symfony.com)
[![GitHub stars](https://img.shields.io/github/stars/nowo-tech/otp-input-bundle.svg?style=social&label=Star)](https://github.com/nowo-tech/OtpInputBundle)
[![Coverage](https://img.shields.io/badge/Coverage-100%25-brightgreen)](#tests-and-coverage)

> Star **Found this useful?** Install it from Packagist and support the project on GitHub.

Customizable Symfony OTP `FormType` with multiple visible inputs that map to a single field value.

FrankenPHP worker mode: Not declared as supported for this bundle at the moment.

## Demo preview

![OTP Input Bundle demo](docs/images/otp-demo.png)

## Features

- `OtpType::class` for verification codes (2FA, email confirmation, magic code).
- Multi-input UI rendered in Twig form themes.
- Stores data as one string value in your DTO/entity.
- Customizable length, classes, numeric/alphanumeric mode, and uppercase normalization.
- TypeScript + Vite assets in `src/Resources/assets`.

## Documentation

- [Installation](docs/INSTALLATION.md)
- [Configuration](docs/CONFIGURATION.md)
- [Usage](docs/USAGE.md)
- [Contributing](docs/CONTRIBUTING.md)
- [Changelog](docs/CHANGELOG.md)
- [Upgrading](docs/UPGRADING.md)
- [Release](docs/RELEASE.md)
- [Security](docs/SECURITY.md)
- [Engram](docs/ENGRAM.md)

### Additional documentation

- [Demo notes](docs/DEMO-FRANKENPHP.md)

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

## Tests and coverage

- PHP: 100%
- TS/JS: 100%
- Python: N/A

# Installation

```bash
composer require nowo-tech/otp-input-bundle
```

Enable bundle if Flex does not do it automatically:

```php
return [
    Nowo\OtpInputBundle\NowoOtpInputBundle::class => ['all' => true],
];
```

The bundle ships a built script at `src/Resources/public/otp-input.js`. After `composer require`, install assets in your app:

```bash
php bin/console assets:install
```

This publishes files to `public/bundles/nowootpinput/`. The bundle also registers a named Symfony asset package (`nowo_otp_input`), so templates should load the script via that package instead of hard-coding the public path:

```twig
<script src="{{ asset('otp-input.js', 'nowo_otp_input') }}"></script>
```

To rebuild TypeScript from this repository (contributors / custom builds):

```bash
pnpm install
pnpm run build
php bin/console assets:install
```

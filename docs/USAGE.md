# Usage

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

## Customization

- `length`: number of OTP characters (3-12)
- `numeric_only`: only digits when true
- `uppercase`: normalize alpha chars to uppercase
- `container_class`, `input_class`, `gap_class`: full CSS control
- `autofocus`: autofocus first OTP digit

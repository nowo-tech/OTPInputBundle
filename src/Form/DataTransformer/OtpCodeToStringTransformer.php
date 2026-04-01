<?php

declare(strict_types=1);

namespace Nowo\OtpInputBundle\Form\DataTransformer;

use Symfony\Component\Form\DataTransformerInterface;

use function is_array;
use function is_string;
use function preg_replace;
use function str_split;
use function strlen;
use function strtoupper;
use function substr;

/**
 * Normalizes OTP data between model (string) and view (array of chars).
 *
 * @implements DataTransformerInterface<string, array<int, string>>
 */
final class OtpCodeToStringTransformer implements DataTransformerInterface
{
    public function __construct(
        private readonly int $length,
        private readonly bool $numericOnly = true,
        private readonly bool $uppercase = true,
    ) {
    }

    /**
     * @param string|null $value
     *
     * @return array<int, string>
     */
    public function transform(mixed $value): array
    {
        if (!is_string($value) || $value === '') {
            return [];
        }

        $normalized = $this->normalizeOtp($value);

        return str_split($normalized);
    }

    /**
     * @param array<int, string>|string|null $value
     */
    public function reverseTransform(mixed $value): string
    {
        if (is_array($value)) {
            $value = implode('', $value);
        }

        if (!is_string($value) || $value === '') {
            return '';
        }

        return $this->normalizeOtp($value);
    }

    private function normalizeOtp(string $value): string
    {
        $value = trim($value);
        $value = $this->numericOnly
            ? (string) preg_replace('/[^0-9]/', '', $value)
            : (string) preg_replace('/[^a-zA-Z0-9]/', '', $value);

        if ($this->uppercase) {
            $value = strtoupper($value);
        }

        if (strlen($value) > $this->length) {
            return substr($value, 0, $this->length);
        }

        return $value;
    }
}

<?php

declare(strict_types=1);

namespace Nowo\OtpInputBundle\Tests\Unit;

use Nowo\OtpInputBundle\DependencyInjection\Compiler\TwigPathsPass;
use Nowo\OtpInputBundle\Form\DataTransformer\OtpCodeToStringTransformer;
use Nowo\OtpInputBundle\NowoOtpInputBundle;
use PHPUnit\Framework\TestCase;
use Symfony\Component\DependencyInjection\ContainerBuilder;

/**
 * @covers \Nowo\OtpInputBundle\NowoOtpInputBundle
 * @covers \Nowo\OtpInputBundle\Form\DataTransformer\OtpCodeToStringTransformer
 */
final class NowoOtpInputBundleTest extends TestCase
{
    public function testBundleRegistersTwigCompilerPass(): void
    {
        $bundle    = new NowoOtpInputBundle();
        $container = new ContainerBuilder();
        $bundle->build($container);

        $passes = $container->getCompilerPassConfig()->getPasses();
        $found  = false;
        foreach ($passes as $pass) {
            if ($pass instanceof TwigPathsPass) {
                $found = true;
                break;
            }
        }

        self::assertTrue($found);
    }

    public function testTransformerNormalizesAndSplitsOtp(): void
    {
        $transformer = new OtpCodeToStringTransformer(6, true, true);

        self::assertSame('123456', $transformer->reverseTransform('12-34 56XX'));
        self::assertSame(['1', '2', '3', '4', '5', '6'], $transformer->transform('123456'));
    }

    public function testTransformerAlphanumericMode(): void
    {
        $transformer = new OtpCodeToStringTransformer(4, false, true);

        self::assertSame('AB12', $transformer->reverseTransform('ab-12'));
    }

    public function testTransformerTruncatesToLength(): void
    {
        $transformer = new OtpCodeToStringTransformer(6, true, true);

        self::assertSame('123456', $transformer->reverseTransform('1234567890'));
    }

    public function testTransformerHandlesEmptyAndArrayInput(): void
    {
        $transformer = new OtpCodeToStringTransformer(6, false, false);

        self::assertSame([], $transformer->transform(null));
        self::assertSame('', $transformer->reverseTransform(''));
        self::assertSame('ab12', $transformer->reverseTransform(['a', 'b', '-', '1', '2']));
    }
}

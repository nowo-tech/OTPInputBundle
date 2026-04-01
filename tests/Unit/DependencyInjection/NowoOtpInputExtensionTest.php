<?php

declare(strict_types=1);

namespace Nowo\OtpInputBundle\Tests\Unit\DependencyInjection;

use Nowo\OtpInputBundle\DependencyInjection\NowoOtpInputExtension;
use PHPUnit\Framework\TestCase;
use Symfony\Component\DependencyInjection\ContainerBuilder;

/**
 * @covers \Nowo\OtpInputBundle\DependencyInjection\NowoOtpInputExtension
 */
final class NowoOtpInputExtensionTest extends TestCase
{
    public function testGetAlias(): void
    {
        $extension = new NowoOtpInputExtension();
        self::assertSame('nowo_otp_input', $extension->getAlias());
    }

    public function testLoadRegistersParameters(): void
    {
        $extension = new NowoOtpInputExtension();
        $container = new ContainerBuilder();
        $container->setParameter('kernel.bundles_metadata', []);

        $extension->load([[
            'length'       => 8,
            'numeric_only' => false,
            'uppercase'    => false,
            'form_theme'   => 'bootstrap_5_layout.html.twig',
        ]], $container);

        self::assertSame(8, $container->getParameter('nowo_otp_input.length'));
        self::assertFalse($container->getParameter('nowo_otp_input.numeric_only'));
        self::assertFalse($container->getParameter('nowo_otp_input.uppercase'));
        self::assertSame('bootstrap_5_layout.html.twig', $container->getParameter('nowo_otp_input.form_theme'));
    }

    public function testPrependSkipsWhenTwigExtensionMissing(): void
    {
        $extension = new NowoOtpInputExtension();
        $container = new ContainerBuilder();

        $extension->prepend($container);

        self::assertSame([], $container->getExtensionConfig('twig'));
    }

    public function testPrependAddsMappedTwigThemeAndFallback(): void
    {
        $extension = new NowoOtpInputExtension();

        $container = new ContainerBuilder();
        $container->registerExtension(new class extends \Symfony\Component\DependencyInjection\Extension\Extension {
            public function load(array $configs, ContainerBuilder $container): void
            {
            }

            public function getAlias(): string
            {
                return 'twig';
            }
        });

        $container->prependExtensionConfig('nowo_otp_input', [
            'form_theme' => 'bootstrap_5_layout.html.twig',
        ]);
        $extension->prepend($container);
        $twigConfigs = $container->getExtensionConfig('twig');
        self::assertSame('@NowoOtpInputBundle/Form/otp_input_theme_bootstrap5.html.twig', $twigConfigs[0]['form_themes'][0]);

        $container2 = new ContainerBuilder();
        $container2->registerExtension(new class extends \Symfony\Component\DependencyInjection\Extension\Extension {
            public function load(array $configs, ContainerBuilder $container): void
            {
            }

            public function getAlias(): string
            {
                return 'twig';
            }
        });
        $container2->prependExtensionConfig('nowo_otp_input', [
            'form_theme' => 'unknown_theme.html.twig',
        ]);
        $extension->prepend($container2);
        $twigConfigs2 = $container2->getExtensionConfig('twig');
        self::assertSame('@NowoOtpInputBundle/Form/otp_input_theme.html.twig', $twigConfigs2[0]['form_themes'][0]);
    }
}

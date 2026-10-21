<?php

declare(strict_types=1);

namespace Nowo\OtpInputBundle\Tests\Unit\DependencyInjection;

use Nowo\OtpInputBundle\DependencyInjection\Configuration;
use Nowo\OtpInputBundle\DependencyInjection\NowoOtpInputExtension;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use ReflectionClassConstant;
use Symfony\Component\Config\Definition\Exception\InvalidConfigurationException;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Extension\Extension;

#[CoversClass(NowoOtpInputExtension::class)]
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
        $container->registerExtension(new class extends Extension {
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
        $container2->registerExtension(new class extends Extension {
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
        $this->expectException(InvalidConfigurationException::class);
        $extension->prepend($container2);
    }

    public function testEveryConfigurableFormThemeIsMapped(): void
    {
        $map = (new ReflectionClassConstant(NowoOtpInputExtension::class, 'FORM_THEME_MAP'))->getValue();

        self::assertIsArray($map);
        self::assertSame(Configuration::FORM_THEMES, array_keys($map));
    }

    public function testPrependAddsNamedAssetPackageWhenFrameworkExtensionPresent(): void
    {
        $frameworkExtension = new class extends Extension {
            public function load(array $configs, ContainerBuilder $container): void
            {
            }

            public function getAlias(): string
            {
                return 'framework';
            }
        };
        $container = new ContainerBuilder();
        $container->registerExtension($frameworkExtension);

        $extension = new NowoOtpInputExtension();
        $extension->prepend($container);

        $frameworkConfig = $container->getExtensionConfig('framework');
        self::assertNotEmpty($frameworkConfig);
        self::assertSame(
            '/bundles/nowootpinput',
            $frameworkConfig[0]['assets']['packages']['nowo_otp_input']['base_path'] ?? null,
        );
    }

    public function testPrependSkipsAssetPackageWhenFrameworkExtensionMissing(): void
    {
        $extension = new NowoOtpInputExtension();
        $container = new ContainerBuilder();

        $extension->prepend($container);

        self::assertFalse($container->hasExtension('framework'));
        self::assertSame([], $container->getExtensionConfig('framework'));
    }
}

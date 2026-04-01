<?php

declare(strict_types=1);

namespace Nowo\OtpInputBundle\Tests\Unit\DependencyInjection;

use Nowo\OtpInputBundle\DependencyInjection\Configuration;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Config\Definition\Processor;

/**
 * @covers \Nowo\OtpInputBundle\DependencyInjection\Configuration
 */
final class ConfigurationTest extends TestCase
{
    public function testGetConfigTreeBuilderReturnsTreeWithAlias(): void
    {
        $config = new Configuration();
        $tree   = $config->getConfigTreeBuilder();
        self::assertSame(Configuration::ALIAS, $tree->buildTree()->getName());
    }

    public function testProcessConfigurationWithDefaults(): void
    {
        $processor = new Processor();
        $config    = $processor->processConfiguration(new Configuration(), []);

        self::assertSame(6, $config['length']);
        self::assertTrue($config['numeric_only']);
        self::assertTrue($config['uppercase']);
        self::assertSame('form_div_layout.html.twig', $config['form_theme']);
    }

    public function testProcessConfigurationWithCustomValues(): void
    {
        $processor = new Processor();
        $config    = $processor->processConfiguration(new Configuration(), [[
            'length'       => 8,
            'numeric_only' => false,
            'uppercase'    => false,
            'form_theme'   => 'bootstrap_5_layout.html.twig',
        ]]);

        self::assertSame(8, $config['length']);
        self::assertFalse($config['numeric_only']);
        self::assertFalse($config['uppercase']);
        self::assertSame('bootstrap_5_layout.html.twig', $config['form_theme']);
    }
}

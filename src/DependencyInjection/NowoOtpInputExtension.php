<?php

declare(strict_types=1);

namespace Nowo\OtpInputBundle\DependencyInjection;

use Symfony\Component\Config\FileLocator;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Extension\Extension;
use Symfony\Component\DependencyInjection\Extension\PrependExtensionInterface;
use Symfony\Component\DependencyInjection\Loader\YamlFileLoader;

final class NowoOtpInputExtension extends Extension implements PrependExtensionInterface
{
    private const FORM_THEME_MAP = [
        'form_div_layout.html.twig'               => '@NowoOtpInputBundle/Form/otp_input_theme.html.twig',
        'form_table_layout.html.twig'             => '@NowoOtpInputBundle/Form/otp_input_theme_table.html.twig',
        'bootstrap_5_layout.html.twig'            => '@NowoOtpInputBundle/Form/otp_input_theme_bootstrap5.html.twig',
        'bootstrap_5_horizontal_layout.html.twig' => '@NowoOtpInputBundle/Form/otp_input_theme_bootstrap5_horizontal.html.twig',
        'bootstrap_4_layout.html.twig'            => '@NowoOtpInputBundle/Form/otp_input_theme_bootstrap4.html.twig',
        'bootstrap_4_horizontal_layout.html.twig' => '@NowoOtpInputBundle/Form/otp_input_theme_bootstrap4_horizontal.html.twig',
        'bootstrap_3_layout.html.twig'            => '@NowoOtpInputBundle/Form/otp_input_theme_bootstrap3.html.twig',
        'bootstrap_3_horizontal_layout.html.twig' => '@NowoOtpInputBundle/Form/otp_input_theme_bootstrap3_horizontal.html.twig',
        'foundation_5_layout.html.twig'           => '@NowoOtpInputBundle/Form/otp_input_theme_foundation5.html.twig',
        'foundation_6_layout.html.twig'           => '@NowoOtpInputBundle/Form/otp_input_theme_foundation6.html.twig',
        'tailwind_2_layout.html.twig'             => '@NowoOtpInputBundle/Form/otp_input_theme_tailwind2.html.twig',
    ];

    public function load(array $configs, ContainerBuilder $container): void
    {
        $loader = new YamlFileLoader($container, new FileLocator(__DIR__ . '/../Resources/config'));
        $loader->load('services.yaml');

        $config = $this->processConfiguration(new Configuration(), $configs);
        $container->setParameter(Configuration::ALIAS . '.length', $config['length']);
        $container->setParameter(Configuration::ALIAS . '.numeric_only', $config['numeric_only']);
        $container->setParameter(Configuration::ALIAS . '.uppercase', $config['uppercase']);
        $container->setParameter(Configuration::ALIAS . '.form_theme', $config['form_theme']);
    }

    public function prepend(ContainerBuilder $container): void
    {
        if (!$container->hasExtension('twig')) {
            return;
        }

        $configs   = $container->getExtensionConfig(Configuration::ALIAS);
        $config    = $this->processConfiguration(new Configuration(), $configs);
        $formTheme = $config['form_theme'] ?? 'form_div_layout.html.twig';
        $themePath = self::FORM_THEME_MAP[$formTheme] ?? self::FORM_THEME_MAP['form_div_layout.html.twig'];

        $container->prependExtensionConfig('twig', [
            'form_themes' => [$themePath],
        ]);
    }

    public function getAlias(): string
    {
        return Configuration::ALIAS;
    }
}

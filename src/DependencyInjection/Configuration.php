<?php

declare(strict_types=1);

namespace Nowo\OtpInputBundle\DependencyInjection;

use Symfony\Component\Config\Definition\Builder\TreeBuilder;
use Symfony\Component\Config\Definition\ConfigurationInterface;

final class Configuration implements ConfigurationInterface
{
    public const ALIAS = 'nowo_otp_input';

    /**
     * Supported Symfony form layouts (each one maps to a bundle theme).
     */
    public const FORM_THEMES = [
        'form_div_layout.html.twig',
        'form_table_layout.html.twig',
        'bootstrap_5_layout.html.twig',
        'bootstrap_5_horizontal_layout.html.twig',
        'bootstrap_4_layout.html.twig',
        'bootstrap_4_horizontal_layout.html.twig',
        'bootstrap_3_layout.html.twig',
        'bootstrap_3_horizontal_layout.html.twig',
        'foundation_5_layout.html.twig',
        'foundation_6_layout.html.twig',
        'tailwind_2_layout.html.twig',
    ];

    public function getConfigTreeBuilder(): TreeBuilder
    {
        $treeBuilder = new TreeBuilder(self::ALIAS);
        $root        = $treeBuilder->getRootNode();

        $root
            ->children()
                ->integerNode('length')
                    ->min(3)
                    ->max(12)
                    ->defaultValue(6)
                ->end()
                ->booleanNode('numeric_only')
                    ->defaultTrue()
                ->end()
                ->booleanNode('uppercase')
                    ->defaultTrue()
                ->end()
                ->enumNode('form_theme')
                    ->values(self::FORM_THEMES)
                    ->defaultValue('form_div_layout.html.twig')
                ->end()
            ->end();

        return $treeBuilder;
    }
}

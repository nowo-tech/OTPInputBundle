<?php

declare(strict_types=1);

namespace Nowo\OtpInputBundle\DependencyInjection;

use Symfony\Component\Config\Definition\Builder\TreeBuilder;
use Symfony\Component\Config\Definition\ConfigurationInterface;

final class Configuration implements ConfigurationInterface
{
    public const ALIAS = 'nowo_otp_input';

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
                ->scalarNode('form_theme')
                    ->defaultValue('form_div_layout.html.twig')
                ->end()
            ->end();

        return $treeBuilder;
    }
}

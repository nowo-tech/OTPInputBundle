<?php

declare(strict_types=1);

namespace Nowo\OtpInputBundle\Form;

use Nowo\OtpInputBundle\Form\DataTransformer\OtpCodeToStringTransformer;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\OptionsResolver\OptionsResolver;

use function is_array;

/**
 * @extends AbstractType<string>
 */
final class OtpType extends AbstractType
{
    public function __construct(
        private readonly int $defaultLength = 6,
        private readonly bool $defaultNumericOnly = true,
        private readonly bool $defaultUppercase = true,
    ) {
    }

    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder->addModelTransformer(new OtpCodeToStringTransformer(
            $options['length'],
            $options['numeric_only'],
            $options['uppercase'],
        ));
    }

    public function buildView(FormView $view, FormInterface $form, array $options): void
    {
        $view->vars['otp_length']           = $options['length'];
        $view->vars['otp_numeric_only']     = $options['numeric_only'];
        $view->vars['otp_uppercase']        = $options['uppercase'];
        $view->vars['otp_container_class']  = $options['container_class'];
        $view->vars['otp_input_class']      = $options['input_class'];
        $view->vars['otp_gap_class']        = $options['gap_class'];
        $view->vars['otp_autofocus']        = $options['autofocus'];
        $view->vars['otp_placeholder_char'] = $options['placeholder_char'];
        $view->vars['otp_disabled']         = $options['disabled'];

        $value = $view->vars['value'] ?? [];
        if (!is_array($value)) {
            $value = [];
        }
        $view->vars['otp_digits'] = $value;

        $view->vars['attr']['data-controller']                        = trim(($view->vars['attr']['data-controller'] ?? '') . ' nowo-otp-input');
        $view->vars['attr']['data-nowo-otp-input-length-value']       = (string) $options['length'];
        $view->vars['attr']['data-nowo-otp-input-numeric-only-value'] = $options['numeric_only'] ? '1' : '0';
        $view->vars['attr']['data-nowo-otp-input-uppercase-value']    = $options['uppercase'] ? '1' : '0';
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'length'             => $this->defaultLength,
            'numeric_only'       => $this->defaultNumericOnly,
            'uppercase'          => $this->defaultUppercase,
            'container_class'    => 'nowo-otp-input__container',
            'input_class'        => 'nowo-otp-input__digit',
            'gap_class'          => 'nowo-otp-input__gap',
            'autofocus'          => true,
            'placeholder_char'   => '',
            'empty_data'         => '',
            'required'           => true,
            'translation_domain' => 'NowoOtpInputBundle',
        ]);

        $resolver->setAllowedTypes('length', ['int']);
        $resolver->setAllowedValues('length', static fn (int $length): bool => $length >= 3 && $length <= 12);
        $resolver->setAllowedTypes('numeric_only', ['bool']);
        $resolver->setAllowedTypes('uppercase', ['bool']);
        $resolver->setAllowedTypes('container_class', ['string']);
        $resolver->setAllowedTypes('input_class', ['string']);
        $resolver->setAllowedTypes('gap_class', ['string']);
        $resolver->setAllowedTypes('autofocus', ['bool']);
        $resolver->setAllowedTypes('placeholder_char', ['string']);
    }

    public function getParent(): string
    {
        return TextType::class;
    }

    public function getBlockPrefix(): string
    {
        return 'nowo_otp_input';
    }
}

<?php

declare(strict_types=1);

namespace App\Form;

use Nowo\FormKitBundle\Attribute\FormKitConfig;
use Nowo\FormKitBundle\Form\FormOptionsTrait;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * REQ-DEMO-015: a FormKit form (profile `demo`); the bundle's OtpType is added through FormKit's addOtp().
 *
 * @extends AbstractType<array{otp: string}>
 */
#[FormKitConfig('demo')]
final class OtpDemoType extends AbstractType
{
    use FormOptionsTrait;

    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $this->addOtp($builder, 'otp', [
            'label'           => 'OTP code',
            'help'            => $options['otp_help'],
            'placeholder'     => false,
            'length'          => $options['length'],
            'numeric_only'    => $options['numeric_only'],
            'uppercase'       => $options['uppercase'],
            'container_class' => 'otp-demo-container',
            'input_class'     => 'nowo-ui-input otp-demo-digit',
            'gap_class'       => 'nowo-ui-toolbar',
        ]);
        $this->addWithDefaults($builder, 'submit', SubmitType::class, [
            'label' => 'Submit OTP',
            'attr'  => ['class' => 'nowo-ui-btn nowo-ui-btn--primary'],
        ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'length'       => 6,
            'numeric_only' => true,
            'uppercase'    => true,
            'otp_help'     => '',
        ]);
        $resolver->setAllowedTypes('length', 'int');
        $resolver->setAllowedTypes('numeric_only', 'bool');
        $resolver->setAllowedTypes('uppercase', 'bool');
        $resolver->setAllowedTypes('otp_help', 'string');
    }
}

<?php

declare(strict_types=1);

namespace Nowo\OtpInputBundle\Tests\Unit\Form;

use Nowo\OtpInputBundle\Form\OtpType;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\Forms;
use Symfony\Component\Form\FormView;

/**
 * @covers \Nowo\OtpInputBundle\Form\OtpType
 */
final class OtpTypeTest extends TestCase
{
    public function testSubmitNormalizesNumericString(): void
    {
        $factory = Forms::createFormFactoryBuilder()
            ->addType(new OtpType(6, true, true))
            ->getFormFactory();

        $form = $factory->create(OtpType::class, '');
        $form->submit('123456');

        self::assertTrue($form->isSynchronized());
        self::assertSame('123456', $form->getData());
    }

    public function testSubmitStripsNonDigitsWhenNumericOnly(): void
    {
        $factory = Forms::createFormFactoryBuilder()
            ->addType(new OtpType(6, true, true))
            ->getFormFactory();

        $form = $factory->create(OtpType::class, '');
        $form->submit('12-34-56');

        self::assertTrue($form->isSynchronized());
        self::assertSame('123456', $form->getData());
    }

    public function testOptionsLengthBoundaries(): void
    {
        $factory = Forms::createFormFactoryBuilder()
            ->addType(new OtpType(6, true, true))
            ->getFormFactory();

        $form = $factory->create(OtpType::class, '', ['length' => 4]);
        $form->submit('1234');

        self::assertSame('1234', $form->getData());
    }

    public function testBuildViewExposesOtpVariablesAndDataAttributes(): void
    {
        $factory = Forms::createFormFactoryBuilder()
            ->addType(new OtpType(6, true, true))
            ->getFormFactory();

        $form = $factory->create(OtpType::class, '12AB', [
            'length'           => 4,
            'numeric_only'     => false,
            'uppercase'        => true,
            'container_class'  => 'custom-container',
            'input_class'      => 'custom-input',
            'gap_class'        => 'custom-gap',
            'autofocus'        => false,
            'placeholder_char' => '*',
            'attr'             => ['data-controller' => 'existing-controller'],
        ]);

        $view = $form->createView();

        self::assertSame(4, $view->vars['otp_length']);
        self::assertFalse($view->vars['otp_numeric_only']);
        self::assertTrue($view->vars['otp_uppercase']);
        self::assertSame('custom-container', $view->vars['otp_container_class']);
        self::assertSame('custom-input', $view->vars['otp_input_class']);
        self::assertSame('custom-gap', $view->vars['otp_gap_class']);
        self::assertFalse($view->vars['otp_autofocus']);
        self::assertSame('*', $view->vars['otp_placeholder_char']);
        self::assertSame('existing-controller nowo-otp-input', $view->vars['attr']['data-controller']);
        self::assertSame('4', $view->vars['attr']['data-nowo-otp-input-length-value']);
        self::assertSame('0', $view->vars['attr']['data-nowo-otp-input-numeric-only-value']);
        self::assertSame('1', $view->vars['attr']['data-nowo-otp-input-uppercase-value']);
        self::assertIsArray($view->vars['otp_digits']);
    }

    public function testGetParentAndBlockPrefix(): void
    {
        $type = new OtpType();

        self::assertSame(TextType::class, $type->getParent());
        self::assertSame('nowo_otp_input', $type->getBlockPrefix());
    }

    /**
     * Simulates FrankenPHP worker with FRANKENPHP_RESET_KERNEL=false: one shared
     * OtpType instance serves consecutive form builds without services_resetter.
     */
    public function testSharedInstanceDoesNotLeakOptionsAcrossConsecutiveBuilds(): void
    {
        $type    = new OtpType(6, true, true);
        $factory = Forms::createFormFactoryBuilder()
            ->addType($type)
            ->getFormFactory();

        $view1 = $factory->create(OtpType::class, '', [
            'length'       => 4,
            'numeric_only' => false,
            'uppercase'    => false,
        ])->createView();

        $view2 = $factory->create(OtpType::class, '')->createView();

        self::assertSame(4, $view1->vars['otp_length']);
        self::assertFalse($view1->vars['otp_numeric_only']);
        self::assertFalse($view1->vars['otp_uppercase']);
        self::assertSame(6, $view2->vars['otp_length']);
        self::assertTrue($view2->vars['otp_numeric_only']);
        self::assertTrue($view2->vars['otp_uppercase']);

        $form1 = $factory->create(OtpType::class, '', ['length' => 4, 'numeric_only' => false]);
        $form1->submit('ab12');
        self::assertSame('AB12', $form1->getData());

        $form2 = $factory->create(OtpType::class, '');
        $form2->submit('12-34-56');
        self::assertSame('123456', $form2->getData());
    }

    public function testBuildViewResetsDigitsWhenValueIsNotArray(): void
    {
        $type                = new OtpType();
        $view                = new FormView();
        $view->vars['value'] = '1234';
        $view->vars['attr']  = [];

        $form    = $this->createMock(FormInterface::class);
        $options = [
            'length'           => 4,
            'numeric_only'     => true,
            'uppercase'        => true,
            'container_class'  => 'container',
            'input_class'      => 'input',
            'gap_class'        => 'gap',
            'autofocus'        => true,
            'placeholder_char' => '',
            'disabled'         => false,
        ];

        $type->buildView($view, $form, $options);

        self::assertSame([], $view->vars['otp_digits']);
    }
}

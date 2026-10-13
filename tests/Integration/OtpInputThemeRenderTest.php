<?php

declare(strict_types=1);

namespace Nowo\OtpInputBundle\Tests\Integration;

use Nowo\OtpInputBundle\Form\OtpType;
use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\TestCase;
use ReflectionClass;
use Symfony\Bridge\Twig\Extension\FormExtension;
use Symfony\Bridge\Twig\Form\TwigRendererEngine;
use Symfony\Component\Form\FormRenderer;
use Symfony\Component\Form\Forms;
use Twig\Environment;
use Twig\Loader\FilesystemLoader;
use Twig\RuntimeLoader\FactoryRuntimeLoader;
use Twig\TwigFilter;

use function dirname;

/**
 * Renders the default OTP form theme and checks the autofill-related attributes.
 */
#[CoversNothing]
final class OtpInputThemeRenderTest extends TestCase
{
    public function testOnlyFirstBoxAdvertisesOneTimeCodeAndAcceptsTheWholeCode(): void
    {
        $html = $this->render([]);

        self::assertSame(1, substr_count($html, 'autocomplete="one-time-code"'));
        self::assertSame(5, substr_count($html, 'maxlength="1"'));
        self::assertMatchesRegularExpression('/<input[^>]*autocomplete="one-time-code"(?![^>]*maxlength)[^>]*data-nowo-otp-digit="0"/', $html);
        self::assertSame(5, substr_count($html, 'autocomplete="off"'));
    }

    public function testPlaceholderCharIsRenderedOnEveryBox(): void
    {
        $html = $this->render(['placeholder_char' => '•', 'length' => 4]);

        self::assertSame(4, substr_count($html, 'placeholder="•"'));
    }

    public function testNoPlaceholderAttributeByDefault(): void
    {
        self::assertStringNotContainsString('placeholder=', $this->render([]));
    }

    /**
     * @param array<string, mixed> $options
     */
    private function render(array $options): string
    {
        $bridgeViews = dirname((string) (new ReflectionClass(FormExtension::class))->getFileName(), 2) . '/Resources/views/Form';
        $loader      = new FilesystemLoader([$bridgeViews]);
        $loader->addPath(dirname(__DIR__, 2) . '/src/Resources/views', 'NowoOtpInputBundle');

        $twig   = new Environment($loader, ['strict_variables' => true]);
        $engine = new TwigRendererEngine(['@NowoOtpInputBundle/Form/otp_input_theme.html.twig'], $twig);
        $twig->addRuntimeLoader(new FactoryRuntimeLoader([
            FormRenderer::class => static fn (): FormRenderer => new FormRenderer($engine),
        ]));
        $twig->addExtension(new FormExtension());
        $twig->addFilter(new TwigFilter('trans', static fn (mixed $message): mixed => $message));

        $form = Forms::createFormFactoryBuilder()
            ->addType(new OtpType())
            ->getFormFactory()
            ->createNamed('code', OtpType::class, null, $options);

        return $twig->createTemplate('{{ form_widget(form) }}')->render(['form' => $form->createView()]);
    }
}

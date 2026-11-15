<?php

declare(strict_types=1);

namespace Nowo\OtpInputBundle\Tests\Integration;

use Nowo\OtpInputBundle\Form\OtpType;
use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\TestCase;
use ReflectionClass;
use Symfony\Bridge\Twig\Extension\FormExtension;
use Symfony\Bridge\Twig\Form\TwigRendererEngine;
use Symfony\Component\DomCrawler\Crawler;
use Symfony\Component\Form\FormError;
use Symfony\Component\Form\FormRenderer;
use Symfony\Component\Form\Forms;
use Twig\Environment;
use Twig\Loader\FilesystemLoader;
use Twig\RuntimeLoader\FactoryRuntimeLoader;
use Twig\TwigFilter;

use function dirname;
use function json_encode;

/**
 * Renders the OTP form themes: the no-JS fallback field, the server-rendered digit boxes and their a11y wiring.
 */
#[CoversNothing]
final class OtpInputThemeRenderTest extends TestCase
{
    private const DEFAULT_THEME = '@NowoOtpInputBundle/Form/otp_input_theme.html.twig';

    public function testNoJsMarkupHasOneNamedVisibleTextInput(): void
    {
        $crawler = new Crawler($this->render([]));

        $named = $crawler->filter('input[name]');
        self::assertCount(1, $named);
        self::assertSame('text', $named->attr('type'));
        self::assertSame('code', $named->attr('name'));
        self::assertSame('code', $named->attr('id'));
        self::assertSame('numeric', $named->attr('inputmode'));
        self::assertSame('one-time-code', $named->attr('autocomplete'));
        self::assertSame('6', $named->attr('maxlength'));
        self::assertSame('1', $named->attr('data-nowo-otp-fallback'));
        self::assertSame('nowo-otp-input', $named->attr('data-controller'));
        self::assertStringContainsString('nowo-otp-input__fallback', (string) $named->attr('class'));
        self::assertSame('required', $named->attr('required'));
        self::assertSame('autofocus', $named->attr('autofocus'));
        self::assertNull($named->attr('hidden'));

        self::assertCount(0, $crawler->filter('input[type="hidden"]'));
    }

    public function testDigitBoxesAreServerRenderedInsideAHiddenClasslessWrapperWithoutNames(): void
    {
        $crawler = new Crawler($this->render(['gap_class' => 'd-flex']));

        // The class-less wrapper carries `hidden`: host CSS on the gap class cannot override it.
        $wrapper = $crawler->filter('nowo-otp-input > [data-nowo-otp-boxes="1"]');
        self::assertCount(1, $wrapper);
        self::assertNotNull($wrapper->attr('hidden'));
        self::assertNull($wrapper->attr('class'));

        $group = $wrapper->filter('[data-nowo-otp-render-target="1"]');
        self::assertCount(1, $group);
        self::assertSame('group', $group->attr('role'));
        self::assertSame('d-flex', $group->attr('class'));

        $digits = $group->filter('input[data-nowo-otp-digit]');
        self::assertCount(6, $digits);
        self::assertCount(0, $group->filter('input[name]'));
        self::assertCount(0, $group->filter('input[autofocus]'));
        self::assertSame('code_digit_0', $digits->first()->attr('id'));
        self::assertSame('code_digit_5', $digits->last()->attr('id'));
    }

    public function testAlphanumericFallbackUsesTextInputModeAndUppercaseCapitalization(): void
    {
        $named = (new Crawler($this->render(['numeric_only' => false, 'length' => 8])))->filter('input[name]');

        self::assertSame('text', $named->attr('inputmode'));
        self::assertSame('characters', $named->attr('autocapitalize'));
        self::assertSame('8', $named->attr('maxlength'));
    }

    public function testHostAttributesWinWithoutDuplicates(): void
    {
        $html  = $this->render(['attr' => ['autocomplete' => 'one-time-code', 'inputmode' => 'tel', 'class' => 'host', 'placeholder' => 'Code']]);
        $named = (new Crawler($html))->filter('input[name]');

        self::assertSame(1, substr_count($html, 'inputmode="tel"'));
        self::assertSame('host nowo-otp-input__fallback', $named->attr('class'));
        self::assertSame('[NowoOtpInputBundle]Code', $named->attr('placeholder'));
    }

    public function testDisabledFieldIsNotAutofocusedAndDisablesEveryBox(): void
    {
        $crawler = new Crawler($this->render(['disabled' => true]));

        self::assertNull($crawler->filter('input[name]')->attr('autofocus'));
        self::assertCount(7, $crawler->filter('input[disabled]'));
    }

    public function testAutofocusCanBeTurnedOff(): void
    {
        self::assertStringNotContainsString('autofocus', $this->render(['autofocus' => false]));
    }

    public function testSubmittedValueIsRedisplayedAsTypedInTheFallback(): void
    {
        // Like any text field, a re-rendered submission shows what was typed; the script sanitizes it into the boxes.
        $crawler = new Crawler($this->render([], '1234'));

        self::assertSame('1234', $crawler->filter('input[name]')->attr('value'));
        self::assertSame('1', $crawler->filter('[data-nowo-otp-digit="0"]')->attr('value'));
        self::assertSame('4', $crawler->filter('[data-nowo-otp-digit="3"]')->attr('value'));
        self::assertSame('', $crawler->filter('[data-nowo-otp-digit="4"]')->attr('value'));

        self::assertSame('12 34', (new Crawler($this->render([], '12 34')))->filter('input[name]')->attr('value'));
    }

    public function testInitialModelValueIsRenderedInTheFallbackAndTheBoxes(): void
    {
        $crawler = new Crawler($this->render([], null, '987654'));

        self::assertSame('987654', $crawler->filter('input[name]')->attr('value'));
        self::assertSame('9', $crawler->filter('[data-nowo-otp-digit="0"]')->attr('value'));
    }

    public function testOneTimeCodeIsAdvertisedOnTheFallbackAndOnTheFirstBoxOnly(): void
    {
        $html = $this->render([]);

        self::assertSame(2, substr_count($html, 'autocomplete="one-time-code"'));
        self::assertSame(5, substr_count($html, 'maxlength="1"'));
        self::assertMatchesRegularExpression('/<input[^>]*autocomplete="one-time-code"(?![^>]*maxlength)[^>]*data-nowo-otp-digit="0"/', $html);
        self::assertSame(5, substr_count($html, 'autocomplete="off"'));
    }

    public function testPlaceholderCharIsRenderedOnEveryBoxAndRepeatedOnTheFallback(): void
    {
        $html = $this->render(['placeholder_char' => '•', 'length' => 4]);

        self::assertSame(4, substr_count($html, 'placeholder="•"'));
        self::assertSame('[NowoOtpInputBundle]••••', (new Crawler($html))->filter('input[name]')->attr('placeholder'));
    }

    public function testNoPlaceholderAttributeByDefault(): void
    {
        self::assertStringNotContainsString('placeholder=', $this->render([]));
    }

    public function testDigitGroupIsLabelledWithTheBundleTranslationWhateverTheFieldDomain(): void
    {
        foreach ([[], ['translation_domain' => 'app'], ['translation_domain' => false]] as $options) {
            $group = (new Crawler($this->render($options)))->filter('[data-nowo-otp-render-target="1"]');

            self::assertSame('[NowoOtpInputBundle]otp.placeholder', $group->attr('aria-label'), (string) json_encode($options));
        }
    }

    public function testEveryBoxHasATranslatedPositionLabel(): void
    {
        $digits = (new Crawler($this->render(['length' => 4, 'translation_domain' => 'app'])))->filter('[data-nowo-otp-digit]');

        self::assertSame('[NowoOtpInputBundle]otp.digit_label{"%position%":1,"%length%":4}', $digits->first()->attr('aria-label'));
        self::assertSame('[NowoOtpInputBundle]otp.digit_label{"%position%":4,"%length%":4}', $digits->last()->attr('aria-label'));
    }

    public function testLabelsFallBackToEnglishWithoutATranslator(): void
    {
        $crawler = new Crawler($this->render(['length' => 4], null, null, true));

        self::assertSame('Enter the OTP code', $crawler->filter('[data-nowo-otp-render-target="1"]')->attr('aria-label'));
        self::assertSame('Character 2 of 4', $crawler->filter('[data-nowo-otp-digit="1"]')->attr('aria-label'));
    }

    public function testHelpIsAnnouncedOnTheFallbackAndOnTheFirstBox(): void
    {
        $crawler = new Crawler($this->renderRow(['help' => 'Sent by SMS']));

        self::assertSame('f_code_help', $crawler->filter('input[name]')->attr('aria-describedby'));
        self::assertSame('f_code_help', $crawler->filter('[data-nowo-otp-digit="0"]')->attr('aria-describedby'));
        self::assertNull($crawler->filter('[data-nowo-otp-digit="1"]')->attr('aria-describedby'));
        self::assertCount(1, $crawler->filter('#f_code_help'));
        self::assertCount(1, $crawler->filter('label'));
        self::assertCount(1, $crawler->filter('label[for="f_code"]'));
    }

    public function testHelpIsDescribedWhenOnlyTheWidgetIsRendered(): void
    {
        $crawler = new Crawler($this->render(['help' => 'Sent by SMS']));

        self::assertSame('code_help', $crawler->filter('input[name]')->attr('aria-describedby'));
        self::assertSame('code_help', $crawler->filter('[data-nowo-otp-digit="0"]')->attr('aria-describedby'));
    }

    public function testErrorsMarkTheFallbackAndTheBoxesInvalid(): void
    {
        $html    = $this->renderRow(['help' => 'Sent by SMS'], 'Wrong code');
        $crawler = new Crawler($html);

        $named = $crawler->filter('input[name]');
        self::assertSame('true', $named->attr('aria-invalid'));
        self::assertStringContainsString('f_code_help', (string) $named->attr('aria-describedby'));
        self::assertCount(6, $crawler->filter('[data-nowo-otp-digit][aria-invalid="true"]'));
        self::assertSame($named->attr('aria-describedby'), $crawler->filter('[data-nowo-otp-digit="0"]')->attr('aria-describedby'));
        self::assertStringContainsString('Wrong code', $html);
    }

    public function testFallbackUsesTheHostThemeTextWidget(): void
    {
        $named = (new Crawler($this->renderRow([], null, [self::DEFAULT_THEME, 'bootstrap_5_layout.html.twig'])))->filter('input[name]');

        self::assertSame('nowo-otp-input__fallback form-control', $named->attr('class'));
        self::assertSame('text', $named->attr('type'));
    }

    public function testEveryBundleThemeVariantRendersTheFallback(): void
    {
        foreach (['table', 'bootstrap5', 'bootstrap5_horizontal', 'bootstrap4', 'bootstrap4_horizontal', 'bootstrap3', 'bootstrap3_horizontal', 'foundation5', 'foundation6', 'tailwind2'] as $variant) {
            $crawler = new Crawler($this->renderRow([], null, ['@NowoOtpInputBundle/Form/otp_input_theme_' . $variant . '.html.twig']));

            self::assertSame('text', $crawler->filter('input[name="f[code]"]')->attr('type'), $variant);
            self::assertCount(6, $crawler->filter('[data-nowo-otp-boxes][hidden] [data-nowo-otp-render-target] [data-nowo-otp-digit]'), $variant);
        }
    }

    /**
     * @param list<string> $themes
     */
    private function environment(array $themes, bool $identityTranslator = false): Environment
    {
        $bridgeViews = dirname((string) (new ReflectionClass(FormExtension::class))->getFileName(), 2) . '/Resources/views/Form';
        $loader      = new FilesystemLoader([$bridgeViews]);
        $loader->addPath(dirname(__DIR__, 2) . '/src/Resources/views', 'NowoOtpInputBundle');

        $twig   = new Environment($loader, ['strict_variables' => true]);
        $engine = new TwigRendererEngine($themes, $twig);
        $twig->addRuntimeLoader(new FactoryRuntimeLoader([
            FormRenderer::class => static fn (): FormRenderer => new FormRenderer($engine),
        ]));
        $twig->addExtension(new FormExtension());
        $twig->addFilter(new TwigFilter('trans', static function (mixed $message, array $parameters = [], ?string $domain = null) use ($identityTranslator): mixed {
            if ($domain === null || $identityTranslator) {
                return $message;
            }

            return '[' . $domain . ']' . $message . ($parameters === [] ? '' : json_encode($parameters));
        }));

        return $twig;
    }

    /**
     * @param array<string, mixed> $options
     */
    private function render(array $options, ?string $submitted = null, ?string $data = null, bool $identityTranslator = false): string
    {
        $form = Forms::createFormFactoryBuilder()
            ->addType(new OtpType())
            ->getFormFactory()
            ->createNamed('code', OtpType::class, $data, $options);
        if ($submitted !== null) {
            $form->submit($submitted);
        }

        return $this->environment([self::DEFAULT_THEME], $identityTranslator)
            ->createTemplate('{{ form_widget(form) }}')
            ->render(['form' => $form->createView()]);
    }

    /**
     * @param array<string, mixed> $options
     * @param list<string> $themes
     */
    private function renderRow(array $options, ?string $error = null, array $themes = [self::DEFAULT_THEME]): string
    {
        $form = Forms::createFormFactoryBuilder()
            ->addType(new OtpType())
            ->getFormFactory()
            ->createNamedBuilder('f')
            ->add('code', OtpType::class, $options)
            ->getForm();
        if ($error !== null) {
            $form->submit(['code' => '12']);
            $form->get('code')->addError(new FormError($error));
        }

        return $this->environment($themes)
            ->createTemplate('{{ form_row(form.code) }}')
            ->render(['form' => $form->createView()]);
    }
}

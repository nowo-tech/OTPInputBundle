<?php

declare(strict_types=1);

namespace Nowo\OtpInputBundle\Tests\Integration\Functional;

use Nowo\OtpInputBundle\Tests\Fixtures\Worker\WorkerHostKernel;
use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpKernel\HttpKernelBrowser;

/**
 * A browser without JavaScript: it only sees the server-rendered markup and submits the named fields. The OTP code
 * must reach the form through the plain fallback text input, exactly like the hidden input did with JavaScript.
 */
#[CoversNothing]
final class NoJsSubmissionTest extends TestCase
{
    private WorkerHostKernel $kernel;

    protected function setUp(): void
    {
        $this->kernel = new WorkerHostKernel();
        $this->kernel->boot();
    }

    protected function tearDown(): void
    {
        $this->kernel->shutdown();
    }

    public function testNumericCodeIsSubmittedThroughTheFallbackField(): void
    {
        $browser = new HttpKernelBrowser($this->kernel);
        $crawler = $browser->request('GET', '/host/alpha');

        $form   = $crawler->filter('form')->form();
        $values = $form->getPhpValues();
        self::assertSame(['f' => ['code' => '']], $values, 'the digit boxes have no name: only the fallback field is submitted');

        $field = $crawler->filter('input[name="f[code]"]');
        self::assertSame('text', $field->attr('type'));
        self::assertSame('one-time-code', $field->attr('autocomplete'));
        self::assertSame('numeric', $field->attr('inputmode'));
        self::assertSame('6', $field->attr('maxlength'));

        $form['f[code]'] = '123456';
        $browser->submit($form);

        self::assertStringContainsString('submitted=123456;', (string) $browser->getResponse()->getContent());
    }

    public function testAlphanumericCodeIsNormalizedServerSide(): void
    {
        $browser = new HttpKernelBrowser($this->kernel);
        $form    = $browser->request('GET', '/host/beta')->filter('form')->form();

        $form['f[code]'] = 'ab12';
        $crawler         = $browser->submit($form);

        self::assertStringContainsString('submitted=AB12;', (string) $browser->getResponse()->getContent());
        self::assertSame('ab12', $crawler->filter('input[name="f[code]"]')->attr('value'), 'the re-rendered fallback shows what was typed');
    }

    public function testSeparatorsTypedIntoTheFallbackAreIgnored(): void
    {
        $browser = new HttpKernelBrowser($this->kernel);
        $form    = $browser->request('GET', '/host/alpha')->filter('form')->form();

        $form['f[code]'] = '123-45 6';
        $browser->submit($form);

        self::assertStringContainsString('submitted=123456;', (string) $browser->getResponse()->getContent());
    }
}

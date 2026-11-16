<?php

declare(strict_types=1);

namespace Nowo\OtpInputBundle\Tests\Integration\Functional;

use Nowo\OtpInputBundle\Tests\Fixtures\Worker\WorkerHostKernel;
use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\TestCase;
use Symfony\Component\DomCrawler\Crawler;
use Symfony\Component\DomCrawler\Form;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\HttpKernelInterface;

/**
 * A browser without JavaScript: it only sees the server-rendered markup and submits the named fields. The OTP code
 * must reach the form through the plain fallback text input, exactly like the hidden input did with JavaScript.
 *
 * The form is read and submitted with DomCrawler against the kernel directly (no BrowserKit), so the test runs on
 * every supported Symfony line, whatever BrowserKit version Composer picks next to HttpKernel 6.4.
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
        $crawler = $this->get('/host/alpha');
        $form    = $crawler->filter('form')->form();

        self::assertSame(['f' => ['code' => '']], $form->getPhpValues(), 'the digit boxes have no name: only the fallback field is submitted');

        $field = $crawler->filter('input[name="f[code]"]');
        self::assertSame('text', $field->attr('type'));
        self::assertSame('one-time-code', $field->attr('autocomplete'));
        self::assertSame('numeric', $field->attr('inputmode'));
        self::assertSame('12', $field->attr('maxlength'), 'loose bound: room for separators, the server keeps 6');

        $form['f[code]'] = '123456';

        self::assertStringContainsString('submitted=123456;', $this->submit($form)->html());
    }

    public function testAlphanumericCodeIsNormalizedServerSide(): void
    {
        $form            = $this->get('/host/beta')->filter('form')->form();
        $form['f[code]'] = 'ab12';
        $crawler         = $this->submit($form);

        self::assertStringContainsString('submitted=AB12;', $crawler->html());
        self::assertSame('ab12', $crawler->filter('input[name="f[code]"]')->attr('value'), 'the re-rendered fallback shows what was typed');
    }

    public function testSeparatorsTypedIntoTheFallbackAreIgnored(): void
    {
        $form            = $this->get('/host/alpha')->filter('form')->form();
        $form['f[code]'] = '123-45 6';

        self::assertStringContainsString('submitted=123456;', $this->submit($form)->html());
    }

    private function get(string $path): Crawler
    {
        return $this->handle(Request::create('http://localhost' . $path));
    }

    private function submit(Form $form): Crawler
    {
        return $this->handle(Request::create($form->getUri(), $form->getMethod(), $form->getPhpValues()));
    }

    private function handle(Request $request): Crawler
    {
        $http = $this->kernel->getContainer()->get('http_kernel');
        self::assertInstanceOf(HttpKernelInterface::class, $http);

        return new Crawler((string) $http->handle($request)->getContent(), $request->getUri());
    }
}

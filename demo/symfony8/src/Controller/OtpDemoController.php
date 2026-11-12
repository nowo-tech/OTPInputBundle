<?php

declare(strict_types=1);

namespace App\Controller;

use App\Form\OtpDemoType;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

use function sprintf;

final class OtpDemoController extends AbstractController
{
    /**
     * @var array<string, array{title: string, length: int, numeric_only: bool, uppercase: bool, help: string}>
     */
    private const EXAMPLES = [
        'numeric-6' => [
            'title'        => '6-digit numeric (SMS style)',
            'length'       => 6,
            'numeric_only' => true,
            'uppercase'    => true,
            'help'         => 'Enter the 6-digit code sent to your phone. Only numbers; spaces are ignored when pasting.',
        ],
        'alphanumeric-8' => [
            'title'        => '8-character alphanumeric',
            'length'       => 8,
            'numeric_only' => false,
            'uppercase'    => true,
            'help'         => 'Use letters and numbers (e.g. backup codes). Letters are normalized to uppercase.',
        ],
        'short-pin-4' => [
            'title'        => '4-digit PIN',
            'length'       => 4,
            'numeric_only' => true,
            'uppercase'    => false,
            'help'         => 'Short numeric PIN for quick verification.',
        ],
    ];

    #[Route(path: '/', name: 'app_root', methods: ['GET'])]
    public function root(): RedirectResponse
    {
        return $this->redirectToRoute('app_demo_index');
    }

    #[Route(path: '/demo', name: 'app_demo_index', methods: ['GET'])]
    public function index(): Response
    {
        return $this->render('otp_demo/index.html.twig', [
            'examples' => self::EXAMPLES,
        ]);
    }

    #[Route(path: '/demo/otp/{slug}', name: 'app_demo_otp', methods: ['GET', 'POST'], requirements: ['slug' => '[a-z0-9\-]+'])]
    public function otp(Request $request, string $slug): Response
    {
        if (!isset(self::EXAMPLES[$slug])) {
            throw $this->createNotFoundException(sprintf('Unknown demo: %s', $slug));
        }

        $cfg  = self::EXAMPLES[$slug];
        $form = $this->createForm(OtpDemoType::class, ['otp' => ''], [
            'length'       => $cfg['length'],
            'numeric_only' => $cfg['numeric_only'],
            'uppercase'    => $cfg['uppercase'],
            'otp_help'     => $cfg['help'],
        ]);

        $form->handleRequest($request);

        $otpValue = null;
        if ($form->isSubmitted() && $form->isValid()) {
            /** @var array{otp: string} $data */
            $data     = $form->getData();
            $otpValue = $data['otp'];

        }

        return $this->render('otp_demo/show.html.twig', [
            'form'       => $form,
            'otp_value'  => $otpValue,
            'demo_title' => $cfg['title'],
            'demo_slug'  => $slug,
            'examples'   => self::EXAMPLES,
        ]);
    }
}

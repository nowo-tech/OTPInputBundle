<?php

declare(strict_types=1);

namespace Nowo\OtpInputBundle\Tests\Fixtures\Worker;

use Nowo\OtpInputBundle\Form\OtpType;
use Symfony\Component\Form\Extension\Core\Type\FormType;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Twig\Environment;

/**
 * Host controller that owns the form: renders it and reads the submission.
 */
final readonly class WorkerHostController
{
    public function __construct(
        private FormFactoryInterface $forms,
        private Environment $twig,
    ) {
    }

    public function __invoke(Request $request, string $who): Response
    {
        $length = $who === 'alpha' ? 6 : 4;
        $form   = $this->forms->createNamedBuilder('f', FormType::class)
            ->add('code', OtpType::class, ['length' => $length, 'numeric_only' => $who === 'alpha'])
            ->getForm();
        $form->handleRequest($request);

        $html = $this->twig->render('host_form.html.twig', ['form' => $form->createView()]);
        $sent = $form->isSubmitted() ? (string) $form->get('code')->getData() : '';

        return new Response('who=' . $who . ';submitted=' . $sent . ';locale=' . $request->getLocale() . ';' . $html);
    }
}

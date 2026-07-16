# Demo notes

This bundle includes `demo/symfony8` with a sample Symfony application.

The demo has its own `docker-compose.yml`, `Dockerfile`, and `docker/frankenphp/` (Caddyfile variants) for local development.

The **repository root** `docker-compose.yml` is for **bundle** development (PHP, Composer, pnpm/Vite, tests). It is not the same as launching a demo as a standalone hosted app.

To run the demo, follow the README inside `demo/symfony8`.

FrankenPHP worker mode is not declared as supported for this bundle at the moment; see the main [README](../README.md).

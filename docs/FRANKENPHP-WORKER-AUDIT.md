# FrankenPHP worker mode audit (kernel not reset between requests)

| Field | Value |
|-------|-------|
| Package | `nowo-tech/otp-input-bundle` (`symfony-bundle`) |
| Audited revision | `v1.6.0` |
| Audit date | 2026-09-24 |
| Target runtime | FrankenPHP **worker** with **`FRANKENPHP_RESET_KERNEL=false`** (sticky Kernel / “Friendly Worker”) |
| Method | Manual review of every file under `src/` (form type, data transformer, DI extension, configuration, compiler pass, `services.yaml`, Twig themes) + PHPStan classic + worker-strict + hardening |
| **Verdict** | ✅ **100% compatible** under Scenario B (`reset_kernel: false`) — no remediations required for sticky Kernel |

## Execution model assumed

FrankenPHP worker mode boots the Symfony kernel once per worker and serves many requests with the same container. This audit assumes the **strict** host contract used by Nowo “Friendly Worker” / kernel-isolation E2E:

| Host flag | Meaning |
|-----------|---------|
| `FRANKENPHP_MODE=worker` | Worker keeps the app in memory |
| **`FRANKENPHP_RESET_KERNEL=false`** | Kernel is **not** rebooted; Scenario **B** below |
| `FRANKENPHP_WORKER_NUM=1` | Single worker (isolation tests) |

Two scenarios are evaluated:

- **A — kernel not rebooted, `services_resetter` still runs:** services tagged `kernel.reset` (or implementing `ResetInterface`) are reset between requests. Typical default when `FRANKENPHP_RESET_KERNEL` is truthy / Runtime `worker=2`-style reset.
- **B — no reset at all (`FRANKENPHP_RESET_KERNEL=false`):** nothing is reset; any per-request state kept in a shared service leaks into the next request.

A bundle that is safe under **B** is safe under **A** and under classic mode / PHP-FPM.

## Summary

| Area | Status | Notes |
|------|--------|-------|
| Mutable state in shared services | ✅ | `OtpType` only has `readonly` constructor defaults (length, numeric only, uppercase) |
| Static properties / `static` locals | ✅ | None; only a static closure used as an OptionsResolver validator |
| `ResetInterface` / `kernel.reset` coverage | ✅ N/A | Nothing to reset |
| Request / user / locale captured in services | ✅ | Submitted OTP values stay in the per-request form and view objects |
| Superglobals, `$_ENV`, `putenv`, `ini_set`, `setlocale`, timezone | ✅ | None used; config is compiled into container parameters |
| Doctrine / EntityManager | ✅ N/A | No persistence |
| Output, headers, `exit`, shutdown functions | ✅ | None |
| Resources (files, sockets, cURL) held open | ✅ | None |
| Memory growth across requests | ✅ | No caches or accumulating arrays |
| Blocking I/O and timeouts | ✅ N/A | No I/O; digit UI runs in the browser |
| Third-party static state | ✅ | Only Symfony Form, Twig and DI/Config |
| PHPStan FrankenPHP rulesets | ✅ | `ruleset-classic.neon` + `ruleset-worker-strict.neon` + `ruleset-hardening.neon` in `phpstan.neon.dist` |

Worker demo: `demo/symfony8/docker/frankenphp/Caddyfile` has a `worker` block, and `FRANKENPHP_MODE=worker` is the default in `demo/symfony8/docker-compose.yml`.

## Services reviewed

| Service | Shared | Mutable state | Scenario A | Scenario B |
|---------|--------|---------------|------------|------------|
| `Nowo\OtpInputBundle\Form\OtpType` (`form.type`) | yes | none (`readonly` defaults, `src/Form/OtpType.php`) | ✅ | ✅ |

`OtpCodeToStringTransformer` is not a service: `OtpType::buildForm()` creates a new `final readonly` instance for each form build. `Configuration`, `NowoOtpInputExtension`, `TwigPathsPass` and `NowoOtpInputBundle` only run while the container is compiled. Twig themes only read `FormView` vars (per request). Frontend `otp-input.js` runs in the browser and does not share PHP worker memory.

## Findings

No open findings.

`OtpType::buildView()` writes the submitted digits and options into the `FormView` of the current request only, and `configureOptions()` reads the `readonly` defaults (scalars only — no shared mutable arrays). Under Scenario B the same `OtpType` instance is reused; consecutive form builds with different options cannot poison later requests (covered by unit regression `testSharedInstanceDoesNotLeakOptionsAcrossConsecutiveBuilds`).

Info: the OTP code is security-sensitive, but the bundle never keeps it outside the form objects of the request that submitted it, so it cannot leak to the next request on the same worker.

## Usage recommendations in worker mode

- No special configuration or reset hook is needed for this bundle when `FRANKENPHP_RESET_KERNEL=false`.
- Do not keep `FormInterface`, `FormView` or the submitted OTP value in a service property (for example in a custom 2FA handler), because it would stay visible to later requests on the same worker. Verify the code against a store that is keyed by user or session.
- Types that extend or wrap `OtpType` must stay stateless (or implement `ResetInterface`) to keep this verdict.

## Re-audit triggers

Re-run this audit when a change adds: mutable properties to `OtpType`, a shared data transformer or validator service, OTP generation or verification logic, a Twig extension, an event listener, or any use of `$_SERVER` / `$_ENV` / session at runtime.

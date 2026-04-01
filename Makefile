.PHONY: up down build shell ensure-up install assets assets-test test test-coverage test-ts cs-check cs-fix phpstan rector rector-dry qa composer-sync release-check release-check-demos validate-translations clean update validate

COMPOSE_FILE ?= docker-compose.yml
COMPOSE     ?= docker-compose -f $(COMPOSE_FILE)
SERVICE_PHP ?= php

up:
	$(COMPOSE) build
	$(COMPOSE) up -d
	@sleep 3
	$(COMPOSE) exec -T $(SERVICE_PHP) composer install --no-interaction
	$(COMPOSE) exec -T -e CI=true $(SERVICE_PHP) pnpm install

down:
	$(COMPOSE) down

build:
	$(COMPOSE) build --no-cache

shell: ensure-up
	$(COMPOSE) exec $(SERVICE_PHP) sh

ensure-up:
	@if ! $(COMPOSE) exec -T $(SERVICE_PHP) true 2>/dev/null; then \
		$(COMPOSE) up -d; sleep 3; \
		$(COMPOSE) exec -T $(SERVICE_PHP) composer install --no-interaction; \
		$(COMPOSE) exec -T -e CI=true $(SERVICE_PHP) pnpm install; \
	fi

install: ensure-up
	$(COMPOSE) exec -T $(SERVICE_PHP) composer install
	$(COMPOSE) exec -T -e CI=true $(SERVICE_PHP) pnpm install

assets: ensure-up
	$(COMPOSE) exec -T $(SERVICE_PHP) pnpm run build

test: ensure-up
	$(COMPOSE) exec -T $(SERVICE_PHP) composer test

test-coverage: ensure-up
	$(COMPOSE) exec -T $(SERVICE_PHP) composer test-coverage | tee coverage-php.txt
	./.scripts/php-coverage-percent.sh coverage-php.txt

test-ts: ensure-up
	$(COMPOSE) exec -T $(SERVICE_PHP) pnpm run test:coverage | tee coverage-ts.txt
	./.scripts/ts-coverage-percent.sh coverage-ts.txt

assets-test: test-ts

cs-check: ensure-up
	$(COMPOSE) exec -T $(SERVICE_PHP) composer cs-check

cs-fix: ensure-up
	$(COMPOSE) exec -T $(SERVICE_PHP) composer cs-fix

phpstan: ensure-up
	$(COMPOSE) exec -T $(SERVICE_PHP) composer phpstan

rector: ensure-up
	$(COMPOSE) exec -T $(SERVICE_PHP) composer rector

rector-dry: ensure-up
	$(COMPOSE) exec -T $(SERVICE_PHP) composer rector-dry

qa: cs-check test

composer-sync: ensure-up
	$(COMPOSE) exec -T $(SERVICE_PHP) composer validate --strict
	$(COMPOSE) exec -T $(SERVICE_PHP) composer update --lock --no-install --no-interaction

release-check-demos:
	@if [ -d demo ]; then $(MAKE) -C demo release-check; fi

release-check: ensure-up composer-sync cs-fix cs-check rector-dry phpstan test-coverage release-check-demos test-ts

clean:
	rm -rf vendor coverage coverage-ts .phpunit.cache coverage-php.txt coverage-ts.txt

update: ensure-up
	$(COMPOSE) exec -T $(SERVICE_PHP) composer update --no-interaction

validate: ensure-up
	$(COMPOSE) exec -T $(SERVICE_PHP) composer validate --strict

validate-translations: ensure-up
	$(COMPOSE) exec -T $(SERVICE_PHP) php bin/console lint:yaml src/Resources/translations

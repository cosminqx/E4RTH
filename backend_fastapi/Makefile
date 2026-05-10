.PHONY: dev up down logs migrate build

COMPOSE=docker compose -f docker-compose.yml

dev: ## Start backend in dev mode (mounted, with reload)
	$(COMPOSE) up --build backend

up: ## Build and start all services in background
	$(COMPOSE) up --build -d

down: ## Stop and remove containers
	$(COMPOSE) down

logs: ## Follow logs for all services
	$(COMPOSE) logs -f

migrate: ## Run Alembic upgrade head inside backend container
	$(COMPOSE) run --rm backend alembic upgrade head

build: ## Build images
	$(COMPOSE) build

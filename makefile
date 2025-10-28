# 🐳 Makefile

COMPOSE = docker-compose

.PHONY: dev build start stop clean logs

dev:
	MODE=dev $(COMPOSE) up --build

build:
	MODE=prod $(COMPOSE) build

start:
	MODE=prod $(COMPOSE) up -d

stop:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f

clean:
	$(COMPOSE) down --rmi all --volumes --remove-orphans

clean-cache:
	docker builder prune -af

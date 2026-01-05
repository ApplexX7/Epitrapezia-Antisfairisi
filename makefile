# 🐳 Docker Makefile
COMPOSE = docker-compose -f docker-compose.yml

.PHONY: dev build start stop clean logs rebuild clean-cache

dev:
	$(COMPOSE) up --build --remove-orphans

build:
	$(COMPOSE) build

start:
	$(COMPOSE) up -d

stop:
	$(COMPOSE) down -v

logs:
	$(COMPOSE) logs -f

rebuild:
	$(COMPOSE) down --remove-orphans
	$(COMPOSE) up --build

clean:
	$(COMPOSE) down --rmi all --volumes --remove-orphans

clean-cache:
	docker builder prune -af

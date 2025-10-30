# 🐳 Docker Makefile
COMPOSE = docker-compose -f docker-compose.yml
MODE ?= dev

.PHONY: dev build start stop clean logs rebuild clean-cache

dev:
	MODE=$(MODE) $(COMPOSE) up --build --remove-orphans

build:
	MODE=prod $(COMPOSE) build

start:
	MODE=prod $(COMPOSE) up -d

stop:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f

rebuild:
	$(COMPOSE) down --remove-orphans
	MODE=$(MODE) $(COMPOSE) up --build

clean:
	$(COMPOSE) down --rmi all --volumes --remove-orphans

clean-cache:
	docker builder prune -af

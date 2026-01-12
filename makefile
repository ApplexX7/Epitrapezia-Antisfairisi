# 🐳 Docker Makefile
COMPOSE = docker-compose -f docker-compose.yml
DB_DATA := ./database

.PHONY:  all build start stop clean logs rebuild clean-cache

all:
	@mkdir -p $(DB_DATA)
	$(COMPOSE) up --build --remove-orphans

build:
	$(COMPOSE) build

start:
	$(COMPOSE) up -d

stop:
	$(COMPOSE) down -v

logs:
	$(COMPOSE) logs -f

clean:
	$(COMPOSE) down --rmi all --volumes --remove-orphans

clean-cache:
	docker builder prune -af

# 🐳 Docker Makefile
COMPOSE = docker-compose -f docker-compose.yml
DB_DATA := ./database

.PHONY: all build start stop clean logs rebuild clean-cache restart db-backup db-restore

all:
	@mkdir -p $(DB_DATA)
	$(COMPOSE) up --build --remove-orphans

build:
	@mkdir -p $(DB_DATA)
	$(COMPOSE) build

start:
	@mkdir -p $(DB_DATA)
	$(COMPOSE) up -d

stop:
	$(COMPOSE) down

down:
	$(COMPOSE) down -v

logs:
	$(COMPOSE) logs -f

logs-server:
	$(COMPOSE) logs -f server

logs-client:
	$(COMPOSE) logs -f client

restart:
	$(COMPOSE) restart

restart-server:
	$(COMPOSE) restart server

restart-client:
	$(COMPOSE) restart client

clean:
	$(COMPOSE) down --rmi all --volumes --remove-orphans

clean-cache:
	docker builder prune -af

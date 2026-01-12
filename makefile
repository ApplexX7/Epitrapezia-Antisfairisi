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

# Database commands
db-backup:
	@mkdir -p ./backups
	@cp $(DB_DATA)/webpong.sqlite ./backups/webpong-$$(date +%Y%m%d-%H%M%S).sqlite
	@echo "Database backed up to ./backups/"

db-restore:
	@if [ -z "$(FILE)" ]; then echo "Usage: make db-restore FILE=./backups/webpong-xxx.sqlite"; exit 1; fi
	@cp $(FILE) $(DB_DATA)/webpong.sqlite
	@echo "Database restored from $(FILE)"

# Monitoring
prometheus:
	@echo "Opening Prometheus at https://e3r8p4.1337.ma/prometheus/"

grafana:
	@echo "Opening Grafana at https://e3r8p4.1337.ma/grafana/"

alertmanager:
	@echo "Opening Alertmanager at https://e3r8p4.1337.ma/alertmanager/"

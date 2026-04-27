# ============================================
# 🛠️ Makefile — University Academic Portal
# ============================================
# Quick commands for development and deployment
# Usage: make <target>
# ============================================

.PHONY: help dev prod stop logs clean build test

# Default target
help: ## 📋 Show available commands
	@echo ""
	@echo "🎓 University Academic Portal — Commands"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ""

# ── Development ───────────────────────────────

dev: ## 🔧 Start development environment
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

dev-d: ## 🔧 Start development (detached)
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d

# ── Production ────────────────────────────────

prod: ## 🚀 Start production environment
	docker compose up --build -d

prod-logs: ## 📋 Follow production logs
	docker compose logs -f

# ── Common ────────────────────────────────────

stop: ## ⏹️  Stop all containers
	docker compose down

clean: ## 🧹 Stop and remove volumes (⚠️  deletes DB data!)
	docker compose down -v --remove-orphans
	docker image prune -f

restart: ## 🔄 Restart all services
	docker compose restart

# ── Logs ──────────────────────────────────────

logs: ## 📋 Show all logs
	docker compose logs -f

logs-backend: ## 📋 Show backend logs
	docker compose logs -f backend

logs-frontend: ## 📋 Show frontend logs
	docker compose logs -f frontend

logs-db: ## 📋 Show database logs
	docker compose logs -f postgres

# ── Database ──────────────────────────────────

db-shell: ## 🗄️  Open PostgreSQL shell
	docker compose exec postgres psql -U postgres -d academic_portal

db-backup: ## 💾 Backup database
	@mkdir -p backups
	docker compose exec postgres pg_dump -U postgres academic_portal \
		> backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "✅ Backup saved to backups/"

db-restore: ## 📥 Restore database (usage: make db-restore FILE=backups/file.sql)
	docker compose exec -T postgres psql -U postgres -d academic_portal < $(FILE)

# ── Build ─────────────────────────────────────

build: ## 🏗️  Build all Docker images
	docker compose build

build-backend: ## 🏗️  Build backend image only
	docker compose build backend

build-frontend: ## 🏗️  Build frontend image only
	docker compose build frontend

# ── Health ────────────────────────────────────

health: ## 🏥 Check service health
	@echo "🏥 Checking services..."
	@curl -sf http://localhost:5000/api/health | python3 -m json.tool 2>/dev/null || echo "❌ Backend is DOWN"
	@curl -sf http://localhost:80/ > /dev/null 2>&1 && echo "✅ Frontend is UP" || echo "❌ Frontend is DOWN"
	@docker compose exec postgres pg_isready -U postgres > /dev/null 2>&1 && echo "✅ Database is UP" || echo "❌ Database is DOWN"

# ── Setup ─────────────────────────────────────

setup: ## ⚡ First-time setup
	@echo "⚡ Setting up Academic Portal..."
	@test -f .env || (cp .env.example .env && echo "📝 Created .env from template — please fill in values")
	@echo "✅ Setup complete! Run 'make dev' to start"

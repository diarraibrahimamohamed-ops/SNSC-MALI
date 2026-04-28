#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> Création de la structure racine"
mkdir -p apps packages infra/docker infra/compose infra/scripts qa/postman qa/e2e/scenarios qa/test-plans data/seeds data/mock-json data/sms-templates docs/adr docs/diagrams docs/architecture docs/api docs/runbooks docs/team .github/workflows .github/ISSUE_TEMPLATE

echo "==> Création du backend Laravel"
if [ ! -d "apps/api" ]; then
  composer create-project laravel/laravel apps/api
fi

echo "==> Création du frontend Next.js"
if [ ! -d "apps/web" ]; then
  npx create-next-app@latest apps/web \
    --ts \
    --eslint \
    --tailwind \
    --app \
    --src-dir \
    --import-alias "@/*" \
    --use-npm \
    --yes
fi

echo "==> Création du service IA Python"
mkdir -p apps/ia/app/api apps/ia/app/core apps/ia/app/models apps/ia/app/services apps/ia/app/data apps/ia/ml/notebooks apps/ia/ml/training apps/ia/ml/artifacts apps/ia/tests

touch apps/ia/app/__init__.py
touch apps/ia/app/api/__init__.py
touch apps/ia/app/core/__init__.py
touch apps/ia/app/models/__init__.py
touch apps/ia/app/services/__init__.py
touch apps/ia/app/data/__init__.py

cat > apps/ia/app/main.py <<'PY'
from fastapi import FastAPI
from app.api.routes_health import router as health_router
from app.api.routes_predict import router as predict_router

app = FastAPI(title="Vaccin Track IA Service")

app.include_router(health_router)
app.include_router(predict_router)
PY

cat > apps/ia/app/api/routes_health.py <<'PY'
from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
def health():
    return {"status": "ok"}
PY

cat > apps/ia/app/api/routes_predict.py <<'PY'
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class PredictRequest(BaseModel):
    enfant_id: str
    features: dict

@router.post("/predict")
def predict(payload: PredictRequest):
    return {
        "enfant_id": payload.enfant_id,
        "score": 0.42,
        "niveau_risque": "MOYEN",
        "confiance": 0.81,
        "facteurs_explicatifs": {"retard": 1, "assiduite": 0.6}
    }
PY

cat > apps/ia/app/core/config.py <<'PY'
import os

APP_NAME = os.getenv("APP_NAME", "vaccin-track-ia")
PY

cat > apps/ia/app/core/security.py <<'PY'
API_TOKEN = "change-me"
PY

cat > apps/ia/app/core/logging.py <<'PY'
import logging
logging.basicConfig(level=logging.INFO)
PY

cat > apps/ia/app/models/schemas.py <<'PY'
from pydantic import BaseModel
from typing import Dict, Any

class PredictPayload(BaseModel):
    enfant_id: str
    features: Dict[str, Any]
PY

cat > apps/ia/app/models/risque_model.py <<'PY'
class RisqueModel:
    def predict(self, features: dict):
        return 0.42
PY

cat > apps/ia/app/services/feature_engineering.py <<'PY'
def build_features(payload: dict) -> dict:
    return payload
PY

cat > apps/ia/app/services/predictor.py <<'PY'
from app.models.risque_model import RisqueModel

def predict(features: dict) -> float:
    model = RisqueModel()
    return model.predict(features)
PY

cat > apps/ia/app/services/explainer.py <<'PY'
def explain(features: dict) -> dict:
    return {"explication": "placeholder"}
PY

cat > apps/ia/app/data/loader.py <<'PY'
def load_data():
    return []
PY

cat > apps/ia/ml/training/train.py <<'PY'
print("Training placeholder")
PY

cat > apps/ia/ml/training/evaluate.py <<'PY'
print("Evaluation placeholder")
PY

cat > apps/ia/ml/training/pipeline.py <<'PY'
print("Pipeline placeholder")
PY

cat > apps/ia/tests/test_predict.py <<'PY'
def test_placeholder():
    assert True
PY

cat > apps/ia/tests/test_features.py <<'PY'
def test_placeholder():
    assert True
PY

cat > apps/ia/tests/test_api.py <<'PY'
def test_placeholder():
    assert True
PY

cat > apps/ia/requirements.txt <<'TXT'
fastapi
uvicorn[standard]
pydantic
scikit-learn
pandas
numpy
pytest
TXT

cat > apps/ia/pyproject.toml <<'TXT'
[tool.pytest.ini_options]
pythonpath = ["."]
TXT

cat > apps/ia/.env.example <<'TXT'
APP_NAME=vaccin-track-ia
TXT

cat > apps/ia/README.md <<'TXT'
# IA Python
Service de scoring de risque vaccinal.
TXT

echo "==> Création des packages partagés"
mkdir -p packages/api-contracts packages/shared-types/src

cat > packages/api-contracts/README.md <<'TXT'
# API Contracts
Contrats OpenAPI partagés entre backend et frontend.
TXT

cat > packages/api-contracts/openapi.yaml <<'YAML'
openapi: 3.0.3
info:
  title: Vaccin Track API
  version: 0.1.0
paths: {}
YAML

cat > packages/shared-types/package.json <<'JSON'
{
  "name": "@vaccin-track/shared-types",
  "version": "0.1.0",
  "main": "src/common.ts"
}
JSON

cat > packages/shared-types/src/enums.ts <<'TS'
export type NiveauRisque = "FAIBLE" | "MOYEN" | "ELEVE";
TS

cat > packages/shared-types/src/common.ts <<'TS'
export type UUID = string;
TS

echo "==> Création de la documentation"
cat > docs/README.md <<'TXT'
# Documentation projet
Voir /docs/architecture et /docs/api
TXT

cat > docs/adr/001-choix-monorepo.md <<'TXT'
# ADR 001 - Choix monorepo
TXT

cat > docs/adr/002-backend-laravel.md <<'TXT'
# ADR 002 - Backend Laravel
TXT

cat > docs/adr/003-frontend-nextjs.md <<'TXT'
# ADR 003 - Frontend Next.js
TXT

cat > docs/adr/004-ia-python.md <<'TXT'
# ADR 004 - IA Python
TXT

cat > docs/adr/005-postgresql-uuid.md <<'TXT'
# ADR 005 - PostgreSQL UUID
TXT

cat > docs/adr/006-mobile-api-only.md <<'TXT'
# ADR 006 - Mobile via API uniquement
TXT

cat > docs/architecture/overview.md <<'TXT'
# Vue d'ensemble architecture
TXT

cat > docs/architecture/backend-modules.md <<'TXT'
# Modules backend
TXT

cat > docs/architecture/frontend-structure.md <<'TXT'
# Structure frontend
TXT

cat > docs/architecture/ia-pipeline.md <<'TXT'
# Pipeline IA
TXT

cat > docs/architecture/security-rbac.md <<'TXT'
# Sécurité RBAC
TXT

cat > docs/architecture/audit-strategy.md <<'TXT'
# Stratégie d'audit
TXT

cat > docs/architecture/sms-integration.md <<'TXT'
# Intégration SMS
TXT

cat > docs/api/openapi.yaml <<'YAML'
openapi: 3.0.3
info:
  title: Vaccin Track API
  version: 0.1.0
paths: {}
YAML

cat > docs/api/conventions.md <<'TXT'
# Conventions API
TXT

cat > docs/api/error-format.md <<'TXT'
# Format d'erreur API
TXT

cat > docs/team/workflow-git.md <<'TXT'
# Workflow Git
TXT

cat > docs/team/branch-naming.md <<'TXT'
# Convention de nommage des branches
TXT

cat > docs/team/code-review.md <<'TXT'
# Revue de code
TXT

cat > docs/team/onboarding.md <<'TXT'
# Onboarding
TXT

echo "==> Création fichiers GitHub"
cat > .github/PULL_REQUEST_TEMPLATE.md <<'TXT'
## Résumé
- 

## Type
- [ ] Feature
- [ ] Fix
- [ ] Refactor
- [ ] Docs
- [ ] Test
- [ ] Infra

## Vérifications
- [ ] Tests OK
- [ ] Migrations OK
- [ ] Swagger mis à jour
TXT

cat > .github/CODEOWNERS <<'TXT'
* @lead
/apps/api/ @dev-backend @dev-integration
/apps/web/ @dev-frontend
/apps/ia/ @lead
/docs/ @lead
/infra/ @dev-integration
TXT

cat > .github/workflows/ci-api.yml <<'YAML'
name: CI API
on: [push, pull_request]
jobs:
  api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
YAML

cat > .github/workflows/ci-web.yml <<'YAML'
name: CI WEB
on: [push, pull_request]
jobs:
  web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
YAML

cat > .github/workflows/ci-ia.yml <<'YAML'
name: CI IA
on: [push, pull_request]
jobs:
  ia:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
YAML

cat > .github/workflows/docker-build.yml <<'YAML'
name: Docker Build
on: [push]
jobs:
  docker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
YAML

cat > .github/workflows/security-scan.yml <<'YAML'
name: Security Scan
on: [push, pull_request]
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
YAML

echo "==> Dockerfiles"
mkdir -p apps/api/docker/php apps/api/docker/nginx apps/api/docker/postgres

cat > apps/api/docker/php/Dockerfile <<'DOCKER'
FROM php:8.3-cli

RUN apt-get update && apt-get install -y \
    git unzip curl libpq-dev libzip-dev zip \
    && docker-php-ext-install pdo pdo_pgsql pgsql zip

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /var/www/html
CMD ["php", "-v"]
DOCKER

cat > apps/web/Dockerfile <<'DOCKER'
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3000"]
DOCKER

cat > apps/ia/Dockerfile <<'DOCKER'
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080", "--reload"]
DOCKER

cat > docker-compose.yml <<'YAML'
services:
  postgres:
    image: postgres:16
    container_name: vaccin_postgres
    environment:
      POSTGRES_DB: vaccin_track
      POSTGRES_USER: vaccin_user
      POSTGRES_PASSWORD: vaccin_pass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    container_name: vaccin_redis
    ports:
      - "6379:6379"

  api:
    build:
      context: ./apps/api
      dockerfile: docker/php/Dockerfile
    container_name: vaccin_api
    working_dir: /var/www/html
    volumes:
      - ./apps/api:/var/www/html
    ports:
      - "8000:8000"
    depends_on:
      - postgres
      - redis
    command: sh -c "composer install && php artisan key:generate --force && php artisan serve --host=0.0.0.0 --port=8000"

  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
    container_name: vaccin_web
    working_dir: /app
    volumes:
      - ./apps/web:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    depends_on:
      - api
    command: sh -c "npm install && npm run dev -- --hostname 0.0.0.0 --port 3000"

  ia:
    build:
      context: ./apps/ia
      dockerfile: Dockerfile
    container_name: vaccin_ia
    working_dir: /app
    volumes:
      - ./apps/ia:/app
    ports:
      - "8080:8080"
    command: sh -c "pip install --no-cache-dir -r requirements.txt && uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload"

volumes:
  postgres_data:
YAML

mkdir -p infra/compose infra/scripts
cp docker-compose.yml infra/compose/docker-compose.dev.yml

cat > infra/scripts/dev-up.sh <<'SH'
#!/usr/bin/env bash
docker compose up -d --build
SH

cat > infra/scripts/dev-down.sh <<'SH'
#!/usr/bin/env bash
docker compose down
SH

cat > infra/scripts/seed.sh <<'SH'
#!/usr/bin/env bash
cd apps/api && php artisan db:seed
SH

cat > infra/scripts/test.sh <<'SH'
#!/usr/bin/env bash
set -e
(cd apps/api && php artisan test)
(cd apps/web && npm test || true)
(cd apps/ia && pytest || true)
SH

cat > infra/scripts/deploy.sh <<'SH'
#!/usr/bin/env bash
echo "Déploiement à définir"
SH

chmod +x infra/scripts/*.sh

echo "==> Fichiers racine"
cat > .gitignore <<'TXT'
.env
.env.*
vendor/
node_modules/
.next/
coverage/
apps/api/vendor/
apps/web/node_modules/
apps/web/.next/
apps/ia/__pycache__/
apps/ia/.pytest_cache/
TXT

cat > .editorconfig <<'TXT'
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
insert_final_newline = true
TXT

cat > .env.example <<'TXT'
POSTGRES_DB=vaccin_track
POSTGRES_USER=vaccin_user
POSTGRES_PASSWORD=vaccin_pass
TXT

cat > Makefile <<'TXT'
up:
	docker compose up -d --build

down:
	docker compose down

logs:
	docker compose logs -f

migrate:
	cd apps/api && php artisan migrate

fresh:
	cd apps/api && php artisan migrate:fresh --seed
TXT

cat > README.md <<'TXT'
# Vaccin Track
Monorepo Laravel + Next.js + Python + PostgreSQL
TXT

echo "==> Bootstrap terminé"
tree -L 2

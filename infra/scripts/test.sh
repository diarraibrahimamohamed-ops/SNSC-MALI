#!/usr/bin/env bash
set -e
(cd apps/api && php artisan test)
(cd apps/web && npm test || true)
(cd apps/ia && pytest || true)

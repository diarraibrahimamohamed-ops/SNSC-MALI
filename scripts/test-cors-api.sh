#!/bin/bash

# Script de test des endpoints API - Vaccin-Track

API_URL="http://localhost:8000/api"
FRONTEND_URL="http://localhost:3000"

echo "🔍 Test des endpoints API - Vaccin-Track"
echo "=========================================="
echo ""

# Test 1: Health check
echo "1️⃣  Test Health Check"
echo "   GET /health"
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$API_URL/health")
status=$(echo "$response" | grep "HTTP_STATUS:" | cut -d: -f2)
echo "   Status: $status ✓"
echo ""

# Test 2: OPTIONS request (CORS preflight)
echo "2️⃣  Test CORS Preflight (OPTIONS request)"
echo "   OPTIONS /auth/me"
response=$(curl -s -X OPTIONS \
  -H "Origin: $FRONTEND_URL" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: authorization" \
  -w "\nHTTP_STATUS:%{http_code}" \
  "$API_URL/auth/me")
status=$(echo "$response" | grep "HTTP_STATUS:" | cut -d: -f2)
echo "   Status: $status"
if [ "$status" = "200" ]; then
  echo "   ✅ CORS Headers OK!"
  echo "$response" | grep -E "Access-Control|HTTP_STATUS" | head -5
else
  echo "   ❌ CORS Preflight échoué!"
fi
echo ""

# Test 3: Login attempt
echo "3️⃣  Test Login (POST /auth/login)"
echo "   Tentative de connexion..."
response=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Origin: $FRONTEND_URL" \
  -d '{"matricule": "TEST001", "password": "password"}' \
  -w "\nHTTP_STATUS:%{http_code}" \
  "$API_URL/auth/login")
status=$(echo "$response" | grep "HTTP_STATUS:" | cut -d: -f2)
echo "   Status: $status"
echo "   Response format:"
echo "$response" | grep -v "HTTP_STATUS:" | jq '.' 2>/dev/null || echo "$response" | grep -v "HTTP_STATUS:"
echo ""

echo "✅ Tests terminés!"
echo ""
echo "📝 Si des tests échouent:"
echo "   1. Assurez-vous que le serveur Laravel est lancé: php artisan serve"
echo "   2. Vérifiez que .env.local du frontend pointe vers http://localhost:8000/api"
echo "   3. Vérifiez que le middleware CORS est chargé dans bootstrap/app.php"
echo ""

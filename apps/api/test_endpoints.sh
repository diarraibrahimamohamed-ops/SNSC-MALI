#!/bin/bash

API_URL="http://localhost:8000/api"

echo "========== TEST 1: Admin Login =========="
ADMIN_LOGIN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "matricule": "ADMIN-REGIONAL-001",
    "password": "admin123"
  }')

echo "Admin Login Response:"
echo $ADMIN_LOGIN | jq .

ADMIN_TOKEN=$(echo $ADMIN_LOGIN | jq -r '.access_token // empty')

if [ -z "$ADMIN_TOKEN" ]; then
  echo "ERROR: Admin login failed!"
  exit 1
fi

echo "✓ Admin token: $ADMIN_TOKEN (first 20 chars): ${ADMIN_TOKEN:0:20}..."

echo ""
echo "========== TEST 2: Create Vaccination Record =========="

VACCINATION=$(curl -s -X POST "$API_URL/actes-vaccinaux" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "enfant_id": "133bc84e-33b6-4ab0-a9c9-a7256b76df70",
    "vaccin_id": "3e5dab7c-ec98-45bd-9472-1ea4a21918de",
    "agent_id": "e0c6049b-5093-11f1-a48a-40a3cc0598a8",
    "centre_sante_id": "081fb1a7-dbd4-30a1-b079-295012e8e21d",
    "administre_le": "2026-05-18",
    "numero_lot": "LOT-123456"
  }')

echo "Vaccination Creation Response:"
echo $VACCINATION | jq .

ACTE_ID=$(echo $VACCINATION | jq -r '.data.id // empty')
if [ -n "$ACTE_ID" ]; then
  echo "✓ Vaccination created with ID: $ACTE_ID"
else
  echo "ERROR: Failed to create vaccination"
fi

echo ""
echo "========== TEST 3: Get Vaccinations =========="

GET_VACCINATIONS=$(curl -s -X GET "$API_URL/actes-vaccinaux" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Get Vaccinations Response:"
echo $GET_VACCINATIONS | jq '.data | length'
echo "Total vaccinations: $(echo $GET_VACCINATIONS | jq '.data | length')"

echo ""
echo "========== All tests completed =========="

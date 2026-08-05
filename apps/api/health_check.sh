#!/bin/bash

cd /home/empereur/Bureau/vaccin-track/apps/api

echo "=== Checking Laravel Application Health ==="
echo ""

# Check PHP syntax
echo "1. Checking PHP Syntax..."
php -l app/Models/Admin.php && echo "✓ Admin.php OK" || echo "✗ Admin.php has errors"
php -l app/Http/Controllers/Api/AuthController.php && echo "✓ AuthController.php OK" || echo "✗ AuthController.php has errors"
php -l app/Http/Controllers/Api/ActeVaccinalController.php && echo "✓ ActeVaccinalController.php OK" || echo "✗ ActeVaccinalController.php has errors"

echo ""
echo "2. Verifying Database State..."
php artisan tinker --execute="echo 'Admin count: ' . \App\Models\Admin::count();"
php artisan tinker --execute="echo 'Vaccin count: ' . \App\Models\Vaccin::count();"
php artisan tinker --execute="echo 'Centre Sante count: ' . \App\Models\CentreSante::count();"
php artisan tinker --execute="echo 'Agent count: ' . \App\Models\Agent::count();"
php artisan tinker --execute="echo 'Enfant count: ' . \App\Models\Enfant::count();"

echo ""
echo "3. Sample Data:"
php artisan tinker --execute="print_r(\App\Models\Admin::select('matricule', 'email', 'role')->first()?->toArray());"
php artisan tinker --execute="print_r(\App\Models\Vaccin::select('code', 'nom')->first()?->toArray());"

echo ""
echo "=== Health Check Complete ==="

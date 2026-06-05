<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Agent;
use App\Models\Enfant;
use App\Models\Vaccin;
use App\Models\ActeVaccinal;
use App\Models\CentreSante;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationAndVaccinationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_login_with_matricule()
    {
        // Create an admin
        $admin = Admin::create([
            'nom' => 'Admin',
            'prenom' => 'Test',
            'matricule' => 'ADM-TEST-001',
            'email' => 'admin-test@test.com',
            'password' => bcrypt('password123'),
            'telephone' => '70000000',
            'role' => 'super_admin',
            'est_actif' => true,
        ]);

        // Attempt login
        $response = $this->postJson('/api/auth/login', [
            'matricule' => 'ADM-TEST-001',
            'password' => 'password123',
        ]);

        $response->assertStatus(200);
        $response->assertHasPath('access_token');
        $response->assertHasPath('admin');
    }

    public function test_create_vaccination_record()
    {
        // Create test data
        $centre = CentreSante::factory()->create();
        $agent = Agent::factory()->create(['centre_sante_id' => $centre->id]);
        $enfant = Enfant::factory()->create(['centre_sante_id' => $centre->id]);
        $vaccin = Vaccin::create([
            'code' => 'TEST-VAC',
            'nom' => 'Test Vaccine',
            'maladie_cible' => 'Test Disease',
            'est_actif' => true,
        ]);

        // Authenticate as agent
        $token = auth('api')->login($agent);

        // Create vaccination
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/actes-vaccinaux', [
                'enfant_id' => $enfant->id,
                'vaccin_id' => $vaccin->id,
                'agent_id' => $agent->id,
                'centre_sante_id' => $centre->id,
                'administre_le' => now()->format('Y-m-d'),
                'numero_lot' => 'LOT-123',
            ]);

        $response->assertStatus(201);
        $response->assertHasPath('data.id');
        $this->assertDatabaseHas('actes_vaccinaux', [
            'vaccin_id' => $vaccin->id,
            'enfant_id' => $enfant->id,
        ]);
    }
}

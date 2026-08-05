<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Agent;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_peut_se_connecter(): void
    {
        $agent = Agent::factory()->create([
            'password' => 'password123'
        ]);

        $response = $this->postJson('/api/auth/login', [
            'matricule' => $agent->matricule,
            'password' => 'password123'
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'access_token',
                'token_type',
                'expires_in',
                'agent' => [
                    'id',
                    'matricule',
                    'nom_complet',
                    'role'
                ]
            ]);
    }

    public function test_ne_peut_pas_se_connecter_avec_mauvais_mot_de_passe(): void
    {
        $agent = Agent::factory()->create();

        $response = $this->postJson('/api/auth/login', [
            'matricule' => $agent->matricule,
            'password' => 'wrongpassword'
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Identifiants invalides'
            ]);
    }

    public function test_peut_se_deconnecter(): void
    {
        $agent = Agent::factory()->create();
        $token = auth('api')->login($agent);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/auth/logout');

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Déconnexion réussie'
            ]);
    }
}

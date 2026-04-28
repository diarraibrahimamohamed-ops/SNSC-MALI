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
            'password' => bcrypt('password123')
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => $agent->email,
            'password' => 'password123'
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'token',
                'user' => [
                    'id',
                    'email',
                    'nom',
                    'prenom',
                    'role'
                ]
            ]);
    }

    public function test_ne_peut_pas_se_connecter_avec_mauvais_mot_de_passe(): void
    {
        $agent = Agent::factory()->create();

        $response = $this->postJson('/api/auth/login', [
            'email' => $agent->email,
            'password' => 'wrongpassword'
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Invalid credentials'
            ]);
    }

    public function test_peut_se_deconnecter(): void
    {
        $agent = Agent::factory()->create();
        $token = $agent->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/auth/logout');

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Logged out successfully'
            ]);
    }
}

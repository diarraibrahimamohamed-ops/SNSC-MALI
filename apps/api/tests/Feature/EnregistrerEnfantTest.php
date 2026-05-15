<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\CentreSante;
use App\Models\Agent;

class EnregistrerEnfantTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->agent = Agent::factory()->create();
        $this->centre = CentreSante::factory()->create();
    }

    public function test_peut_enregistrer_un_enfant(): void
    {
        $enfantData = [
            'identifiant_sanitaire' => 'SAN-' . rand(1000, 9999),
            'nom' => 'Doe',
            'prenom' => 'John',
            'date_naissance' => '2023-01-01',
            'sexe' => 'M',
            'age_mois' => 12,
            'centre_sante_id' => $this->centre->id,
            'statut_vaccinal_global' => 'INCONNU'
        ];

        $response = $this->actingAs($this->agent, 'api')
            ->postJson('/api/enfants', $enfantData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'identifiant_sanitaire',
                    'nom',
                    'prenom',
                    'sexe',
                    'date_naissance',
                    'statut_vaccinal_global'
                ]
            ]);
    }

    public function test_ne_peut_pas_enregistrer_enfant_sans_auth(): void
    {
        $enfantData = [
            'identifiant_sanitaire' => 'SAN-FAIL',
            'nom' => 'Doe',
            'prenom' => 'Fail',
            'date_naissance' => '2023-01-01',
            'sexe' => 'M',
            'centre_sante_id' => $this->centre->id,
        ];

        $response = $this->postJson('/api/enfants', $enfantData);

        $response->assertStatus(401);
    }
}

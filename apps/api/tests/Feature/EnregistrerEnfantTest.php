<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
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
            'nom' => 'Doe',
            'prenom' => 'John',
            'date_naissance' => '2022-01-01',
            'sexe' => 'M',
            'lieu_naissance' => 'Paris',
            'centre_sante_id' => $this->centre->id,
            'tuteurs' => [
                [
                    'nom' => 'Doe',
                    'prenom' => 'Jane',
                    'telephone' => '0123456789',
                    'relation' => 'Mère'
                ]
            ]
        ];

        $response = $this->actingAs($this->agent, 'api')
            ->postJson('/api/enfants', $enfantData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'id',
                'uuid',
                'nom',
                'prenom',
                'tuteurs' => [
                    '*' => ['id', 'nom', 'prenom', 'telephone', 'relation']
                ]
            ]);
    }

    public function test_ne_peut_pas_enregistrer_enfant_sans_auth(): void
    {
        $enfantData = [
            'nom' => 'Doe',
            'prenom' => 'John',
            'date_naissance' => '2022-01-01',
            'sexe' => 'M',
        ];

        $response = $this->postJson('/api/enfants', $enfantData);

        $response->assertStatus(401);
    }
}

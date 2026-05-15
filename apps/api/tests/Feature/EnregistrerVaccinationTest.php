<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Enfant;
use App\Models\Agent;
use App\Models\Vaccin;
use App\Models\CentreSante;

class EnregistrerVaccinationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->agent = Agent::factory()->create();
        $this->centre = CentreSante::factory()->create();
        $this->enfant = Enfant::factory()->create(['centre_sante_id' => $this->centre->id]);
        $this->vaccin = Vaccin::factory()->create();
    }

    public function test_peut_enregistrer_une_vaccination(): void
    {
        $vaccinationData = [
            'enfant_id' => $this->enfant->id,
            'vaccin_id' => $this->vaccin->id,
            'agent_id' => $this->agent->id,
            'centre_sante_id' => $this->centre->id,
            'administre_le' => now()->toISOString(),
            'notes' => 'Test vaccination',
        ];

        $response = $this->actingAs($this->agent, 'api')
            ->postJson('/api/actes-vaccinaux', $vaccinationData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'administre_le',
                    'enfant',
                    'vaccin',
                    'agent'
                ]
            ]);
    }
}

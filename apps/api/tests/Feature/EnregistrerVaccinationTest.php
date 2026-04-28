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
            'date_vaccination' => now()->toDateString(),
            'dose' => 1,
            'agent_id' => $this->agent->id,
        ];

        $response = $this->actingAs($this->agent, 'api')
            ->postJson('/api/actes-vaccinaux', $vaccinationData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'id',
                'date_vaccination',
                'dose',
                'enfant' => ['id', 'nom', 'prenom'],
                'vaccin' => ['id', 'nom'],
                'agent' => ['id', 'nom', 'prenom']
            ]);
    }

    public function test_ne_peut_pas_vacciner_enfant_non_autorise(): void
    {
        $autreAgent = Agent::factory()->create();
        $vaccinationData = [
            'enfant_id' => $this->enfant->id,
            'vaccin_id' => $this->vaccin->id,
            'date_vaccination' => now()->toDateString(),
            'dose' => 1,
            'agent_id' => $autreAgent->id,
        ];

        $response = $this->actingAs($this->agent, 'api')
            ->postJson('/api/actes-vaccinaux', $vaccinationData);

        $response->assertStatus(403);
    }
}

<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Enfant;
use App\Models\Agent;
use App\Models\NotificationSms;

class RelanceSmsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->agent = Agent::factory()->create();
    }

    public function test_peut_voir_liste_des_relances(): void
    {
        NotificationSms::factory()->count(5)->create();

        $response = $this->actingAs($this->agent, 'api')
            ->getJson('/api/relances-sms');

        $response->assertStatus(200)
            ->assertJsonCount(5, 'data')
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'telephone',
                        'message',
                        'statut',
                        'date_envoi',
                        'enfant' => ['id', 'nom', 'prenom']
                    ]
                ]
            ]);
    }

    public function test_peut_declencher_relances_manuelles(): void
    {
        $enfant = Enfant::factory()->create();

        $response = $this->actingAs($this->agent, 'api')
            ->postJson('/api/relances-sms/declencher', [
                'enfant_ids' => [$enfant->id]
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Relances déclenchées avec succès'
            ]);
    }
}

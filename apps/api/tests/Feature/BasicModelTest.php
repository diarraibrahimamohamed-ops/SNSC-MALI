<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Agent;

class BasicModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_peut_creer_un_agent(): void
    {
        $agent = Agent::factory()->create();
        $this->assertDatabaseHas('agents', [
            'id' => $agent->id,
            'matricule' => $agent->matricule
        ]);
    }
}

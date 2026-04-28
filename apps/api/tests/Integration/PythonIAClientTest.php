<?php

namespace Tests\Integration;

use Tests\TestCase;
use App\Modules\RisqueIA\Services\PythonIAClient;
use Illuminate\Support\Facades\Http;

class PythonIAClientTest extends TestCase
{
    protected PythonIAClient $client;

    protected function setUp(): void
    {
        parent::setUp();
        $this->client = new PythonIAClient();
    }

    public function test_connecte_au_service_ia(): void
    {
        Http::fake([
            'http://ia-service:8000/health' => Http::response(['status' => 'healthy'], 200)
        ]);

        $response = $this->client->healthCheck();

        $this->assertTrue($response);
    }

    public function test_predit_risque_avec_features(): void
    {
        $features = [
            'age_en_mois' => 6,
            'nombre_vaccinations' => 2,
            'jours_derniere_vaccination' => 30,
            'region_centre' => 'Dakar'
        ];

        Http::fake([
            'http://ia-service:8000/predict' => Http::response([
                'risque_score' => 0.75,
                'risque_level' => 'high',
                'confidence' => 0.85
            ], 200)
        ]);

        $result = $this->client->predictRisk($features);

        $this->assertEquals(0.75, $result['risque_score']);
        $this->assertEquals('high', $result['risque_level']);
        $this->assertEquals(0.85, $result['confidence']);
    }

    public function test_gere_erreur_service_indisponible(): void
    {
        Http::fake([
            'http://ia-service:8000/health' => Http::response(null, 500)
        ]);

        $response = $this->client->healthCheck();

        $this->assertFalse($response);
    }

    public function test_gere_timeout_prediction(): void
    {
        $features = ['age_en_mois' => 6];

        Http::fake([
            'http://ia-service:8000/predict' => Http::timeout()
        ]);

        $this->expectException(\Exception::class);
        $this->client->predictRisk($features);
    }
}

<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Modules\RisqueIA\Services\CollecteurFeaturesService;
use App\Models\Enfant;
use App\Models\ActeVaccinal;
use App\Models\CentreSante;
use Carbon\Carbon;

class CollecteurFeaturesTest extends TestCase
{
    protected CollecteurFeaturesService $collecteur;

    protected function setUp(): void
    {
        parent::setUp();
        $this->collecteur = new CollecteurFeaturesService();
    }

    public function test_collecte_features_pour_enfant(): void
    {
        $centre = CentreSante::factory()->create();
        $enfant = Enfant::factory()->create([
            'date_naissance' => Carbon::now()->subMonths(6),
            'centre_sante_id' => $centre->id
        ]);

        // Ajouter quelques vaccinations
        ActeVaccinal::factory()->count(3)->create([
            'enfant_id' => $enfant->id,
            'date_vaccination' => Carbon::now()->subMonths(rand(1, 5))
        ]);

        $features = $this->collecteur->collecterFeatures($enfant->id);

        $this->assertIsArray($features);
        $this->assertArrayHasKey('age_en_mois', $features);
        $this->assertArrayHasKey('nombre_vaccinations', $features);
        $this->assertArrayHasKey('jours_derniere_vaccination', $features);
        $this->assertArrayHasKey('region_centre', $features);
        
        $this->assertEquals(6, $features['age_en_mois']);
        $this->assertEquals(3, $features['nombre_vaccinations']);
    }

    public function test_calcule_age_correctement(): void
    {
        $enfant = Enfant::factory()->create([
            'date_naissance' => Carbon::now()->subMonths(8)->subDays(15)
        ]);

        $features = $this->collecteur->collecterFeatures($enfant->id);

        $this->assertEquals(8, $features['age_en_mois']);
        $this->assertEquals(15, $features['jours_en_plus']);
    }

    public function test_handle_enfant_sans_vaccination(): void
    {
        $enfant = Enfant::factory()->create([
            'date_naissance' => Carbon::now()->subMonths(4)
        ]);

        $features = $this->collecteur->collecterFeatures($enfant->id);

        $this->assertEquals(0, $features['nombre_vaccinations']);
        $this->assertNull($features['jours_derniere_vaccination']);
        $this->assertNull($features['intervalle_moyen_vaccinations']);
    }

    public function test_inclut_features_geographiques(): void
    {
        $centre = CentreSante::factory()->create([
            'region' => 'Dakar',
            'ville' => 'Dakar'
        ]);
        $enfant = Enfant::factory()->create([
            'centre_sante_id' => $centre->id
        ]);

        $features = $this->collecteur->collecterFeatures($enfant->id);

        $this->assertEquals('Dakar', $features['region_centre']);
        $this->assertEquals('Dakar', $features['ville_centre']);
    }
}

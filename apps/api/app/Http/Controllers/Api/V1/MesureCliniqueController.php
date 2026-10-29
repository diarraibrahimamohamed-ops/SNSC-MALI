<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Grossesse;
use App\Models\MesureClinique;
use App\Modules\SanteMaternelle\Services\AccesParStructureService;
use App\Modules\SanteMaternelle\Services\AuditCliniqueService;
use Illuminate\Http\Request;

class MesureCliniqueController extends Controller
{
    /**
     * Broad technical plausibility bounds to catch obvious entry/unit errors.
     * They are NOT clinical thresholds and must not be used to triage a patient.
     */
    private const CATALOGUE = [
        ['code' => 'POIDS_MATERNEL', 'libelle' => 'Poids maternel', 'unite' => 'kg', 'minimum' => 10, 'maximum' => 400],
        ['code' => 'TENSION_ARTERIELLE_SYSTOLIQUE', 'libelle' => 'Tension systolique', 'unite' => 'mmHg', 'minimum' => 40, 'maximum' => 350],
        ['code' => 'TENSION_ARTERIELLE_DIASTOLIQUE', 'libelle' => 'Tension diastolique', 'unite' => 'mmHg', 'minimum' => 20, 'maximum' => 250],
        ['code' => 'TENSION_ARTERIELLE', 'libelle' => 'Tension artérielle (ancienne saisie)', 'unite' => 'mmHg', 'minimum' => 20, 'maximum' => 350],
        ['code' => 'TEMPERATURE', 'libelle' => 'Température', 'unite' => '°C', 'minimum' => 25, 'maximum' => 45],
        ['code' => 'FREQUENCE_CARDIAQUE', 'libelle' => 'Fréquence cardiaque', 'unite' => 'bpm', 'minimum' => 20, 'maximum' => 300],
        ['code' => 'FREQUENCE_RESPIRATOIRE', 'libelle' => 'Fréquence respiratoire', 'unite' => 'cycles/min', 'minimum' => 3, 'maximum' => 100],
        ['code' => 'SATURATION_OXYGENE', 'libelle' => 'Saturation en oxygène', 'unite' => '%', 'minimum' => 30, 'maximum' => 100],
        ['code' => 'HAUTEUR_UTERINE', 'libelle' => 'Hauteur utérine', 'unite' => 'cm', 'minimum' => 0, 'maximum' => 70],
    ];

    public function catalogue()
    {
        return response()->json(['data' => self::CATALOGUE]);
    }

    public function index(string $grossesse, AccesParStructureService $acces)
    {
        $dossier = Grossesse::findOrFail($grossesse);
        $acces->verifierCentre($dossier->centre_sante_id);

        return response()->json([
            'data' => $dossier->mesures()->orderByDesc('mesuree_le')->paginate(50),
        ]);
    }

    public function store(
        Request $request,
        string $grossesse,
        AccesParStructureService $acces,
        AuditCliniqueService $audit
    ) {
        $data = $request->validate([
            'type_mesure' => ['required', 'string', 'max:100'],
            'valeur' => ['required', 'numeric'],
            'unite' => ['required', 'string', 'max:30'],
            'mesuree_le' => ['required', 'date', 'before_or_equal:now'],
            'methode' => ['nullable', 'string', 'max:100'],
            'source_donnee' => ['nullable', 'string', 'max:100'],
        ]);

        $dossier = Grossesse::findOrFail($grossesse);
        $acces->verifierCentre($dossier->centre_sante_id);

        $known = collect(self::CATALOGUE)->firstWhere('code', $data['type_mesure']);
        if ($known !== null) {
            if ($data['unite'] !== $known['unite']) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'unite' => ["L’unité attendue pour {$known['libelle']} est {$known['unite']}. Il s’agit d’un contrôle de saisie, pas d’une interprétation médicale."],
                ]);
            }

            if ($data['valeur'] < $known['minimum'] || $data['valeur'] > $known['maximum']) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'valeur' => ["La valeur est en dehors des limites techniques de saisie prévues pour {$known['libelle']}. Vérifiez la saisie et la mesure source."],
                ]);
            }
        }

        $mesure = MesureClinique::create([
            ...$data,
            'grossesse_id' => $dossier->id,
            'auteur_id' => $acces->utilisateur()?->agentId,
            'source_donnee' => $data['source_donnee'] ?? 'SAISIE_AGENT',
            'statut_validation' => 'A_VERIFIER',
        ]);

        $audit->journaliser(
            'CREATION_MESURE_CLINIQUE',
            'MesureClinique',
            $mesure->id,
            $dossier->centre_sante_id,
        );

        return response()->json(['data' => $mesure], 201);
    }
}

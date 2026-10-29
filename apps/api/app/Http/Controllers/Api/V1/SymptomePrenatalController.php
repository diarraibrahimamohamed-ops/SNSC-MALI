<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ContactPrenatal;
use App\Models\DeclarationSymptomePrenatal;
use App\Models\Grossesse;
use App\Modules\SanteMaternelle\Services\AccesParStructureService;
use App\Modules\SanteMaternelle\Services\AuditCliniqueService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

class SymptomePrenatalController extends Controller
{
    private const SYMPTOMES = [
        'DOULEURS_ABDOMINALES' => 'Douleurs abdominales',
        'SAIGNEMENTS_VAGINAUX' => 'Saignements vaginaux',
        'FIEVRE' => 'Fièvre déclarée',
        'VOMISSEMENTS_IMPORTANTS' => 'Vomissements importants',
        'CEPHALEES' => 'Maux de tête',
        'TROUBLES_VISUELS' => 'Troubles visuels',
        'PERTE_LIQUIDE' => 'Pertes liquidiennes déclarées',
        'OEDEMES_SIGNES' => 'Œdèmes signalés',
        'DIMINUTION_MOUVEMENTS_FOETAUX' => 'Diminution des mouvements fœtaux déclarée',
        'DIFFICULTE_RESPIRATOIRE' => 'Difficulté respiratoire déclarée',
        'CONVULSIONS' => 'Convulsions déclarées',
        'PERTE_CONNAISSANCE' => 'Perte de connaissance déclarée',
        'DOULEUR_THORACIQUE' => 'Douleur thoracique déclarée',
        'FATIGUE_INHABITUELLE' => 'Fatigue inhabituelle',
        'AUTRE' => 'Autre symptôme déclaré',
    ];

    public function catalogue()
    {
        $items = [];
        foreach (self::SYMPTOMES as $code => $libelle) {
            $items[] = ['code' => $code, 'libelle' => $libelle];
        }

        return response()->json(['data' => $items]);
    }

    public function index(string $grossesse, AccesParStructureService $acces)
    {
        $dossier = Grossesse::findOrFail($grossesse);
        $acces->verifierCentre($dossier->centre_sante_id);

        $query = DeclarationSymptomePrenatal::query()
            ->where('grossesse_id', $dossier->id)
            ->where('centre_sante_id', $dossier->centre_sante_id);

        return response()->json([
            'data' => $query->orderByDesc('declare_le')
                ->orderByDesc('created_at')
                ->paginate(50),
        ]);
    }

    public function store(
        Request $request,
        string $grossesse,
        AccesParStructureService $acces,
        AuditCliniqueService $audit
    ) {
        $dossier = Grossesse::findOrFail($grossesse);
        $acces->verifierCentre($dossier->centre_sante_id);

        $data = $request->validate([
            'contact_prenatal_id' => ['nullable', 'uuid'],
            'code_symptome' => ['required', 'string', 'in:'.implode(',', array_keys(self::SYMPTOMES))],
            'statut_declaration' => ['required', 'in:SIGNALE,NON_SIGNALE,NON_EVALUE'],
            'source_declaration' => ['required', 'in:DECLARE_PAR_MERE,DECLARE_PAR_ACCOMPAGNANT,OBSERVE_PAR_AGENT,TRANSCRIT_DOSSIER'],
            'declare_le' => ['required', 'date', 'before_or_equal:now'],
            'debut_estime_le' => ['nullable', 'date', 'before_or_equal:now'],
            'intensite_declaree' => ['nullable', 'integer', 'between:0,10'],
            'precision' => ['nullable', 'string', 'max:180'],
            'observations' => ['nullable', 'string', 'max:2000'],
        ]);

        if ($data['code_symptome'] === 'AUTRE' && empty(trim((string) ($data['precision'] ?? '')))) {
            throw ValidationException::withMessages([
                'precision' => ['Précisez le symptôme lorsque le code AUTRE est choisi.'],
            ]);
        }

        if ($data['statut_declaration'] !== 'SIGNALE' && isset($data['intensite_declaree'])) {
            throw ValidationException::withMessages([
                'intensite_declaree' => ['L’intensité ne s’applique qu’à un symptôme déclaré présent.'],
            ]);
        }

        if (! empty($data['debut_estime_le']) && Carbon::parse($data['debut_estime_le'])->gt(Carbon::parse($data['declare_le']))) {
            throw ValidationException::withMessages([
                'debut_estime_le' => ['Le début estimé ne peut pas être postérieur à la date de déclaration.'],
            ]);
        }

        if (! empty($data['contact_prenatal_id'])) {
            $contact = ContactPrenatal::findOrFail($data['contact_prenatal_id']);
            $acces->verifierCentre($contact->centre_sante_id);
            if ($contact->grossesse_id !== $dossier->id) {
                throw ValidationException::withMessages([
                    'contact_prenatal_id' => ['Le contact prénatal doit appartenir à cette grossesse.'],
                ]);
            }
        }

        $declaration = DeclarationSymptomePrenatal::create([
            ...$data,
            'grossesse_id' => $dossier->id,
            'centre_sante_id' => $dossier->centre_sante_id,
            'auteur_id' => $acces->utilisateur()?->agentId,
            'libelle_symptome' => self::SYMPTOMES[$data['code_symptome']],
            'statut_validation' => 'A_VERIFIER',
        ]);

        $audit->journaliser(
            'CREATION_DECLARATION_SYMPTOME_PRENATAL',
            'DeclarationSymptomePrenatal',
            $declaration->id,
            $dossier->centre_sante_id,
            'SUCCES',
            [
                'code_symptome' => $declaration->code_symptome,
                'statut_declaration' => $declaration->statut_declaration,
                'source_declaration' => $declaration->source_declaration,
            ],
        );

        return response()->json(['data' => $declaration], 201);
    }
}

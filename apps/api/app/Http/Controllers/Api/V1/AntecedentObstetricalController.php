<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AntecedentObstetrical;
use App\Models\PersonneMere;
use App\Modules\SanteMaternelle\Services\AccesParStructureService;
use App\Modules\SanteMaternelle\Services\AuditCliniqueService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AntecedentObstetricalController extends Controller
{
    private const CATALOGUE = [
        'PREMATURITE' => 'Antécédent de naissance prématurée déclaré',
        'CESARIENNE' => 'Antécédent de césarienne déclaré',
        'MORTINAISSANCE' => 'Antécédent de mortinaissance déclaré',
        'DECES_NEONATAL' => 'Antécédent de décès néonatal déclaré',
        'COMPLICATION_HYPERTENSIVE' => 'Antécédent de complication hypertensive obstétricale déclaré',
        'HEMORRAGIE_POSTPARTUM' => 'Antécédent d’hémorragie du post-partum déclaré',
        'GROSSESSE_MULTIPLE' => 'Antécédent de grossesse multiple déclaré',
        'FAUSSE_COUCHE' => 'Antécédent de fausse couche déclaré',
        'TRANSFERT_OBSTETRICAL' => 'Antécédent de transfert obstétrical déclaré',
        'AUTRE' => 'Autre antécédent déclaré',
    ];

    public function catalogue()
    {
        $items = [];
        foreach (self::CATALOGUE as $code => $libelle) {
            $items[] = ['code' => $code, 'libelle' => $libelle];
        }

        return response()->json(['data' => $items]);
    }

    public function index(string $mere, AccesParStructureService $acces)
    {
        $maman = PersonneMere::findOrFail($mere);
        $acces->verifierCentre($maman->centre_sante_id);

        $query = AntecedentObstetrical::query()
            ->where('mere_id', $maman->id)
            ->where('centre_sante_id', $maman->centre_sante_id);

        return response()->json([
            'data' => $query->orderByDesc('date_evenement')
                ->orderByDesc('created_at')
                ->paginate(50),
        ]);
    }

    public function store(
        Request $request,
        string $mere,
        AccesParStructureService $acces,
        AuditCliniqueService $audit
    ) {
        $maman = PersonneMere::findOrFail($mere);
        $acces->verifierCentre($maman->centre_sante_id);

        $data = $request->validate([
            'code_antecedent' => ['required', 'string', 'in:'.implode(',', array_keys(self::CATALOGUE))],
            'date_evenement' => ['nullable', 'date', 'before_or_equal:today'],
            'source_declaration' => ['required', 'in:DECLARE_PAR_MERE,DECLARE_PAR_ACCOMPAGNANT,DOSSIER_MEDICAL,INCONNU'],
            'precision' => ['nullable', 'string', 'max:2000'],
            'observations' => ['nullable', 'string', 'max:2000'],
        ]);

        if ($data['code_antecedent'] === 'AUTRE' && empty(trim((string) ($data['precision'] ?? '')))) {
            throw ValidationException::withMessages([
                'precision' => ['Précisez l’antécédent lorsque le code AUTRE est choisi.'],
            ]);
        }

        $antecedent = AntecedentObstetrical::create([
            ...$data,
            'mere_id' => $maman->id,
            'centre_sante_id' => $maman->centre_sante_id,
            'auteur_id' => $acces->utilisateur()?->agentId,
            'statut_validation' => 'A_VERIFIER',
        ]);

        $audit->journaliser(
            'CREATION_ANTECEDENT_OBSTETRICAL',
            'AntecedentObstetrical',
            $antecedent->id,
            $maman->centre_sante_id,
            'SUCCES',
            [
                'code_antecedent' => $antecedent->code_antecedent,
                'source_declaration' => $antecedent->source_declaration,
            ],
        );

        return response()->json(['data' => $antecedent], 201);
    }
}

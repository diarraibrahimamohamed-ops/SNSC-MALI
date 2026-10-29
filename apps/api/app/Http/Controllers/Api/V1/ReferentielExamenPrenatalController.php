<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Grossesse;
use App\Models\ReferentielExamenPrenatal;
use App\Models\ResultatExamenPrenatal;
use App\Modules\SanteMaternelle\Services\AccesParStructureService;
use App\Modules\SanteMaternelle\Services\AuditCliniqueService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

class ReferentielExamenPrenatalController extends Controller
{
    public function index(Request $request, AccesParStructureService $acces)
    {
        $request->validate([
            'version_protocole' => ['nullable', 'string', 'max:100'],
        ]);

        $query = ReferentielExamenPrenatal::query();
        if ($request->filled('version_protocole')) {
            $query->where('version_protocole', $request->query('version_protocole'));
        }

        return response()->json([
            'data' => $query
                ->orderBy('version_protocole')
                ->orderBy('semaine_min')
                ->orderBy('nom_examen')
                ->paginate(min(max((int) $request->query('per_page', 50), 1), 100)),
        ]);
    }

    public function store(
        Request $request,
        AccesParStructureService $acces,
        AuditCliniqueService $audit
    ) {
        if (! $acces->estAdministrateur()) {
            throw new AuthorizationException('Seul un administrateur peut publier un référentiel de protocole.');
        }

        $data = $request->validate([
            'version_protocole' => ['required', 'string', 'max:100'],
            'code_examen' => ['required', 'string', 'max:80'],
            'nom_examen' => ['required', 'string', 'max:180'],
            'categorie' => ['required', 'string', 'max:80'],
            'modalite' => ['required', 'in:ROUTINE,SELON_CONTEXTE,INFORMATIF'],
            'semaine_min' => ['nullable', 'integer', 'between:0,45'],
            'semaine_max' => ['nullable', 'integer', 'between:0,45'],
            'source_reference' => ['required', 'string', 'max:255'],
        ]);

        if (
            isset($data['semaine_min'], $data['semaine_max'])
            && $data['semaine_min'] > $data['semaine_max']
        ) {
            throw ValidationException::withMessages([
                'semaine_max' => ['La semaine maximale ne peut pas précéder la semaine minimale.'],
            ]);
        }

        $alreadyExists = ReferentielExamenPrenatal::query()
            ->where('version_protocole', $data['version_protocole'])
            ->where('code_examen', $data['code_examen'])
            ->exists();

        if ($alreadyExists) {
            throw ValidationException::withMessages([
                'code_examen' => ['Ce code existe déjà dans cette version du protocole. Publiez une nouvelle version pour modifier le référentiel.'],
            ]);
        }

        $definition = ReferentielExamenPrenatal::create([
            ...$data,
            'auteur_id' => $acces->utilisateur()?->agentId,
        ]);

        $audit->journaliser(
            'AJOUT_REFERENTIEL_EXAMEN_PRENATAL',
            'ReferentielExamenPrenatal',
            $definition->id,
            $acces->centreCourant(),
            'SUCCES',
            [
                'version_protocole' => $definition->version_protocole,
                'code_examen' => $definition->code_examen,
            ],
        );

        return response()->json(['data' => $definition], 201);
    }

    public function attendus(string $grossesse, AccesParStructureService $acces)
    {
        $dossier = Grossesse::findOrFail($grossesse);
        $acces->verifierCentre($dossier->centre_sante_id);
        $version = trim((string) $dossier->version_protocole);

        if ($version === '') {
            return response()->json([
                'data' => [],
                'meta' => [
                    'version_protocole' => null,
                    'reference_configuree' => false,
                    'age_gestationnel_estime_semaines' => null,
                    'message' => 'Aucune version de protocole n’est associée à cette grossesse; aucun examen attendu ne peut être déduit automatiquement.',
                ],
            ]);
        }

        $referenceExiste = ReferentielExamenPrenatal::query()
            ->where('version_protocole', $version)
            ->exists();

        $start = Carbon::parse($dossier->date_debut_estimee)->startOfDay();
        $today = Carbon::today();
        $ageSemaines = $start->greaterThan($today)
            ? null
            : intdiv((int) $start->diffInDays($today), 7);

        $definitions = ReferentielExamenPrenatal::query()
            ->where('version_protocole', $version)
            ->when($ageSemaines !== null, function ($query) use ($ageSemaines) {
                $query->where(function ($windows) use ($ageSemaines) {
                    $windows->whereNull('semaine_min')->orWhere('semaine_min', '<=', $ageSemaines);
                })->where(function ($windows) use ($ageSemaines) {
                    $windows->whereNull('semaine_max')->orWhere('semaine_max', '>=', $ageSemaines);
                });
            })
            ->orderBy('semaine_min')
            ->orderBy('nom_examen')
            ->get();

        $codes = $definitions->pluck('code_examen')->all();
        $latestResults = $codes === []
            ? collect()
            : ResultatExamenPrenatal::query()
                ->where('grossesse_id', $dossier->id)
                ->whereIn('code_examen', $codes)
                ->orderByDesc('created_at')
                ->get()
                ->unique('code_examen')
                ->keyBy('code_examen');

        $data = $definitions->map(function (ReferentielExamenPrenatal $definition) use ($latestResults) {
            $result = $latestResults->get($definition->code_examen);

            return [
                'id' => $definition->id,
                'version_protocole' => $definition->version_protocole,
                'code_examen' => $definition->code_examen,
                'nom_examen' => $definition->nom_examen,
                'categorie' => $definition->categorie,
                'modalite' => $definition->modalite,
                'semaine_min' => $definition->semaine_min,
                'semaine_max' => $definition->semaine_max,
                'source_reference' => $definition->source_reference,
                'suivi' => $result ? 'RESULTAT_ENREGISTRE' : 'AUCUN_RESULTAT_ENREGISTRE',
                'dernier_resultat' => $result ? [
                    'statut_resultat' => $result->statut_resultat,
                    'statut_validation' => $result->statut_validation,
                    'date_resultat' => $result->date_resultat?->toIso8601String(),
                ] : null,
            ];
        })->values();

        return response()->json([
            'data' => $data,
            'meta' => [
                'version_protocole' => $version,
                'reference_configuree' => $referenceExiste,
                'definitions_applicables_trouvees' => $definitions->isNotEmpty(),
                'age_gestationnel_estime_semaines' => $ageSemaines,
                'message' => ! $referenceExiste
                    ? 'Aucun référentiel n’est chargé pour cette version. Aucun examen attendu ne peut être déduit automatiquement.'
                    : ($definitions->isEmpty()
                        ? 'Le référentiel existe, mais aucune définition ne correspond à cette fenêtre gestationnelle. Vérifiez la couverture du protocole; cela ne signifie pas qu’aucun examen n’est nécessaire.'
                        : 'Liste informative issue du référentiel configuré. Vérifiez la version et la datation avec le protocole approuvé par les autorités sanitaires.'),
            ],
        ]);
    }
}

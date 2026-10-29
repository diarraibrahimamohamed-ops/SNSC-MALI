<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ContactPrenatal;
use App\Models\Grossesse;
use App\Models\ResultatExamenPrenatal;
use App\Modules\SanteMaternelle\Services\AccesParStructureService;
use App\Modules\SanteMaternelle\Services\AuditCliniqueService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

class ExamenPrenatalController extends Controller
{
    public function index(Request $request, string $grossesse, AccesParStructureService $acces)
    {
        $dossier = Grossesse::findOrFail($grossesse);
        $acces->verifierCentre($dossier->centre_sante_id);

        $query = ResultatExamenPrenatal::query()
            ->where('grossesse_id', $dossier->id)
            ->where('centre_sante_id', $dossier->centre_sante_id);

        if ($request->filled('code_examen')) {
            $query->where('code_examen', trim((string) $request->query('code_examen')));
        }

        if ($request->filled('statut_resultat')) {
            $request->validate([
                'statut_resultat' => ['in:EN_ATTENTE,DISPONIBLE,NON_REALISE,NON_APPLICABLE'],
            ]);
            $query->where('statut_resultat', $request->query('statut_resultat'));
        }

        return response()->json([
            'data' => $query->orderByDesc('date_prelevement')
                ->orderByDesc('created_at')
                ->paginate(min(max((int) $request->query('per_page', 25), 1), 100)),
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
            'code_examen' => ['required', 'string', 'max:80'],
            'nom_examen' => ['required', 'string', 'max:180'],
            'categorie' => ['required', 'string', 'max:80'],
            'statut_resultat' => ['required', 'in:EN_ATTENTE,DISPONIBLE,NON_REALISE,NON_APPLICABLE'],
            'resultat_texte' => ['nullable', 'string', 'max:10000'],
            'resultat_numerique' => ['nullable', 'numeric', 'between:-1000000000,1000000000'],
            'unite' => ['nullable', 'string', 'max:40'],
            'details' => ['nullable', 'array'],
            'date_prelevement' => ['nullable', 'date', 'before_or_equal:now'],
            'date_resultat' => ['nullable', 'date', 'before_or_equal:now'],
            'laboratoire' => ['nullable', 'string', 'max:180'],
            'source_donnee' => ['nullable', 'string', 'max:100'],
            'version_protocole' => ['nullable', 'string', 'max:100'],
        ]);

        if (
            $data['statut_resultat'] === 'DISPONIBLE'
            && ($data['resultat_texte'] ?? null) === null
            && ($data['resultat_numerique'] ?? null) === null
        ) {
            throw ValidationException::withMessages([
                'resultat_texte' => ['Un résultat textuel ou numérique est requis quand le statut est DISPONIBLE.'],
            ]);
        }

        if (! empty($data['date_resultat']) && ! empty($data['date_prelevement'])) {
            if (Carbon::parse($data['date_resultat'])->lt(Carbon::parse($data['date_prelevement']))) {
                throw ValidationException::withMessages([
                    'date_resultat' => ['La date du résultat ne peut pas précéder la date de prélèvement.'],
                ]);
            }
        }

        if (! empty($data['contact_prenatal_id'])) {
            $contact = ContactPrenatal::findOrFail($data['contact_prenatal_id']);
            // Vérifier le périmètre de la structure avant de révéler si le contact est lié à cette grossesse.
            $acces->verifierCentre($contact->centre_sante_id);
            if ($contact->grossesse_id !== $dossier->id) {
                throw ValidationException::withMessages([
                    'contact_prenatal_id' => ['Le contact prénatal doit appartenir à cette grossesse.'],
                ]);
            }
        }

        $examen = ResultatExamenPrenatal::create([
            ...$data,
            'grossesse_id' => $dossier->id,
            'centre_sante_id' => $dossier->centre_sante_id,
            'auteur_id' => $acces->utilisateur()?->agentId,
            'source_donnee' => $data['source_donnee'] ?? 'SAISIE_AGENT',
            'statut_validation' => 'A_VERIFIER',
        ]);

        $audit->journaliser(
            'CREATION_RESULTAT_EXAMEN_PRENATAL',
            'ResultatExamenPrenatal',
            $examen->id,
            $dossier->centre_sante_id,
            'SUCCES',
            [
                'code_examen' => $examen->code_examen,
                'statut_resultat' => $examen->statut_resultat,
            ],
        );

        return response()->json(['data' => $examen], 201);
    }
}

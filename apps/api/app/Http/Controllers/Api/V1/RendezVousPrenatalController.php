<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ContactPrenatal;
use App\Models\Grossesse;
use App\Models\RendezVousPrenatal;
use App\Modules\SanteMaternelle\Services\AccesParStructureService;
use App\Modules\SanteMaternelle\Services\AuditCliniqueService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RendezVousPrenatalController extends Controller
{
    public function index(Request $request, AccesParStructureService $acces)
    {
        $query = RendezVousPrenatal::query()
            ->with(['grossesse.mere:id,nom,prenom', 'contactPrenatal:id,contact_le,type_contact'])
            ->whereIn('statut', ['PLANIFIE', 'REPORTE', 'REALISE', 'MANQUE', 'ANNULE']);

        $acces->appliquer($query);

        if ($request->filled('statut')) {
            $request->validate(['statut' => ['in:PLANIFIE,REPORTE,REALISE,MANQUE,ANNULE']]);
            $query->where('statut', $request->query('statut'));
        }

        if ($request->filled('du')) {
            $request->validate(['du' => ['date']]);
            $query->whereDate('prevu_le', '>=', $request->query('du'));
        }

        if ($request->filled('au')) {
            $request->validate(['au' => ['date']]);
            $query->whereDate('prevu_le', '<=', $request->query('au'));
        }

        return response()->json([
            'data' => $query->orderBy('prevu_le')->paginate(min(max((int) $request->query('per_page', 25), 1), 100)),
        ]);
    }

    public function forGrossesse(string $grossesse, AccesParStructureService $acces)
    {
        $dossier = Grossesse::findOrFail($grossesse);
        $acces->verifierCentre($dossier->centre_sante_id);

        $items = RendezVousPrenatal::where('grossesse_id', $dossier->id)
            ->where('centre_sante_id', $dossier->centre_sante_id)
            ->with('contactPrenatal:id,contact_le,type_contact')
            ->orderByDesc('prevu_le')
            ->paginate(50);

        return response()->json(['data' => $items]);
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
            'prevu_le' => ['required', 'date', 'after_or_equal:today'],
            'type_rendez_vous' => ['required', 'in:CPN,EXAMEN,ECHOGRAPHIE,POSTPARTUM,AUTRE'],
            'libelle' => ['required', 'string', 'max:180'],
            'contact_prenatal_id' => ['nullable', 'uuid'],
            'rappel_programme_le' => ['nullable', 'date', 'after_or_equal:now'],
        ]);

        if (! empty($data['contact_prenatal_id'])) {
            $contact = ContactPrenatal::findOrFail($data['contact_prenatal_id']);
            $acces->verifierCentre($contact->centre_sante_id);
            if ($contact->grossesse_id !== $dossier->id) {
                throw ValidationException::withMessages([
                    'contact_prenatal_id' => ['Le contact doit appartenir à cette grossesse.'],
                ]);
            }
        }

        if (! empty($data['rappel_programme_le']) && Carbon::parse($data['rappel_programme_le'])->gt(Carbon::parse($data['prevu_le'])->endOfDay())) {
            throw ValidationException::withMessages([
                'rappel_programme_le' => ['Le rappel doit être programmé au plus tard à la date du rendez-vous.'],
            ]);
        }

        $rendezVous = RendezVousPrenatal::create([
            ...$data,
            'grossesse_id' => $dossier->id,
            'centre_sante_id' => $dossier->centre_sante_id,
            'auteur_id' => $acces->utilisateur()?->agentId,
            'statut' => 'PLANIFIE',
            'rappel_statut' => empty($data['rappel_programme_le']) ? 'NON_DEMANDE' : 'EN_ATTENTE',
        ]);

        $audit->journaliser(
            'CREATION_RENDEZ_VOUS_PRENATAL',
            'RendezVousPrenatal',
            $rendezVous->id,
            $dossier->centre_sante_id,
            'SUCCES',
            ['type_rendez_vous' => $rendezVous->type_rendez_vous],
        );

        return response()->json(['data' => $rendezVous], 201);
    }

    public function updateStatut(
        Request $request,
        string $rendezVous,
        AccesParStructureService $acces,
        AuditCliniqueService $audit
    ) {
        $data = $request->validate([
            'statut' => ['required', 'in:REALISE,MANQUE,ANNULE,REPORTE'],
            'realise_le' => ['nullable', 'date', 'before_or_equal:now'],
            'motif' => ['nullable', 'string', 'max:1000'],
            'nouvelle_date' => ['nullable', 'date', 'after_or_equal:today'],
            'nouveau_rappel_programme_le' => ['nullable', 'date'],
        ]);

        $createdReplacement = null;
        $original = DB::transaction(function () use ($data, $rendezVous, $acces, &$createdReplacement) {
            $element = RendezVousPrenatal::whereKey($rendezVous)->lockForUpdate()->firstOrFail();
            $acces->verifierCentre($element->centre_sante_id);

            if ($element->statut !== 'PLANIFIE') {
                throw ValidationException::withMessages([
                    'statut' => ['Seul un rendez-vous planifié peut changer de statut.'],
                ]);
            }

            if ($data['statut'] === 'REPORTE' && empty($data['nouvelle_date'])) {
                throw ValidationException::withMessages([
                    'nouvelle_date' => ['La nouvelle date est obligatoire pour reporter un rendez-vous.'],
                ]);
            }

            if ($data['statut'] !== 'REPORTE' && ! empty($data['nouvelle_date'])) {
                throw ValidationException::withMessages([
                    'nouvelle_date' => ['La nouvelle date ne s’applique qu’à un report.'],
                ]);
            }

            if (
                ! empty($data['nouveau_rappel_programme_le'])
                && Carbon::parse($data['nouveau_rappel_programme_le'])->gt(Carbon::parse($data['nouvelle_date'] ?? $element->prevu_le)->endOfDay())
            ) {
                throw ValidationException::withMessages([
                    'nouveau_rappel_programme_le' => ['Le rappel doit précéder ou correspondre à la date du rendez-vous.'],
                ]);
            }

            $element->update([
                'statut' => $data['statut'],
                'realise_le' => $data['statut'] === 'REALISE' ? ($data['realise_le'] ?? now()) : null,
                'motif' => $data['motif'] ?? null,
                'rappel_statut' => in_array($data['statut'], ['ANNULE', 'REPORTE', 'REALISE', 'MANQUE'], true)
                    ? ($element->rappel_statut === 'ENVOYE' ? 'ENVOYE' : 'ANNULE')
                    : $element->rappel_statut,
            ]);

            if ($data['statut'] === 'REPORTE') {
                $createdReplacement = RendezVousPrenatal::create([
                    'grossesse_id' => $element->grossesse_id,
                    'centre_sante_id' => $element->centre_sante_id,
                    'contact_prenatal_id' => $element->contact_prenatal_id,
                    'auteur_id' => $acces->utilisateur()?->agentId,
                    'prevu_le' => $data['nouvelle_date'],
                    'type_rendez_vous' => $element->type_rendez_vous,
                    'libelle' => $element->libelle,
                    'statut' => 'PLANIFIE',
                    'motif' => $data['motif'] ?? null,
                    'remplace_rendez_vous_id' => $element->id,
                    'rappel_programme_le' => $data['nouveau_rappel_programme_le'] ?? null,
                    'rappel_statut' => empty($data['nouveau_rappel_programme_le']) ? 'NON_DEMANDE' : 'EN_ATTENTE',
                ]);
            }

            return $element->refresh();
        });

        $audit->journaliser(
            'MISE_A_JOUR_RENDEZ_VOUS_PRENATAL',
            'RendezVousPrenatal',
            $original->id,
            $original->centre_sante_id,
            'SUCCES',
            ['statut' => $original->statut],
        );

        return response()->json([
            'data' => $original,
            'remplacement' => $createdReplacement,
        ]);
    }
}

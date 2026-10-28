<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ReferenceSoin;
use App\Models\DossierEnfant;
use App\Models\Grossesse;
use App\Models\PersonneMere;
use App\Modules\ReferenceSoin\Services\ReferenceSoinService;
use App\Modules\SanteMaternelle\Services\AccesParStructureService;
use App\Modules\SanteMaternelle\Services\AuditCliniqueService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ReferenceSoinController extends Controller
{
    public function index(AccesParStructureService $acces)
    {
        $query = ReferenceSoin::query()->with(['centreEmetteur', 'centreDestinataire']);
        if (! $acces->estAdministrateur()) {
            $centreId = $acces->centreCourant();
            $query->where(function ($references) use ($centreId) {
                $references->where('centre_emetteur_id', $centreId)->orWhere('centre_destinataire_id', $centreId);
            });
        }

        return response()->json(['data' => $query->orderByDesc('cree_le')->paginate(50)]);
    }

    public function store(Request $request, AccesParStructureService $acces, AuditCliniqueService $audit)
    {
        $data = $request->validate([
            'patient_type' => ['required', 'in:MERE,ENFANT,GROSSESSE'],
            'patient_id' => ['required', 'uuid'],
            'grossesse_id' => ['nullable', 'uuid', 'exists:grossesses,id'],
            'centre_destinataire_id' => ['required', 'uuid', 'exists:CentreSante,centreId'],
            'centre_emetteur_id' => ['nullable', 'uuid', 'exists:CentreSante,centreId'],
            'motif_code' => ['required', 'string', 'max:100'],
            'priorite' => ['required', 'in:ROUTINE,PRIORITAIRE,URGENTE'],
            'transport' => ['nullable', 'string', 'max:100'],
        ]);

        $centreEmetteurId = $data['centre_emetteur_id'] ?? $acces->centreCourant();
        $centreDestinataireId = $data['centre_destinataire_id'];
        if (! $centreEmetteurId) {
            throw ValidationException::withMessages(['centre_emetteur_id' => ['Une structure émettrice est requise.']]);
        }
        if ($centreEmetteurId === $centreDestinataireId) {
            throw ValidationException::withMessages([
                'centre_destinataire_id' => ['La structure destinataire doit être différente de la structure émettrice.'],
            ]);
        }

        $acces->verifierCentre($centreEmetteurId);
        $this->verifierSujetEtPerimetre($data['patient_type'], $data['patient_id'], $acces);

        if ($data['patient_type'] === 'GROSSESSE') {
            if (! empty($data['grossesse_id']) && $data['grossesse_id'] !== $data['patient_id']) {
                throw ValidationException::withMessages(['grossesse_id' => ['Pour un patient de type GROSSESSE, grossesse_id doit correspondre à patient_id.']]);
            }
            $data['grossesse_id'] = $data['patient_id'];
        } elseif (! empty($data['grossesse_id']) && $data['patient_type'] === 'MERE') {
            $grossesseLiee = Grossesse::findOrFail($data['grossesse_id']);
            if ($grossesseLiee->mere_id !== $data['patient_id']) {
                throw ValidationException::withMessages(['grossesse_id' => ['La grossesse indiquée ne correspond pas à la mère référée.']]);
            }
            $acces->verifierCentre($grossesseLiee->centre_sante_id);
        }

        $reference = ReferenceSoin::create([
            ...$data,
            'centre_emetteur_id' => $centreEmetteurId,
            'centre_destinataire_id' => $centreDestinataireId,
            'responsable_suivi_id' => $acces->utilisateur()?->agentId,
            'cree_le' => now(),
            'statut' => 'CREEE',
        ]);

        $audit->journaliser('CREATION_REFERENCE', 'ReferenceSoin', $reference->id, $centreEmetteurId, 'SUCCES', ['priorite' => $reference->priorite]);

        return response()->json(['data' => $reference], 201);
    }

    public function envoyer(string $reference, AccesParStructureService $acces, ReferenceSoinService $workflow, AuditCliniqueService $audit)
    {
        $element = ReferenceSoin::findOrFail($reference);
        $acces->verifierCentre($element->centre_emetteur_id);
        $resultat = $workflow->transitionner($element, 'ENVOYEE');
        $audit->journaliser('ENVOI_REFERENCE', 'ReferenceSoin', $resultat->id, $resultat->centre_emetteur_id);

        return response()->json(['data' => $resultat]);
    }

    public function accuseReception(string $reference, AccesParStructureService $acces, ReferenceSoinService $workflow, AuditCliniqueService $audit)
    {
        $element = ReferenceSoin::findOrFail($reference);
        $acces->verifierCentre($element->centre_destinataire_id);
        $resultat = $workflow->transitionner($element, 'RECUE');
        $audit->journaliser('ACCUSE_RECEPTION_REFERENCE', 'ReferenceSoin', $resultat->id, $resultat->centre_destinataire_id);

        return response()->json(['data' => $resultat]);
    }

    public function issue(Request $request, string $reference, AccesParStructureService $acces, ReferenceSoinService $workflow, AuditCliniqueService $audit)
    {
        $data = $request->validate([
            'statut' => ['required', 'in:PRISE_EN_CHARGE_CONFIRMEE,CLOTUREE,ANNULEE'],
            'note_issue' => ['nullable', 'string', 'max:2000'],
        ]);
        $element = ReferenceSoin::findOrFail($reference);
        $centreId = $data['statut'] === 'ANNULEE' ? $element->centre_emetteur_id : $element->centre_destinataire_id;
        $acces->verifierCentre($centreId);
        $resultat = $workflow->transitionner($element, $data['statut'], $data['note_issue'] ?? null);
        $audit->journaliser('TRANSITION_REFERENCE', 'ReferenceSoin', $resultat->id, $centreId, 'SUCCES', ['statut' => $resultat->statut]);

        return response()->json(['data' => $resultat]);
    }

    private function verifierSujetEtPerimetre(string $type, string $id, AccesParStructureService $acces): void
    {
        $sujet = match ($type) {
            'MERE' => PersonneMere::findOrFail($id),
            'ENFANT' => DossierEnfant::where('enfantId', $id)->firstOrFail(),
            'GROSSESSE' => Grossesse::findOrFail($id),
        };

        $acces->verifierCentre($sujet->centre_sante_id ?? $sujet->centreId);
    }
}

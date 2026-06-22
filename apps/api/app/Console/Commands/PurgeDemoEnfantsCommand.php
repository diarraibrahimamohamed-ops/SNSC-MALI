<?php

namespace App\Console\Commands;

use App\Models\ActeVaccinal;
use App\Models\CalendrierVaccinal;
use App\Models\DosePlanifie;
use App\Models\DossierEnfant;
use App\Models\JournalAudit;
use App\Models\RendezVousVaccinal;
use App\Models\ScoreRisqueVaccinal;
use App\Models\Tuteur;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class PurgeDemoEnfantsCommand extends Command
{
    protected $signature = 'vaccintrack:purge-demo-enfants';

    protected $description = 'Supprime les enfants et tuteurs de démonstration (identifiants MLI-1xxx)';

    public function handle(): int
    {
        $enfants = DossierEnfant::where('identifiantSanitaire', 'like', 'MLI-1%')->get();

        if ($enfants->isEmpty()) {
            $this->info('Aucun enfant de démonstration trouvé.');

            return self::SUCCESS;
        }

        $count = $enfants->count();
        $tuteurIds = $enfants->pluck('tuteurId')->unique()->filter();

        DB::transaction(function () use ($enfants) {
            foreach ($enfants as $enfant) {
                $calendrierIds = CalendrierVaccinal::where('enfantId', $enfant->enfantId)->pluck('calendrierId');
                $doseIds = DosePlanifie::whereIn('calendrierId', $calendrierIds)->pluck('doseId');

                RendezVousVaccinal::where('enfantId', $enfant->enfantId)->delete();
                RendezVousVaccinal::whereIn('doseId', $doseIds)->delete();
                DosePlanifie::whereIn('calendrierId', $calendrierIds)->delete();
                CalendrierVaccinal::where('enfantId', $enfant->enfantId)->delete();
                ActeVaccinal::where('enfantId', $enfant->enfantId)->delete();
                ScoreRisqueVaccinal::where('enfantId', $enfant->enfantId)->delete();
                JournalAudit::where('enfantId', $enfant->enfantId)->delete();
                $enfant->delete();
            }
        });

        Tuteur::whereIn('tuteurId', $tuteurIds)
            ->whereDoesntHave('dossiersEnfants')
            ->delete();

        $this->info("{$count} enfant(s) de démonstration supprimé(s).");

        return self::SUCCESS;
    }
}

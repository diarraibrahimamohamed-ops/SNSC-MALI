<?php

namespace App\Console\Commands;

use App\Modules\RelanceSMS\Services\RelanceService;
use Illuminate\Console\Command;

class DeclencherRelancesSMS extends Command
{
    protected $signature = 'relances:sms';

    protected $description = 'Déclenche les relances SMS pour les rendez-vous vaccinaux imminents ou en retard';

    public function handle(RelanceService $relanceService): int
    {
        $this->info('Démarrage du job de relance SMS...');

        $resultats = $relanceService->declencherRelances();

        $this->info("Envoyés: {$resultats['envoyes']}, Échecs: {$resultats['echecs']}, Ignorés: {$resultats['ignores']}");

        return self::SUCCESS;
    }
}

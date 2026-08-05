<?php

namespace App\Modules\RisqueIA\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Modules\RisqueIA\Services\RisqueService;

class EvaluerRisqueJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $enfantId;

    /**
     * Create a new job instance.
     */
    public function __construct(int $enfantId)
    {
        $this->enfantId = $enfantId;
    }

    /**
     * Execute the job.
     */
    public function handle(RisqueService $risqueService): void
    {
        $risqueService->evaluerRisquePourEnfant($this->enfantId);
    }
}

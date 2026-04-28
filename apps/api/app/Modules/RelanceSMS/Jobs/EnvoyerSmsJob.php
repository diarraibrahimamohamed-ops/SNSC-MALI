<?php

namespace App\Modules\RelanceSMS\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Modules\RelanceSMS\Services\SmsDispatcherService;

class EnvoyerSmsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $phoneNumber;
    public $message;

    /**
     * Create a new job instance.
     */
    public function __construct(string $phoneNumber, string $message)
    {
        $this->phoneNumber = $phoneNumber;
        $this->message = $message;
    }

    /**
     * Execute the job.
     */
    public function handle(SmsDispatcherService $smsService): void
    {
        $smsService->envoyerSms($this->phoneNumber, $this->message);
    }
}

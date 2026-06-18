<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\RateLimiter;

class ClearLoginAttempts extends Command
{
    protected $signature = 'auth:clear-attempts {ip? : IP address to clear (optional)} {matricule? : Matricule to clear (optional)}';
    protected $description = 'Clear login attempts for rate limiting';

    public function handle()
    {
        $ip = $this->argument('ip');
        $matricule = $this->argument('matricule');

        if ($ip && $matricule) {
            $key = 'login:'.$ip.':'.$matricule;
            RateLimiter::clear($key);
            $this->info("Cleared login attempts for IP: {$ip}, Matricule: {$matricule}");
        } else {
            $this->warn("RateLimiter does not support clearing all keys directly.");
            $this->info("To clear specific attempts, use: php artisan auth:clear-attempts <ip> <matricule>");
            $this->info("Alternatively, clear the entire cache: php artisan cache:clear");
        }

        return Command::SUCCESS;
    }
}

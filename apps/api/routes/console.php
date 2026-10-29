<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Run only through Laravel Scheduler; delivery is gated by explicit active SMS consent.
Schedule::command('maternite:rappels-prenataux --limit=100')
    ->everyTenMinutes()
    ->withoutOverlapping();

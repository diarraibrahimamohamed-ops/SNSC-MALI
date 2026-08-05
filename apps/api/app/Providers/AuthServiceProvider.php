<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Policies\EnfantPolicy;
use App\Policies\ActeVaccinalPolicy;
use App\Policies\CentreSantePolicy;
use App\Policies\AuditPolicy;
use App\Modules\Auth\Policies\UserPolicy;
use App\Models\Enfant;
use App\Models\ActeVaccinal;
use App\Models\CentreSante;
use App\Models\JournalAudit;
use App\Models\User;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Enfant::class => EnfantPolicy::class,
        ActeVaccinal::class => ActeVaccinalPolicy::class,
        CentreSante::class => CentreSantePolicy::class,
        JournalAudit::class => AuditPolicy::class,
        User::class => UserPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        Gate::before(function (User $user, string $ability) {
            return $user->role === 'admin' ? true : null;
        });
    }
}

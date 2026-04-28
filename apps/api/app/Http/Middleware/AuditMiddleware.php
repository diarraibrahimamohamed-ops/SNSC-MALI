<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\AuditService;

class AuditMiddleware
{
    protected $auditService;

    public function __construct(AuditService $auditService)
    {
        $this->auditService = $auditService;
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // Enregistrer l'action dans l'audit
        $this->auditService->logAction(
            auth()->user(),
            $request->method(),
            $request->path(),
            $request->all(),
            $response->getStatusCode()
        );

        return $response;
    }
}

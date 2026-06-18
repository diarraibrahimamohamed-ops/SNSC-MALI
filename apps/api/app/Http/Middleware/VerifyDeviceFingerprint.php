<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class VerifyDeviceFingerprint
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::guard('api')->user();
        
        if (!$user) {
            return $next($request);
        }

        // Generate current device fingerprint
        $userAgent = $request->userAgent();
        $ip = $request->ip();
        $ipParts = explode('.', $ip);
        $ipSubnet = $ipParts[0] . '.' . $ipParts[1] . '.' . $ipParts[2] . '.0';
        $currentFingerprint = hash('sha256', $userAgent . '|' . $ipSubnet);

        // Get stored fingerprint from token claims
        $token = Auth::guard('api')->getToken();
        if ($token) {
            $payload = Auth::guard('api')->payload();
            $storedFingerprint = $payload->get('device_fingerprint');

            // If fingerprints don't match, reject the request
            if ($storedFingerprint && $storedFingerprint !== $currentFingerprint) {
                return response()->json([
                    'message' => 'Session invalide: appareil non reconnu',
                    'error' => 'device_mismatch'
                ], 401);
            }
        }

        return $next($request);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\AgentSante;
use Illuminate\Support\Facades\RateLimiter;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        $credentials = $request->only('matricule', 'password');
        $key = 'login:'.$request->ip().':'.$request->input('matricule');
        
        // Vérifier d'abord si le compte est déjà verrouillé AVANT de tenter l'authentification
        $attempts = RateLimiter::attempts($key);
        if ($attempts >= 20) {
            return response()->json([
                'message' => 'Compte verrouillé. Contactez l\'administrateur.',
                'locked' => true
            ], 423);
        } elseif ($attempts >= 10) {
            return response()->json([
                'message' => 'Trop de tentatives. Réessayez dans 15 minutes.',
                'retry_after' => 900
            ], 429);
        } elseif ($attempts >= 5) {
            return response()->json([
                'message' => 'Trop de tentatives. Réessayez dans 1 minute.',
                'retry_after' => 60
            ], 429);
        }

        if (! $token = auth('api')->attempt($credentials)) {
            // Incrémenter le compteur d'échecs pour les identifiants invalides
            RateLimiter::hit($key, now()->addHours(1));
            $attempts = RateLimiter::attempts($key);
            
            // Vérifier le verrouillage progressif après incrémentation
            if ($attempts >= 20) {
                return response()->json([
                    'message' => 'Compte verrouillé. Contactez l\'administrateur.',
                    'locked' => true
                ], 423);
            } elseif ($attempts >= 10) {
                return response()->json([
                    'message' => 'Trop de tentatives. Réessayez dans 15 minutes.',
                    'retry_after' => 900
                ], 429);
            } elseif ($attempts >= 5) {
                return response()->json([
                    'message' => 'Trop de tentatives. Réessayez dans 1 minute.',
                    'retry_after' => 60
                ], 429);
            }
            
            return response()->json(['message' => 'Identifiants invalides'], 401);
        }

        // Clear login attempts on successful login
        LoginRequest::clearLoginAttempts($request->ip(), $request->input('matricule'));

        return $this->respondWithToken($token);
    }

    public function me()
    {
        $user = auth('api')->user();
        if ($user) {
            $user->load('centreSante');
            return response()->json([
                'data' => [
                    'id' => $user->agentId,
                    'nom' => $user->nom,
                    'nom_complet' => $user->nom,
                    'role' => $user->role,
                    'matricule' => $user->matricule,
                    'centre_sante_id' => $user->centreId,
                    'centreSante' => $user->centreSante
                ]
            ]);
        }
        return response()->json(['message' => 'Non authentifié'], 401);
    }

    public function logout()
    {
        auth('api')->logout();
        return response()->json(['message' => 'Déconnexion réussie']);
    }

    protected function respondWithToken($token)
    {
        $user = auth('api')->user();
        if ($user) {
            $user->load('centreSante');
        }
        
        // Device fingerprint: User-Agent + IP /24
        $deviceFingerprint = $this->generateDeviceFingerprint();
        
        $userPayload = [
            'id' => $user->agentId ?? null,
            'nom' => $user->nom ?? null,
            'nom_complet' => $user->nom ?? null,
            'role' => $user->role ?? null,
            'matricule' => $user->matricule ?? null,
            'centre_sante_id' => $user->centreId ?? null,
            'centreSante' => $user->centreSante ?? null,
            'device_fingerprint' => $deviceFingerprint
        ];

        $response = [
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60,
            'user' => $userPayload
        ];

        if ($user && $user->role === 'ADMIN') {
            $response['admin'] = $userPayload;
        } else {
            $response['agent'] = $userPayload;
        }

        return response()->json($response);
    }

    /**
     * Generate device fingerprint from User-Agent and IP /24
     */
    protected function generateDeviceFingerprint(): string
    {
        $userAgent = request()->userAgent();
        $ip = request()->ip();
        
        // Get /24 subnet
        $ipParts = explode('.', $ip);
        $ipSubnet = $ipParts[0] . '.' . $ipParts[1] . '.' . $ipParts[2] . '.0';
        
        return hash('sha256', $userAgent . '|' . $ipSubnet);
    }

}

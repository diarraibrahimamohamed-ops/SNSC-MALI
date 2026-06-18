<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\AgentSante;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'matricule' => 'required|string',
            'password' => 'required|string',
        ]);

        $credentials = $request->only('matricule', 'password');

        if (! $token = auth('api')->attempt($credentials)) {
            return response()->json(['message' => 'Identifiants invalides'], 401);
        }

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

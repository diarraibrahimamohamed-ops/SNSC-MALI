<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'matricule' => 'required|string|max:255',
            'password' => 'required|string|min:6', // Minimum 6 caractères (temporairement réduit pour tests)
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator(Validator $validator): void
    {
        // Validation forte désactivée temporairement pour compatibilité
        // Validation forte désactivée temporairement pour compatibilité
        // Réactiver après migration des mots de passe existants
        /*
        $validator->after(function ($validator) {
            $password = $this->input('password');
            
            // Validation forte: classes mixtes
            if (!preg_match('/[a-z]/', $password)) {
                $validator->errors()->add('password', 'Le mot de passe doit contenir au moins une lettre minuscule.');
            }
            if (!preg_match('/[A-Z]/', $password)) {
                $validator->errors()->add('password', 'Le mot de passe doit contenir au moins une lettre majuscule.');
            }
            if (!preg_match('/[0-9]/', $password)) {
                $validator->errors()->add('password', 'Le mot de passe doit contenir au moins un chiffre.');
            }
            if (!preg_match('/[^a-zA-Z0-9]/', $password)) {
                $validator->errors()->add('password', 'Le mot de passe doit contenir au moins un caractère spécial.');
            }
        });
        */
        
        // Verrouillage progressif actif
        $validator->after(function ($validator) {
            $key = 'login:'.$this->ip().':'.$this->input('matricule');
            $attempts = RateLimiter::attempts($key);
            
            if ($attempts >= 20) {
                $validator->errors()->add('matricule', 'Compte verrouillé. Contactez l\'administrateur.');
            } elseif ($attempts >= 10) {
                $validator->errors()->add('matricule', 'Trop de tentatives. Réessayez dans 15 minutes.');
            } elseif ($attempts >= 5) {
                $validator->errors()->add('matricule', 'Trop de tentatives. Réessayez dans 1 minute.');
            }
        });
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator): void
    {
        $key = 'login:'.$this->ip().':'.$this->input('matricule');
        
        // Incrémenter le compteur d'échecs
        RateLimiter::hit($key, now()->addHours(1));
        
        $attempts = RateLimiter::attempts($key);
        
        // Vérifier le verrouillage progressif
        if ($attempts >= 20) {
            // Verrouillage définitif jusqu'à intervention admin
            throw new HttpResponseException(
                response()->json([
                    'message' => 'Compte verrouillé. Contactez l\'administrateur.',
                    'locked' => true
                ], 423)
            );
        } elseif ($attempts >= 10) {
            // Verrouillage 15 minutes
            throw new HttpResponseException(
                response()->json([
                    'message' => 'Trop de tentatives. Réessayez dans 15 minutes.',
                    'retry_after' => 900
                ], 429)
            );
        } elseif ($attempts >= 5) {
            // Verrouillage 1 minute
            throw new HttpResponseException(
                response()->json([
                    'message' => 'Trop de tentatives. Réessayez dans 1 minute.',
                    'retry_after' => 60
                ], 429)
            );
        }
        
        throw new HttpResponseException(
            response()->json([
                'message' => 'Identifiants invalides',
                'errors' => $validator->errors()
            ], 422)
        );
    }

    /**
     * Reset login attempts on successful login.
     */
    public static function clearLoginAttempts(string $ip, string $matricule): void
    {
        $key = 'login:'.$ip.':'.$matricule;
        RateLimiter::clear($key);
    }
}

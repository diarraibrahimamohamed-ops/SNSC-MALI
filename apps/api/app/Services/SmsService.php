<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Http\Client\Factory as HttpClient;

class SmsService
{
    private $httpClient;
    private $provider;
    private $debugMode;

    public function __construct(HttpClient $httpClient)
    {
        $this->httpClient = $httpClient;
        $this->provider = config('sms.provider', 'local');
        $this->debugMode = config('sms.debug_mode', true);
    }

    /**
     * Envoyer un SMS
     */
    public function sendSms(string $phoneNumber, string $message): array
    {
        //  Normalisation du numéro
        $phoneNumber = $this->formatPhoneNumber($phoneNumber);

        //  Validation
        if (!$this->validatePhoneNumber($phoneNumber)) {
            return [
                'success' => false,
                'error' => 'Numéro invalide',
                'phone' => $phoneNumber
            ];
        }

        //  Mode debug
        if ($this->debugMode) {
            Log::info('SMS (debug)', [
                'to' => $phoneNumber,
                'message' => $message
            ]);

            return [
                'success' => true,
                'message' => 'SMS simulé (debug)',
                'sid' => 'debug_' . uniqid()
            ];
        }

        // Choix provider
        return match ($this->provider) {
            'telerivet' => $this->sendViaTelerivet($phoneNumber, $message),
            'orange' => $this->sendViaOrange($phoneNumber, $message),
            'twilio' => $this->sendViaTwilio($phoneNumber, $message),
            default => $this->sendLocal($phoneNumber, $message),
        };
    }

    /**
     * Orange Mali API
     */
    private function sendViaOrange(string $phoneNumber, string $message): array
    {
        try {
            $response = $this->httpClient
                ->retry(3, 1000)
                ->asForm()
                ->post(config('sms.orange.base_url'), [
                    'outboundSMSMessageRequest' => json_encode([
                        'address' => 'tel:' . $phoneNumber,
                        'senderAddress' => 'tel:' . config('sms.orange.sender_name'),
                        'outboundSMSTextMessage' => [
                            'message' => $message
                        ]
                    ])
                ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'SMS envoyé (Orange)',
                    'sid' => $response->json('outboundSMSMessageRequest.messageId') ?? uniqid()
                ];
            }

            Log::error('Erreur Orange', ['body' => $response->body()]);

            return [
                'success' => false,
                'error' => 'Erreur Orange API',
            ];

        } catch (\Throwable $e) {
            Log::error('Exception Orange', ['error' => $e->getMessage()]);

            return [
                'success' => false,
                'error' => 'Exception Orange',
            ];
        }
    }

    /**
     * Twilio API
     */
    private function sendViaTwilio(string $phoneNumber, string $message): array
    {
        try {
            $response = $this->httpClient
                ->retry(3, 1000)
                ->withBasicAuth(
                    config('sms.twilio.account_sid'),
                    config('sms.twilio.auth_token')
                )
                ->asForm()
                ->post(
                    "https://api.twilio.com/2010-04-01/Accounts/" . config('sms.twilio.account_sid') . "/Messages.json",
                    [
                        'To' => $phoneNumber,
                        'From' => config('sms.twilio.phone_number'),
                        'Body' => $message
                    ]
                );

            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'SMS envoyé (Twilio)',
                    'sid' => $response->json('sid')
                ];
            }

            Log::error('Erreur Twilio', ['body' => $response->body()]);

            return [
                'success' => false,
                'error' => 'Erreur Twilio',
            ];

        } catch (\Throwable $e) {
            Log::error('Exception Twilio', ['error' => $e->getMessage()]);

            return [
                'success' => false,
                'error' => 'Exception Twilio',
            ];
        }
    }

    /**
     * Mode local (fallback)
     */
    private function sendLocal(string $phoneNumber, string $message): array
    {
        Log::info('SMS local', [
            'to' => $phoneNumber,
            'message' => $message
        ]);

        return [
            'success' => true,
            'message' => 'SMS loggé localement',
            'sid' => 'local_' . uniqid()
        ];
    }

    /**
     * Validation Mali (+223)
     */
    public function validatePhoneNumber(string $phoneNumber): bool
    {
        return preg_match('/^\+223[7-9][0-9]{7}$/', $phoneNumber);
    }

    /**
     * Formatage Mali
     */
    public function formatPhoneNumber(string $phoneNumber): string
    {
        // Supprimer espaces
        $phoneNumber = preg_replace('/\s+/', '', $phoneNumber);

        // Format local → international
        if (preg_match('/^[7-9][0-9]{7}$/', $phoneNumber)) {
            return '+223' . $phoneNumber;
        }

        if (preg_match('/^0[7-9][0-9]{7}$/', $phoneNumber)) {
            return '+223' . substr($phoneNumber, 1);
        }

        return $phoneNumber;
    }

    /**
     * Mask phone number for logging (privacy)
     */
    private function maskPhoneNumber(string $phone): string
    {
        if (strlen($phone) < 4) {
            return '***';
        }
        return substr($phone, 0, -4) . '****';
    }
}                       'To' => $phoneNumber,
                        'From' => config('sms.twilio.phone_number'),
                        'Body' => $message
                    ]
                );

            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'SMS envoyé (Twilio)',
                    'sid' => $response->json('sid')
                ];
            }

            Log::error('Erreur Twilio', ['body' => $response->body()]);

            return [
                'success' => false,
                'error' => 'Erreur Twilio',
            ];

        } catch (\Throwable $e) {
            Log::error('Exception Twilio', ['error' => $e->getMessage()]);

            return [
                'success' => false,
                'error' => 'Exception Twilio',
            ];
        }
    }

    /**
     * Mode local (fallback)
     */
    private function sendLocal(string $phoneNumber, string $message): array
    {
        Log::info('SMS local', [
            'to' => $phoneNumber,
            'message' => $message
        ]);

        return [
            'success' => true,
            'message' => 'SMS loggé localement',
            'sid' => 'local_' . uniqid()
        ];
    }

    /**
     * Validation Mali (+223)
     */
    public function validatePhoneNumber(string $phoneNumber): bool
    {
        return preg_match('/^\+223[7-9][0-9]{7}$/', $phoneNumber);
    }

    /**
     * Formatage Mali
     */
    public function formatPhoneNumber(string $phoneNumber): string
    {
        // Supprimer espaces
        $phoneNumber = preg_replace('/\s+/', '', $phoneNumber);

        // Format local → international
        if (preg_match('/^[7-9][0-9]{7}$/', $phoneNumber)) {
            return '+223' . $phoneNumber;
        }

        if (preg_match('/^0[7-9][0-9]{7}$/', $phoneNumber)) {
            return '+223' . substr($phoneNumber, 1);
        }

        return $phoneNumber;
    }
}
<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OrangeSmsService
{
    private string $apiUrl;
    private string $clientId;
    private string $clientSecret;
    private string $senderAddress;

    public function __construct()
    {
        $this->apiUrl = env('ORANGE_SMS_API_URL', 'https://api.orange.com/smsmessaging/v1/outbound');
        $this->clientId = env('ORANGE_SMS_CLIENT_ID', '');
        $this->clientSecret = env('ORANGE_SMS_CLIENT_SECRET', '');
        $this->senderAddress = env('ORANGE_SMS_SENDER_ADDRESS', 'tel:+22300000000');
    }

    /**
     * Authenticate with Orange Developer API
     */
    private function getToken(): ?string
    {
        try {
            $response = Http::asForm()->withHeaders([
                'Authorization' => 'Basic ' . base64_encode($this->clientId . ':' . $this->clientSecret),
            ])->post('https://api.orange.com/oauth/v3/token', [
                'grant_type' => 'client_credentials'
            ]);

            if ($response->successful()) {
                return $response->json('access_token');
            }
        } catch (\Exception $e) {
            Log::error('Orange SMS Token Error: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Send SMS to a specific number
     */
    public function sendSms(string $phoneNumber, string $message): array
    {
        // For local development or missing credentials, simulate success
        if (empty($this->clientId) || empty($this->clientSecret)) {
            Log::info("Simulated SMS to {$phoneNumber}: {$message}");
            return ['success' => true, 'id_message' => 'sim_' . uniqid()];
        }

        $token = $this->getToken();
        if (!$token) {
            return ['success' => false, 'error' => 'Unable to authenticate with Orange API'];
        }

        try {
            // Format phone number to international format for Mali (+223)
            $formattedNumber = "tel:+223" . ltrim($phoneNumber, '+223');

            $response = Http::withToken($token)->post("{$this->apiUrl}/{$this->senderAddress}/requests", [
                'outboundSMSMessageRequest' => [
                    'address' => $formattedNumber,
                    'senderAddress' => $this->senderAddress,
                    'outboundSMSTextMessage' => [
                        'message' => $message
                    ]
                ]
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $messageId = $data['outboundSMSMessageRequest']['resourceURL'] ?? uniqid();
                return ['success' => true, 'id_message' => basename($messageId)];
            }

            Log::error('Orange SMS Send Error: ' . $response->body());
            return ['success' => false, 'error' => $response->json('description', 'Unknown error')];
        } catch (\Exception $e) {
            Log::error('Orange SMS Exception: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
}

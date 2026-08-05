<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelerivetService
{
    private string $projectId;
    private string $routeId;
    private string $apiKey;
    private string $apiUrl;

    public function __construct()
    {
        $this->projectId = config('services.telerivet.project_id');
        $this->routeId = config('services.telerivet.route_id');
        $this->apiKey = config('services.telerivet.api_key');
        $this->apiUrl = "https://api.telerivet.com/v1/projects/" . $this->projectId . "/messages/send";
    }

    /**
     * Send SMS via Telerivet Gateway
     *
     * @param string $phoneNumber Phone number (format: +223XXXXXXXX)
     * @param string $message SMS message content
     * @return array Response with status and details
     */
    public function sendSms(string $phoneNumber, string $message): array
    {
        try {
            // Validate phone number format
            if (!preg_match('/^\+?[0-9]{10,15}$/', $phoneNumber)) {
                return [
                    'success' => false,
                    'error' => 'Invalid phone number format',
                    'message' => 'Le format du numéro de téléphone est invalide'
                ];
            }

            // Validate message length (Telerivet limit: 1600 chars for single SMS)
            if (strlen($message) > 1600) {
                return [
                    'success' => false,
                    'error' => 'Message too long',
                    'message' => 'Le message dépasse la limite de 1600 caractères'
                ];
            }

            // Prepare request data
            $data = [
                'content' => $message,
                'to_number' => $phoneNumber,
                'route_id' => $this->routeId
            ];

            // Send request to Telerivet API
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Authorization' => 'Basic ' . base64_encode($this->apiKey . ':'),
            ])->timeout(30)->post($this->apiUrl, $data);

            // Parse response
            if ($response->successful()) {
                $responseData = $response->json();
                
                if (isset($responseData['id'])) {
                    Log::info('SMS sent successfully via Telerivet', [
                        'phone' => $this->maskPhoneNumber($phoneNumber),
                        'message_id' => $responseData['id'],
                        'route_id' => $this->routeId
                    ]);

                    return [
                        'success' => true,
                        'message_id' => $responseData['id'],
                        'message' => 'SMS envoyé avec succès',
                        'phone' => $this->maskPhoneNumber($phoneNumber)
                    ];
                } else {
                    $errorMsg = $responseData['error']['message'] ?? 'Unknown error';
                    Log::error('Telerivet API error', [
                        'error' => $errorMsg,
                        'response' => $responseData
                    ]);

                    return [
                        'success' => false,
                        'error' => $errorMsg,
                        'message' => 'Erreur Telerivet: ' . $errorMsg
                    ];
                }
            } else {
                Log::error('Telerivet HTTP error', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);

                return [
                    'success' => false,
                    'error' => 'HTTP error',
                    'message' => 'Erreur de communication avec Telerivet',
                    'status' => $response->status()
                ];
            }
        } catch (\Exception $e) {
            Log::error('Telerivet service exception', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'error' => 'Service error',
                'message' => 'Erreur critique lors de l\'envoi du SMS',
                'exception' => $e->getMessage()
            ];
        }
    }

    /**
     * Send bulk SMS messages
     *
     * @param array $recipients Array of ['phone' => '+223...', 'message' => '...']
     * @return array Summary of sending results
     */
    public function sendBulkSms(array $recipients): array
    {
        $results = [
            'total' => count($recipients),
            'success' => 0,
            'failed' => 0,
            'details' => []
        ];

        foreach ($recipients as $index => $recipient) {
            $phone = $recipient['phone'] ?? '';
            $message = $recipient['message'] ?? '';

            $result = $this->sendSms($phone, $message);
            
            $results['details'][] = [
                'index' => $index,
                'phone' => $this->maskPhoneNumber($phone),
                'success' => $result['success'],
                'message' => $result['message'] ?? ''
            ];

            if ($result['success']) {
                $results['success']++;
            } else {
                $results['failed']++;
            }

            // Small delay to avoid rate limiting
            if ($index < count($recipients) - 1) {
                usleep(200000); // 0.2 seconds
            }
        }

        return $results;
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

    /**
     * Check service health
     */
    public function healthCheck(): bool
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Basic ' . base64_encode($this->apiKey . ':'),
            ])->timeout(10)->get("https://api.telerivet.com/v1/projects/" . $this->projectId);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Telerivet health check failed', ['error' => $e->getMessage()]);
            return false;
        }
    }
}

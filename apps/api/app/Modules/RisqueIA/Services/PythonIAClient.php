<?php

namespace App\Modules\RisqueIA\Services;

use Illuminate\Support\Facades\Http;

class PythonIAClient
{
    public function evaluate(array $payload): array
    {
        $baseUrl = rtrim((string) config('ia.base_url', ''), '/');
        $timeout = (float) config('ia.timeout', 5.0);
        $token = config('ia.token');

        if ($baseUrl === '') {
            throw new \RuntimeException('IA base URL is not configured.');
        }

        $request = Http::timeout($timeout)->acceptJson();
        if (!empty($token)) {
            $request = $request->withToken($token);
        }

        $response = $request->post("{$baseUrl}/evaluate", $payload);

        if (!$response->successful()) {
            throw new \RuntimeException('IA service call failed: ' . $response->status() . ' ' . $response->body());
        }

        return $response->json() ?? [];
    }
}

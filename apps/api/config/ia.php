<?php

return [
    'base_url' => env('IA_BASE_URL', 'http://ia:8001'),
    'timeout' => (float) env('IA_TIMEOUT', 5.0),
    'enabled' => (bool) env('IA_ENABLED', true),
    'fallback_local' => (bool) env('IA_FALLBACK_LOCAL', true),
    'token' => env('IA_API_TOKEN'),
];

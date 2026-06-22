<?php

return [
    'provider' => env('SMS_PROVIDER', 'local'),
    'debug_mode' => env('SMS_DEBUG_MODE', env('APP_ENV') === 'local'),
    'max_retries' => (int) env('SMS_MAX_RETRIES', 3),
    'retry_delay_ms' => (int) env('SMS_RETRY_DELAY_MS', 1000),
    'relance_delai_jours' => (int) env('SMS_RELANCE_DELAI_JOURS', 3),
    'relance_cooldown_heures' => (int) env('SMS_RELANCE_COOLDOWN_HEURES', 24),

    'telerivet' => [
        'api_key' => env('TELERIVET_API_KEY'),
        'project_id' => env('TELERIVET_PROJECT_ID'),
        'phone_id' => env('TELERIVET_PHONE_ID'),
    ],

    'orange' => [
        'base_url' => env('ORANGE_SMS_BASE_URL', ''),
        'sender_name' => env('ORANGE_SMS_SENDER', ''),
    ],

    'twilio' => [
        'account_sid' => env('TWILIO_ACCOUNT_SID', ''),
        'auth_token' => env('TWILIO_AUTH_TOKEN', ''),
        'phone_number' => env('TWILIO_PHONE_NUMBER', ''),
    ],
];

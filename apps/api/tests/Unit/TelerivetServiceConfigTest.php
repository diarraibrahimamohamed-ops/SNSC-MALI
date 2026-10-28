<?php

namespace Tests\Unit;

use App\Services\TelerivetService;
use Tests\TestCase;

class TelerivetServiceConfigTest extends TestCase
{
    public function test_missing_credentials_disable_provider_without_crashing(): void
    {
        config([
            'services.telerivet.project_id' => null,
            'services.telerivet.route_id' => null,
            'services.telerivet.api_key' => null,
        ]);

        $service = new TelerivetService();

        $this->assertFalse($service->healthCheck());

        $result = $service->sendSms('+22370000000', 'Message de test');

        $this->assertFalse($result['success']);
        $this->assertSame('Telerivet non configuré', $result['error']);
    }
}

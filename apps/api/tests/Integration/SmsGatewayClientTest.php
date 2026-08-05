<?php

namespace Tests\Integration;

use Tests\TestCase;
use App\Modules\RelanceSMS\Integrations\SmsGatewayClient;
use Illuminate\Support\Facades\Http;

class SmsGatewayClientTest extends TestCase
{
    protected SmsGatewayClient $client;

    protected function setUp(): void
    {
        parent::setUp();
        $this->client = new SmsGatewayClient();
    }

    public function test_envoie_sms_avec_succes(): void
    {
        $phoneNumber = '+221778899990';
        $message = 'Rappel: Votre enfant a un rendez-vous vaccinal prévu pour demain.';

        Http::fake([
            'https://api.sms-gateway.com/send' => Http::response([
                'message_id' => 'msg_123456',
                'status' => 'sent',
                'cost' => 0.05
            ], 200)
        ]);

        $result = $this->client->sendSms($phoneNumber, $message);

        $this->assertTrue($result['success']);
        $this->assertEquals('msg_123456', $result['message_id']);
        $this->assertEquals('sent', $result['status']);
    }

    public function test_gere_erreur_envoi(): void
    {
        $phoneNumber = '+221778899990';
        $message = 'Test message';

        Http::fake([
            'https://api.sms-gateway.com/send' => Http::response([
                'error' => 'Invalid phone number'
            ], 400)
        ]);

        $result = $this->client->sendSms($phoneNumber, $message);

        $this->assertFalse($result['success']);
        $this->assertEquals('Invalid phone number', $result['error']);
    }

    public function test_verifie_statut_sms(): void
    {
        $messageId = 'msg_123456';

        Http::fake([
            'https://api.sms-gateway.com/status/*' => Http::response([
                'message_id' => $messageId,
                'status' => 'delivered',
                'delivered_at' => '2023-01-01T10:00:00Z'
            ], 200)
        ]);

        $status = $this->client->getMessageStatus($messageId);

        $this->assertEquals('delivered', $status['status']);
        $this->assertArrayHasKey('delivered_at', $status);
    }

    public function test_gere_service_indisponible(): void
    {
        $phoneNumber = '+221778899990';
        $message = 'Test message';

        Http::fake([
            'https://api.sms-gateway.com/send' => Http::response(null, 503)
        ]);

        $result = $this->client->sendSms($phoneNumber, $message);

        $this->assertFalse($result['success']);
        $this->assertEquals('Service unavailable', $result['error']);
    }
}

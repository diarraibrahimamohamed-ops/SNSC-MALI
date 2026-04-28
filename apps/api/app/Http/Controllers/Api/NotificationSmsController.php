<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NotificationSmsController extends Controller
{
    public function index()
    {
        return response()->json(['message' => 'SMS notifications list']);
    }

    public function store(Request $request)
    {
        return response()->json(['message' => 'SMS notification created']);
    }

    public function show($id)
    {
        return response()->json(['message' => 'SMS notification details']);
    }

    public function update(Request $request, $id)
    {
        return response()->json(['message' => 'SMS notification updated']);
    }

    public function destroy($id)
    {
        return response()->json(['message' => 'SMS notification deleted']);
    }

    public function declencher(Request $request)
    {
        return response()->json(['message' => 'SMS relances déclenchées']);
    }
}

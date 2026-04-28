<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class JournalAuditController extends Controller
{
    public function index()
    {
        return response()->json(['message' => 'Audit journal list']);
    }

    public function store(Request $request)
    {
        return response()->json(['message' => 'Audit entry created']);
    }

    public function show($id)
    {
        return response()->json(['message' => 'Audit entry details']);
    }

    public function update(Request $request, $id)
    {
        return response()->json(['message' => 'Audit entry updated']);
    }

    public function destroy($id)
    {
        return response()->json(['message' => 'Audit entry deleted']);
    }
}

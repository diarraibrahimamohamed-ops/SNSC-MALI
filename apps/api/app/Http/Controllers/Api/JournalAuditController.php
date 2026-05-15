<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JournalAudit;
use Illuminate\Http\Request;

class JournalAuditController extends Controller
{
    public function index()
    {
        $journaux = JournalAudit::with('agent')->orderBy('date_evenement', 'desc')->get();
        return response()->json(['data' => $journaux]);
    }

    public function store(Request $request)
    {
        $journal = JournalAudit::create($request->all());
        return response()->json(['data' => $journal], 201);
    }

    public function show(string $id)
    {
        $journal = JournalAudit::with('agent')->findOrFail($id);
        return response()->json(['data' => $journal]);
    }

    public function update(Request $request, string $id)
    {
        $journal = JournalAudit::findOrFail($id);
        $journal->update($request->all());
        return response()->json(['data' => $journal]);
    }

    public function destroy(string $id)
    {
        $journal = JournalAudit::findOrFail($id);
        $journal->delete();
        return response()->json(['message' => 'Journal d\'audit supprimé avec succès']);
    }
}

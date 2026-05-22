<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JournalAudit;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class JournalAuditController extends Controller
{
    use AuthorizesRequests;
    public function index()
    {
        $this->authorize('viewAny', JournalAudit::class);
        $journaux = JournalAudit::with('agent')->orderBy('date_evenement', 'desc')->get();
        return response()->json(['data' => $journaux]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', JournalAudit::class);
        $journal = JournalAudit::create($request->all());
        return response()->json(['data' => $journal], 201);
    }

    public function show(string $id)
    {
        $journal = JournalAudit::with('agent')->findOrFail($id);
        $this->authorize('view', $journal);
        return response()->json(['data' => $journal]);
    }

    public function update(Request $request, string $id)
    {
        $journal = JournalAudit::findOrFail($id);
        $this->authorize('update', $journal);
        $journal->update($request->all());
        return response()->json(['data' => $journal]);
    }

    public function destroy(string $id)
    {
        $journal = JournalAudit::findOrFail($id);
        $this->authorize('delete', $journal);
        $journal->delete();
        return response()->json(['message' => 'Journal d\'audit supprimé avec succès']);
    }
}

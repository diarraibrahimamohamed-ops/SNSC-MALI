<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ScoreRisqueController extends Controller
{
    public function index()
    {
        return response()->json(['message' => 'Risk scores list']);
    }

    public function store(Request $request)
    {
        return response()->json(['message' => 'Risk score created']);
    }

    public function show($id)
    {
        return response()->json(['message' => 'Risk score details']);
    }

    public function update(Request $request, $id)
    {
        return response()->json(['message' => 'Risk score updated']);
    }

    public function destroy($id)
    {
        return response()->json(['message' => 'Risk score deleted']);
    }

    public function evaluer(Request $request)
    {
        return response()->json(['message' => 'Risk evaluation completed']);
    }
}

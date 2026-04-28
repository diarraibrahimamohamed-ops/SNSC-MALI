<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class FileSynchronisationController extends Controller
{
    public function index()
    {
        return response()->json(['message' => 'File sync list']);
    }

    public function store(Request $request)
    {
        return response()->json(['message' => 'File sync created']);
    }

    public function show($id)
    {
        return response()->json(['message' => 'File sync details']);
    }

    public function update(Request $request, $id)
    {
        return response()->json(['message' => 'File sync updated']);
    }

    public function destroy($id)
    {
        return response()->json(['message' => 'File sync deleted']);
    }
}

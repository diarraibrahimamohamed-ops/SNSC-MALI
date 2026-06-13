<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Vaccin;

class VaccinController extends Controller
{
    public function index()
    {
        $vaccins = Vaccin::all();
        return response()->json(['data' => $vaccins]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'libelle' => 'required|string|max:255',
            'code' => 'required|string|max:50'
        ]);

        $vaccin = Vaccin::create([
            'vaccinId' => (string) \Str::uuid(),
            'libelle' => $data['libelle'],
            'code' => $data['code']
        ]);

        return response()->json(['data' => $vaccin], 201);
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class IssController extends Controller
{
    public function position()
    {
        $data = Cache::remember('iss_position', now()->addSeconds(5), function () {
            $response = Http::get('https://api.wheretheiss.at/v1/satellites/25544');

            if ($response->failed()) {
                return null;
            }

            $iss = $response->json();

            return [
                'name'         => $iss['name'],
                'latitude'     => $iss['latitude'],
                'longitude'    => $iss['longitude'],
                'altitude_km'  => round($iss['altitude'], 2),
                'velocity_kmh' => round($iss['velocity'], 2),
                'visibility'   => $iss['visibility'],
                'timestamp'    => $iss['timestamp'],
            ];
        });

        if (!$data) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Gagal mengambil posisi ISS dari layanan eksternal',
            ], 503);
        }

        return response()->json([
            'status' => 'success',
            'data'   => $data,
        ]);
    }
}
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class AsteroidController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->query('start_date');
        $endDate   = $request->query('end_date', $startDate
            ? (new \DateTime($startDate))->modify('+7 days')->format('Y-m-d')
            : now()->format('Y-m-d')
        );

        // Validasi start_date wajib ada
        if (!$startDate) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Parameter start_date wajib diisi',
            ], 422);
        }

        // Validasi selisih maksimal 7 hari
        $diff = (new \DateTime($startDate))->diff(new \DateTime($endDate))->days;

        if ($diff > 7) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Rentang tanggal tidak valid atau melebihi 7 hari',
            ], 422);
        }

        $cacheKey = "asteroids_{$startDate}_{$endDate}";

        $data = Cache::remember($cacheKey, now()->addHour(), function () use ($startDate, $endDate) {
            $response = Http::get('https://api.nasa.gov/neo/rest/v1/feed', [
                'api_key'    => config('services.nasa.key'),
                'start_date' => $startDate,
                'end_date'   => $endDate,
            ]);

            if ($response->failed()) {
                return null;
            }

            $raw         = $response->json();
            $nearObjects = $raw['near_earth_objects'];
            $asteroids   = [];

            foreach ($nearObjects as $date => $objects) {
                foreach ($objects as $obj) {
                    $approach = $obj['close_approach_data'][0];

                    $asteroids[] = [
                        'id'                       => $obj['id'],
                        'name'                     => $obj['name'],
                        'estimated_diameter_km'    => [
                            'min' => round($obj['estimated_diameter']['kilometers']['estimated_diameter_min'], 2),
                            'max' => round($obj['estimated_diameter']['kilometers']['estimated_diameter_max'], 2),
                        ],
                        'is_potentially_hazardous' => $obj['is_potentially_hazardous_asteroid'],
                        'close_approach_date'      => $approach['close_approach_date'],
                        'miss_distance_km'         => $approach['miss_distance']['kilometers'],
                        'miss_distance_lunar'      => $approach['miss_distance']['lunar'],
                        'relative_velocity_kmh'    => $approach['relative_velocity']['kilometers_per_hour'],
                    ];
                }
            }

            return [
                'total_asteroids' => count($asteroids),
                'asteroids'       => $asteroids,
            ];
        });

        if (!$data) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Gagal mengambil data asteroid dari NASA',
            ], 400);
        }

        return response()->json([
            'status' => 'success',
            'data'   => $data,
        ]);
    }
}
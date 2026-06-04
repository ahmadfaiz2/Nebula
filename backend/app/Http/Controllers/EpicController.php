<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class EpicController extends Controller
{
    public function index(Request $request)
    {
        $date = $request->query('date');

        $cacheKey = $date ? "epic_{$date}" : 'epic_latest';

        $data = Cache::remember($cacheKey, now()->addHours(6), function () use ($date) {
            // Tentukan URL berdasarkan ada tidaknya parameter date
            $url = $date
                ? "https://epic.gsfc.nasa.gov/api/natural/date/{$date}"
                : "https://epic.gsfc.nasa.gov/api/natural/latest";

            $response = Http::get($url);

            if ($response->failed() || empty($response->json())) {
                return null;
            }

            $photos = $response->json();

            return array_map(function ($photo) {
                // Susun URL gambar dari metadata
                $dateParts = explode(' ', $photo['date']);
                $dateOnly  = $dateParts[0]; // "2025-06-03"
                $datePath  = str_replace('-', '/', $dateOnly); // "2025/06/03"

                $imageUrl = "https://epic.gsfc.nasa.gov/archive/natural/{$datePath}/png/{$photo['image']}.png";

                return [
                    'identifier'           => $photo['identifier'],
                    'caption'              => $photo['caption'],
                    'date'                 => $photo['date'],
                    'image_url'            => $imageUrl,
                    'centroid_coordinates' => [
                        'lat' => $photo['centroid_coordinates']['lat'],
                        'lon' => $photo['centroid_coordinates']['lon'],
                    ],
                    'dscovr_distance_km'   => round(sqrt(
                        ($photo['dscovr_j2000_position']['x'] ?? 0) ** 2 +
                        ($photo['dscovr_j2000_position']['y'] ?? 0) ** 2 +
                        ($photo['dscovr_j2000_position']['z'] ?? 0) ** 2
                    ), 2),
                ];
            }, $photos);
        });

        if (!$data) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Tidak ada foto tersedia untuk tanggal yang diminta',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data'   => $data,
        ]);
    }
}
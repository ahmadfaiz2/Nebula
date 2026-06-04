<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class ShareController extends Controller
{
    public function show($type, $slug)
    {
        $allowedTypes = ['apod', 'iss', 'asteroid', 'epic'];

        if (!in_array($type, $allowedTypes)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Tipe konten tidak valid',
            ], 404);
        }

        $data = match($type) {
            'apod'     => $this->getApodData($slug),
            'asteroid' => $this->getAsteroidData($slug),
            'epic'     => $this->getEpicData($slug),
            'iss'      => $this->getIssData(),
        };

        if (!$data) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Konten yang dibagikan tidak ditemukan',
            ], 404);
        }

        $shareUrl  = url("/share/{$type}/{$slug}");
        $embedCode = "<iframe src='" . url("/embed/{$type}/{$slug}") . "' width='600' height='400'></iframe>";

        return response()->json([
            'status' => 'success',
            'data'   => [
                'type'        => $type,
                'title'       => $data['title'],
                'description' => $data['description'],
                'image_url'   => $data['image_url'],
                'share_url'   => $shareUrl,
                'embed_code'  => $embedCode,
                'open_graph'  => [
                    'og:title'       => $data['title'] . ' — Nebula',
                    'og:description' => $data['description'],
                    'og:image'       => $data['image_url'],
                    'og:url'         => $shareUrl,
                ],
            ],
        ]);
    }

    private function getApodData($date)
    {
        $cached = Cache::get("apod_{$date}");

        if (!$cached) {
            $response = Http::get('https://api.nasa.gov/planetary/apod', [
                'api_key' => config('services.nasa.key'),
                'date'    => $date,
            ]);

            if ($response->failed()) return null;
            $cached = $response->json();
        }

        return [
            'title'       => $cached['title'],
            'description' => substr($cached['explanation'], 0, 200) . '...',
            'image_url'   => $cached['url'],
        ];
    }

    private function getAsteroidData($id)
    {
        $response = Http::get("https://api.nasa.gov/neo/rest/v1/neo/{$id}", [
            'api_key' => config('services.nasa.key'),
        ]);

        if ($response->failed()) return null;

        $asteroid = $response->json();

        return [
            'title'       => $asteroid['name'],
            'description' => 'Asteroid dengan diameter estimasi ' .
                round($asteroid['estimated_diameter']['kilometers']['estimated_diameter_max'], 2) . ' km.',
            'image_url'   => 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/FullMoon2010.jpg/600px-FullMoon2010.jpg',
        ];
    }

    private function getEpicData($identifier)
    {
        // Cari di semua cache yang mungkin: latest dan per-tanggal
        $cached = Cache::get("epic_latest");

        $photo = $cached ? collect($cached)->firstWhere('identifier', $identifier) : null;

        // Jika tidak ketemu di latest, coba fetch langsung dari NASA
        if (!$photo) {
            $response = Http::get("https://epic.gsfc.nasa.gov/api/natural/latest");
            if ($response->failed()) return null;
            $photo = collect($response->json())->firstWhere('identifier', $identifier);
        }

        if (!$photo) return null;

        return [
            'title'       => 'Earth from Space — ' . $photo['date'],
            'description' => $photo['caption'],
            'image_url'   => $photo['image_url'],
        ];
    }

    private function getIssData()
    {
        $cached = Cache::get('iss_position');

        if (!$cached) return null;

        return [
            'title'       => 'ISS Real-Time Position',
            'description' => "ISS sedang berada di latitude {$cached['latitude']}, longitude {$cached['longitude']}.",
            'image_url'   => 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/International_Space_Station_after_undocking_of_STS-132.jpg/600px-International_Space_Station_after_undocking_of_STS-132.jpg',
        ];
    }
}
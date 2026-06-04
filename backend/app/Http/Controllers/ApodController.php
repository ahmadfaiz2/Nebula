<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class ApodController extends Controller
{
    public function index(Request $request)
    {
        $date = $request->query('date', now()->format('Y-m-d'));

        // Validasi tanggal
        if ($date < '1995-06-16' || $date > now()->format('Y-m-d')) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Tanggal tidak valid. Rentang: 1995-06-16 hingga hari ini',
            ], 422);
        }

        $cacheKey = "apod_{$date}";

        $data = Cache::remember($cacheKey, now()->addHours(24), function () use ($date) {
            $response = Http::get('https://api.nasa.gov/planetary/apod', [
                'api_key' => config('services.nasa.key'),
                'date'    => $date,
            ]);

            if ($response->failed()) {
                return null;
            }

            $apod = $response->json();

            return [
                'date'       => $apod['date'],
                'title'      => $apod['title'],
                'explanation'=> $apod['explanation'],
                'media_type' => $apod['media_type'],
                'url'        => $apod['url'],
                'hdurl'      => $apod['hdurl'] ?? null,
                'copyright'  => $apod['copyright'] ?? null,
            ];
        });

        if (!$data) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Gagal mengambil data APOD dari NASA',
            ], 400);
        }

        return response()->json([
            'status' => 'success',
            'data'   => $data,
        ]);
    }
}
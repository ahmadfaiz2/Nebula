<?php

namespace App\Http\Controllers;

use App\Models\Bookmark;
use Illuminate\Http\Request;

class BookmarkController extends Controller
{
    public function index(Request $request)
    {
        $bookmarks = Bookmark::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => $bookmarks,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'type'           => 'required|in:apod,iss,asteroid,epic',
            'title'          => 'required|string',
            'reference_date' => 'nullable|date',
            'thumbnail_url'  => 'nullable|string',
            'metadata'       => 'nullable|array',
        ]);

        // Cek duplikat
        $exists = Bookmark::where('user_id', $request->user()->id)
            ->where('type', $request->type)
            ->where('reference_date', $request->reference_date)
            ->exists();

        if ($exists) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Konten ini sudah ada di bookmark Anda',
            ], 409);
        }

        $bookmark = Bookmark::create([
            'user_id'        => $request->user()->id,
            'type'           => $request->type,
            'title'          => $request->title,
            'reference_date' => $request->reference_date,
            'thumbnail_url'  => $request->thumbnail_url,
            'metadata'       => $request->metadata,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Bookmark berhasil disimpan',
            'data'    => [
                'id'             => $bookmark->id,
                'type'           => $bookmark->type,
                'title'          => $bookmark->title,
                'reference_date' => $bookmark->reference_date,
            ],
        ], 201);
    }

    public function destroy(Request $request, $id)
    {
        $bookmark = Bookmark::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$bookmark) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Bookmark tidak ditemukan',
            ], 404);
        }

        $bookmark->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Bookmark berhasil dihapus',
        ]);
    }
}
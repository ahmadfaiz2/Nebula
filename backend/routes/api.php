<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ApodController;
use App\Http\Controllers\IssController;
use App\Http\Controllers\AsteroidController;
use App\Http\Controllers\EpicController;
use App\Http\Controllers\BookmarkController;
use App\Http\Controllers\ShareController;

// Auth
Route::prefix('v1/auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me',       [AuthController::class, 'me']);
        Route::post('/logout',  [AuthController::class, 'logout']);
    });
});

// NASA & ISS (publik)
Route::prefix('v1')->group(function () {
    Route::get('/apod',                   [ApodController::class, 'index']);
    Route::get('/iss/position',           [IssController::class, 'position']);
    Route::get('/asteroids',              [AsteroidController::class, 'index']);
    Route::get('/epic',                   [EpicController::class, 'index']);
    Route::get('/share/{type}/{slug}',    [ShareController::class, 'show']);
});

// Bookmark (perlu login)
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    Route::get('/bookmarks',             [BookmarkController::class, 'index']);
    Route::post('/bookmarks',            [BookmarkController::class, 'store']);
    Route::delete('/bookmarks/{id}',     [BookmarkController::class, 'destroy']);
});

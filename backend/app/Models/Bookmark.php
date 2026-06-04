<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bookmark extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'title',
        'reference_date',
        'thumbnail_url',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];
}
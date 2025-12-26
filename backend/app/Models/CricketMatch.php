<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CricketMatch extends Model
{
    use HasFactory;


    protected $fillable = [
        'competition_id',
        'match_name',
        'team_a',
        'team_b',
        'score_a',
        'wickets_a',
        'overs_a',
        'score_b',
        'wickets_b',
        'overs_b',
        'status',
        'status_label',
    ];

    protected $casts = [
        'competition_id' => 'integer',
        'score_a' => 'integer',
        'wickets_a' => 'integer',
        'score_b' => 'integer',
        'wickets_b' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}


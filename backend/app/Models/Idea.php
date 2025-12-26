<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Idea extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['user_id', 'content'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function likes()
    {
        return $this->hasMany(Like::class);
    }

    /**
     * Scope a query to order by most popular (highest likes count).
     */
    public function scopePopular($query)
    {
        return $query->withCount('likes')
            ->orderBy('likes_count', 'desc')
            ->orderBy('created_at', 'desc');
    }

    /**
     * Scope a query to order by trending (likes + comments + recency).
     */
    public function scopeTrending($query)
    {
        return $query->withCount(['likes', 'comments'])
            ->orderByRaw('(likes_count * 2 + comments_count) DESC')
            ->orderBy('created_at', 'desc');
    }

    /**
     * Scope a query to order by most recent.
     */
    public function scopeRecent($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    /**
     * Scope a query to filter ideas by user.
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }
}

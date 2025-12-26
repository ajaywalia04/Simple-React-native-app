<?php

namespace App\Traits;

use App\Models\Like;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

trait AttachesLikeStatus
{
    /**
     * Attach like status to ideas for a specific user
     */
    protected function attachLikeStatus(LengthAwarePaginator $ideas, int $userId): void
    {
        $ideaIds = $ideas->getCollection()->pluck('id')->toArray();
        
        $likedIds = Like::where('user_id', $userId)
            ->whereIn('idea_id', $ideaIds)
            ->pluck('idea_id')
            ->toArray();

        $ideas->getCollection()->transform(function ($idea) use ($likedIds) {
            $idea->is_liked = (bool) in_array($idea->id, $likedIds);
            return $idea;
        });
    }

    /**
     * Set default like status (false) for all ideas
     */
    protected function setDefaultLikeStatus(LengthAwarePaginator $ideas): void
    {
        $ideas->getCollection()->transform(function ($idea) {
            $idea->is_liked = false;
            return $idea;
        });
    }
}


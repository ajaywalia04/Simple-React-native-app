<?php

namespace App\Services;

use App\Models\Idea;
use App\Models\Like;
use App\Models\User;
use App\Traits\AttachesLikeStatus;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class UserService
{
    use AttachesLikeStatus;

    /**
     * Get user's ideas with engagement status
     */
    public function getUserIdeas(User $user, ?User $currentUser = null): LengthAwarePaginator
    {
        $ideas = $user->ideas()
            ->with(['user'])
            ->withCount(['likes', 'comments'])
            ->latest()
            ->paginate(20);

        if ($currentUser) {
            $this->attachLikeStatus($ideas, $currentUser->id);
        } else {
            $this->setDefaultLikeStatus($ideas);
        }

        return $ideas;
    }
}


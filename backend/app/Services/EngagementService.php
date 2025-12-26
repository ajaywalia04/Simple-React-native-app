<?php

namespace App\Services;

use App\Models\Idea;
use App\Models\User;

class EngagementService
{
    /**
     * Toggle like on an idea
     */
    public function toggleLike(Idea $idea, User $user): array
    {
        $like = $idea->likes()->where('user_id', $user->id)->first();

        if ($like) {
            $like->delete();
            $isLiked = false;
        } else {
            $idea->likes()->create(['user_id' => $user->id]);
            $isLiked = true;
        }

        // Refresh the idea model to get updated counts
        $idea->refresh();
        $idea->load(['user'])->loadCount(['likes', 'comments']);
        $idea->is_liked = $isLiked;

        return [
            'liked' => $isLiked,
            'idea' => $idea,
            'likes_count' => (int) $idea->likes_count,
            'is_liked' => (bool) $isLiked,
        ];
    }

    /**
     * Toggle follow relationship between users
     */
    public function toggleFollow(User $targetUser, User $currentUser): array
    {
        // Prevent self-follow
        if ($currentUser->id === $targetUser->id) {
            return [
                'following' => false,
                'message' => 'You cannot follow yourself',
            ];
        }

        $isFollowing = $currentUser->following()->where('following_id', $targetUser->id)->exists();

        if ($isFollowing) {
            $currentUser->following()->detach($targetUser->id);
            return ['following' => false];
        }

        $currentUser->following()->attach($targetUser->id);
        return ['following' => true];
    }
}


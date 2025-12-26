<?php

namespace App\Services;

use App\Models\Idea;
use App\Models\Like;
use App\Models\User;
use App\Traits\AttachesLikeStatus;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;

class IdeaService
{
    use AttachesLikeStatus;

    /**
     * Get ideas with pagination and user engagement status
     */
    public function getIdeas(Request $request, ?User $user = null, ?string $feedType = null): LengthAwarePaginator
    {
        $query = Idea::with(['user'])
            ->withCount(['likes', 'comments'])
            ->latest();

        // Filter by following feed if requested
        if ($feedType === 'following' && $user) {
            $followingIds = $user->following()->pluck('following_id');
            if ($followingIds->isEmpty()) {
                // Return empty paginator if no following users
                return Idea::whereRaw('1 = 0')->paginate(5);
            }
            $query->whereIn('user_id', $followingIds);
        }

        // Get page from request, default to 1
        $perPage = 10;
        $page = $request->input('page', 1);
        
        $ideas = $query->paginate($perPage, ['*'], 'page', $page);

        // Set is_liked status for authenticated users
        if ($user) {
            $this->attachLikeStatus($ideas, $user->id);
        } else {
            $this->setDefaultLikeStatus($ideas);
        }

        return $ideas;
    }

    /**
     * Get a single idea with engagement status
     */
    public function getIdea(Idea $idea, ?User $user = null): Idea
    {
        $idea->load(['user', 'comments.user'])->loadCount(['likes', 'comments']);

        if ($user) {
            $idea->is_liked = Like::where('idea_id', $idea->id)
                ->where('user_id', $user->id)
                ->exists();
        } else {
            $idea->is_liked = false;
        }

        return $idea;
    }

    /**
     * Create a new idea
     */
    public function createIdea(User $user, string $content): Idea
    {
        $idea = $user->ideas()->create([
            'content' => $content,
        ]);

        $idea->load(['user'])->loadCount(['likes', 'comments']);
        $idea->is_liked = false; // New ideas are not liked by default

        return $idea;
    }

    /**
     * Update an idea
     */
    public function updateIdea(Idea $idea, User $user, string $content): ?Idea
    {
        // Authorization check
        if ($idea->user_id !== $user->id) {
            return null;
        }

        $idea->update(['content' => $content]);
        $idea->load(['user'])->loadCount(['likes', 'comments']);
        
        // Set is_liked status
        $idea->is_liked = Like::where('idea_id', $idea->id)
            ->where('user_id', $user->id)
            ->exists();

        return $idea;
    }

    /**
     * Delete an idea (soft delete)
     */
    public function deleteIdea(Idea $idea, User $user): bool
    {
        // Authorization check
        if ($idea->user_id !== $user->id) {
            return false;
        }

        $idea->delete();
        return true;
    }
}


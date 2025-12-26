<?php

namespace App\Services;

use App\Models\Comment;
use App\Models\Idea;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CommentService
{
    /**
     * Get comments for an idea
     */
    public function getComments(Idea $idea): LengthAwarePaginator
    {
        return $idea->comments()
            ->with('user')
            ->latest()
            ->paginate(20);
    }

    /**
     * Create a new comment
     */
    public function createComment(Idea $idea, User $user, string $content): Comment
    {
        $comment = $idea->comments()->create([
            'user_id' => $user->id,
            'content' => $content,
        ]);

        $comment->load('user');
        return $comment;
    }

    /**
     * Update a comment
     */
    public function updateComment(Comment $comment, User $user, string $content): ?Comment
    {
        // Authorization check
        if ($comment->user_id !== $user->id) {
            return null;
        }

        $comment->update(['content' => $content]);
        $comment->load('user');
        return $comment;
    }

    /**
     * Delete a comment (soft delete)
     */
    public function deleteComment(Comment $comment, User $user): bool
    {
        // Authorization check
        if ($comment->user_id !== $user->id) {
            return false;
        }

        $comment->delete();
        return true;
    }
}


<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCommentRequest;
use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Models\Idea;
use App\Services\CommentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CommentController extends Controller
{
    public function __construct(
        private CommentService $commentService
    ) {}

    public function index(Idea $idea)
    {
        $comments = $this->commentService->getComments($idea);
        return CommentResource::collection($comments);
    }

    public function store(StoreCommentRequest $request, Idea $idea)
    {
        $comment = $this->commentService->createComment(
            $idea,
            $request->user(),
            $request->content
        );

        return (new CommentResource($comment))->response()->setStatusCode(201);
    }

    public function update(Request $request, Comment $comment)
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $updatedComment = $this->commentService->updateComment(
            $comment,
            $request->user(),
            $request->content
        );

        if (!$updatedComment) {
            return response()->json(['message' => 'Unauthorized. You can only edit your own comments.'], 403);
        }

        return new CommentResource($updatedComment);
    }

    public function destroy(Request $request, Comment $comment)
    {
        $deleted = $this->commentService->deleteComment($comment, $request->user());

        if (!$deleted) {
            return response()->json(['message' => 'Unauthorized. You can only delete your own comments.'], 403);
        }

        return response()->json(['message' => 'Comment deleted successfully'], 200);
    }
}

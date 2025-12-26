<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreIdeaRequest;
use App\Http\Requests\UpdateIdeaRequest;
use App\Http\Resources\IdeaResource;
use App\Models\Idea;
use App\Services\IdeaService;
use App\Traits\AuthenticatesUser;
use Illuminate\Http\Request;

class IdeaController extends Controller
{
    use AuthenticatesUser;

    public function __construct(
        private IdeaService $ideaService
    ) {}

    public function index(Request $request)
    {
        $user = $this->getAuthenticatedUser($request);
        $feedType = $request->has('feed') && $request->feed === 'following' ? 'following' : null;
        
        $ideas = $this->ideaService->getIdeas($request, $user, $feedType);
        
        // Return paginated resource collection with metadata preserved
        return IdeaResource::collection($ideas)->response();
    }

    public function store(StoreIdeaRequest $request)
    {
        $idea = $this->ideaService->createIdea(
            $request->user(),
            $request->input('content')
        );

        return (new IdeaResource($idea))->response()->setStatusCode(201);
    }

    public function show(Request $request, Idea $idea)
    {
        $user = $this->getAuthenticatedUser($request);
        $idea = $this->ideaService->getIdea($idea, $user);

        return new IdeaResource($idea);
    }

    public function update(UpdateIdeaRequest $request, Idea $idea)
    {
        $updatedIdea = $this->ideaService->updateIdea(
            $idea,
            $request->user(),
            $request->input('content')
        );

        if (!$updatedIdea) {
            return response()->json(['message' => 'Unauthorized. You can only edit your own ideas.'], 403);
        }

        return new IdeaResource($updatedIdea);
    }

    public function destroy(Request $request, Idea $idea)
    {
        $deleted = $this->ideaService->deleteIdea($idea, $request->user());

        if (!$deleted) {
            return response()->json(['message' => 'Unauthorized. You can only delete your own ideas.'], 403);
        }

        return response()->json(['message' => 'Idea deleted successfully'], 200);
    }
}

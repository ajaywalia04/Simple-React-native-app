<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Idea;
use App\Models\User;
use App\Services\EngagementService;
use Illuminate\Http\Request;

class EngagementController extends Controller
{
    public function __construct(
        private EngagementService $engagementService
    ) {}

    public function like(Request $request, Idea $idea)
    {
        $result = $this->engagementService->toggleLike($idea, $request->user());
        return response()->json($result);
    }

    public function follow(Request $request, User $user)
    {
        $result = $this->engagementService->toggleFollow($user, $request->user());
        
        if (isset($result['message'])) {
            return response()->json($result, 400);
        }

        return response()->json($result);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\IdeaResource;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\UserService;
use App\Traits\AuthenticatesUser;
use Illuminate\Http\Request;

class UserController extends Controller
{
    use AuthenticatesUser;

    public function __construct(
        private UserService $userService
    ) {}
    public function show(Request $request, User $user)
    {
        $user->loadCount(['ideas', 'followers', 'following']);

        // Get authenticated user - check token manually for public routes
        $currentUser = $this->getAuthenticatedUser($request);
        $user->is_following = $currentUser ? $user->followers()->where('follower_id', $currentUser->id)->exists() : false;

        return new UserResource($user);
    }

    public function ideas(Request $request, User $user)
    {
        $currentUser = $this->getAuthenticatedUser($request);
        $ideas = $this->userService->getUserIdeas($user, $currentUser);

        return IdeaResource::collection($ideas);
    }


    public function followers(User $user)
    {
        $followers = $user->followers()->get();
        return UserResource::collection($followers);
    }

    public function following(User $user)
    {
        $following = $user->following()->get();
        return UserResource::collection($following);
    }
}

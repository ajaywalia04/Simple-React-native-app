# Service Layer Pattern - Explanation

## What is a Service Layer?

The **Service Layer** is a design pattern that separates business logic from controllers. Instead of putting all the logic directly in controllers, we extract it into dedicated service classes.

## Why Use Service Layer?

### Benefits:

1. **Separation of Concerns**: Controllers handle HTTP requests/responses, Services handle business logic
2. **Reusability**: Business logic can be reused across different controllers or even in other contexts (jobs, commands, etc.)
3. **Testability**: Services are easier to unit test than controllers
4. **Maintainability**: Changes to business logic are isolated to service classes
5. **Single Responsibility**: Each service class has one clear purpose

## Architecture Overview

```
Request → Controller → Service → Model → Database
                ↓
            Response
```

**Before (Without Service Layer):**
- Controller contains: HTTP handling + Validation + Business Logic + Database queries
- Hard to test, hard to reuse, hard to maintain

**After (With Service Layer):**
- Controller: HTTP handling + Validation only
- Service: Business Logic + Database queries
- Easy to test, reusable, maintainable

## Our Implementation

### Service Classes Created:

1. **IdeaService** (`app/Services/IdeaService.php`)
   - `getIdeas()` - Fetch ideas with pagination and engagement status
   - `getIdea()` - Get single idea with engagement status
   - `createIdea()` - Create a new idea
   - `deleteIdea()` - Delete an idea (with authorization)

2. **EngagementService** (`app/Services/EngagementService.php`)
   - `toggleLike()` - Like/unlike an idea
   - `toggleFollow()` - Follow/unfollow a user

3. **CommentService** (`app/Services/CommentService.php`)
   - `getComments()` - Get comments for an idea
   - `createComment()` - Create a new comment
   - `deleteComment()` - Delete a comment (with authorization)

4. **UserService** (`app/Services/UserService.php`)
   - `getUserIdeas()` - Get user's ideas with engagement status

## Example: Before vs After

### Before (Controller with all logic):

```php
public function index(Request $request)
{
    $query = Idea::with(['user'])
        ->withCount(['likes', 'comments'])
        ->latest();

    $user = $this->getAuthenticatedUser($request);
    
    if ($request->has('feed') && $request->feed === 'following' && $user) {
        $followingIds = $user->following()->pluck('following_id');
        $query->whereIn('user_id', $followingIds);
    }

    $ideas = $query->paginate(10);

    if ($user) {
        $userId = $user->id;
        $ideaIds = $ideas->getCollection()->pluck('id')->toArray();
        $likedIds = Like::where('user_id', $userId)
            ->whereIn('idea_id', $ideaIds)
            ->pluck('idea_id')
            ->toArray();

        $ideas->getCollection()->transform(function ($idea) use ($likedIds) {
            $idea->is_liked = (bool) in_array($idea->id, $likedIds);
            return $idea;
        });
    } else {
        $ideas->getCollection()->transform(function ($idea) {
            $idea->is_liked = false;
            return $idea;
        });
    }

    return IdeaResource::collection($ideas);
}
```

### After (Controller using Service):

```php
public function index(Request $request)
{
    $user = $this->getAuthenticatedUser($request);
    $feedType = $request->has('feed') && $request->feed === 'following' ? 'following' : null;
    
    $ideas = $this->ideaService->getIdeas($request, $user, $feedType);
    
    return IdeaResource::collection($ideas);
}
```

**Much cleaner and easier to understand!**

## Dependency Injection

Laravel automatically resolves service dependencies through **Dependency Injection**:

```php
public function __construct(
    private IdeaService $ideaService
) {}
```

Laravel's service container automatically creates and injects the `IdeaService` instance when the controller is instantiated.

## Testing Benefits

With services, you can easily test business logic:

```php
// Test service directly without HTTP layer
$service = new IdeaService();
$ideas = $service->getIdeas($request, $user, 'following');
// Assert results...
```

## Best Practices

1. **One Service per Domain**: Each service handles one area (Ideas, Comments, Engagement, Users)
2. **Keep Services Focused**: Services should have a single responsibility
3. **Use Dependency Injection**: Let Laravel handle service instantiation
4. **Return Models/Collections**: Services return data, controllers format responses
5. **Handle Authorization in Services**: Business rules belong in services

## Summary

The Service Layer pattern makes our code:
- ✅ **Cleaner**: Controllers are thin, focused on HTTP
- ✅ **Testable**: Business logic can be tested independently
- ✅ **Reusable**: Services can be used in controllers, jobs, commands, etc.
- ✅ **Maintainable**: Changes are isolated to specific service classes
- ✅ **Scalable**: Easy to add new features without bloating controllers

This is the same pattern used by large-scale applications like Quora and Reddit!


<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\EngagementController;
use App\Http\Controllers\Api\IdeaController;
use App\Http\Controllers\Api\CricketMatchController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes with rate limiting
Route::middleware('throttle:60,1')->group(function () {
    Route::get('/matches', [CricketMatchController::class, 'index']);
    Route::get('/ideas', [IdeaController::class, 'index']);
    Route::get('/ideas/{idea}', [IdeaController::class, 'show']);
    Route::get('/ideas/{idea}/comments', [CommentController::class, 'index']);
    Route::get('/users/{user}', [UserController::class, 'show']);
    Route::get('/users/{user}/ideas', [UserController::class, 'ideas']);
    Route::get('/users/{user}/followers', [UserController::class, 'followers']);
    Route::get('/users/{user}/following', [UserController::class, 'following']);
});

// Authentication routes with stricter rate limiting
Route::middleware('throttle:20,1')->group(function () {
    Route::post('/signup', [AuthController::class, 'signup']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/verify-reset-code', [AuthController::class, 'verifyResetCode']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

// Protected routes with rate limiting
Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/ideas', [IdeaController::class, 'store']);
    Route::put('/ideas/{idea}', [IdeaController::class, 'update']);
    Route::delete('/ideas/{idea}', [IdeaController::class, 'destroy']);
    Route::post('/ideas/{idea}/comments', [CommentController::class, 'store']);
    Route::put('/comments/{comment}', [CommentController::class, 'update']);
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);

    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});

// Engagement routes with stricter rate limiting (30 per minute)
Route::middleware(['auth:sanctum', 'throttle:30,1'])->group(function () {
    Route::post('/ideas/{idea}/like', [EngagementController::class, 'like']);
    Route::post('/users/{user}/follow', [EngagementController::class, 'follow']);
});

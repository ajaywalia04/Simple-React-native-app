<?php

namespace App\Traits;

use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

trait AuthenticatesUser
{
    /**
     * Get authenticated user from Sanctum token (works on public routes)
     * 
     * This method allows authentication on public routes where auth:sanctum middleware
     * is not applied. It checks for a Bearer token in the Authorization header and
     * validates it against the database.
     * 
     * @param Request $request
     * @return \App\Models\User|null
     */
    protected function getAuthenticatedUser(Request $request)
    {
        // First, try to get user from request (works if middleware is applied)
        $user = $request->user('sanctum');
        if ($user) {
            return $user;
        }

        // For public routes, manually check for bearer token
        $bearerToken = $request->bearerToken();
        if (!$bearerToken) {
            return null;
        }

        // Find the token in the database
        $token = PersonalAccessToken::findToken($bearerToken);
        if (!$token) {
            return null;
        }

        // Check if token is expired (if expiration is set)
        if ($token->expires_at && $token->expires_at->isPast()) {
            return null;
        }

        // Return the user associated with the token
        return $token->tokenable;
    }
}


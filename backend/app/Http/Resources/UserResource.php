<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Ensure counts are always returned as integers
        // loadCount sets attributes like ideas_count, followers_count, following_count
        // If not set, count manually (though UserController should always loadCount)
        $ideasCount = isset($this->ideas_count) 
            ? (int) $this->ideas_count 
            : (int) $this->ideas()->count();
            
        $followersCount = isset($this->followers_count)
            ? (int) $this->followers_count
            : (int) $this->followers()->count();
            
        $followingCount = isset($this->following_count)
            ? (int) $this->following_count
            : (int) $this->following()->count();
        
        return [
            'id' => $this->id,
            'username' => $this->username,
            'email' => $this->when($request->user()?->id === $this->id, $this->email),
            'ideas_count' => $ideasCount,
            'followers_count' => $followersCount,
            'following_count' => $followingCount,
            'is_following' => $this->is_following ?? false,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}

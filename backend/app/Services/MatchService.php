<?php

namespace App\Services;

use App\Models\CricketMatch;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Collection as SupportCollection;

class MatchService
{
    /**
     * Get all matches ordered by creation date
     */
    public function getAllMatches(): Collection
    {
        return CricketMatch::orderBy('created_at', 'desc')->get();
    }

    /**
     * Get a match by ID
     */
    public function getMatchById(int $id): CricketMatch
    {
        return CricketMatch::findOrFail($id);
    }

    /**
     * Create a new match
     */
    public function createMatch(array $data): CricketMatch
    {
        return CricketMatch::create($data);
    }

    /**
     * Update an existing match
     */
    public function updateMatch(CricketMatch $match, array $data): bool
    {
        return $match->update($data);
    }

    /**
     * Delete a match
     */
    public function deleteMatch(CricketMatch $match): bool
    {
        return $match->delete();
    }

    /**
     * Get matches for public API: latest completed match, all live matches, and 2 upcoming matches
     */
    public function getLiveAndScheduledMatches(): SupportCollection
    {
        // Get the latest completed match
        $latestCompletedMatch = CricketMatch::where('status', 'completed')
            ->orderBy('updated_at', 'desc')
            ->first();

        // Get all live matches
        $liveMatches = CricketMatch::where('status', 'live')
            ->orderBy('created_at', 'desc')
            ->get();

        // Get next 2 scheduled matches
        $scheduledMatches = CricketMatch::where('status', 'scheduled')
            ->orderBy('created_at', 'asc')
            ->limit(2)
            ->get();

        // Combine: latest completed (if exists), then live matches, then scheduled matches
        $matches = collect();
        
        if ($latestCompletedMatch) {
            $matches->push($latestCompletedMatch);
        }
        
        $matches = $matches->concat($liveMatches);
        $matches = $matches->concat($scheduledMatches);

        return $matches;
    }
}


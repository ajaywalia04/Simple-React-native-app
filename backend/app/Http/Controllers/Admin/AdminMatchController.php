<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreMatchRequest;
use App\Http\Requests\Admin\UpdateMatchRequest;
use App\Services\MatchService;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

class AdminMatchController extends Controller
{
    protected MatchService $matchService;

    public function __construct(MatchService $matchService)
    {
        $this->matchService = $matchService;
    }

    /**
     * Display a listing of all matches (for admin)
     */
    public function index(): View
    {
        $matches = $this->matchService->getAllMatches();
        return view('admin.dashboard', compact('matches'));
    }

    /**
     * Show the form for creating a new match
     */
    public function create(): View
    {
        // Get unique competition IDs from existing matches for dropdown
        $competitionIds = \App\Models\CricketMatch::whereNotNull('competition_id')
            ->distinct()
            ->orderBy('competition_id')
            ->pluck('competition_id')
            ->toArray();
        
        return view('admin.matches.create', compact('competitionIds'));
    }

    /**
     * Store a newly created match
     */
    public function store(StoreMatchRequest $request): RedirectResponse
    {
        $data = $request->validated();
        
        // Handle new competition ID
        if ($request->input('competition_id') === '__new__' && $request->has('new_competition_id')) {
            $data['competition_id'] = $request->input('new_competition_id');
        }
        
        // Remove the new_competition_id from data as it's not a database field
        unset($data['new_competition_id']);
        
        $this->matchService->createMatch($data);

        return redirect()->route('admin.dashboard')
            ->with('success', 'Match created successfully!');
    }

    /**
     * Show the form for editing a match
     */
    public function edit(int $id): View
    {
        $match = $this->matchService->getMatchById($id);
        
        // Get unique competition IDs from existing matches for dropdown
        $competitionIds = \App\Models\CricketMatch::whereNotNull('competition_id')
            ->distinct()
            ->orderBy('competition_id')
            ->pluck('competition_id')
            ->toArray();
        
        // Add current match's competition_id if not in list
        if ($match->competition_id && !in_array($match->competition_id, $competitionIds)) {
            $competitionIds[] = $match->competition_id;
            sort($competitionIds);
        }
        
        return view('admin.matches.edit', compact('match', 'competitionIds'));
    }

    /**
     * Update the specified match
     */
    public function update(UpdateMatchRequest $request, int $id): RedirectResponse
    {
        $match = $this->matchService->getMatchById($id);
        $this->matchService->updateMatch($match, $request->validated());

        return redirect()->route('admin.matches.edit', $id);
    }

    /**
     * Remove the specified match
     */
    public function destroy(int $id): RedirectResponse
    {
        $match = $this->matchService->getMatchById($id);
        $this->matchService->deleteMatch($match);

        return redirect()->route('admin.dashboard')
            ->with('success', 'Match deleted successfully!');
    }
}

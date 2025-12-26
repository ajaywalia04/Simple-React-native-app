<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\MatchService;
use Illuminate\Http\JsonResponse;

class CricketMatchController extends Controller
{
    protected MatchService $matchService;

    public function __construct(MatchService $matchService)
    {
        $this->matchService = $matchService;
    }

    /**
     * Display a listing of all live matches and next 2 upcoming scheduled matches.
     */
    public function index(): JsonResponse
    {
        $matches = $this->matchService->getLiveAndScheduledMatches();

        return response()->json([
            'data' => $matches
        ]);
    }
}

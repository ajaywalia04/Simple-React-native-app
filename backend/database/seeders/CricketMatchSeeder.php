<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CricketMatch;

class CricketMatchSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $teams = ['India', 'Australia', 'England', 'Pakistan', 'New Zealand', 'South Africa', 'West Indies', 'Sri Lanka', 'Bangladesh', 'Afghanistan'];
        $matchNames = ['Match 1', 'Match 2', 'Match 3', 'Match 4', 'Match 5', 'Quarter Final', 'Semi Final', 'Final', 'Group Stage', 'Super 8'];
        $statuses = ['scheduled', 'live', 'completed', 'tie', 'draw'];
        $statusLabels = [
            'scheduled' => 'Upcoming',
            'live' => 'Live',
            'completed' => 'Completed',
            'tie' => 'Tied',
            'draw' => 'Drawn'
        ];

        // Create 20 random matches
        for ($i = 0; $i < 20; $i++) {
            $teamA = $teams[array_rand($teams)];
            $teamB = $teams[array_rand($teams)];
            
            // Ensure teams are different
            while ($teamB === $teamA) {
                $teamB = $teams[array_rand($teams)];
            }

            $status = $statuses[array_rand($statuses)];
            $matchName = $matchNames[array_rand($matchNames)];

            $matchData = [
                'competition_id' => rand(1, 5),
                'match_name' => $matchName,
                'team_a' => $teamA,
                'team_b' => $teamB,
                'status' => $status,
                'status_label' => $statusLabels[$status],
            ];

            // Add scores for live, completed, tie, or draw matches
            if (in_array($status, ['live', 'completed', 'tie', 'draw'])) {
                $matchData['score_a'] = rand(150, 350);
                $matchData['wickets_a'] = rand(0, 10);
                $matchData['overs_a'] = rand(20, 50) . '.' . rand(0, 5);
                
                $matchData['score_b'] = rand(150, 350);
                $matchData['wickets_b'] = rand(0, 10);
                $matchData['overs_b'] = rand(20, 50) . '.' . rand(0, 5);
            }

            CricketMatch::create($matchData);
        }
    }
}

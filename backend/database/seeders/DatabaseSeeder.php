<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create test user
        User::factory()->create([
            'username' => 'test_user_' . rand(100, 999),
            'email' => 'test@example.com',
        ]);

        // Seed ideas with categories
        $this->call(IdeaSeeder::class);
        
        // Seed matches
        $this->call(CricketMatchSeeder::class);
    }
}

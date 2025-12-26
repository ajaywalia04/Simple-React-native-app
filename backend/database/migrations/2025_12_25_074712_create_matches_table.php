<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cricket_matches', function (Blueprint $table) {
            $table->id();
            $table->integer('competition_id')->nullable();
            $table->string('match_name', 100);
            $table->string('team_a', 50);
            $table->string('team_b', 50);
            $table->integer('score_a')->nullable();
            $table->integer('wickets_a')->nullable();
            $table->string('overs_a', 10)->nullable();
            $table->integer('score_b')->nullable();
            $table->integer('wickets_b')->nullable();
            $table->string('overs_b', 10)->nullable();
            $table->enum('status', ['scheduled', 'live', 'completed', 'tie', 'draw'])->default('scheduled');
            $table->string('status_label', 50)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cricket_matches');
    }
};

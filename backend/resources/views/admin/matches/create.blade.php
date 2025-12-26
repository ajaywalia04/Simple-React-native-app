@extends('admin.layout')

@section('title', 'Create Match')

@section('styles')
<style>
    .form-container {
        background: white;
        border-radius: 12px;
        padding: 30px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        max-width: 800px;
        margin: 0 auto;
    }
    .form-header {
        margin-bottom: 30px;
    }
    .form-header h2 {
        font-size: 24px;
        color: #1e293b;
    }
    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 20px;
    }
    .form-group {
        margin-bottom: 20px;
    }
    .form-group.full-width {
        grid-column: 1 / -1;
    }
    .form-group label {
        display: block;
        margin-bottom: 8px;
        color: #334155;
        font-weight: 600;
        font-size: 14px;
    }
    .form-group input,
    .form-group select {
        width: 100%;
        padding: 12px 16px;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        font-size: 14px;
        transition: border-color 0.3s;
    }
    .form-group input:focus,
    .form-group select:focus {
        outline: none;
        border-color: #667eea;
    }
    .form-group small {
        display: block;
        margin-top: 4px;
        color: #64748b;
        font-size: 12px;
    }
    .error-message {
        color: #ef4444;
        font-size: 12px;
        margin-top: 4px;
    }
    .form-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #e2e8f0;
    }
    .btn {
        padding: 12px 24px;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 600;
        font-size: 14px;
        transition: all 0.2s;
        border: none;
        cursor: pointer;
    }
    .btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: 2px solid #667eea;
    }
    .btn-primary:hover {
        background: linear-gradient(135deg, #5568d3 0%, #653a8f 100%);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        border-color: #5568d3;
    }
    .btn-secondary {
        background: #e2e8f0;
        color: #475569;
        border: 2px solid #cbd5e1;
    }
    .btn-secondary:hover {
        background: #94a3b8;
        color: white;
        border-color: #94a3b8;
    }
    .score-section {
        background: #f8fafc;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 20px;
    }
    .score-section h3 {
        font-size: 16px;
        color: #475569;
        margin-bottom: 16px;
    }
    
    /* Mobile Responsive */
    @media (max-width: 768px) {
        .form-container {
            padding: 15px;
            margin: 0 10px;
        }
        .form-row {
            grid-template-columns: 1fr;
            gap: 15px;
            margin-bottom: 15px;
        }
        .form-group.full-width {
            grid-column: 1;
        }
        .score-section {
            padding: 15px;
        }
        .form-actions {
            flex-direction: column;
            gap: 10px;
        }
        .form-actions .btn {
            width: 100%;
            padding: 12px;
        }
        .form-header h2 {
            font-size: 20px;
        }
        .form-group input,
        .form-group select {
            font-size: 16px; /* Prevents zoom on iOS */
        }
    }
</style>
@endsection

@section('content')
<div class="form-container">
    <div class="form-header">
        <h2>Create New Match</h2>
    </div>

    <form method="POST" action="{{ route('admin.matches.store') }}">
        @csrf

        <div class="form-row">
            <div class="form-group">
                <label for="match_name">Match Name *</label>
                <input type="text" id="match_name" name="match_name" value="{{ old('match_name') }}" required>
                @error('match_name')
                    <div class="error-message">{{ $message }}</div>
                @enderror
            </div>

            <div class="form-group">
                <label for="competition_id">Competition ID</label>
                <select id="competition_id" name="competition_id">
                    <option value="">-- Select Competition --</option>
                    @if(isset($competitionIds) && count($competitionIds) > 0)
                        @foreach($competitionIds as $compId)
                            <option value="{{ $compId }}" {{ old('competition_id') == $compId ? 'selected' : '' }}>
                                Competition {{ $compId }}
                            </option>
                        @endforeach
                    @endif
                    <option value="__new__" {{ old('competition_id') == '__new__' ? 'selected' : '' }}>+ New Competition</option>
                </select>
                <input type="number" id="new_competition_id" name="new_competition_id" value="{{ old('new_competition_id') }}" placeholder="Enter new competition ID" style="display: none; margin-top: 8px;">
                @error('competition_id')
                    <div class="error-message">{{ $message }}</div>
                @enderror
                @error('new_competition_id')
                    <div class="error-message">{{ $message }}</div>
                @enderror
                <script>
                    document.getElementById('competition_id').addEventListener('change', function() {
                        const newInput = document.getElementById('new_competition_id');
                        if (this.value === '__new__') {
                            newInput.style.display = 'block';
                            newInput.required = true;
                        } else {
                            newInput.style.display = 'none';
                            newInput.required = false;
                            newInput.value = '';
                        }
                    });
                    // Trigger on page load if already selected
                    if (document.getElementById('competition_id').value === '__new__') {
                        document.getElementById('new_competition_id').style.display = 'block';
                    }
                </script>
            </div>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label for="team_a">Team A *</label>
                <input type="text" id="team_a" name="team_a" value="{{ old('team_a') }}" required>
                @error('team_a')
                    <div class="error-message">{{ $message }}</div>
                @enderror
            </div>

            <div class="form-group">
                <label for="team_b">Team B *</label>
                <input type="text" id="team_b" name="team_b" value="{{ old('team_b') }}" required>
                @error('team_b')
                    <div class="error-message">{{ $message }}</div>
                @enderror
            </div>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label for="status">Status *</label>
                <select id="status" name="status" required>
                    <option value="scheduled" {{ old('status') == 'scheduled' ? 'selected' : '' }}>Scheduled</option>
                    <option value="live" {{ old('status') == 'live' ? 'selected' : '' }}>Live</option>
                    <option value="completed" {{ old('status') == 'completed' ? 'selected' : '' }}>Completed</option>
                </select>
                @error('status')
                    <div class="error-message">{{ $message }}</div>
                @enderror
            </div>

            <div class="form-group">
                <label for="status_label">Status Label</label>
                <input type="text" id="status_label" name="status_label" value="{{ old('status_label') }}" placeholder="e.g., Live, Upcoming, Completed">
                @error('status_label')
                    <div class="error-message">{{ $message }}</div>
                @enderror
            </div>
        </div>

        <div class="score-section">
            <h3>Team A Score (Optional - leave blank for scheduled matches)</h3>
            <div class="form-row">
                <div class="form-group">
                    <label for="score_a">Score</label>
                    <input type="number" id="score_a" name="score_a" value="{{ old('score_a') }}" min="0">
                    @error('score_a')
                        <div class="error-message">{{ $message }}</div>
                    @enderror
                </div>
                <div class="form-group">
                    <label for="wickets_a">Wickets</label>
                    <input type="number" id="wickets_a" name="wickets_a" value="{{ old('wickets_a') }}" min="0" max="10">
                    @error('wickets_a')
                        <div class="error-message">{{ $message }}</div>
                    @enderror
                </div>
                <div class="form-group">
                    <label for="overs_a">Overs</label>
                    <input type="text" id="overs_a" name="overs_a" value="{{ old('overs_a') }}" placeholder="e.g., 42.3">
                    @error('overs_a')
                        <div class="error-message">{{ $message }}</div>
                    @enderror
                </div>
            </div>
        </div>

        <div class="score-section">
            <h3>Team B Score (Optional - leave blank for scheduled matches)</h3>
            <div class="form-row">
                <div class="form-group">
                    <label for="score_b">Score</label>
                    <input type="number" id="score_b" name="score_b" value="{{ old('score_b') }}" min="0">
                    @error('score_b')
                        <div class="error-message">{{ $message }}</div>
                    @enderror
                </div>
                <div class="form-group">
                    <label for="wickets_b">Wickets</label>
                    <input type="number" id="wickets_b" name="wickets_b" value="{{ old('wickets_b') }}" min="0" max="10">
                    @error('wickets_b')
                        <div class="error-message">{{ $message }}</div>
                    @enderror
                </div>
                <div class="form-group">
                    <label for="overs_b">Overs</label>
                    <input type="text" id="overs_b" name="overs_b" value="{{ old('overs_b') }}" placeholder="e.g., 42.3">
                    @error('overs_b')
                        <div class="error-message">{{ $message }}</div>
                    @enderror
                </div>
            </div>
        </div>

        <div class="form-actions">
            <a href="{{ route('admin.dashboard') }}" class="btn btn-secondary">Cancel</a>
            <button type="submit" class="btn btn-primary">Create Match</button>
        </div>
    </form>
</div>
@endsection


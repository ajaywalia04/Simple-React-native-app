@extends('admin.layout')

@section('title', 'Edit Match')

@section('styles')
<style>
    body {
        overflow: hidden;
    }
    .form-container {
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        max-width: 1000px;
        margin: 0 auto;
        height: calc(100vh - 120px);
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }
    .form-header {
        margin-bottom: 15px;
        padding-bottom: 12px;
        border-bottom: 2px solid #e2e8f0;
    }
    .form-header h2 {
        font-size: 20px;
        color: #1e293b;
        margin: 0;
    }
    .match-info {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 12px;
        margin-bottom: 15px;
        padding: 12px;
        background: #f8fafc;
        border-radius: 8px;
    }
    .info-item {
        display: flex;
        flex-direction: column;
    }
    .info-label {
        font-size: 11px;
        color: #64748b;
        text-transform: uppercase;
        font-weight: 600;
        margin-bottom: 4px;
        letter-spacing: 0.5px;
    }
    .info-value {
        font-size: 14px;
        color: #1e293b;
        font-weight: 600;
    }
    .editable-section {
        flex: 1;
        overflow: hidden;
    }
    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 12px;
        margin-bottom: 12px;
    }
    .form-group {
        margin-bottom: 0;
    }
    .form-group label {
        display: block;
        margin-bottom: 6px;
        color: #334155;
        font-weight: 600;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .form-group input,
    .form-group select {
        width: 100%;
        padding: 8px 10px;
        border: 2px solid #e2e8f0;
        border-radius: 6px;
        font-size: 13px;
        transition: border-color 0.3s;
    }
    .form-group input:focus,
    .form-group select:focus {
        outline: none;
        border-color: #667eea;
    }
    .score-section {
        background: #ffffff;
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 12px;
        border: 2px solid #e2e8f0;
    }
    .score-section h3 {
        font-size: 13px;
        color: #475569;
        margin-bottom: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
        .form-actions {
            display: flex;
            gap: 12px;
            justify-content: center;
            margin-top: 12px;
            padding-top: 12px;
            border-top: 2px solid #e2e8f0;
            flex-shrink: 0;
        }
    .btn {
        padding: 10px 20px;
        border-radius: 6px;
        text-decoration: none;
        font-weight: 600;
        font-size: 13px;
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
    .status-group {
        grid-column: 1 / -1;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
    }
    .status-group .form-group {
        max-width: none;
    }
    
    /* Mobile Responsive */
    @media (max-width: 768px) {
        body {
            overflow: auto;
        }
        .form-container {
            height: auto;
            min-height: calc(100vh - 120px);
            padding: 15px;
            margin: 0 10px;
        }
        .match-info {
            grid-template-columns: 1fr;
            gap: 10px;
            padding: 10px;
        }
        .form-row {
            grid-template-columns: 1fr;
            gap: 10px;
            margin-bottom: 10px;
        }
        .status-group {
            grid-template-columns: 1fr;
        }
        .score-section {
            padding: 10px;
            margin-bottom: 10px;
        }
        .form-actions .btn {
            width: 100%;
            padding: 12px;
        }
        .form-header h2 {
            font-size: 18px;
        }
        .form-group input,
        .form-group select {
            padding: 10px 12px;
            font-size: 16px; /* Prevents zoom on iOS */
        }
    }
</style>
@endsection

@section('content')
<div class="form-container">
    <div class="form-header">
        <h2>Edit Match Score</h2>
    </div>

    @if($errors->any())
        <div style="background: #fee2e2; color: #991b1b; padding: 10px 14px; border-radius: 6px; margin-bottom: 15px; border-left: 4px solid #ef4444; font-size: 13px;">
            <strong>Please fix the following errors:</strong>
            <ul style="margin: 8px 0 0 20px;">
                @foreach($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <div class="match-info">
        <div class="info-item">
            <div class="info-label">Match Name</div>
            <div class="info-value">{{ $match->match_name }}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Teams</div>
            <div class="info-value">{{ $match->team_a }} vs {{ $match->team_b }}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Competition ID</div>
            <div class="info-value">{{ $match->competition_id ?? 'N/A' }}</div>
        </div>
    </div>

    <form method="POST" action="{{ route('admin.matches.update', $match->id) }}" class="editable-section">
        @csrf
        @method('PUT')

        <div class="form-row status-group">
            <div class="form-group">
                <label for="status">Status *</label>
                <select id="status" name="status" required>
                    <option value="scheduled" {{ old('status', $match->status) == 'scheduled' ? 'selected' : '' }}>Scheduled</option>
                    <option value="live" {{ old('status', $match->status) == 'live' ? 'selected' : '' }}>Live</option>
                    <option value="completed" {{ old('status', $match->status) == 'completed' ? 'selected' : '' }}>Completed</option>
                </select>
                @error('status')
                    <div style="color: #ef4444; font-size: 11px; margin-top: 4px;">{{ $message }}</div>
                @enderror
            </div>
            <div class="form-group">
                <label for="status_label">Status Label</label>
                <input type="text" id="status_label" name="status_label" value="{{ old('status_label', $match->status_label) }}" placeholder="e.g., Live, Upcoming, Completed">
                @error('status_label')
                    <div style="color: #ef4444; font-size: 11px; margin-top: 4px;">{{ $message }}</div>
                @enderror
            </div>
        </div>

        <div class="score-section">
            <h3>{{ $match->team_a }} - Score</h3>
            <div class="form-row">
                <div class="form-group">
                    <label for="score_a">Score</label>
                    <input type="number" id="score_a" name="score_a" value="{{ old('score_a', $match->score_a) }}" min="0" placeholder="0">
                    @error('score_a')
                        <div style="color: #ef4444; font-size: 11px; margin-top: 4px;">{{ $message }}</div>
                    @enderror
                </div>
                <div class="form-group">
                    <label for="wickets_a">Wickets</label>
                    <input type="number" id="wickets_a" name="wickets_a" value="{{ old('wickets_a', $match->wickets_a) }}" min="0" max="10" placeholder="0">
                    @error('wickets_a')
                        <div style="color: #ef4444; font-size: 11px; margin-top: 4px;">{{ $message }}</div>
                    @enderror
                </div>
                <div class="form-group">
                    <label for="overs_a">Overs</label>
                    <input type="text" id="overs_a" name="overs_a" value="{{ old('overs_a', $match->overs_a) }}" placeholder="0.0">
                    @error('overs_a')
                        <div style="color: #ef4444; font-size: 11px; margin-top: 4px;">{{ $message }}</div>
                    @enderror
                </div>
            </div>
        </div>

        <div class="score-section">
            <h3>{{ $match->team_b }} - Score</h3>
            <div class="form-row">
                <div class="form-group">
                    <label for="score_b">Score</label>
                    <input type="number" id="score_b" name="score_b" value="{{ old('score_b', $match->score_b) }}" min="0" placeholder="0">
                    @error('score_b')
                        <div style="color: #ef4444; font-size: 11px; margin-top: 4px;">{{ $message }}</div>
                    @enderror
                </div>
                <div class="form-group">
                    <label for="wickets_b">Wickets</label>
                    <input type="number" id="wickets_b" name="wickets_b" value="{{ old('wickets_b', $match->wickets_b) }}" min="0" max="10" placeholder="0">
                    @error('wickets_b')
                        <div style="color: #ef4444; font-size: 11px; margin-top: 4px;">{{ $message }}</div>
                    @enderror
                </div>
                <div class="form-group">
                    <label for="overs_b">Overs</label>
                    <input type="text" id="overs_b" name="overs_b" value="{{ old('overs_b', $match->overs_b) }}" placeholder="0.0">
                    @error('overs_b')
                        <div style="color: #ef4444; font-size: 11px; margin-top: 4px;">{{ $message }}</div>
                    @enderror
                </div>
            </div>
        </div>

        <div class="form-actions">
            <button type="submit" class="btn btn-primary">Update Score</button>
        </div>
    </form>
</div>
@endsection

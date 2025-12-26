@extends('admin.layout')

@section('title', 'Dashboard')

@section('styles')
<style>
    .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
    }
    .dashboard-header h2 {
        font-size: 28px;
        color: #1e293b;
    }
    .matches-table {
        background: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    table {
        width: 100%;
        border-collapse: collapse;
    }
    thead {
        background: #f1f5f9;
    }
    th {
        padding: 16px;
        text-align: left;
        font-weight: 600;
        color: #475569;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    td {
        padding: 16px;
        border-top: 1px solid #e2e8f0;
        color: #334155;
    }
    tbody tr:hover {
        background: #f8fafc;
    }
    .status-badge {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
    }
    .status-live {
        background: #fee2e2;
        color: #991b1b;
    }
    .status-scheduled {
        background: #dbeafe;
        color: #1e40af;
    }
    .status-completed {
        background: #d1fae5;
        color: #065f46;
    }
    .action-buttons {
        display: flex;
        gap: 8px;
    }
    .btn-sm {
        padding: 6px 12px;
        font-size: 12px;
        border-radius: 6px;
        text-decoration: none;
        font-weight: 600;
        transition: all 0.2s;
    }
    .btn-edit {
        background: #3b82f6;
        color: white;
    }
    .btn-edit:hover {
        background: #2563eb;
    }
    .btn-delete {
        background: #ef4444;
        color: white;
        border: none;
        cursor: pointer;
        padding: 6px 12px;
        font-size: 12px;
        border-radius: 6px;
        font-weight: 600;
        transition: all 0.2s;
    }
    .btn-delete:hover {
        background: #dc2626;
    }
    .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: #64748b;
    }
    .empty-state h3 {
        font-size: 20px;
        margin-bottom: 8px;
        color: #334155;
    }
    
    /* Mobile Responsive */
    @media (max-width: 768px) {
        .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
            margin-bottom: 20px;
        }
        .dashboard-header h2 {
            font-size: 22px;
        }
        .dashboard-header .btn {
            width: 100%;
            text-align: center;
        }
        .matches-table {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
        }
        table {
            min-width: 600px;
        }
        th, td {
            padding: 12px 8px;
            font-size: 12px;
        }
        .action-buttons {
            flex-direction: column;
            gap: 6px;
        }
        .action-buttons .btn-sm {
            width: 100%;
            text-align: center;
        }
        .status-badge {
            font-size: 10px;
            padding: 3px 8px;
        }
    }
    
    @media (max-width: 480px) {
        .dashboard-header h2 {
            font-size: 18px;
        }
        th, td {
            padding: 10px 6px;
            font-size: 11px;
        }
        table {
            min-width: 500px;
        }
    }
</style>
@endsection

@section('content')
<div class="dashboard-header">
    <h2>All Matches</h2>
    <a href="{{ route('admin.matches.create') }}" class="btn btn-primary">+ Create New Match</a>
</div>

@if(session('success'))
    <div style="background: #d1fae5; color: #065f46; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #10b981;">
        {{ session('success') }}
    </div>
@endif

<div class="matches-table">
    @if($matches->count() > 0)
        <table>
            <thead>
                <tr>
                    <th>Match Name</th>
                    <th>Teams</th>
                    <th>Scores</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                @foreach($matches as $match)
                    <tr>
                        <td><strong>{{ $match->match_name }}</strong></td>
                        <td>
                            <div>{{ $match->team_a }} vs {{ $match->team_b }}</div>
                        </td>
                        <td>
                            @if($match->score_a !== null)
                                <div><strong>{{ $match->team_a }}:</strong> {{ $match->score_a }}/{{ $match->wickets_a }} ({{ $match->overs_a }})</div>
                                <div><strong>{{ $match->team_b }}:</strong> {{ $match->score_b }}/{{ $match->wickets_b }} ({{ $match->overs_b }})</div>
                            @else
                                <span style="color: #94a3b8;">Not started</span>
                            @endif
                        </td>
                        <td>
                            <span class="status-badge status-{{ $match->status }}">
                                {{ $match->status_label ?? $match->status }}
                            </span>
                        </td>
                        <td>
                            <div class="action-buttons">
                                <a href="{{ route('admin.matches.edit', $match->id) }}" class="btn-sm btn-edit">Edit</a>
                                <form method="POST" action="{{ route('admin.matches.destroy', $match->id) }}" style="display: inline;" onsubmit="return confirm('Are you sure you want to delete this match?');">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="btn-sm btn-delete">Delete</button>
                                </form>
                            </div>
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <div class="empty-state">
            <h3>No matches found</h3>
            <p>Create your first match to get started.</p>
            <a href="{{ route('admin.matches.create') }}" class="btn btn-primary" style="margin-top: 16px; display: inline-block;">Create Match</a>
        </div>
    @endif
</div>
@endsection


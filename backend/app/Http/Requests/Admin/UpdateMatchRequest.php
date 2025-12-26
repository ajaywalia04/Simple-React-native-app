<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMatchRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled by AdminAuth middleware
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'competition_id' => ['nullable', 'integer'],
            'score_a' => ['nullable', 'integer', 'min:0'],
            'wickets_a' => ['nullable', 'integer', 'min:0', 'max:10'],
            'overs_a' => ['nullable', 'string', 'max:10'],
            'score_b' => ['nullable', 'integer', 'min:0'],
            'wickets_b' => ['nullable', 'integer', 'min:0', 'max:10'],
            'overs_b' => ['nullable', 'string', 'max:10'],
            'status' => ['required', 'in:scheduled,live,completed'],
            'status_label' => ['nullable', 'string', 'max:50'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'match_name.required' => 'Match name is required.',
            'match_name.max' => 'Match name cannot exceed 100 characters.',
            'team_a.required' => 'Team A is required.',
            'team_a.max' => 'Team A name cannot exceed 50 characters.',
            'team_b.required' => 'Team B is required.',
            'team_b.max' => 'Team B name cannot exceed 50 characters.',
            'status.required' => 'Status is required.',
            'status.in' => 'Status must be one of: scheduled, live, completed.',
            'wickets_a.max' => 'Wickets cannot exceed 10.',
            'wickets_b.max' => 'Wickets cannot exceed 10.',
        ];
    }
}

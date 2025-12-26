<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;

use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'username',
        'email',
        'password',
        'username_changes_count',
        'password_reset_code',
        'password_reset_code_expires_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'password_reset_code_expires_at' => 'datetime',
        ];
    }

    public function ideas()
    {
        return $this->hasMany(Idea::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function likes()
    {
        return $this->hasMany(Like::class);
    }

    public function followers()
    {
        return $this->belongsToMany(User::class, 'follows', 'following_id', 'follower_id');
    }

    public function following()
    {
        return $this->belongsToMany(User::class, 'follows', 'follower_id', 'following_id');
    }

    /**
     * Generate a 4-character random reset code
     *
     * @return string
     */
    public function generateResetCode(): string
    {
        // Generate 4-character alphanumeric code (A-Z, 0-9), case-sensitive
        $characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        $code = '';
        for ($i = 0; $i < 4; $i++) {
            $code .= $characters[random_int(0, strlen($characters) - 1)];
        }
        return $code;
    }

    /**
     * Check if the reset code is valid (matches and not expired)
     *
     * @param  string  $code
     * @return bool
     */
    public function isResetCodeValid(string $code): bool
    {
        if (!$this->password_reset_code || !$this->password_reset_code_expires_at) {
            return false;
        }

        if ($this->password_reset_code !== $code) {
            return false;
        }

        if ($this->password_reset_code_expires_at->isPast()) {
            return false;
        }

        return true;
    }

    /**
     * Clear the reset code
     *
     * @return void
     */
    public function clearResetCode(): void
    {
        $this->update([
            'password_reset_code' => null,
            'password_reset_code_expires_at' => null,
        ]);
    }
}

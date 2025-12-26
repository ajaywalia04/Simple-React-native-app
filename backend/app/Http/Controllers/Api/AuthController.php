<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Http\Requests\SignupRequest;
use App\Http\Requests\VerifyResetCodeRequest;
use App\Models\User;
use App\Notifications\PasswordResetCodeNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function signup(SignupRequest $request)
    {
        $username = $this->generateUsername();

        $user = User::create([
            'username' => $username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function login(LoginRequest $request)
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid login details'], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }

    public function forgotPassword(ForgotPasswordRequest $request)
    {
        // First check if user exists with this email
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'Email does not exist in our system'
            ], 404);
        }

        // Generate 4-letter reset code
        $code = $user->generateResetCode();
        
        // Save code and expiration (15 minutes from now)
        $user->update([
            'password_reset_code' => $code,
            'password_reset_code_expires_at' => now()->addMinutes(15),
        ]);

        // Send code via email
        $user->notify(new PasswordResetCodeNotification($code));

        return response()->json([
            'message' => 'Password reset code sent to your email'
        ]);
    }

    public function verifyResetCode(VerifyResetCodeRequest $request)
    {
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'Email does not exist in our system'
            ], 404);
        }

        if (!$user->isResetCodeValid($request->code)) {
            return response()->json([
                'message' => 'Invalid or expired reset code'
            ], 400);
        }

        return response()->json([
            'message' => 'Code verified successfully'
        ]);
    }

    public function resetPassword(ResetPasswordRequest $request)
    {
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'Email does not exist in our system'
            ], 404);
        }

        // Verify the code first
        if (!$user->isResetCodeValid($request->code)) {
            return response()->json([
                'message' => 'Invalid or expired reset code'
            ], 400);
        }

        // Code is valid, update password
        $user->password = Hash::make($request->password);
        $user->save();

        // Clear the reset code
        $user->clearResetCode();

        // Create authentication token and log the user in
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Password has been reset successfully',
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    private function generateUsername()
    {
        $prefixes = ['idea', 'think', 'mind', 'spark', 'flow'];
        $words = ['vibe', 'node', 'wave', 'core', 'path'];

        do {
            $username = $prefixes[array_rand($prefixes)] . '_' . $words[array_rand($words)] . '_' . rand(100, 999);
        } while (User::where('username', $username)->exists());

        return $username;
    }
}

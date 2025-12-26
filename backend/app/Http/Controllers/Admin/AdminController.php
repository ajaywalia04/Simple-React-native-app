<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class AdminController extends Controller
{
    private const ADMIN_CODE = 'ADMIN123';

    /**
     * Show the admin login page
     */
    public function showLogin()
    {
        // If already logged in, redirect to dashboard
        if (Session::has('admin_authenticated')) {
            return redirect()->route('admin.dashboard');
        }

        return view('admin.login');
    }

    /**
     * Handle admin login
     */
    public function login(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        if ($request->code === self::ADMIN_CODE) {
            Session::put('admin_authenticated', true);
            return redirect()->route('admin.dashboard')->with('success', 'Login successful!');
        }

        return back()->withErrors(['code' => 'Invalid admin code'])->withInput();
    }

    /**
     * Handle admin logout
     */
    public function logout()
    {
        Session::forget('admin_authenticated');
        return redirect()->route('admin.login')->with('success', 'Logged out successfully');
    }
}

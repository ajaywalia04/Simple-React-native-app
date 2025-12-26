<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\AdminMatchController;

Route::get('/', function () {
    return view('welcome');
});

// Admin routes
Route::prefix('admin')->name('admin.')->group(function () {
    // Public admin login routes
    Route::get('/', [AdminController::class, 'showLogin'])->name('login');
    Route::post('/login', [AdminController::class, 'login'])->name('login.post');
    
    // Protected admin routes (require authentication)
    Route::middleware([\App\Http\Middleware\AdminAuth::class])->group(function () {
        Route::get('/dashboard', [AdminMatchController::class, 'index'])->name('dashboard');
        Route::get('/logout', [AdminController::class, 'logout'])->name('logout');
        
        // Match management routes
        Route::get('/matches/create', [AdminMatchController::class, 'create'])->name('matches.create');
        Route::post('/matches', [AdminMatchController::class, 'store'])->name('matches.store');
        Route::get('/matches/{id}/edit', [AdminMatchController::class, 'edit'])->name('matches.edit');
        Route::put('/matches/{id}', [AdminMatchController::class, 'update'])->name('matches.update');
        Route::delete('/matches/{id}', [AdminMatchController::class, 'destroy'])->name('matches.destroy');
    });
});

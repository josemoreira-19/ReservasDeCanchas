<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
        collect([
            'login' => Route::has('login'),
            'register' => Route::has('register'),
            'forgotPassword' => Route::has('password.request'),
            'resetPassword' => Route::has('password.reset'),
            'emailVerification' => Route::has('verification.notice'),
        ])->filter(fn ($value) => $value !== false),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';

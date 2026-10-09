<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();
        $user = $request->user();
        if (! $user->isSuperAdmin() && (! $user->store_id || ! $user->store()->where('status', 'active')->exists())) {
            Auth::logout();
            throw ValidationException::withMessages([
                'email' => 'This store is currently unavailable. Contact your CrystalBubble administrator.',
            ]);
        }

        $request->session()->regenerate();
        $home = $user->isSuperAdmin()
            ? route('super-admin.dashboard', absolute: false)
            : ($user->isAdmin()
            ? route('admin.dashboard', absolute: false)
            : route('staff.dashboard', absolute: false));

        return redirect()->to($home);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}

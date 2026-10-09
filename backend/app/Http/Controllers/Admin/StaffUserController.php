<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StaffUserController extends Controller
{
    public function index(): Response
    {
        $staff = User::query()->where('store_id', auth()->user()->store_id)->where('role', User::ROLE_STAFF)->orderBy('name')->paginate(15);

        return Inertia::render('Admin/Staff/Index', [
            'staff' => $staff,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Staff/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::query()->create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => User::ROLE_STAFF,
            'store_id' => $request->user()->store_id,
        ]);

        ActivityLogger::log('staff.created', "Staff {$user->email}", $user);

        return redirect()->route('admin.staff.index')->with('success', 'Staff account created.');
    }

    public function edit(User $user): Response
    {
        if ($user->role !== User::ROLE_STAFF || $user->store_id !== auth()->user()->store_id) {
            abort(404);
        }

        return Inertia::render('Admin/Staff/Edit', [
            'staffUser' => $user->only(['id', 'name', 'email', 'role']),
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        if ($user->role !== User::ROLE_STAFF || $user->store_id !== $request->user()->store_id) {
            abort(404);
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
        ]);

        $user->name = $data['name'];
        $user->email = $data['email'];
        if (! empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }
        $user->save();

        ActivityLogger::log('staff.updated', "Staff {$user->email}", $user);

        return redirect()->route('admin.staff.index')->with('success', 'Staff updated.');
    }

    public function destroy(User $user): RedirectResponse
    {
        if ($user->role !== User::ROLE_STAFF || $user->store_id !== auth()->user()->store_id) {
            abort(404);
        }
        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        ActivityLogger::log('staff.deleted', "Staff {$user->email}", $user);
        $user->delete();

        return redirect()->route('admin.staff.index')->with('success', 'Staff removed.');
    }
}

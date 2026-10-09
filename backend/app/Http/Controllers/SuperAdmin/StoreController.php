<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StoreController extends Controller
{
    public function index(): Response
    {
        $stores = Store::query()->withCount('users')->orderBy('name')->get()->map(function (Store $store): array {
            return [
                'id' => $store->id,
                'name' => $store->name,
                'code' => $store->code,
                'address' => $store->address,
                'contact_email' => $store->contact_email,
                'status' => $store->status,
                'users_count' => $store->users_count,
                'customers_count' => DB::table('customers')->where('store_id', $store->id)->count(),
                'orders_count' => DB::table('laundry_orders')->where('store_id', $store->id)->count(),
                'sales_total' => (float) DB::table('payments')->where('store_id', $store->id)->sum('amount_paid'),
                'created_at' => $store->created_at?->toDateString(),
            ];
        });

        return Inertia::render('Platform/Stores', [
            'stores' => $stores,
            'summary' => [
                'stores' => $stores->count(),
                'active' => $stores->where('status', 'active')->count(),
                'customers' => $stores->sum('customers_count'),
                'orders' => $stores->sum('orders_count'),
                'sales' => $stores->sum('sales_total'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'admin_name' => ['required', 'string', 'max:255'],
            'admin_email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'admin_password' => ['required', 'string', 'min:10', 'confirmed'],
        ]);

        DB::transaction(function () use ($data): void {
            $baseCode = Str::upper(Str::slug($data['name']) ?: Str::random(8));
            $code = $baseCode;
            for ($suffix = 2; Store::query()->where('code', $code)->exists(); $suffix++) {
                $code = $baseCode.'-'.$suffix;
            }

            $store = Store::query()->create([
                'name' => $data['name'],
                'code' => $code,
                'address' => $data['address'] ?? null,
                'contact_email' => $data['contact_email'] ?? null,
                'status' => 'active',
            ]);

            User::query()->create([
                'name' => $data['admin_name'],
                'email' => $data['admin_email'],
                'password' => Hash::make($data['admin_password']),
                'role' => User::ROLE_ADMIN,
                'store_id' => $store->id,
            ]);
        });

        return back()->with('success', 'Store and store administrator created.');
    }

    public function updateStatus(Request $request, Store $store): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['active', 'suspended'])],
        ]);

        $store->update(['status' => $data['status']]);

        return back()->with('success', 'Store status updated.');
    }
}

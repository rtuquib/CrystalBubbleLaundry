<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(Request $request): Response
    {
        $q = trim((string) $request->get('q', ''));

        $customers = Customer::query()
            ->when($q !== '', function ($query) use ($q): void {
                $query->where(function ($w) use ($q): void {
                    $w->where('full_name', 'like', "%{$q}%")
                        ->orWhere('customer_code', 'like', "%{$q}%")
                        ->orWhere('email', 'like', "%{$q}%")
                        ->orWhere('contact_number', 'like', "%{$q}%");
                });
            })
            ->orderByDesc('id')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Customers/Index', [
            'customers' => $customers,
            'filters' => ['q' => $q],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Customers/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'contact_number' => ['nullable', 'string', 'max:64'],
            'address' => ['nullable', 'string', 'max:500'],
            'email' => ['nullable', 'email', 'max:255'],
            'gender' => ['nullable', 'string', 'max:32'],
            'preferred_scent' => ['nullable', 'string', 'max:128'],
            'preferred_detergent' => ['nullable', 'string', 'max:128'],
            'notes' => ['nullable', 'string'],
            'status' => ['required', 'string', 'in:active,inactive'],
        ]);

        $customer = Customer::query()->create($data);
        ActivityLogger::log('customer.created', "Customer {$customer->customer_code}", $customer);

        return redirect()->route('customers.show', $customer)->with('success', 'Customer created.');
    }

    public function show(Customer $customer): Response
    {
        $customer->load([
            'laundryOrders' => fn ($q) => $q->latest()->limit(50),
        ]);

        return Inertia::render('Customers/Show', [
            'customer' => $customer,
        ]);
    }

    public function edit(Customer $customer): Response
    {
        return Inertia::render('Customers/Edit', [
            'customer' => $customer,
        ]);
    }

    public function update(Request $request, Customer $customer): RedirectResponse
    {
        $data = $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'contact_number' => ['nullable', 'string', 'max:64'],
            'address' => ['nullable', 'string', 'max:500'],
            'email' => ['nullable', 'email', 'max:255'],
            'gender' => ['nullable', 'string', 'max:32'],
            'preferred_scent' => ['nullable', 'string', 'max:128'],
            'preferred_detergent' => ['nullable', 'string', 'max:128'],
            'notes' => ['nullable', 'string'],
            'status' => ['required', 'string', 'in:active,inactive'],
        ]);

        $customer->update($data);
        ActivityLogger::log('customer.updated', "Updated {$customer->customer_code}", $customer);

        return redirect()->route('customers.show', $customer)->with('success', 'Customer updated.');
    }

    public function destroy(Customer $customer): RedirectResponse
    {
        ActivityLogger::log('customer.deleted', "Deleted {$customer->customer_code}", $customer);
        $customer->delete();

        return redirect()->route('customers.index')->with('success', 'Customer removed.');
    }
}

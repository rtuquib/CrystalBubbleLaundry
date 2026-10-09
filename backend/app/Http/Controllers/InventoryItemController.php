<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use App\Services\ActivityLogger;
use App\Services\InventoryStockService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryItemController extends Controller
{
    public function index(): Response
    {
        $items = InventoryItem::query()->orderBy('item_name')->paginate(20);

        return Inertia::render('Inventory/Index', [
            'items' => $items,
            'low_stock' => InventoryItem::query()->whereColumn('quantity', '<=', 'reorder_level')->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Inventory/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'item_name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'in:detergent,softener,packaging,other'],
            'unit' => ['required', 'string', 'max:32'],
            'quantity' => ['required', 'numeric', 'min:0'],
            'reorder_level' => ['required', 'numeric', 'min:0'],
            'status' => ['required', 'string', 'in:active,inactive'],
        ]);

        $item = InventoryItem::query()->create($data);
        ActivityLogger::log('inventory.created', $item->item_name, $item);

        return redirect()->route('inventory.index')->with('success', 'Item added.');
    }

    public function edit(InventoryItem $inventory_item): Response
    {
        $inventory_item->load(['movements' => fn ($q) => $q->limit(30)]);

        return Inertia::render('Inventory/Edit', [
            'item' => $inventory_item,
        ]);
    }

    public function update(Request $request, InventoryItem $inventory_item): RedirectResponse
    {
        $data = $request->validate([
            'item_name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'in:detergent,softener,packaging,other'],
            'unit' => ['required', 'string', 'max:32'],
            'reorder_level' => ['required', 'numeric', 'min:0'],
            'status' => ['required', 'string', 'in:active,inactive'],
        ]);

        $inventory_item->update($data);
        ActivityLogger::log('inventory.updated', $inventory_item->item_name, $inventory_item);

        return redirect()->route('inventory.edit', $inventory_item)->with('success', 'Item saved.');
    }

    public function movement(Request $request, InventoryItem $inventory_item, InventoryStockService $stock): RedirectResponse
    {
        $data = $request->validate([
            'type' => ['required', 'string', 'in:stock_in,stock_out'],
            'quantity' => ['required', 'numeric', 'min:0.001'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        if ($data['type'] === 'stock_in') {
            $stock->stockIn($inventory_item, (float) $data['quantity'], $request->user(), $data['notes'] ?? null);
        } else {
            $stock->stockOut($inventory_item, (float) $data['quantity'], $request->user(), $data['notes'] ?? null);
        }

        return back()->with('success', 'Stock updated.');
    }
}

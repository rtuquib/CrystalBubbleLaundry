<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-semibold text-slate-700">My Orders</h1>
      <p class="text-slate-400 mt-1">View your active and recent laundry orders.</p>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white rounded-2xl shadow-sm p-5 mb-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
      <input
        type="text"
        placeholder="Search order ID..."
        class="w-full md:w-80 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
      />

      <div class="flex flex-wrap gap-3">
        <button class="px-4 py-2 rounded-xl bg-sky-500 text-white text-sm font-medium">All</button>
        <button class="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium">Active</button>
        <button class="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium">Completed</button>
        <button class="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium">Cancelled</button>
      </div>
    </div>

    <!-- Order Cards -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-slate-700">Order #CB-1001</h2>
          <span class="px-3 py-1 rounded-full bg-sky-100 text-sky-600 text-xs font-medium">Active</span>
        </div>

        <div class="space-y-2 text-sm text-slate-500">
          <p><span class="font-medium text-slate-700">Service:</span> Wash, Dry & Fold</p>
          <p><span class="font-medium text-slate-700">Weight:</span> 5 kg</p>
          <p><span class="font-medium text-slate-700">Date:</span> April 4, 2026</p>
          <p><span class="font-medium text-slate-700">Total:</span> ₱250</p>
        </div>

        <div class="mt-5">
          <button class="px-4 py-2 rounded-xl bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 transition">
            View Details
          </button>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-slate-700">Order #CB-0998</h2>
          <span class="px-3 py-1 rounded-full bg-green-100 text-green-600 text-xs font-medium">Completed</span>
        </div>

        <div class="space-y-2 text-sm text-slate-500">
          <p><span class="font-medium text-slate-700">Service:</span> Dry Clean</p>
          <p><span class="font-medium text-slate-700">Weight:</span> 3 kg</p>
          <p><span class="font-medium text-slate-700">Date:</span> April 2, 2026</p>
          <p><span class="font-medium text-slate-700">Total:</span> ₱350</p>
        </div>

        <div class="mt-5">
          <button class="px-4 py-2 rounded-xl bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 transition">
            View Details
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
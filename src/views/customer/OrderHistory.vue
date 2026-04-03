<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-semibold text-slate-700">Order History</h1>
      <p class="text-slate-400 mt-1">View all your previous completed laundry orders.</p>
    </div>

    <div class="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
        <input
          type="text"
          placeholder="Search order history..."
          class="w-full md:w-80 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
        />

        <button class="px-4 py-3 rounded-xl bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 transition">
          Filter
        </button>
      </div>

      <div class="space-y-4">
        <div class="border border-slate-100 rounded-2xl p-5">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-semibold text-slate-700">Order #CB-0998</h3>
            <span class="px-3 py-1 rounded-full bg-green-100 text-green-600 text-xs font-medium">Completed</span>
          </div>
          <p class="text-sm text-slate-500">Dry Clean • April 2, 2026 • ₱350</p>
        </div>

        <div class="border border-slate-100 rounded-2xl p-5">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-semibold text-slate-700">Order #CB-0995</h3>
            <span class="px-3 py-1 rounded-full bg-green-100 text-green-600 text-xs font-medium">Completed</span>
          </div>
          <p class="text-sm text-slate-500">Wash Only • March 30, 2026 • ₱180</p>
        </div>
      </div>
    </div>
  </div>
</template>
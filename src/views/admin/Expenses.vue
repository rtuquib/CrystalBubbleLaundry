<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-semibold text-slate-700">Sales</h1>
      <p class="text-slate-400 mt-1">View all laundry sales transactions.</p>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <p class="text-sm text-slate-400 mb-2">Sales Today</p>
        <h2 class="text-3xl font-bold text-sky-500">₱4,500</h2>
      </div>

      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <p class="text-sm text-slate-400 mb-2">Sales This Week</p>
        <h2 class="text-3xl font-bold text-green-500">₱18,500</h2>
      </div>

      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <p class="text-sm text-slate-400 mb-2">Transactions</p>
        <h2 class="text-3xl font-bold text-amber-500">34</h2>
      </div>
    </div>

    <!-- Sales Table -->
    <div class="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
      <div class="flex items-center justify-between mb-5">
        <h3 class="text-lg font-semibold text-slate-700">Sales Transactions</h3>
        <button class="px-4 py-2 rounded-xl bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 transition">
          Export
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-slate-400 border-b border-slate-100">
              <th class="pb-3">Transaction ID</th>
              <th class="pb-3">Order ID</th>
              <th class="pb-3">Customer</th>
              <th class="pb-3">Amount</th>
              <th class="pb-3">Payment Method</th>
              <th class="pb-3">Date</th>
            </tr>
          </thead>

          <tbody class="text-slate-600">
            <tr class="border-b border-slate-100">
              <td class="py-4">S-001</td>
              <td>CB-1001</td>
              <td>Juan Dela Cruz</td>
              <td>₱250</td>
              <td>Cash</td>
              <td>April 4, 2026</td>
            </tr>

            <tr class="border-b border-slate-100">
              <td class="py-4">S-002</td>
              <td>CB-1002</td>
              <td>Maria Lopez</td>
              <td>₱350</td>
              <td>GCash</td>
              <td>April 4, 2026</td>
            </tr>

            <tr>
              <td class="py-4">S-003</td>
              <td>CB-1003</td>
              <td>Pedro Cruz</td>
              <td>₱180</td>
              <td>Cash</td>
              <td>April 3, 2026</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
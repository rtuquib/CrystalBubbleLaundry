<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-semibold text-slate-700">Consolidated Report</h1>
      <p class="text-slate-400 mt-1">Review total sales, expenses, and daily net profit.</p>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label class="block text-sm text-slate-500 mb-2">From Date</label>
          <input
            type="date"
            class="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>

        <div>
          <label class="block text-sm text-slate-500 mb-2">To Date</label>
          <input
            type="date"
            class="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>

        <button class="px-4 py-3 rounded-xl bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 transition">
          Filter Report
        </button>

        <button
          onclick="window.print()"
          class="px-4 py-3 rounded-xl bg-slate-700 text-white text-sm font-medium hover:bg-slate-800 transition"
        >
          Print Report
        </button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <p class="text-sm text-slate-400 mb-2">Total Sales</p>
        <h2 class="text-3xl font-bold text-sky-500">₱18,500</h2>
      </div>

      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <p class="text-sm text-slate-400 mb-2">Total Expenses</p>
        <h2 class="text-3xl font-bold text-red-500">₱5,000</h2>
      </div>

      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <p class="text-sm text-slate-400 mb-2">Net Profit</p>
        <h2 class="text-3xl font-bold text-green-500">₱13,500</h2>
      </div>
    </div>

    <!-- Report Table -->
    <div class="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
      <h3 class="text-lg font-semibold text-slate-700 mb-5">Daily Net Profit Report</h3>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-slate-400 border-b border-slate-100">
              <th class="pb-3">Date</th>
              <th class="pb-3">Sales</th>
              <th class="pb-3">Expenses</th>
              <th class="pb-3">Net Profit</th>
            </tr>
          </thead>

          <tbody class="text-slate-600">
            <tr class="border-b border-slate-100">
              <td class="py-4">April 4, 2026</td>
              <td>₱4,500</td>
              <td>₱1,200</td>
              <td class="font-semibold text-green-600">₱3,300</td>
            </tr>

            <tr class="border-b border-slate-100">
              <td class="py-4">April 3, 2026</td>
              <td>₱3,800</td>
              <td>₱900</td>
              <td class="font-semibold text-green-600">₱2,900</td>
            </tr>

            <tr>
              <td class="py-4">April 2, 2026</td>
              <td>₱5,200</td>
              <td>₱1,500</td>
              <td class="font-semibold text-green-600">₱3,700</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
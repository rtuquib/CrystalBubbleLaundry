<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-semibold text-slate-700">Payments</h1>
      <p class="text-slate-400 mt-1">View your payment summary and transaction history.</p>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <p class="text-sm text-slate-400 mb-2">Total Due</p>
        <h2 class="text-3xl font-bold text-red-500">₱250</h2>
      </div>

      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <p class="text-sm text-slate-400 mb-2">Total Paid</p>
        <h2 class="text-3xl font-bold text-green-500">₱150</h2>
      </div>

      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <p class="text-sm text-slate-400 mb-2">Balance</p>
        <h2 class="text-3xl font-bold text-sky-500">₱100</h2>
      </div>
    </div>

    <!-- Payment History -->
    <div class="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
      <h3 class="text-lg font-semibold text-slate-700 mb-4">Payment History</h3>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-slate-400 border-b border-slate-100">
              <th class="pb-3">Order ID</th>
              <th class="pb-3">Amount</th>
              <th class="pb-3">Method</th>
              <th class="pb-3">Date</th>
              <th class="pb-3">Status</th>
            </tr>
          </thead>

          <tbody class="text-slate-600">
            <tr class="border-b border-slate-100">
              <td class="py-4">CB-1001</td>
              <td>₱150</td>
              <td>Cash</td>
              <td>April 4, 2026</td>
              <td>
                <span class="px-3 py-1 rounded-full bg-amber-100 text-amber-600 text-xs font-medium">
                  Partial
                </span>
              </td>
            </tr>

            <tr>
              <td class="py-4">CB-0998</td>
              <td>₱350</td>
              <td>GCash</td>
              <td>April 2, 2026</td>
              <td>
                <span class="px-3 py-1 rounded-full bg-green-100 text-green-600 text-xs font-medium">
                  Paid
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

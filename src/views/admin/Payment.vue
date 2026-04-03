<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-semibold text-slate-700">Payments</h1>
      <p class="text-slate-400 mt-1">Review and monitor all payment transactions.</p>
    </div>

    <div class="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-slate-400 border-b border-slate-100">
              <th class="pb-3">Payment ID</th>
              <th class="pb-3">Order ID</th>
              <th class="pb-3">Customer</th>
              <th class="pb-3">Amount</th>
              <th class="pb-3">Status</th>
            </tr>
          </thead>

          <tbody class="text-slate-600">
            <tr class="border-b border-slate-100">
              <td class="py-4">P-001</td>
              <td>CB-1001</td>
              <td>Juan Dela Cruz</td>
              <td>₱250</td>
              <td>
                <span class="px-3 py-1 rounded-full bg-amber-100 text-amber-600 text-xs font-medium">Partial</span>
              </td>
            </tr>

            <tr>
              <td class="py-4">P-002</td>
              <td>CB-1002</td>
              <td>Maria Lopez</td>
              <td>₱350</td>
              <td>
                <span class="px-3 py-1 rounded-full bg-green-100 text-green-600 text-xs font-medium">Paid</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
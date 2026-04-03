<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-semibold text-slate-700">Assigned Orders</h1>
      <p class="text-slate-400 mt-1">View all laundry orders assigned to you.</p>
    </div>

    <div class="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-slate-400 border-b border-slate-100">
              <th class="pb-3">Order ID</th>
              <th class="pb-3">Customer</th>
              <th class="pb-3">Service</th>
              <th class="pb-3">Status</th>
              <th class="pb-3">Action</th>
            </tr>
          </thead>

          <tbody class="text-slate-600">
            <tr class="border-b border-slate-100">
              <td class="py-4">CB-1001</td>
              <td>Juan Dela Cruz</td>
              <td>Wash, Dry & Fold</td>
              <td>
                <span class="px-3 py-1 rounded-full bg-sky-100 text-sky-600 text-xs font-medium">Washing</span>
              </td>
              <td>
                <button class="px-3 py-2 rounded-lg bg-sky-500 text-white text-xs hover:bg-sky-600 transition">
                  Update
                </button>
              </td>
            </tr>

            <tr>
              <td class="py-4">CB-1002</td>
              <td>Maria Lopez</td>
              <td>Dry Clean</td>
              <td>
                <span class="px-3 py-1 rounded-full bg-amber-100 text-amber-600 text-xs font-medium">Pending</span>
              </td>
              <td>
                <button class="px-3 py-2 rounded-lg bg-sky-500 text-white text-xs hover:bg-sky-600 transition">
                  Update
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
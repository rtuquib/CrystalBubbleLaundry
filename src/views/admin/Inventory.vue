<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-semibold text-slate-700">Inventory</h1>
      <p class="text-slate-400 mt-1">Track purchased, used, and remaining laundry materials.</p>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <p class="text-sm text-slate-400 mb-2">Total Materials</p>
        <h2 class="text-3xl font-bold text-sky-500">15</h2>
      </div>

      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <p class="text-sm text-slate-400 mb-2">Low Stock</p>
        <h2 class="text-3xl font-bold text-red-500">3</h2>
      </div>

      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <p class="text-sm text-slate-400 mb-2">Purchased</p>
        <h2 class="text-3xl font-bold text-green-500">250</h2>
      </div>

      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <p class="text-sm text-slate-400 mb-2">Used</p>
        <h2 class="text-3xl font-bold text-amber-500">180</h2>
      </div>
    </div>

    <!-- Inventory Table -->
    <div class="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
      <div class="flex items-center justify-between mb-5">
        <h3 class="text-lg font-semibold text-slate-700">Material Inventory</h3>
        <button class="px-4 py-2 rounded-xl bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 transition">
          Add Material
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-slate-400 border-b border-slate-100">
              <th class="pb-3">Material</th>
              <th class="pb-3">Purchased</th>
              <th class="pb-3">Used</th>
              <th class="pb-3">Remaining</th>
              <th class="pb-3">Status</th>
            </tr>
          </thead>

          <tbody class="text-slate-600">
            <tr class="border-b border-slate-100">
              <td class="py-4">Detergent</td>
              <td>50</td>
              <td>35</td>
              <td>15</td>
              <td>
                <span class="px-3 py-1 rounded-full bg-green-100 text-green-600 text-xs font-medium">In Stock</span>
              </td>
            </tr>

            <tr class="border-b border-slate-100">
              <td class="py-4">Fabric Conditioner</td>
              <td>40</td>
              <td>30</td>
              <td>10</td>
              <td>
                <span class="px-3 py-1 rounded-full bg-amber-100 text-amber-600 text-xs font-medium">Low Stock</span>
              </td>
            </tr>

            <tr class="border-b border-slate-100">
              <td class="py-4">Bleach</td>
              <td>30</td>
              <td>18</td>
              <td>12</td>
              <td>
                <span class="px-3 py-1 rounded-full bg-green-100 text-green-600 text-xs font-medium">In Stock</span>
              </td>
            </tr>

            <tr>
              <td class="py-4">Plastic Packaging</td>
              <td>100</td>
              <td>97</td>
              <td>3</td>
              <td>
                <span class="px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-medium">Critical</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
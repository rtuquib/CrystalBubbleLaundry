<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-semibold text-slate-700">Release Orders</h1>
      <p class="text-slate-400 mt-1">Manage completed laundry ready for customer pickup.</p>
    </div>

    <div class="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
      <div class="space-y-4">
        <div class="border border-slate-100 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <h3 class="font-semibold text-slate-700">Order #CB-0995</h3>
            <p class="text-sm text-slate-500">Customer: Lea Santos</p>
          </div>

          <button class="px-4 py-2 rounded-xl bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition">
            Release
          </button>
        </div>

        <div class="border border-slate-100 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <h3 class="font-semibold text-slate-700">Order #CB-0998</h3>
            <p class="text-sm text-slate-500">Customer: Pedro Cruz</p>
          </div>

          <button class="px-4 py-2 rounded-xl bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition">
            Release
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
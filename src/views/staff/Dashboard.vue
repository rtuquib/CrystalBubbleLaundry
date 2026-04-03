<template>
  <div>
    <div class="bg-sky-500 text-white rounded-3xl p-6 shadow-md mb-6">
      <h1 class="text-2xl font-semibold mb-2">Staff Dashboard</h1>
      <p class="text-sm text-sky-100">
        Manage assigned laundry tasks and daily operations.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div class="text-sm text-slate-400 mb-2">Assigned Orders</div>
        <div class="text-3xl font-bold text-sky-500">8</div>
      </div>

      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div class="text-sm text-slate-400 mb-2">Washing Queue</div>
        <div class="text-3xl font-bold text-amber-500">5</div>
      </div>

      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div class="text-sm text-slate-400 mb-2">Ready for Release</div>
        <div class="text-3xl font-bold text-green-500">3</div>
      </div>

      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div class="text-sm text-slate-400 mb-2">Completed Today</div>
        <div class="text-3xl font-bold text-sky-600">12</div>
      </div>
    </div>

    <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <h2 class="text-lg font-semibold text-slate-700 mb-4">Today’s Task Overview</h2>
      <p class="text-slate-500 text-sm">
        Monitor assigned customer orders, update their laundry status, and prepare completed orders for release.
      </p>
    </div>
  </div>
</template>
<template>
  <div>
    <div class="bg-sky-500 text-white rounded-3xl p-6 shadow-md mb-6">
      <h1 class="text-2xl font-semibold mb-2">Admin Dashboard</h1>
      <p class="text-sm text-sky-100">
        Monitor the overall laundry shop performance and system management.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div class="text-sm text-slate-400 mb-2">Total Customers</div>
        <div class="text-3xl font-bold text-sky-500">120</div>
      </div>

      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div class="text-sm text-slate-400 mb-2">Total Staff</div>
        <div class="text-3xl font-bold text-green-500">8</div>
      </div>

      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div class="text-sm text-slate-400 mb-2">Orders Today</div>
        <div class="text-3xl font-bold text-amber-500">34</div>
      </div>

      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div class="text-sm text-slate-400 mb-2">Income Today</div>
        <div class="text-3xl font-bold text-sky-600">₱4,500</div>
      </div>
    </div>
  </div>
</template>
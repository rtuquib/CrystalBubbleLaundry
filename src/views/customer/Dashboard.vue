<template>
  <div>
    <div class="bg-sky-500 text-white rounded-3xl p-6 shadow-md mb-6">
      <h1 class="text-2xl font-semibold mb-2">Customer Dashboard</h1>
      <p class="text-sm text-sky-100">
        Welcome to CrystalBubble Laundry Shop. Track your orders and manage your account here.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div class="text-sm text-slate-400 mb-2">Active Orders</div>
        <div class="text-3xl font-bold text-sky-500">3</div>
      </div>

      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div class="text-sm text-slate-400 mb-2">Ready for Pickup</div>
        <div class="text-3xl font-bold text-green-500">1</div>
      </div>

      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div class="text-sm text-slate-400 mb-2">Pending Payment</div>
        <div class="text-3xl font-bold text-amber-500">₱250</div>
      </div>

      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div class="text-sm text-slate-400 mb-2">Completed Orders</div>
        <div class="text-3xl font-bold text-sky-600">12</div>
      </div>
    </div>
  </div>
</template>
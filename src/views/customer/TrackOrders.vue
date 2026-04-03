<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-semibold text-slate-700">Track Order</h1>
      <p class="text-slate-400 mt-1">Track the real-time progress of your laundry.</p>
    </div>

    <!-- Current Order -->
    <div class="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-slate-700">Order #CB-1001</h2>
        <span class="px-3 py-1 rounded-full bg-sky-100 text-sky-600 text-sm font-medium">Washing</span>
      </div>

      <p class="text-slate-500 mb-6">Estimated completion: April 5, 2026 - 2:00 PM</p>

      <!-- Progress Steps -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div class="bg-sky-500 text-white rounded-xl p-4 text-center">
          <p class="font-medium">Order Placed</p>
        </div>
        <div class="bg-sky-500 text-white rounded-xl p-4 text-center">
          <p class="font-medium">Confirmed</p>
        </div>
        <div class="bg-sky-500 text-white rounded-xl p-4 text-center">
          <p class="font-medium">Washing</p>
        </div>
        <div class="bg-slate-100 text-slate-500 rounded-xl p-4 text-center">
          <p class="font-medium">Ready</p>
        </div>
        <div class="bg-slate-100 text-slate-500 rounded-xl p-4 text-center">
          <p class="font-medium">Completed</p>
        </div>
      </div>
    </div>

    <!-- Pickup Info -->
    <div class="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
      <h3 class="text-lg font-semibold text-slate-700 mb-4">Pickup Information</h3>
      <div class="space-y-2 text-sm text-slate-500">
        <p><span class="font-medium text-slate-700">Pickup Date:</span> April 5, 2026</p>
        <p><span class="font-medium text-slate-700">Pickup Time:</span> 2:00 PM</p>
        <p><span class="font-medium text-slate-700">Branch:</span> CrystalBubble Main Branch</p>
      </div>
    </div>
  </div>
</template>
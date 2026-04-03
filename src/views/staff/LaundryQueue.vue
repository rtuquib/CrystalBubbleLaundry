<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-semibold text-slate-700">Laundry Queue</h1>
      <p class="text-slate-400 mt-1">Track ongoing laundry processing stages.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 class="text-lg font-semibold text-slate-700 mb-4">Washing</h2>
        <div class="space-y-3">
          <div class="rounded-xl bg-slate-50 p-4">CB-1001 - Juan Dela Cruz</div>
          <div class="rounded-xl bg-slate-50 p-4">CB-1003 - Ana Reyes</div>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 class="text-lg font-semibold text-slate-700 mb-4">Drying</h2>
        <div class="space-y-3">
          <div class="rounded-xl bg-slate-50 p-4">CB-0998 - Pedro Cruz</div>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 class="text-lg font-semibold text-slate-700 mb-4">Ready</h2>
        <div class="space-y-3">
          <div class="rounded-xl bg-slate-50 p-4">CB-0995 - Lea Santos</div>
        </div>
      </div>
    </div>
  </div>
</template>
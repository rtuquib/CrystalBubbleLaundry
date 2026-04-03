<template>
  <aside class="w-64 h-screen bg-sky-700 text-white flex flex-col shadow-xl">
    <div class="h-20 border-b border-white/20 flex items-center justify-center px-4">
      <div class="text-center">
        <div class="text-xl font-semibold">CrystalBubble</div>
        <div class="text-xs text-sky-100">Laundry Shop</div>
      </div>
    </div>

    <nav class="flex-1 px-4 py-6 space-y-2">
      <router-link
        to="/customer/dashboard"
        active-class="bg-white/20"
        class="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium hover:bg-white/10 transition "
      >
        <div>🏠</div>
        <div>Dashboard</div>
      </router-link>

      <router-link
        to="/customer/my-orders"
        active-class="bg-white/20"
        class="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium hover:bg-white/10 transition"
      >
        <div>🧺</div>
        <div>My Orders</div>
      </router-link>

      <router-link
        to="/customer/track-orders"
        active-class="bg-white/20"
        class="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium hover:bg-white/10 transition"
      >
        <div>📍</div>
        <div>Track Orders</div>
      </router-link>

      <router-link
        to="/customer/payments"
        active-class="bg-white/20"
        class="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium hover:bg-white/10 transition"
      >
        <div>💳</div>
        <div>Payments</div>
      </router-link>

      <router-link
        to="/customer/order-history"
        active-class="bg-white/20"
        class="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium hover:bg-white/10 transition"
      >
        <div>🕘</div>
        <div>Order History</div>
      </router-link>

      <router-link
        to="/customer/profile"
        active-class="bg-white/20"
        class="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium hover:bg-white/10 transition"
      >
        <div>👤</div>
        <div>Profile</div>
      </router-link>
    </nav>

    <div class="p-4 border-t border-white/20">
      <button class="w-full rounded-xl bg-white text-sky-700 py-3 text-sm font-semibold hover:bg-sky-100 transition">
        Logout
      </button>
    </div>
  </aside>
</template>
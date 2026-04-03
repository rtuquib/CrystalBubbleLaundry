<template>
  <aside class="w-64 h-screen bg-sky-800 text-white flex flex-col shadow-xl overflow-hidden">
    <!-- Brand -->
    <div class="h-20 border-b border-white/20 flex items-center justify-center px-4 shrink-0">
      <div class="text-center">
        <div class="text-2xl font-semibold leading-tight">CrystalBubble</div>
        <div class="text-sm text-sky-100">Admin Panel</div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-4 py-4 flex flex-col justify-between overflow-hidden">
      <div class="space-y-4">
        <!-- MAIN -->
        <div>
          <p class="text-[11px] uppercase tracking-wider text-sky-200 mb-2 px-2">Main</p>

          <router-link
            to="/admin/dashboard"
            active-class="bg-white/20"
            class="w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-white/10 transition"
          >
            <div class="text-base">🏠</div>
            <div>Dashboard</div>
          </router-link>
        </div>

        <!-- MANAGEMENT -->
        <div>
          <p class="text-[11px] uppercase tracking-wider text-sky-200 mb-2 px-2">Management</p>

          <div class="space-y-1">
            <router-link
              to="/admin/manage-customers"
              active-class="bg-white/20"
              class="w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-white/10 transition"
            >
              <div class="text-base">👥</div>
              <div>Manage Customers</div>
            </router-link>

            <router-link
              to="/admin/manage-staff"
              active-class="bg-white/20"
              class="w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-white/10 transition"
            >
              <div class="text-base">🧑‍💼</div>
              <div>Manage Staff</div>
            </router-link>
          </div>
        </div>

        <!-- SALES -->
        <div>
          <p class="text-[11px] uppercase tracking-wider text-sky-200 mb-2 px-2">Sales</p>

          <div class="space-y-1">
            <router-link
              to="/admin/sales"
              active-class="bg-white/20"
              class="w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-white/10 transition"
            >
              <div class="text-base">💰</div>
              <div>Sales</div>
            </router-link>

            <router-link
              to="/admin/expenses"
              active-class="bg-white/20"
              class="w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-white/10 transition"
            >
              <div class="text-base">🧾</div>
              <div>Expenses</div>
            </router-link>

            <router-link
              to="/admin/consolidated-report"
              active-class="bg-white/20"
              class="w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-white/10 transition"
            >
              <div class="text-base">📊</div>
              <div>Consolidated Report</div>
            </router-link>
          </div>
        </div>

        <!-- INVENTORY -->
        <div>
          <p class="text-[11px] uppercase tracking-wider text-sky-200 mb-2 px-2">Inventory</p>

          <router-link
            to="/admin/inventory"
            active-class="bg-white/20"
            class="w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-white/10 transition"
          >
            <div class="text-base">📦</div>
            <div>Inventory</div>
          </router-link>
        </div>

        <!-- ACCOUNT -->
        <div>
          <p class="text-[11px] uppercase tracking-wider text-sky-200 mb-2 px-2">Account</p>

          <router-link
            to="/admin/profile"
            active-class="bg-white/20"
            class="w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-white/10 transition"
          >
            <div class="text-base">👤</div>
            <div>Profile</div>
          </router-link>
        </div>
      </div>

      <!-- Logout -->
      <div class="pt-4 border-t border-white/20 mt-4 shrink-0">
        <button
          @click="handleLogout"
          class="w-full rounded-xl bg-white text-sky-800 py-2.5 text-sm font-semibold hover:bg-sky-100 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  </aside>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const handleLogout = () => {
  localStorage.removeItem('loggedInUser')
  router.push('/')
}
</script>
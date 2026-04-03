<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-semibold text-slate-700">Profile</h1>
      <p class="text-slate-400 mt-1">Manage your staff information.</p>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div class="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
        <div class="flex flex-col items-center text-center">
          <div class="w-24 h-24 rounded-full bg-sky-500 text-white flex items-center justify-center text-3xl font-bold mb-4">
            M
          </div>
          <h2 class="text-xl font-semibold text-slate-700">Maria Santos</h2>
          <p class="text-sm text-slate-400">Staff</p>
        </div>
      </div>

      <div class="xl:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
        <h3 class="text-lg font-semibold text-slate-700 mb-5">Staff Information</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm text-slate-500 mb-2">Full Name</label>
            <input type="text" value="Maria Santos" class="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none" />
          </div>

          <div>
            <label class="block text-sm text-slate-500 mb-2">Email</label>
            <input type="email" value="maria@example.com" class="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none" />
          </div>

          <div>
            <label class="block text-sm text-slate-500 mb-2">Contact Number</label>
            <input type="text" value="09123456789" class="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none" />
          </div>

          <div>
            <label class="block text-sm text-slate-500 mb-2">Role</label>
            <input type="text" value="Staff" class="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none" />
          </div>
        </div>

        <div class="mt-6">
          <button class="px-5 py-3 rounded-xl bg-sky-500 text-white font-medium hover:bg-sky-600 transition">
            Update Profile
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
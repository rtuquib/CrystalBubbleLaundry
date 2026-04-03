<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-semibold text-slate-700">Manage Staff</h1>
      <p class="text-slate-400 mt-1">View and manage staff accounts.</p>
    </div>

    <div class="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-slate-400 border-b border-slate-100">
              <th class="pb-3">Staff ID</th>
              <th class="pb-3">Name</th>
              <th class="pb-3">Email</th>
              <th class="pb-3">Role</th>
              <th class="pb-3">Action</th>
            </tr>
          </thead>

          <tbody class="text-slate-600">
            <tr class="border-b border-slate-100">
              <td class="py-4">S-001</td>
              <td>Maria Santos</td>
              <td>maria@example.com</td>
              <td>Staff</td>
              <td>
                <button class="px-3 py-2 rounded-lg bg-sky-500 text-white text-xs hover:bg-sky-600 transition">
                  Edit
                </button>
              </td>
            </tr>

            <tr>
              <td class="py-4">S-002</td>
              <td>Pedro Cruz</td>
              <td>pedro@example.com</td>
              <td>Staff</td>
              <td>
                <button class="px-3 py-2 rounded-lg bg-sky-500 text-white text-xs hover:bg-sky-600 transition">
                  Edit
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
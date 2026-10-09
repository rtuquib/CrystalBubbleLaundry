import { createRouter, createWebHistory } from 'vue-router'
import {
  clearSession,
  getSessionRole,
  homePathForRole,
  roleAllowedForPath,
} from './guards.js'
import Login from '../views/auth/Login.vue'
import RoleLogin from '../views/auth/RoleLogin.vue'
import Register from '../views/auth/Register.vue'

import CustomerLayout from '../layouts/CustomerLayout.vue'
import StaffLayout from '../layouts/StaffLayout.vue'
import AdminLayout from '../layouts/AdminLayout.vue'
import SuperAdminLayout from '../layouts/SuperAdminLayout.vue'

// Customer Views
import CustomerDashboard from '../views/customer/Dashboard.vue'
import MyOrders from '../views/customer/MyOrders.vue'
import TrackOrders from '../views/customer/TrackOrders.vue'
import Payments from '../views/customer/Payments.vue'
import OrderHistory from '../views/customer/OrderHistory.vue'
import Profile from '../views/customer/Profile.vue'
import NewOrder from '../views/customer/NewOrder.vue'
import CustomerMessaging from '../views/customer/Messaging.vue'

// Staff Views
import StaffDashboard from '../views/staff/Dashboard.vue'
import AssignedOrders from '../views/staff/AssignedOrders.vue'
import LaundryQueue from '../views/staff/LaundryQueue.vue'
import ReleaseOrders from '../views/staff/ReleaseOrders.vue'
import StaffProfile from '../views/staff/Profile.vue'
import StaffMessaging from '../views/staff/Messaging.vue'

// Admin Views
import AdminDashboard from '../views/admin/Dashboard.vue'
import ManageCustomers from '../views/admin/ManageCustomers.vue'
import ManageStaff from '../views/admin/ManageStaff.vue'
import Orders from '../views/admin/Orders.vue'
import AdminPayments from '../views/admin/Payment.vue'
import Reports from '../views/admin/Reports.vue'
import Sales from '../views/admin/Sales.vue'
import Expenses from '../views/admin/Expenses.vue'
import ConsolidatedReport from '../views/admin/ConsolidatedReport.vue'
import AdminOfficialReceipt from '../views/admin/OfficialReceipt.vue'
import Inventory from '../views/admin/Inventory.vue'
import AdminProfile from '../views/admin/Profile.vue'
import OrderTracking from '../views/admin/OrderTracking.vue'
import PickupScheduling from '../views/admin/PickupScheduling.vue'
import AdminMessaging from '../views/admin/Messaging.vue'
import StaffOfficialReceipt from '../views/staff/OfficialReceipt.vue'
import SuperAdminDashboard from '../views/super-admin/Dashboard.vue'
import SuperAdminStores from '../views/super-admin/Stores.vue'
import SuperAdminStoreShow from '../views/super-admin/StoreShow.vue'

const routes = [
  {
    path: '/',
    name: 'login',
    component: Login,
    meta: { public: true },
  },
  {
    path: '/login/super-admin',
    name: 'login-super-admin',
    component: RoleLogin,
    meta: { public: true, loginRole: 'super_admin' },
  },
  {
    path: '/login/admin',
    name: 'login-admin',
    component: RoleLogin,
    meta: { public: true, loginRole: 'admin' },
  },
  {
    path: '/login/staff',
    name: 'login-staff',
    component: RoleLogin,
    meta: { public: true, loginRole: 'staff' },
  },
  {
    path: '/login/customer',
    name: 'login-customer',
    component: RoleLogin,
    meta: { public: true, loginRole: 'customer' },
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
    meta: { public: true },
  },

  {
    path: '/customer',
    component: CustomerLayout,
    redirect: { name: 'customer-dashboard' },
    meta: { roles: ['customer'] },
    children: [
      { path: 'dashboard', name: 'customer-dashboard', component: CustomerDashboard },
      { path: 'new-order', name: 'customer-new-order', component: NewOrder },
      { path: 'my-orders', name: 'customer-my-orders', component: MyOrders },
      { path: 'messaging', name: 'customer-messaging', component: CustomerMessaging },
      { path: 'track-orders', name: 'customer-track-orders', component: TrackOrders },
      { path: 'payments', name: 'customer-payments', component: Payments },
      { path: 'order-history', name: 'customer-order-history', component: OrderHistory },
      { path: 'profile', name: 'customer-profile', component: Profile },
    ],
  },

  {
    path: '/staff',
    component: StaffLayout,
    redirect: { name: 'staff-dashboard' },
    meta: { roles: ['staff'] },
    children: [
      { path: 'dashboard', name: 'staff-dashboard', component: StaffDashboard },
      { path: 'customers', name: 'staff-customers', component: ManageCustomers },
      { path: 'orders', name: 'staff-orders', component: Orders },
      { path: 'pickup-scheduling', name: 'staff-pickup-scheduling', component: PickupScheduling },
      { path: 'pickup-schedules', redirect: { name: 'staff-pickup-scheduling' } },
      { path: 'inventory', name: 'staff-inventory', component: Inventory },
      { path: 'assigned-orders', name: 'staff-assigned-orders', component: AssignedOrders },
      { path: 'laundry-queue', name: 'staff-laundry-queue', component: LaundryQueue },
      { path: 'release-orders', name: 'staff-release-orders', component: ReleaseOrders },
      { path: 'messaging', name: 'staff-messaging', component: StaffMessaging },
      { path: 'official-receipt', name: 'staff-official-receipt', component: StaffOfficialReceipt },
      { path: 'profile', name: 'staff-profile', component: StaffProfile },
    ],
  },

  {
    path: '/admin',
    component: AdminLayout,
    redirect: { name: 'admin-dashboard' },
    meta: { roles: ['admin'] },
    children: [
      { path: 'dashboard', name: 'admin-dashboard', component: AdminDashboard },
      { path: 'manage-customers', name: 'admin-manage-customers', component: ManageCustomers },
      { path: 'manage-staff', name: 'admin-manage-staff', component: ManageStaff },
      { path: 'orders', name: 'admin-orders', component: Orders },
      { path: 'order-tracking', name: 'admin-order-tracking', component: OrderTracking },
      { path: 'pickup-scheduling', name: 'admin-pickup-scheduling', component: PickupScheduling },
      { path: 'messaging', name: 'admin-messaging', component: AdminMessaging },
      { path: 'payment', name: 'admin-payment', component: AdminPayments },
      { path: 'reports', name: 'admin-reports', component: Reports },
      { path: 'sales', name: 'admin-sales', component: Sales },
      { path: 'expenses', name: 'admin-expenses', component: Expenses },
      { path: 'official-receipt', name: 'admin-official-receipt', component: AdminOfficialReceipt },
      { path: 'consolidated-report', name: 'admin-consolidated-report', component: ConsolidatedReport },
      { path: 'inventory', name: 'admin-inventory', component: Inventory },
      { path: 'profile', name: 'admin-profile', component: AdminProfile },
    ],
  },

  {
    path: '/super-admin',
    component: SuperAdminLayout,
    redirect: { name: 'super-admin-dashboard' },
    meta: { roles: ['super_admin'] },
    children: [
      { path: 'dashboard', name: 'super-admin-dashboard', component: SuperAdminDashboard },
      { path: 'stores', name: 'super-admin-stores', component: SuperAdminStores },
      { path: 'stores/:storeId', name: 'super-admin-store-show', component: SuperAdminStoreShow },
    ],
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    redirect: { name: 'login' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const role = getSessionRole()
  const isPublic = Boolean(to.meta.public || to.name === 'login' || to.name === 'register')

  if (isPublic) {
    // Store-scoped login links from super admin: clear session so role login is reachable.
    if (to.path.startsWith('/login/') && to.query.storeId) {
      if (role) clearSession()
      return true
    }
    if (!role) return true
    const home = homePathForRole(role)
    if (home === to.path || home === '/') return true
    return home
  }

  if (!role) {
    clearSession()
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  const allowedRoles = to.matched
    .map((record) => record.meta.roles)
    .find((roles) => Array.isArray(roles) && roles.length)

  if (allowedRoles && !allowedRoles.includes(role)) {
    const home = homePathForRole(role)
    if (home === to.path) return true
    return home
  }

  if (!roleAllowedForPath(role, to.path)) {
    const home = homePathForRole(role)
    if (home === to.path) return true
    return home
  }

  return true
})

export default router

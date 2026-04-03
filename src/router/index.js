import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/auth/Login.vue'

import CustomerLayout from '../layouts/CustomerLayout.vue'
import StaffLayout from '../layouts/StaffLayout.vue'
import AdminLayout from '../layouts/AdminLayout.vue'

// Customer Views
import CustomerDashboard from '../views/customer/Dashboard.vue'
import MyOrders from '../views/customer/MyOrders.vue'
import TrackOrders from '../views/customer/TrackOrders.vue'
import Payments from '../views/customer/Payments.vue'
import OrderHistory from '../views/customer/OrderHistory.vue'
import Profile from '../views/customer/Profile.vue'

// Staff Views
import StaffDashboard from '../views/staff/Dashboard.vue'
import AssignedOrders from '../views/staff/AssignedOrders.vue'
import LaundryQueue from '../views/staff/LaundryQueue.vue'
import ReleaseOrders from '../views/staff/ReleaseOrders.vue'
import StaffProfile from '../views/staff/Profile.vue'

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
import Inventory from '../views/admin/Inventory.vue'
import AdminProfile from '../views/admin/Profile.vue'

const routes = [
  {
    path: '/',
    name: 'login',
    component: Login,
  },

  {
    path: '/customer',
    component: CustomerLayout,
    children: [
      {
        path: 'dashboard',
        name: 'customer-dashboard',
        component: CustomerDashboard,
      },
      {
        path: 'my-orders',
        name: 'customer-my-orders',
        component: MyOrders,
      },
      {
        path: 'track-orders',
        name: 'customer-track-orders',
        component: TrackOrders,
      },
      {
        path: 'payments',
        name: 'customer-payments',
        component: Payments,
      },
      {
        path: 'order-history',
        name: 'customer-order-history',
        component: OrderHistory,
      },
      {
        path: 'profile',
        name: 'customer-profile',
        component: Profile,
      },
    ],
  },

  {
    path: '/staff',
    component: StaffLayout,
    children: [
      {
        path: 'dashboard',
        name: 'staff-dashboard',
        component: StaffDashboard,
      },
      {
        path: 'assigned-orders',
        name: 'staff-assigned-orders',
        component: AssignedOrders,
      },
      {
        path: 'laundry-queue',
        name: 'staff-laundry-queue',
        component: LaundryQueue,
      },
      {
        path: 'release-orders',
        name: 'staff-release-orders',
        component: ReleaseOrders,
      },
      {
        path: 'profile',
        name: 'staff-profile',
        component: StaffProfile,
      },
    ],
  },

 {
  path: '/admin',
  component: AdminLayout,
  children: [
    {
      path: 'dashboard',
      name: 'admin-dashboard',
      component: AdminDashboard,
    },
    {
      path: 'manage-customers',
      name: 'admin-manage-customers',
      component: ManageCustomers,
    },
    {
      path: 'manage-staff',
      name: 'admin-manage-staff',
      component: ManageStaff,
    },
    {
      path: 'orders',
      name: 'admin-orders',
      component: Orders,
    },
    {
      path: 'payment',
      name: 'admin-payment',
      component: AdminPayments,
    },
    {
      path: 'reports',
      name: 'admin-reports',
      component: Reports,
    },
    {
    path: 'sales',
    name: 'admin-sales',
    component: Sales,
    },
    {
    path: 'expenses',
    name: 'admin-expenses',
    component: Expenses,
    },
    {
    path: 'consolidated-report',
    name: 'admin-consolidated-report',
    component: ConsolidatedReport,
    },
    {
    path: 'inventory',
    name: 'admin-inventory',
    component: Inventory,
    },
    {
      path: 'profile',
      name: 'admin-profile',
      component: AdminProfile,
    },
  ],
},
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
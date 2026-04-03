import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/auth/Login.vue'

import CustomerLayout from '../layouts/CustomerLayout.vue'
// import StaffLayout from '../layouts/StaffLayout.vue'
// import AdminLayout from '../layouts/AdminLayout.vue'

import CustomerDashboard from '../views/customer/Dashboard.vue'
import MyOrders from '../views/customer/MyOrders.vue'
import TrackOrders from '../views/customer/TrackOrders.vue'
import Payments from '../views/customer/Payments.vue'
import OrderHistory from '../views/customer/OrderHistory.vue'
import Profile from '../views/customer/Profile.vue'

// import StaffDashboard from '../views/staff/StaffDashboard.vue'
// import AdminDashboard from '../views/admin/AdminDashboard.vue'

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

  // {
  //   path: '/staff',
  //   component: StaffLayout,
  //   children: [
  //     {
  //       path: 'dashboard',
  //       name: 'staff-dashboard',
  //       component: StaffDashboard,
  //     },
  //   ],
  // },

  // {
  //   path: '/admin',
  //   component: AdminLayout,
  //   children: [
  //     {
  //       path: 'dashboard',
  //       name: 'admin-dashboard',
  //       component: AdminDashboard,
  //     },
  //   ],
  // },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
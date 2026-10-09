import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import { initLaundryDb } from './services/laundryDb.js'

initLaundryDb()
createApp(App).use(router).mount('#app')
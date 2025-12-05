import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// Import global styles
import './assets/main.css'

// Create app instance
const app = createApp(App)

// Use Pinia for state management
const pinia = createPinia()
app.use(pinia)

// Use Vue Router
app.use(router)

// Mount the app
app.mount('#app')

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.log('ServiceWorker registration failed:', err)
    })
  })
}


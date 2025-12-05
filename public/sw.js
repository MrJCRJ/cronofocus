// CronoFocus Service Worker
const CACHE_NAME = 'cronofocus-v1'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/sounds/notification.mp3',
  '/sounds/timer-end.mp3'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.log('Cache addAll error:', err)
      })
    })
  )
  self.skipWaiting()
})

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) return

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(event.request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response
        }

        // Clone response for caching
        const responseToCache = response.clone()

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })

        return response
      }).catch(() => {
        // Return offline fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html')
        }
        return new Response('Offline', { status: 503 })
      })
    })
  )
})

// Push notification event
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || 'Nova notificação do CronoFocus',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      { action: 'view', title: 'Ver' },
      { action: 'dismiss', title: 'Dispensar' }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('CronoFocus', options)
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-tasks') {
    event.waitUntil(syncTasks())
  }
})

async function syncTasks() {
  // Placeholder for future sync implementation
  console.log('Syncing tasks...')
}

// Timer Web Worker functionality (for precision timing)
let timerInterval = null
let timerSeconds = 0
let timerRunning = false

self.addEventListener('message', (event) => {
  const { action, data } = event.data

  switch (action) {
    case 'START_TIMER':
      timerSeconds = data.seconds || 0
      timerRunning = true
      startTimer(event.source)
      break

    case 'PAUSE_TIMER':
      timerRunning = false
      if (timerInterval) {
        clearInterval(timerInterval)
        timerInterval = null
      }
      break

    case 'RESET_TIMER':
      timerRunning = false
      timerSeconds = 0
      if (timerInterval) {
        clearInterval(timerInterval)
        timerInterval = null
      }
      event.source.postMessage({ type: 'TIMER_UPDATE', seconds: 0 })
      break

    case 'GET_TIME':
      event.source.postMessage({ type: 'TIMER_UPDATE', seconds: timerSeconds })
      break
  }
})

function startTimer(client) {
  if (timerInterval) clearInterval(timerInterval)

  timerInterval = setInterval(() => {
    if (timerRunning) {
      timerSeconds++
      client.postMessage({ type: 'TIMER_UPDATE', seconds: timerSeconds })
    }
  }, 1000)
}

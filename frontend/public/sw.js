// Service Worker for DentalERP PWA
// Provides offline caching, background sync, and performance optimizations

const CACHE_NAME = 'dentalerp-v1.0.0';
const CACHE_STRATEGY_VERSION = '1.0.0';

// Define cache strategies for different resource types
const CACHE_STRATEGIES = {
  CRITICAL: 'critical-resources',
  STATIC: 'static-assets',
  API: 'api-responses',
  IMAGES: 'image-cache',
  FONTS: 'font-cache'
};

// Critical resources to cache immediately
const CRITICAL_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/js/main.js',
  '/static/css/main.css'
];

// Cache duration configurations (in milliseconds)
const CACHE_DURATIONS = {
  CRITICAL: 7 * 24 * 60 * 60 * 1000, // 7 days
  STATIC: 30 * 24 * 60 * 60 * 1000,  // 30 days
  API: 5 * 60 * 1000,                 // 5 minutes
  IMAGES: 7 * 24 * 60 * 60 * 1000,    // 7 days
  FONTS: 30 * 24 * 60 * 60 * 1000     // 30 days
};

// Install event - cache critical resources
self.addEventListener('install', event => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache critical resources
      caches.open(CACHE_STRATEGIES.CRITICAL).then(cache => {
        console.log('📦 Caching critical resources');
        return cache.addAll(CRITICAL_RESOURCES);
      }),
      
      // Initialize other caches
      ...Object.values(CACHE_STRATEGIES).map(cacheName => 
        caches.open(cacheName)
      )
    ]).then(() => {
      console.log('✅ Service Worker installed successfully');
      // Force activation of new service worker
      self.skipWaiting();
    }).catch(error => {
      console.error('❌ Service Worker installation failed:', error);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        const validCaches = Object.values(CACHE_STRATEGIES);
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!validCaches.includes(cacheName) && !cacheName.includes(CACHE_STRATEGY_VERSION)) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Take control of all clients
      self.clients.claim()
    ]).then(() => {
      console.log('✅ Service Worker activated successfully');
    })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }
  
  event.respondWith(handleRequest(request));
});

// Main request handler with different strategies
async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Route requests to appropriate cache strategies
    if (isCriticalResource(url)) {
      return await cacheFirst(request, CACHE_STRATEGIES.CRITICAL);
    } else if (isStaticAsset(url)) {
      return await cacheFirst(request, CACHE_STRATEGIES.STATIC);
    } else if (isAPIRequest(url)) {
      return await networkFirst(request, CACHE_STRATEGIES.API);
    } else if (isImageRequest(url)) {
      return await cacheFirst(request, CACHE_STRATEGIES.IMAGES);
    } else if (isFontRequest(url)) {
      return await cacheFirst(request, CACHE_STRATEGIES.FONTS);
    } else {
      // Default: try network first, fallback to cache
      return await networkFirst(request, CACHE_STRATEGIES.STATIC);
    }
  } catch (error) {
    console.error('❌ Request handling failed:', error);
    return await getOfflineFallback(request);
  }
}

// Cache-first strategy (good for static resources)
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse && !isExpired(cachedResponse, cacheName)) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Network-first strategy (good for API calls)
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Check if response is expired based on cache strategy
function isExpired(response, cacheName) {
  const cachedTime = response.headers.get('sw-cache-time');
  if (!cachedTime) return false;
  
  const cacheAge = Date.now() - parseInt(cachedTime);
  const maxAge = CACHE_DURATIONS[cacheName.toUpperCase()] || CACHE_DURATIONS.STATIC;
  
  return cacheAge > maxAge;
}

// Resource type detection functions
function isCriticalResource(url) {
  return CRITICAL_RESOURCES.some(resource => url.pathname.includes(resource)) ||
         url.pathname === '/' ||
         url.pathname.includes('index.html');
}

function isStaticAsset(url) {
  return url.pathname.includes('/static/') ||
         /\.(js|css|html)$/.test(url.pathname);
}

function isAPIRequest(url) {
  return url.pathname.includes('/api/') ||
         url.hostname !== self.location.hostname;
}

function isImageRequest(url) {
  return /\.(png|jpg|jpeg|gif|webp|svg|ico)$/i.test(url.pathname);
}

function isFontRequest(url) {
  return /\.(woff|woff2|ttf|eot|otf)$/i.test(url.pathname);
}

// Offline fallback for different request types
async function getOfflineFallback(request) {
  const url = new URL(request.url);
  
  if (request.destination === 'document') {
    // Return cached index.html for navigation requests
    const cache = await caches.open(CACHE_STRATEGIES.CRITICAL);
    return await cache.match('/') || await cache.match('/index.html');
  }
  
  if (isImageRequest(url)) {
    // Return a placeholder image for failed image requests
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f3f4f6"/><text x="100" y="100" text-anchor="middle" dy="0.3em" font-family="Arial" font-size="14" fill="#9ca3af">Image Unavailable</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
  
  // Return a generic offline response
  return new Response('Offline - Please check your connection', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: { 'Content-Type': 'text/plain' }
  });
}

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(processOfflineActions());
  }
});

// Process actions that were queued while offline
async function processOfflineActions() {
  try {
    // Get queued actions from IndexedDB or localStorage
    const queuedActions = await getQueuedActions();
    
    for (const action of queuedActions) {
      try {
        await processAction(action);
        await removeQueuedAction(action.id);
        console.log('✅ Processed queued action:', action.type);
      } catch (error) {
        console.error('❌ Failed to process queued action:', error);
      }
    }
  } catch (error) {
    console.error('❌ Background sync failed:', error);
  }
}

// Message handling for communication with main thread
self.addEventListener('message', event => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_CACHE_SIZE':
      getCacheSize().then(size => {
        event.ports[0].postMessage({ type: 'CACHE_SIZE', payload: size });
      });
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ type: 'CACHE_CLEARED' });
      });
      break;
      
    case 'PRELOAD_ROUTES':
      preloadRoutes(payload.routes);
      break;
  }
});

// Utility functions
async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    totalSize += keys.length;
  }
  
  return totalSize;
}

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
}

async function preloadRoutes(routes) {
  const cache = await caches.open(CACHE_STRATEGIES.CRITICAL);
  
  for (const route of routes) {
    try {
      const response = await fetch(route);
      if (response.ok) {
        await cache.put(route, response);
        console.log('📦 Preloaded route:', route);
      }
    } catch (error) {
      console.error('❌ Failed to preload route:', route, error);
    }
  }
}

// Placeholder functions for offline action queue (implement with IndexedDB)
async function getQueuedActions() {
  // TODO: Implement with IndexedDB
  return [];
}

async function processAction(action) {
  // TODO: Implement action processing
  console.log('Processing action:', action);
}

async function removeQueuedAction(actionId) {
  // TODO: Implement with IndexedDB
  console.log('Removing queued action:', actionId);
}

console.log('🚀 DentalERP Service Worker script loaded');

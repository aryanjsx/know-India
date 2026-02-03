/**
 * Know India - Service Worker
 * 
 * This service worker enables offline functionality by caching static assets,
 * images, and API responses.
 * 
 * =============================================================================
 * HOW TO TEST OFFLINE MODE IN CHROME DEVTOOLS
 * =============================================================================
 * 
 * 1. Open Chrome DevTools (F12 or Ctrl+Shift+I / Cmd+Option+I on Mac)
 * 
 * 2. Check Service Worker Status:
 *    - Go to "Application" tab → "Service Workers" (left sidebar)
 *    - Verify the service worker is registered and "activated and running"
 *    - You can click "Update" to force a new version or "Unregister" to remove it
 * 
 * 3. View Cached Data:
 *    - Go to "Application" tab → "Cache Storage" (left sidebar)
 *    - You should see: know-india-cache-v1, know-india-images-v1, know-india-api-v1
 *    - Click each cache to view stored resources
 * 
 * 4. Test Offline Mode:
 *    - Go to "Network" tab
 *    - Check the "Offline" checkbox (or select "Offline" from throttling dropdown)
 *    - Refresh the page - it should load from cache
 *    - Navigate to different pages to test offline behavior
 *    - Try loading images - cached images should appear
 * 
 * 5. Monitor Service Worker Logs:
 *    - Go to "Console" tab
 *    - Filter by "[SW]" to see service worker logs
 *    - Watch for cache hits/misses and network fallbacks
 * 
 * 6. Simulate Slow Network:
 *    - Go to "Network" tab
 *    - Select "Slow 3G" or "Fast 3G" from throttling dropdown
 *    - Observe how cached resources load instantly vs network requests
 * 
 * 7. Clear Cache for Fresh Testing:
 *    - Go to "Application" tab → "Storage" (left sidebar)
 *    - Click "Clear site data" to remove all caches and service worker
 *    - Refresh and watch the install process in console
 * 
 * =============================================================================
 */

// Cache versioning - increment this when you want to invalidate all caches
const CACHE_VERSION = 1;
const CACHE_PREFIX = "know-india";

// Cache names with version
const CACHE_NAME = `${CACHE_PREFIX}-cache-v${CACHE_VERSION}`;
const IMAGE_CACHE_NAME = `${CACHE_PREFIX}-images-v${CACHE_VERSION}`;
const API_CACHE_NAME = `${CACHE_PREFIX}-api-v${CACHE_VERSION}`;

// All current valid cache names
const CURRENT_CACHES = [CACHE_NAME, IMAGE_CACHE_NAME, API_CACHE_NAME];

// Static assets to cache on install
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/offline.html",
  "/manifest.json",
  "/logo192.png",
  "/logo512.png",
  "/favicon.ico"
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Install event triggered");
  console.log("[SW] Cache version:", CACHE_VERSION);
  console.log("[SW] Cache names:", CURRENT_CACHES);
  console.log("[SW] Static assets to cache:", STATIC_ASSETS);
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Cache opened, adding static assets...");
      return cache.addAll(STATIC_ASSETS).then(() => {
        console.log("[SW] All static assets cached successfully");
      });
    }).catch((error) => {
      console.error("[SW] Failed to cache static assets:", error);
    })
  );
  self.skipWaiting();
  console.log("[SW] skipWaiting called - new SW will activate immediately");
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activate event triggered");
  console.log("[SW] Current cache version:", CACHE_VERSION);
  console.log("[SW] Current valid caches:", CURRENT_CACHES);
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      console.log("[SW] Existing caches found:", cacheNames);
      
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete cache if it belongs to our app but doesn't match current version
          const isOurCache = cacheName.startsWith(CACHE_PREFIX);
          const isCurrentVersion = CURRENT_CACHES.includes(cacheName);
          
          if (isOurCache && !isCurrentVersion) {
            console.log("[SW] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          } else if (isCurrentVersion) {
            console.log("[SW] Keeping current cache:", cacheName);
          } else {
            console.log("[SW] Ignoring unrelated cache:", cacheName);
          }
        })
      );
    }).then(() => {
      console.log("[SW] Cache cleanup complete - old versions removed");
    })
  );
  
  self.clients.claim();
  console.log("[SW] clients.claim() called - SW now controls all pages");
});

// Helper function to check if request is for an image
function isImageRequest(request) {
  const url = new URL(request.url);
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".ico"];
  const hasImageExtension = imageExtensions.some((ext) => url.pathname.toLowerCase().endsWith(ext));
  const acceptHeader = request.headers.get("Accept") || "";
  const isImageAccept = acceptHeader.includes("image/");
  
  return hasImageExtension || isImageAccept;
}

// Helper function to check if request is for /api/places
function isApiPlacesRequest(request) {
  const url = new URL(request.url);
  return url.pathname.includes("/api/places");
}

// Helper function to check if request is a navigation request
function isNavigationRequest(request) {
  return request.mode === "navigate" || 
    (request.method === "GET" && request.headers.get("Accept")?.includes("text/html"));
}

// Fetch event - handle requests with appropriate caching strategy
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== "GET") {
    console.log("[SW] Fetch: Skipping non-GET request:", request.method, url.pathname);
    return;
  }

  console.log("[SW] Fetch:", url.pathname, "| Mode:", request.mode);

  // Handle /api/places requests with network-first strategy
  if (isApiPlacesRequest(request)) {
    console.log("[SW] Fetch: API request detected - using network-first strategy");
    event.respondWith(
      caches.open(API_CACHE_NAME).then((cache) => {
        console.log("[SW] Fetch: Attempting network request for API:", url.pathname);
        return fetch(request)
          .then((networkResponse) => {
            // Save successful response to cache
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              cache.put(request, responseToCache);
              console.log("[SW] Fetch: API response cached successfully:", url.pathname);
            } else {
              console.log("[SW] Fetch: API response not cached (status:", networkResponse?.status, ")");
            }
            return networkResponse;
          })
          .catch((error) => {
            // Network failed, try to return cached API response
            console.log("[SW] Fetch: Network failed for API, checking cache:", url.pathname);
            return cache.match(request).then((cachedResponse) => {
              if (cachedResponse) {
                console.log("[SW] Fetch: Serving API from cache:", url.pathname);
                return cachedResponse;
              }
              // No cached response available
              console.error("[SW] Fetch: No cached API response available:", url.pathname, error);
              return new Response(
                JSON.stringify({ error: "Offline and no cached data available" }),
                {
                  status: 503,
                  statusText: "Service Unavailable",
                  headers: { "Content-Type": "application/json" }
                }
              );
            });
          });
      })
    );
    return;
  }

  // Handle image requests with cache-first strategy
  if (isImageRequest(request)) {
    console.log("[SW] Fetch: Image request detected - using cache-first strategy");
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            // Return cached image
            console.log("[SW] Fetch: Image served from cache:", url.href);
            return cachedResponse;
          }

          console.log("[SW] Fetch: Image not in cache, fetching from network:", url.href);
          // Fetch from network and cache for future use
          return fetch(request)
            .then((networkResponse) => {
              // Only cache successful responses
              if (networkResponse && networkResponse.status === 200) {
                // Clone the response since it can only be consumed once
                const responseToCache = networkResponse.clone();
                cache.put(request, responseToCache);
                console.log("[SW] Fetch: Image cached successfully:", url.href);
              } else {
                console.log("[SW] Fetch: Image not cached (status:", networkResponse?.status, ")");
              }
              return networkResponse;
            })
            .catch((error) => {
              console.error("[SW] Fetch: Failed to fetch image:", url.href, error);
              // Return a placeholder or undefined if image fetch fails
              return undefined;
            });
        });
      })
    );
    return;
  }

  // Handle other requests with network-first strategy
  console.log("[SW] Fetch: General request - using network-first strategy");
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        // Cache successful responses for static assets
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
            console.log("[SW] Fetch: Response cached:", url.pathname);
          });
        }
        console.log("[SW] Fetch: Served from network:", url.pathname);
        return networkResponse;
      })
      .catch((error) => {
        console.log("[SW] Fetch: Network failed, checking cache:", url.pathname, error);
        // Fallback to cache if network fails
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log("[SW] Fetch: Served from cache (offline):", url.pathname);
            return cachedResponse;
          }
          // If navigation request and nothing cached, show offline page
          if (isNavigationRequest(request)) {
            console.log("[SW] Fetch: Navigation failed, serving offline page for:", url.pathname);
            return caches.match("/offline.html");
          }
          console.log("[SW] Fetch: No cache available for:", url.pathname);
          return undefined;
        });
      })
  );
});

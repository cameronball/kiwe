// Set the current cache name
const CACHE_NAME = 'kiwe-cache-v3';
// Set the files to be cached by the service worker.
const urlsToCache = [
  '/css/login.css',
  '/js/bootstrap.min.js',
];

// When the app is installed
self.addEventListener('install', function(event) {
  event.waitUntil(
    // Create the cache
    caches.open(CACHE_NAME)
      .then(function(cache) {
        // Add the defined files to the cache
        return cache.addAll(urlsToCache);
      })
  );
});

// When a user requests one of the files
self.addEventListener('fetch', function(event) {
  event.respondWith(
    // If in the cache
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          // Return the file
          return response;
        }
        // Return the request
        return fetch(event.request);
      })
  );
});

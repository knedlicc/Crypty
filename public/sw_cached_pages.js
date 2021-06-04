
const cacheName = 'v1';

const cacheAssets = [
    '../offline.html',
    '../offlineStyle.css',
];

// Call Install Event
self.addEventListener('install', e => {
    console.log('Service Worker: Installed');

    e.waitUntil(
        caches
            .open(cacheName)
            .then(cache => {
                console.log('Service Worker: Caching Files');
                cache.addAll(cacheAssets).then();
            })
            .then(() => self.skipWaiting())
    );
});

// Call Activate Event
self.addEventListener('activate', e => {
    console.log('Service Worker: Activated');
    // Remove unwanted caches
    e.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== cacheName) {
                        console.log('Service Worker: Clearing Old Cache');
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Call Fetch Event
self.addEventListener('fetch', async e => {
    console.log('Service Worker: Fetching');
    e.respondWith(respondTo(e.request));
});



async function respondTo(request) {
    let f = fetch(request);
    const cached = await caches.match(request);

    if (cached) { // try updating the cache first
        try {
            let response = await f;
            let cache = await caches.open(cacheName);
            await cache.put(request, response.clone());
            return response;
        } catch (e) { // offline
            return cached;
        }
    } else { // not cached, forward to network
        return f;
    }
}


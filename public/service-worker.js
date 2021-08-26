const CACHE_NAME = "budget-cache-v1"
const DATA_CACHE_NAME = "data-cache-v1"

const FILES_TO_CACHE = [
    "./index.html",
    "./styles.css",
    "./index.js",
    "./indexedDB.js",
    "./manifest.json",
    "./icons/icon-192x192.png",
    "./icons/icon-512x512.png",
]

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(FILES_TO_CACHE)
        })
    )
});

self.addEventListener("fetch", (event) => {
    if(event.request.url.includes("/api/")) {
        event.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(event.request)
                    .then(response => {
                        if(response.status === 200){
                            cache.put(event.request.url, response.clone());
                        }

                        return response;
                    })
                    .catch(err => {
                        return cache.match(event.request)
                    })
            }).catch(err => console.log(err))
        )

        return
    }

    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request).then(response => {
                if(response){
                    return response
                }else if (event.request.headers.get("accept").includes("text/html")) {
                    return caches.match("/")
                }
            })
        })
    )
})

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(function (keyList) {
            let cacheKeeplist = keyList.filter(function(key) {
                return key.indexOf(CACHE_NAME)
            })
            cacheKeeplist.push(CACHE_NAME)

            return Promise.all(keyList.map(function(key, i) {
                if(cacheKeeplist.indexOf(key) === -1) {
                    console.log("delete")
                    return caches.delete(keyList[i])
                }
            }))
        })
    )
})
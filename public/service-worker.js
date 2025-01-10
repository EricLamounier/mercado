const CACHE_NAME = "my-pwa-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/offline.html",
  "/manifest.json",
];

// Instalação do Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Cache inicializado");
      return cache.addAll(urlsToCache);
    })
  );
});

// Interceptação de requisições e cache dinâmico
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request)
          .then((fetchResponse) => {
            // Cacheando dinamicamente arquivos
            if (!event.request.url.includes("chrome-extension")) {
              return caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, fetchResponse.clone());
                return fetchResponse;
              });
            }
            return fetchResponse;
          })
          .catch(() => caches.match("/offline.html")) // Fallback offline
      );
    })
  );
});

// Atualização do Cache durante a ativação
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log("Deletando cache antigo:", cacheName);
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
});

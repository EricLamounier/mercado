const CACHE_VERSION = "v1"; // Versão do cache para o build atual
const CACHE_NAME = `my-pwa-cache-${CACHE_VERSION}`;
const urlsToCache = [
  "/",
  "/index.html",
  "/offline.html",
  "/manifest.json",
  // Adicione outros recursos estáticos aqui
];

// Instalação do Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Cache inicializado");
      // Cacheando arquivos principais
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
            // Cacheando arquivos JS e CSS gerados no build
            if (!event.request.url.includes("chrome-extension") && !event.request.url.includes("/offline.html")) {
              return caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, fetchResponse.clone());
                return fetchResponse;
              });
            }
            return fetchResponse;
          })
          .catch(() => {
            // Caso falhe, retorna a página offline
            return caches.match("/offline.html");
          })
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

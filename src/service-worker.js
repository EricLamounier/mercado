import { clientsClaim } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

clientsClaim();

// Precache todos os arquivos gerados pela build do React
precacheAndRoute(self.__WB_MANIFEST);

// Cache de todas as imagens (usando StaleWhileRevalidate)
registerRoute(
  ({ url }) => url.origin === self.location.origin && url.pathname.endsWith('.png'),
  new StaleWhileRevalidate({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({ maxEntries: 50 }),
    ],
  })
);

// Cache de todos os arquivos CSS e JS
registerRoute(
  ({ url }) => url.origin === self.location.origin && (url.pathname.endsWith('.js') || url.pathname.endsWith('.css')),
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
  })
);

// Cache de arquivos HTML
registerRoute(
  ({ request }) => request.mode === 'navigate', // Vai cachear todas as requisições de navegação
  new StaleWhileRevalidate({
    cacheName: 'html-pages',
  })
);

// Cache de outros arquivos de mídia (imagens, fontes)
registerRoute(
  ({ url }) => url.origin === self.location.origin && (url.pathname.endsWith('.jpg') || url.pathname.endsWith('.gif') || url.pathname.endsWith('.woff2') || url.pathname.endsWith('.woff')),
  new StaleWhileRevalidate({
    cacheName: 'media-files',
  })
);

// Intercepta requisições POST para salvar dados no localStorage quando offline
self.addEventListener('fetch', (event) => {
  if (event.request.method === 'POST') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          const requestClone = event.request.clone();
          requestClone.json().then((data) => {
            const queue = JSON.parse(localStorage.getItem('dataQueue')) || [];
            queue.push(data);
            localStorage.setItem('dataQueue', JSON.stringify(queue));
          });
          return new Response('Você está offline, seus dados serão enviados quando a conexão for restabelecida.');
        })
    );
  }
});

// Enviar dados da fila para o servidor quando o app voltar online
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SEND_QUEUE') {
    const queue = JSON.parse(localStorage.getItem('dataQueue')) || [];
    if (queue.length > 0) {
      queue.forEach((data) => {
        fetch('https://meu-servidor.com/api', {
          method: 'POST',
          body: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' },
        }).then(() => {
          console.log('Dado enviado:', data);
        });
      });
      // Limpa a fila após envio
      localStorage.removeItem('dataQueue');
    }
  }
});

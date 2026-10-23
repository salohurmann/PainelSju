/* Service worker do Painel Seju. — gerado no build (vite.config.ts). */
/* global self, caches, fetch, URL, Response */
const VERSAO = '__VERSAO__';
const CACHE = `seju-${VERSAO}`;
const ARQUIVOS = __ARQUIVOS__;
const escopo = self.registration.scope;
const INDEX = new URL('./', escopo).href;

self.addEventListener('install', evento => {
  evento.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ARQUIVOS.map(a => new URL(a, escopo).href))),
  );
});

self.addEventListener('activate', evento => {
  evento.waitUntil(
    caches
      .keys()
      .then(nomes => Promise.all(nomes.filter(n => n.startsWith('seju-') && n !== CACHE).map(n => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

// A página pede para ativar a versão nova quando a pessoa clica em "Atualizar".
self.addEventListener('message', evento => {
  if (evento.data === 'pular-espera') self.skipWaiting();
});

self.addEventListener('fetch', evento => {
  const req = evento.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Só arquivos do próprio Painel. Dados do banco (outro domínio) nunca passam pelo cache.
  if (url.origin !== self.location.origin || !req.url.startsWith(escopo)) return;

  if (req.mode === 'navigate') {
    // Página: tenta a rede (versão mais nova); sem conexão, usa a cópia guardada.
    evento.respondWith(
      fetch(req)
        .then(resp => {
          if (resp.ok) caches.open(CACHE).then(c => c.put(INDEX, resp.clone()));
          return resp;
        })
        .catch(() => caches.match(INDEX).then(r => r || new Response('Sem conexão.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }))),
    );
    return;
  }

  // Arquivos com hash no nome não mudam: cache primeiro.
  evento.respondWith(
    caches.match(req).then(
      guardado =>
        guardado ||
        fetch(req).then(resp => {
          if (resp.ok && url.pathname.includes('/assets/')) {
            const copia = resp.clone();
            caches.open(CACHE).then(c => c.put(req, copia));
          }
          return resp;
        }),
    ),
  );
});

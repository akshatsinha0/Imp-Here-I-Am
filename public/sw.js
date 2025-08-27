const CACHE_NAME='hereiam-chat-v2';
self.addEventListener('install',e=>{self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)));await self.clients.claim()})())});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const isNav=e.request.mode==='navigate'||e.request.destination==='document'||e.request.headers.get('accept')?.includes('text/html');
  if(isNav){
    e.respondWith((async()=>{
      try{
        const res=await fetch(e.request);
        const c=await caches.open(CACHE_NAME);c.put(e.request,res.clone());
        return res
      }catch{
        const cached=await caches.match(e.request);
        if(cached)return cached;
        return new Response('Offline',{status:503,statusText:'Service Unavailable'})
      }
    })());
    return;
  }
  e.respondWith((async()=>{
    const cached=await caches.match(e.request);
    if(cached)return cached;
    try{
      const res=await fetch(e.request);
      if(res.status===200){const c=await caches.open(CACHE_NAME);c.put(e.request,res.clone())}
      return res
    }catch{
      return new Response('Offline',{status:503,statusText:'Service Unavailable'})
    }
  })());
});
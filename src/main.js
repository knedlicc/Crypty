import App from "./App.svelte";
// import cache from './sw_cached_pages.js';
const app = new App({

  target: document.getElementById("app"),
});



if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
        .register( `../../sw_cached_pages.js`,)
        .then(req => console.log('Service Worker: Registered (Pages)'))
        .catch(err => console.log(`Service Worker: Error: ${err}`));
  });
}



export default app;

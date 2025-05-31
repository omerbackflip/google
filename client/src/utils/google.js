// client/src/utils/google.js

let apiLoaded = false;

export async function loadGoogleApis() {
  if (apiLoaded) return;

  // Load gapi
  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });

  // Load Google Identity Services
  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });

  apiLoaded = true;
}

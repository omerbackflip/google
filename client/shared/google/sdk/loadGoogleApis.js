let gisScriptPromise = null;
let gapiScriptPromise = null;
let pickerApiPromise = null;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === 'true') {
        resolve();
        return;
      }

      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };

    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function loadGisScript() {
  if (!gisScriptPromise) {
    gisScriptPromise = loadScript('https://accounts.google.com/gsi/client');
  }
  return gisScriptPromise;
}

function loadGapiScript() {
  if (!gapiScriptPromise) {
    gapiScriptPromise = loadScript('https://apis.google.com/js/api.js');
  }
  return gapiScriptPromise;
}

async function loadPickerApi() {
  if (!pickerApiPromise) {
    pickerApiPromise = (async () => {
      await loadGapiScript();

      await new Promise((resolve, reject) => {
        window.gapi.load('picker', {
          callback: resolve,
          onerror: () => reject(new Error('Failed to load Google Picker API'))
        });
      });
    })();
  }

  return pickerApiPromise;
}

async function loadGoogleApis() {
  await Promise.all([
    loadGisScript(),
    loadPickerApi()
  ]);
}

export {
  loadGoogleApis
};
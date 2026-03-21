import { openPicker } from '../../client/shared/google/index.js';

const resultEl = document.getElementById('result');
const button = document.getElementById('pick-file-btn');

button.addEventListener('click', async () => {
  resultEl.textContent = 'Opening picker...';

  try {
    const file = await openPicker({
      clientId: window.SANDBOX_GOOGLE_CONFIG.clientId,
      apiKey: window.SANDBOX_GOOGLE_CONFIG.apiKey,
      appId: window.SANDBOX_GOOGLE_CONFIG.appId,
      scope: window.SANDBOX_GOOGLE_CONFIG.scope
    });

    resultEl.textContent = JSON.stringify(file, null, 2);
  } catch (error) {
    resultEl.textContent = `Error: ${error.message}`;
    console.error(error);
  }
});
import SpecificServiceEndPoints from "../services/specificServiceEndPoints";

export async function initializeGoogleOnAppLoad(setMenuItemCallback = null) {
    try {
        const response = await SpecificServiceEndPoints.getGoogleConnectionStatus();
        const data = response?.data || {};

        if (data.connected) {
            if (setMenuItemCallback) {
                if (data.username !== '') {
                    setMenuItemCallback(`Google (${data.username})`);
                } else {
                    setMenuItemCallback('Google');
                }
            }

            if (data.developerKey || data.access_token || data.folderId || data.locale) {
                localStorage.setItem('developerKey', data.developerKey || '');
                localStorage.setItem('googleAccessToken', data.access_token || '');
                localStorage.setItem('folderId', data.folderId || '');
                localStorage.setItem('locale', data.locale || '');
            }
        } else {
            if (setMenuItemCallback) {
                setMenuItemCallback('Google (Connect)');
            }

            if (data.authUrl) {
                window.open(data.authUrl, '_self');
            }
        }

        return response;
    } catch (error) {
        console.log("initializeGoogleOnAppLoad error:", error);
    }
}
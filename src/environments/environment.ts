const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';

export const environment = {
  apiUrl: isLocalhost ? 'http://localhost:3000' : 'https://api.youtome.us',
};

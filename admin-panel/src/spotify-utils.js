// src/spotify-utils.js

export const loadSpotifySDK = () => {
  return new Promise((resolve, reject) => {
    if (window.Spotify) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Spotify SDK'));

    document.body.appendChild(script);
  });
};

export const initializeSpotifyPlayer = (token, onReady, onError) => {
  return new Promise((resolve, reject) => {
    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'Web Playback SDK',
        getOAuthToken: cb => cb(token)
      });

      player.addListener('ready', ({ device_id }) => {
        console.log('Spotify Player is ready.');
        onReady(player); // Pass the player instance
        resolve(player);
      });

      player.addListener('not_ready', ({ device_id }) => {
        console.log('Spotify Player is not ready.');
        onError(new Error('Spotify Player is not ready'));
        reject(new Error('Spotify Player is not ready'));
      });

      player.connect();
    };

    loadSpotifySDK().catch(reject);
  });
};

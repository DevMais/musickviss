import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import LobbySettings from './LobbySettings';
import type { LobbySettings as LobbySettingsType } from '../types/game';

interface CreateLobbyModalProps {
  playerName: string;
  onClose: () => void;
  onSuccess: (sessionCode: string, playerId: string, wsUrl: string) => void;
}

export default function CreateLobbyModal({
  playerName,
  onClose,
  onSuccess,
}: CreateLobbyModalProps) {
  const [settings, setSettings] = useState<LobbySettingsType>({
    numSongs: 10,
    timeLimit: 30,
    scoreMethod: 'faster',
    musicSelection: {
      type: 'genre',
      value: 'pop',
    },
    answerMode: 'both',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [spotifyAuthenticated, setSpotifyAuthenticated] = useState(false);

  useEffect(() => {
    // Check if returning from Spotify auth
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('spotify_auth') === 'success') {
      setSpotifyAuthenticated(true);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleCreateLobby = async () => {
    if (!spotifyAuthenticated) {
      setError('Please authenticate with Spotify first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.createLobby({
        playerName,
        settings,
      });
      onSuccess(response.sessionCode, response.playerId, response.wsUrl);
    } catch (err) {
      setError('Failed to create lobby. Please try again.');
      setLoading(false);
    }
  };

  const handleSpotifyAuth = async () => {
    try {
      const { url } = await api.getSpotifyAuthUrl();
      window.location.href = url;
    } catch (err) {
      setError('Failed to initiate Spotify authentication');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Create Lobby</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {!spotifyAuthenticated ? (
            <div className="space-y-4">
              <p className="text-white mb-4">
                Please authenticate with Spotify to create a lobby.
              </p>
              <button
                onClick={handleSpotifyAuth}
                className="w-full py-4 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold rounded-lg transition-colors touch-manipulation min-h-[48px]"
              >
                Authenticate with Spotify
              </button>
            </div>
          ) : (
            <>
              <LobbySettings settings={settings} onChange={setSettings} />
              {error && (
                <div className="text-red-500 text-sm mt-4">{error}</div>
              )}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={onClose}
                  className="flex-1 py-4 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white font-semibold rounded-lg transition-colors touch-manipulation min-h-[48px]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateLobby}
                  disabled={loading}
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors touch-manipulation min-h-[48px]"
                >
                  {loading ? 'Creating...' : 'Create Lobby'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


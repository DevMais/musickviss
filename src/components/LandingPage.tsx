import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import CreateLobbyModal from './CreateLobbyModal';

export default function LandingPage() {
  const [playerName, setPlayerName] = useState('');
  const [sessionCode, setSessionCode] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoinLobby = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!sessionCode.trim()) {
      setError('Please enter a session code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.joinLobby({
        sessionCode: sessionCode.toUpperCase().trim(),
        playerName: playerName.trim(),
      });
      navigate(`/game/${sessionCode.toUpperCase().trim()}`, {
        state: { playerId: response.playerId, wsUrl: response.wsUrl },
      });
    } catch (err) {
      setError('Failed to join lobby. Please check the session code.');
      setLoading(false);
    }
  };

  const handleCreateLobby = () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    setShowCreateModal(true);
    setError('');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Music Quiz
        </h1>

        <div className="space-y-4">
          <div>
            <label htmlFor="playerName" className="block text-white mb-2 text-sm">
              Your Name
            </label>
            <input
              id="playerName"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-blue-500"
              maxLength={20}
            />
          </div>

          <div>
            <label htmlFor="sessionCode" className="block text-white mb-2 text-sm">
              Session Code
            </label>
            <input
              id="sessionCode"
              type="text"
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
              placeholder="Enter session code"
              className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-blue-500 uppercase"
              maxLength={6}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <button
            onClick={handleJoinLobby}
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors touch-manipulation"
          >
            {loading ? 'Joining...' : 'Join Lobby'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-black text-gray-400">OR</span>
            </div>
          </div>

      <button
        onClick={handleCreateLobby}
        className="w-full py-3 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold rounded-lg transition-colors touch-manipulation"
      >
        Create Lobby
      </button>
        </div>
      </div>

      {showCreateModal && (
        <CreateLobbyModal
          playerName={playerName.trim()}
          onClose={() => setShowCreateModal(false)}
          onSuccess={(sessionCode, playerId, wsUrl) => {
            navigate(`/game/${sessionCode}`, {
              state: { playerId, wsUrl },
            });
          }}
        />
      )}
    </div>
  );
}


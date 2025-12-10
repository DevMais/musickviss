import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';
import PlayerList from './PlayerList';
import ScoreBoard from './ScoreBoard';
import SettingsModal from './SettingsModal';

export default function GameRoom() {
  const { sessionCode } = useParams<{ sessionCode: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { playerId, wsUrl } = location.state || {};

  const { gameState, connected, sendMessage } = useWebSocket(
    wsUrl || null
  );
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);

  useEffect(() => {
    if (!playerId || !wsUrl) {
      navigate('/');
      return;
    }

    if (connected) {
      sendMessage({
        type: 'join',
        data: { playerId, sessionCode },
      });
    }
  }, [connected, playerId, sessionCode, wsUrl, sendMessage, navigate]);

  useEffect(() => {
    if (gameState?.settings?.timeLimit) {
      setTimeRemaining(gameState.settings.timeLimit);
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 0) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [gameState?.currentQuestion]);

  const handleAnswer = () => {
    if (!currentAnswer.trim() || hasAnswered) return;

    const timestamp = Date.now();
    sendMessage({
      type: 'answer',
      data: {
        playerId,
        answer: currentAnswer.trim(),
        timestamp,
      },
    });
    setHasAnswered(true);
  };

  const handleStartGame = () => {
    if (gameState?.players.find((p) => p.id === playerId)?.isHost) {
      sendMessage({ type: 'game-start', data: {} });
    }
  };

  if (!gameState) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Connecting to game...</p>
        </div>
      </div>
    );
  }

  const currentTrack = gameState.currentTrack;
  const isHost = gameState.players.find((p) => p.id === playerId)?.isHost;
  const currentPlayer = gameState.players.find((p) => p.id === playerId);

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-4xl mx-auto">
        {!gameState.isGameStarted ? (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">
                Lobby: {sessionCode}
              </h1>
              <p className="text-gray-400">
                {gameState.players.length} player
                {gameState.players.length !== 1 ? 's' : ''} in lobby
              </p>
            </div>

            <PlayerList players={gameState.players} currentPlayerId={playerId} />

            {isHost && (
              <div className="text-center">
                <button
                  onClick={handleStartGame}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Start Game
                </button>
              </div>
            )}

            {!isHost && (
              <div className="text-center text-gray-400">
                Waiting for host to start the game...
              </div>
            )}
          </div>
        ) : gameState.isGameEnded ? (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-center">Game Over!</h1>
            <ScoreBoard players={gameState.players} />
            <div className="text-center">
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">
                  Question {gameState.currentQuestion} /{' '}
                  {gameState.totalQuestions}
                </h2>
                <p className="text-gray-400">Time: {timeRemaining}s</p>
              </div>
              {currentPlayer && (
                <div className="text-right">
                  <p className="text-sm text-gray-400">Your Score</p>
                  <p className="text-2xl font-bold">{currentPlayer.score}</p>
                </div>
              )}
            </div>

            {currentTrack && (
              <div className="bg-gray-900 rounded-lg p-6 space-y-4">
                <div className="text-center">
                  <img
                    src={currentTrack.albumCover}
                    alt="Album cover"
                    className="w-48 h-48 mx-auto rounded-lg mb-4"
                  />
                  {currentTrack.previewUrl && (
                    <audio
                      src={currentTrack.previewUrl}
                      controls
                      autoPlay
                      className="w-full"
                    />
                  )}
                </div>

                <div className="space-y-4">
                  {gameState.settings.answerMode === 'multiple-choice' ||
                  gameState.settings.answerMode === 'both' ? (
                    <div className="grid grid-cols-1 gap-2">
                      {currentTrack.options?.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setCurrentAnswer(option);
                          if (!hasAnswered) handleAnswer();
                        }}
                        disabled={hasAnswered}
                        className="px-4 py-4 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 disabled:bg-gray-900 disabled:cursor-not-allowed rounded-lg text-left transition-colors touch-manipulation min-h-[48px] flex items-center"
                      >
                        {option}
                      </button>
                      ))}
                    </div>
                  ) : null}

                  {(gameState.settings.answerMode === 'text-input' ||
                    gameState.settings.answerMode === 'both') && (
                    <div>
                      <input
                        type="text"
                        value={currentAnswer}
                        onChange={(e) => setCurrentAnswer(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !hasAnswered) {
                            handleAnswer();
                          }
                        }}
                        placeholder="Enter your answer"
                        disabled={hasAnswered}
                        className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-blue-500 disabled:bg-gray-900 disabled:cursor-not-allowed"
                      />
                      <button
                        onClick={handleAnswer}
                        disabled={hasAnswered || !currentAnswer.trim()}
                        className="w-full mt-2 py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors touch-manipulation min-h-[48px]"
                      >
                        {hasAnswered ? 'Answered' : 'Submit Answer'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <ScoreBoard players={gameState.players} />
          </div>
        )}
      </div>

      <button
        onClick={() => setShowSettings(true)}
        className="fixed bottom-4 right-4 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors text-sm touch-manipulation z-40 shadow-lg"
        aria-label="Settings"
      >
        ⚙️ Settings
      </button>

      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}


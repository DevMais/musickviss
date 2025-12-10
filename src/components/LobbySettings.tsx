import type { LobbySettings } from '../types/game';

interface LobbySettingsProps {
  settings: LobbySettings;
  onChange: (settings: LobbySettings) => void;
}

const GENRES = [
  'pop',
  'rock',
  'hip-hop',
  'electronic',
  'jazz',
  'classical',
  'country',
  'r&b',
  'indie',
  'metal',
];

export default function LobbySettingsComponent({
  settings,
  onChange,
}: LobbySettingsProps) {
  const updateSettings = (updates: Partial<LobbySettings>) => {
    onChange({ ...settings, ...updates });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-white mb-2 text-sm font-medium">
          Number of Songs
        </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="5"
              max="30"
              value={settings.numSongs}
              onChange={(e) =>
                updateSettings({ numSongs: parseInt(e.target.value) })
              }
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-white w-12 text-right">{settings.numSongs}</span>
          </div>
      </div>

      <div>
        <label className="block text-white mb-2 text-sm font-medium">
          Time Limit (seconds)
        </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="10"
              max="60"
              step="5"
              value={settings.timeLimit}
              onChange={(e) =>
                updateSettings({ timeLimit: parseInt(e.target.value) })
              }
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-white w-12 text-right">
              {settings.timeLimit}s
            </span>
          </div>
      </div>

      <div>
        <label className="block text-white mb-2 text-sm font-medium">
          Score Calculation
        </label>
        <select
          value={settings.scoreMethod}
          onChange={(e) =>
            updateSettings({
              scoreMethod: e.target.value as 'faster' | 'correct',
            })
          }
          className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
        >
          <option value="faster">Faster answer = more points</option>
          <option value="correct">Correct answer = fixed points</option>
        </select>
      </div>

      <div>
        <label className="block text-white mb-2 text-sm font-medium">
          Music Selection
        </label>
        <div className="space-y-3">
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="genre"
                checked={settings.musicSelection.type === 'genre'}
                onChange={() =>
                  updateSettings({
                    musicSelection: {
                      type: 'genre',
                      value: settings.musicSelection.value,
                    },
                  })
                }
                className="mr-2"
              />
              <span className="text-white">Genre</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="playlist"
                checked={settings.musicSelection.type === 'playlist'}
                onChange={() =>
                  updateSettings({
                    musicSelection: {
                      type: 'playlist',
                      value: '',
                    },
                  })
                }
                className="mr-2"
              />
              <span className="text-white">Playlist</span>
            </label>
          </div>

          {settings.musicSelection.type === 'genre' ? (
            <select
              value={settings.musicSelection.value}
              onChange={(e) =>
                updateSettings({
                  musicSelection: {
                    type: 'genre',
                    value: e.target.value,
                  },
                })
              }
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
            >
              {GENRES.map((genre) => (
                <option key={genre} value={genre}>
                  {genre.charAt(0).toUpperCase() + genre.slice(1)}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={settings.musicSelection.value}
              onChange={(e) =>
                updateSettings({
                  musicSelection: {
                    type: 'playlist',
                    value: e.target.value,
                  },
                })
              }
              placeholder="Enter playlist ID or URL"
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-blue-500"
            />
          )}
        </div>
      </div>

      <div>
        <label className="block text-white mb-2 text-sm font-medium">
          Answer Mode
        </label>
        <select
          value={settings.answerMode}
          onChange={(e) =>
            updateSettings({
              answerMode: e.target.value as
                | 'multiple-choice'
                | 'text-input'
                | 'both',
            })
          }
          className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
        >
          <option value="multiple-choice">Multiple Choice</option>
          <option value="text-input">Text Input</option>
          <option value="both">Both</option>
        </select>
      </div>
    </div>
  );
}


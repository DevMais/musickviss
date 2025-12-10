interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Settings & Sources</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Data Sources
              </h3>
              <p className="text-gray-300 mb-2">
                This app uses the Spotify Web API to provide music content.
              </p>
              <p className="text-gray-400 text-sm">
                Music data, album covers, and track previews are provided by
                Spotify.
              </p>
              <a
                href="https://developer.spotify.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm underline"
              >
                Learn more about Spotify Web API
              </a>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Changelog
              </h3>
              <div className="space-y-2 text-gray-300">
                <div>
                  <p className="font-semibold">Version 1.0.0</p>
                  <ul className="list-disc list-inside text-sm text-gray-400 ml-4">
                    <li>Initial release</li>
                    <li>Multiplayer music quiz functionality</li>
                    <li>Spotify integration</li>
                    <li>Real-time scoring system</li>
                    <li>Mobile-responsive design</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">About</h3>
              <p className="text-gray-300 text-sm">
                Music Quiz is a multiplayer game where players compete to
                identify songs. Points are awarded based on speed and accuracy.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-6 py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-lg transition-colors touch-manipulation min-h-[48px]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}


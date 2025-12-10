import type { Player } from '../types/game';

interface ScoreBoardProps {
  players: Player[];
}

export default function ScoreBoard({ players }: ScoreBoardProps) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3">Scoreboard</h3>
      <div className="space-y-2">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.id}
            className="flex justify-between items-center p-3 rounded bg-gray-800"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-gray-600 w-8">
                {index + 1}
              </span>
              <span className="text-white">{player.name}</span>
            </div>
            <span className="text-xl font-bold text-blue-400">
              {player.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}


import type { Player } from '../types/game';

interface PlayerListProps {
  players: Player[];
  currentPlayerId: string;
}

export default function PlayerList({ players, currentPlayerId }: PlayerListProps) {
  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3">Players</h3>
      <div className="space-y-2">
        {players.map((player) => (
          <div
            key={player.id}
            className={`flex justify-between items-center p-2 rounded ${
              player.id === currentPlayerId ? 'bg-blue-900' : 'bg-gray-800'
            }`}
          >
            <span className="text-white">
              {player.name}
              {player.isHost && (
                <span className="ml-2 text-xs text-yellow-400">(Host)</span>
              )}
              {player.id === currentPlayerId && (
                <span className="ml-2 text-xs text-blue-400">(You)</span>
              )}
            </span>
            <span className="text-gray-400">{player.score} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}


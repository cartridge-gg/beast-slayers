import { useLeaderboard } from './hooks/useLeaderboard';
import { ToriiClient } from "@dojoengine/torii-wasm";

interface LeaderboardProps {
  client?: ToriiClient;
  onClose: () => void;
}

export function Leaderboard({ client, onClose }: LeaderboardProps) {
  const leaderboard = useLeaderboard(client);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
        <ul>
          {leaderboard.map((warrior, index) => (
            <li key={warrior.address} className="mb-2">
              <span className="font-bold">{index + 1}.</span> {warrior.address.slice(0, 6)}...{warrior.address.slice(-4)} - Score: {warrior.score}
            </li>
          ))}
        </ul>
        <button 
          onClick={onClose}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
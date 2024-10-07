import { useUsernames } from './contexts/UsernamesContext';
import { useLeaderboard } from './hooks/useLeaderboard';
import { ToriiClient } from "@dojoengine/torii-wasm";

interface LeaderboardProps {
  client: ToriiClient;
  balances: Record<string, bigint>;
  onClose: () => void;
}

const formatEth = (wei: bigint): string => {
    const eth = Number(wei) / 1e18;
    return eth.toFixed(2);
  };

export function Leaderboard({ client, balances, onClose }: LeaderboardProps) {
  const { leaderboard, loading } = useLeaderboard(client);
  const { usernamesCache } = useUsernames()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
      <div className="bg-black bg-opacity-80 text-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : (
          <ul>
            {leaderboard.map((warrior, index) => (
              <li key={warrior.address} className="mb-2">
                <span className="font-bold">{index + 1}.</span> {usernamesCache?.[warrior.address] ?? warrior.address.slice(0, 6)}...{warrior.address.slice(-4)} - Score: {warrior.score} - {formatEth(balances?.[warrior.address] ?? 0n)} $THING
              </li>
            ))}
          </ul>
        )}
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
import { useState, useEffect, useRef } from "react";
import { ToriiClient } from "@dojoengine/torii-wasm";

export interface LeaderboardWarrior {
  address: string;
  level: number;
  score: number;
}

export function useLeaderboard(client?: ToriiClient) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardWarrior[]>([]);
  const subscription = useRef<any>();

  useEffect(() => {
    if (!client) return;

    const fetchLeaderboard = async () => {
      const entities = await client.getEntities({
        limit: 1000, // Adjust this value based on your expected number of warriors
        offset: 0,
        clause: undefined
      });

      const warriors = Object.values(entities).map((entity) => {
        const warriorData = entity["beastslayers-Warrior"];
        return {
          address: warriorData.address.value,
          level: warriorData.level.value,
          score: warriorData.score.value,
        } as LeaderboardWarrior;
      });

      // Sort warriors by score in descending order and take the top 10
      const topWarriors = warriors
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      setLeaderboard(topWarriors);
    };

    const subscribeToLeaderboard = async () => {
      subscription.current = await client.onEntityUpdated(
        [{ Keys: { models: ["beastslayers-Warrior"], keys: [undefined], pattern_matching: "VariableLen" } }],
        (_hashedKeys, models) => {
          const updatedWarrior = models["beastslayers-Warrior"];
          if (updatedWarrior) {
            fetchLeaderboard();
          }
        }
      );
    };

    fetchLeaderboard();
    subscribeToLeaderboard();

    // Clean up the subscription on component unmount
    return () => {
      if (subscription.current) {
        subscription.current.unsubscribe();
      }
    };
  }, [client]);

  return leaderboard;
}
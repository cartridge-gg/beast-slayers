import { useState, useEffect, useRef, useMemo } from "react";
import { ToriiClient } from "@dojoengine/torii-wasm";
import { useFetchUsernames } from "@/contexts/UsernamesContext";

export interface LeaderboardWarrior {
  address: string;
  level: number;
  score: number;
}

export function useLeaderboard(client?: ToriiClient) {
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardWarrior[]>([]);
  const subscription = useRef<any>();

  useEffect(() => {
    if (!client) return;

    const fetchLeaderboard = async () => {
      setLoading(true);
      const entities = await client.getEntities({
        limit: 1000,
        offset: 0,
        clause: {
            Keys: {
                models: ["beastslayers-Warrior"],
                keys: [undefined],
                pattern_matching: "VariableLen"
            }
        }
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
      setLoading(false);
    };

    const subscribeToLeaderboard = async () => {
      subscription.current = await client.onEntityUpdated(
        [{ Keys: { models: ["beastslayers-Warrior"], keys: [undefined], pattern_matching: "VariableLen" } }],
        (_hashedKeys, models) => {
          const updatedWarrior = models["beastslayers-Warrior"];
          if (updatedWarrior) {
            const newWarrior: LeaderboardWarrior = {
              address: updatedWarrior.address.value,
              level: updatedWarrior.level.value,
              score: updatedWarrior.score.value,
            };

            setLeaderboard(prevLeaderboard => {
              const updatedLeaderboard = [...prevLeaderboard];
              const existingIndex = updatedLeaderboard.findIndex(w => w.address === newWarrior.address);

              if (existingIndex !== -1) {
                // Update existing warrior
                updatedLeaderboard[existingIndex] = newWarrior;
              } else if (updatedLeaderboard.length < 10 || newWarrior.score > updatedLeaderboard[9].score) {
                // Add new warrior if leaderboard has less than 10 entries or if the new score is higher than the lowest score
                updatedLeaderboard.push(newWarrior);
              }

              // Sort and slice to keep top 10
              return updatedLeaderboard
                .sort((a, b) => b.score - a.score)
                .slice(0, 10);
            });
          }
        }
      );
    };

    fetchLeaderboard();
    subscribeToLeaderboard();

    // Clean up the subscription on component unmount
    return () => {
      if (subscription.current) {
        subscription.current.cancel();
      }
    };
  }, [client]);

  const addresses = useMemo(() => leaderboard.map((entry) => entry.address), [leaderboard])
  useFetchUsernames(addresses)

  return { leaderboard, loading };
}
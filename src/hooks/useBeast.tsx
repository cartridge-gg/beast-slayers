import { ToriiClient } from "@dojoengine/torii-wasm";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

export interface Beast {
  health: number;
  level: number;
}

export function useBeast(client?: ToriiClient) {
  const [beast, setBeast] = useState<Beast>({ health: 100, level: 1 });
  const subscription = useRef<any>();

  useEffect(() => {
    if (!client) return;

    const fetchBeast = async () => {
      const entities = await client.getEntities({
        limit: 1,
        offset: 0,
        clause: {
          Keys: {
            keys: ["0xfea4"],
            models: ["beastslayers-Game"],
            pattern_matching: "FixedLen",
          },
        },
      });

      const updateBeast = (game: any) => {
        setBeast(() => {
          const mappedBeast = {
            health: game.current_beast.value.get("health").value,
            level: game.current_beast.value.get("level").value,
          };

          // if health is 0, show toast
          if (mappedBeast.health <= 0) {
            toast(`Level ${mappedBeast.level} beast defeated`);
          }

          return mappedBeast;
        });
      };

      const game = Object.values(entities)[0]["beastslayers-Game"];
      updateBeast(game);

      subscription.current = await client.onEntityUpdated(
        [{ HashedKeys: Object.keys(entities) }],
        (_hashedKeys, models) => {
          const updatedGame = models["beastslayers-Game"];
          updateBeast(updatedGame);
        }
      );
    };

    fetchBeast();
  }, [client]);

  return beast;
}

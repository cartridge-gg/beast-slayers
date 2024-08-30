import { ToriiClient } from '@dojoengine/torii-wasm';
import { useState, useEffect } from 'react';

export interface Beast {
  health: number;
  level: number;
}

export function useBeast(client?: ToriiClient) {
  const [beast, setBeast] = useState<Beast>({ health: 100, level: 1 });

  useEffect(() => {
    if (!client) return;

    const fetchBeast = async () => {
      const entities = await client.getEntities({
        limit: 1,
        offset: 0,
        clause: {
          Keys: {
            keys: [undefined],
            models: ["beastslayers-Game"],
            pattern_matching: "FixedLen",
          },
        },
      });

      const updateBeast = (game: any) => {
        setBeast({
          health: game.current_beast.value.get("health").value,
          level: game.current_beast.value.get("level").value,
        });
      };

      const game = Object.values(entities)[0]["beastslayers-Game"];
      updateBeast(game);

      client.onEntityUpdated([{HashedKeys: Object.keys(entities)}], (entity) => {
        const updatedGame = entity["beastslayers-Game"];
        updateBeast(updatedGame);
      });
    };

    fetchBeast();
  }, [client]);

  return beast;
}
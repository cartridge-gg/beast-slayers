import { ToriiClient } from "@dojoengine/torii-wasm";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export interface Warrior {
  address: string;
  level: number;
  last_mega_attack: number;
  score: number;
}

export function useWarrior(client?: ToriiClient, address?: string) {
  const [warrior, setWarrior] = useState<Warrior | null>(null);

  useEffect(() => {
    if (!client || !address) return;

    const fetchWarrior = async () => {
      const entities = await client.getEntities({
        limit: 1,
        offset: 0,
        clause: {
          Keys: {
            keys: [address],
            models: ["beastslayers-Warrior"],
            pattern_matching: "FixedLen",
          },
        },
      });

      if (Object.keys(entities).length === 0) {
        return;
      }

      const updateWarrior = (warriorData: any) => {
        setWarrior((oldWarrior) => {
          const mappedWarrior = {
            address: warriorData.address.value,
            level: warriorData.level.value,
            last_mega_attack: warriorData.last_mega_attack.value,
            score: warriorData.score.value,
          };

          if (mappedWarrior.level > (oldWarrior?.level || 0)) {
            toast.success(`Leveled up! ${mappedWarrior.level}`);
            console.log("Leveled up!");
          }

          if (mappedWarrior.score > (oldWarrior?.score || 0)) {
            toast.success(`+${mappedWarrior.score - oldWarrior?.score}`);
            console.log("Score updated!");
          }

          return mappedWarrior;
        });
      };

      const warriorEntity = Object.values(entities)[0]["beastslayers-Warrior"];
      if (warriorEntity) {
        updateWarrior(warriorEntity);
      }

      client.onEntityUpdated(
        [{ HashedKeys: Object.keys(entities) }],
        (entity) => {
          const updatedWarrior = entity["beastslayers-Warrior"];
          if (updatedWarrior) {
            updateWarrior(updatedWarrior);
          }
        }
      );
    };

    fetchWarrior();
  }, [client, address]);

  return warrior;
}
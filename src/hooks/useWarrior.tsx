import { ToriiClient } from "@dojoengine/torii-wasm";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

export interface Warrior {
  address: string;
  level: number;
  score: number;
  unclaimed_tokens: bigint;
}

export function useWarrior(client?: ToriiClient, address?: string) {
  const [warrior, setWarrior] = useState<Warrior | undefined>();
  const subscription = useRef<any>();

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
            score: warriorData.score.value,
            unclaimed_tokens: BigInt(warriorData.unclaimed_tokens.value),
          };

          if (mappedWarrior.level > (oldWarrior?.level || 0)) {
            toast(`Leveled up! ${mappedWarrior.level}`);
          }

          if (mappedWarrior.score > (oldWarrior?.score || 0)) {
            toast(`New score: ${mappedWarrior.score}`);
          }

          return mappedWarrior;
        });
      };

      const warriorEntity = Object.values(entities)[0]["beastslayers-Warrior"];
      if (warriorEntity) {
        updateWarrior(warriorEntity);
      }

      subscription.current = await client.onEntityUpdated(
        [{ HashedKeys: Object.keys(entities) }],
        (_hashedKeys, models) => {
          const updatedWarrior = models["beastslayers-Warrior"];
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

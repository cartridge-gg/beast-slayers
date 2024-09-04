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
  const [warrior, setWarrior] = useState<Warrior>({
    address,
    level: 0,
    score: 0,
    unclaimed_tokens: BigInt(0),
  });
  const subscription = useRef<any>();


  const updateWarrior = (warriorData: any) => {
    setWarrior((oldWarrior) => {
      console.log(warriorData);
      const mappedWarrior = {
        address: warriorData.address.value,
        level: warriorData.level.value,
        score: warriorData.score.value,
        unclaimed_tokens: BigInt('0x' +warriorData.unclaimed_tokens.value),
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

      updateWarrior(Object.values(entities)[0]["beastslayers-Warrior"]);
    };

    const subscribeToWarrior = async () => {
      subscription.current = await client.onEntityUpdated(
        [{ Keys: { keys: [address], models: ["beastslayers-Warrior"], pattern_matching: "FixedLen" } }],
        (_hashedKeys, models) => {
          const updatedWarrior = models["beastslayers-Warrior"];
          if (updatedWarrior) {
            updateWarrior(updatedWarrior);
          }
        }
      );
    };

    fetchWarrior();
    subscribeToWarrior();
  }, [client, address]);

  return warrior;
}

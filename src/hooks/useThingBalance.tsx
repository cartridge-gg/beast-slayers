import { ToriiClient } from "@dojoengine/torii-wasm";
import { useState, useEffect, useRef } from "react";

export function useThingBalance(client?: ToriiClient, address?: string) {
  const [balance, setBalance] = useState<bigint>(BigInt(0));
  const subscription = useRef<any>();

  const updateBalance = (balanceData: any) => {
    setBalance(() => {
      return BigInt('0x' + balanceData.amount.value);
    });
  };

  useEffect(() => {
    if (!client || !address) return;

    const fetchBalance = async () => {
      const entities = await client.getEntities({
        limit: 1,
        offset: 0,
        clause: {
          Keys: {
            keys: [undefined, address],
            models: ["beastslayers-ERC20BalanceModel"],
            pattern_matching: "FixedLen",
          },
        },
      });

      if (Object.keys(entities).length === 0) {
        return;
      }

      updateBalance(Object.values(entities)[0]["beastslayers-ERC20BalanceModel"]);
    };

    const subscribeToBalance = async () => {
      subscription.current = await client.onEntityUpdated(
        [{ Keys: { keys: [undefined, address], models: ["beastslayers-ERC20BalanceModel"], pattern_matching: "FixedLen" } }],
        (_hashedKeys, models) => {
          const updatedBalance = models["beastslayers-ERC20BalanceModel"];
          if (updatedBalance) {
            updateBalance(updatedBalance);
          }
        }
      );
    };

    fetchBalance();
    subscribeToBalance();
  }, [client, address]);

  return balance;
}
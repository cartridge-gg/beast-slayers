import { ToriiClient } from "@dojoengine/torii-wasm";
import { useState, useEffect, useRef } from "react";

export interface ThingBalance {
  address: string;
  balance: bigint;
}

export function useThingBalance(client?: ToriiClient, address?: string) {
  const [balance, setBalance] = useState<ThingBalance | undefined>();
  const subscription = useRef<any>();

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

      const updateBalance = (balanceData: any) => {
        setBalance(() => {
          const mappedBalance = {
            address: balanceData.address.value,
            balance: BigInt(balanceData.balance.value),
          };

          return mappedBalance;
        });
      };

      const balanceEntity = Object.values(entities)[0]["beastslayers-ERC20BalanceModel"];
      if (balanceEntity) {
        updateBalance(balanceEntity);
      }

      subscription.current = await client.onEntityUpdated(
        [{ HashedKeys: Object.keys(entities) }],
        (_hashedKeys, models) => {
          const updatedBalance = models["beastslayers-ERC20BalanceModel"];
          if (updatedBalance) {
            updateBalance(updatedBalance);
          }
        }
      );
    };

    fetchBalance();

    return () => {
      if (subscription.current) {
        subscription.current.unsubscribe();
      }
    };
  }, [client, address]);

  return balance;
}
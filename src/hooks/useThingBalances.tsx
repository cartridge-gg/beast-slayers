import { ToriiClient } from "@dojoengine/torii-wasm";
import { useState, useEffect, useRef } from "react";

export function useThingBalances(client?: ToriiClient) {
  const [balances, setBalances] = useState<Record<string, bigint>>({});
  const subscription = useRef<any>();

  const updateBalance = (balanceData: any) => {
    setBalances((prevBalances) => {
      const newBalances = { ...prevBalances };
      newBalances[balanceData.account?.value ?? balanceData.account] = BigInt(
        "0x" + (balanceData.amount?.value ?? balanceData.amount)
      );
      return newBalances;
    });
  };

  useEffect(() => {
    if (!client) return;

    const fetchBalances = async () => {
      const entities = await client.getEntities({
        limit: 1000,
        offset: 0,
        clause: {
          Keys: {
            keys: [undefined, undefined],
            models: ["beastslayers-ERC20BalanceModel"],
            pattern_matching: "FixedLen",
          },
        },
      });

      if (Object.keys(entities).length === 0) {
        return;
      }

      setBalances((prevBalances) => {
        const newBalances = { ...prevBalances };
        Object.values(entities).forEach((entity) => {
          const balanceData = entity["beastslayers-ERC20BalanceModel"] as any;
          newBalances[balanceData.account.value] = BigInt(
            "0x" + balanceData.amount.value
          );
        });
        return newBalances;
      });
    };

    const subscribeToBalance = async () => {
      subscription.current = await client.onEntityUpdated(
        [
          {
            Keys: {
              keys: [undefined, undefined],
              models: ["beastslayers-ERC20BalanceModel"],
              pattern_matching: "FixedLen",
            },
          },
        ],
        (_hashedKeys, models) => {
          const updatedBalance = models["beastslayers-ERC20BalanceModel"];
          if (updatedBalance) {
            updateBalance(updatedBalance);
          }
        }
      );
    };

    fetchBalances();
    subscribeToBalance();
  }, [client]);

  return { balances, optimisticallyUpdateBalance: updateBalance };
}

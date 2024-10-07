import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import {
  cloudStorage,
  miniApp,
  // mockTelegramEnv,
  openLink,
  retrieveLaunchParams,
} from "@telegram-apps/sdk-react";
import * as Dojo from "@dojoengine/torii-wasm";
import { KEYCHAIN_URL, POLICIES, REDIRECT_URI, RPC_URL } from "../constants";
import encodeUrl from "encodeurl";
import { CartridgeSessionAccount } from "@/lib/account-wasm";

interface AccountStorage {
  username: string;
  address: string;
  ownerGuid: string;
  transactionHash?: string;
  expiresAt: string;
}

interface SessionSigner {
  privateKey: string;
  publicKey: string;
}

interface AccountContextType {
  accountStorage: AccountStorage | undefined;
  sessionSigner: SessionSigner | undefined;
  account: CartridgeSessionAccount | undefined;
  openConnectionPage: () => void;
  clearSession: () => void;
  address: string | undefined;
  username: string | undefined;
}

// if (!window?.["Telegram"]) {
//   mockTelegramEnv({
//     themeParams: {
//       accentTextColor: "#6ab2f2",
//       bgColor: "#17212b",
//       buttonColor: "#5288c1",
//       buttonTextColor: "#ffffff",
//       destructiveTextColor: "#ec3942",
//       headerBgColor: "#17212b",
//       hintColor: "#708499",
//       linkColor: "#6ab3f3",
//       secondaryBgColor: "#232e3c",
//       sectionBgColor: "#17212b",
//       sectionHeaderTextColor: "#6ab3f3",
//       subtitleTextColor: "#708499",
//       textColor: "#f5f5f5",
//     },
//     startParam: (() => {
//       const url = new URL(window.location.href);
//       return url.searchParams.get("startapp");
//     })(),
//     version: "7.2",
//     platform: "web",
//   });
// }

// const storage = retrieveLaunchParams().platform !== "web"
//   ? {
//       get: (key: string) => cloudStorage.getItem(key),
//       set: (key: string, value: string) => cloudStorage.setItem(key, value),
//       delete: (key: string) => cloudStorage.deleteItem(key),
//     }
//   : {
//       get: (key: string): Promise<string | null> =>
//         new Promise((resolve) => resolve(localStorage.getItem(key))),
//       set: (key: string, value: string): Promise<void> =>
//         new Promise((resolve) => resolve(localStorage.setItem(key, value))),
//       delete: (key: string): Promise<void> =>
//         new Promise((resolve) => resolve(localStorage.removeItem(key))),
//     };

const storage = {
  get: (key: string) => cloudStorage.getItem(key),
  set: (key: string, value: string) => cloudStorage.setItem(key, value),
  delete: (key: string) => cloudStorage.deleteItem(key),
};

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const AccountProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [accountStorage, setAccountStorage] = useState<AccountStorage>();
  const [sessionSigner, setSessionSigner] = useState<SessionSigner>();

  useEffect(() => {
    storage.get("sessionSigner").then(async (signer) => {
      if (signer) return setSessionSigner(JSON.parse(signer) as SessionSigner);

      const privateKey = Dojo.signingKeyNew();
      const publicKey = Dojo.verifyingKeyNew(privateKey);

      const newSigner = { privateKey, publicKey };
      await storage.set("sessionSigner", JSON.stringify(newSigner));
      setSessionSigner(newSigner);
    });

    storage.get("account").then(async (account) => {
      if (account) {
        const parsedAccount = JSON.parse(account) as AccountStorage;
        if (
          !parsedAccount.address ||
          !parsedAccount.ownerGuid ||
          !parsedAccount.expiresAt
        ) {
          return await storage.delete("account");
        }
        setAccountStorage(parsedAccount);
      }
    });
  }, []);

  useEffect(() => {
    const initData = retrieveLaunchParams();
    if (!initData?.startParam) return;

    const cartridgeAccount = JSON.parse(
      atob(initData.startParam)
    ) as AccountStorage;
    storage.set("account", JSON.stringify(cartridgeAccount)).then(() => {
      setAccountStorage(cartridgeAccount);
    });
  }, []);

  const account = useMemo(() => {
    if (!accountStorage || !sessionSigner) return;

    return CartridgeSessionAccount.new_as_registered(
      RPC_URL,
      sessionSigner.privateKey,
      accountStorage.address,
      accountStorage.ownerGuid,
      Dojo.cairoShortStringToFelt("SN_MAIN"),
      {
        expiresAt: Number(accountStorage.expiresAt),
        policies: POLICIES,
      }
    );
  }, [accountStorage, sessionSigner]);

  const openConnectionPage = () => {
    const { platform } = retrieveLaunchParams();

    if (!sessionSigner) {
      const privateKey = Dojo.signingKeyNew();
      const publicKey = Dojo.verifyingKeyNew(privateKey);

      const newSigner = { privateKey, publicKey };
      storage.set("sessionSigner", JSON.stringify(newSigner)).then(() => {
        setSessionSigner(newSigner);
      });
      return;
    }

    if (platform === "web") {
      window.location.href = encodeUrl(
        `${KEYCHAIN_URL}/session?public_key=${
          sessionSigner.publicKey
        }&redirect_uri=${
          window.location.href
        }&redirect_query_name=startapp&policies=${JSON.stringify(
          POLICIES
        )}&rpc_url=${RPC_URL}`
      );
      return;
    }

    openLink(
      encodeUrl(
        `${KEYCHAIN_URL}/session?public_key=${
          sessionSigner.publicKey
        }&redirect_uri=${REDIRECT_URI}&redirect_query_name=startapp&policies=${JSON.stringify(
          POLICIES
        )}&rpc_url=${RPC_URL}`
      )
    );
    miniApp.close();
  };

  const clearSession = () => {
    storage.delete("sessionSigner").then(() => {
      setSessionSigner(undefined);
    });
    storage.delete("account").then(() => {
      setAccountStorage(undefined);
    });
  };

  const value = {
    accountStorage,
    sessionSigner,
    account,
    openConnectionPage,
    clearSession,
    address: accountStorage?.address,
    username: accountStorage?.username,
  };

  return (
    <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
  );
};

export const useAccount = () => {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error("useAccount must be used within an AccountProvider");
  }
  return context;
};

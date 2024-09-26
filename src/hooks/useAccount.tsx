import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { mockTelegramEnv, useCloudStorage, useLaunchParams, useMiniApp, useUtils } from "@telegram-apps/sdk-react";
import * as Dojo from "@dojoengine/torii-wasm";
import { KEYCHAIN_URL, POLICIES, REDIRECT_URI, RPC_URL } from "../constants";
import encodeUrl from "encodeurl";
import { CartridgeSessionAccount } from "@cartridge/account-wasm"

interface AccountStorage {
  username: string;
  address: string;
  ownerGuid: string;
  transactionHash?: string;
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

if (!window?.['Telegram']) {
  mockTelegramEnv({
    themeParams: {
      accentTextColor: '#6ab2f2',
      bgColor: '#17212b',
      buttonColor: '#5288c1',
      buttonTextColor: '#ffffff',
      destructiveTextColor: '#ec3942',
      headerBgColor: '#17212b',
      hintColor: '#708499',
      linkColor: '#6ab3f3',
      secondaryBgColor: '#232e3c',
      sectionBgColor: '#17212b',
      sectionHeaderTextColor: '#6ab3f3',
      subtitleTextColor: '#708499',
      textColor: '#f5f5f5',
    },
    version: '7.2',
    platform: 'tdesktop',
  });
  
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const AccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { initData } = useLaunchParams();
  const storage = useCloudStorage();
  const utils = useUtils();
  const miniApp = useMiniApp();

  const [accountStorage, setAccountStorage] = useState<AccountStorage>();
  const [sessionSigner, setSessionSigner] = useState<SessionSigner>();

  useEffect(() => {
    storage.get("sessionSigner").then((signer) => {
      if (signer) return setSessionSigner(JSON.parse(signer) as SessionSigner);

      const privateKey = Dojo.signingKeyNew();
      const publicKey = Dojo.verifyingKeyNew(privateKey);

      const newSigner = { privateKey, publicKey };
      storage.set("sessionSigner", JSON.stringify(newSigner));
      setSessionSigner(newSigner);
    });

    storage.get("account").then((account) => {
      if (account) {
        const parsedAccount = JSON.parse(account) as AccountStorage;
        if (!parsedAccount.address || !parsedAccount.ownerGuid) {
          return storage.delete("account");
        }
        setAccountStorage(parsedAccount);
      }
    });
  }, [storage]);

  useEffect(() => {
    if (!initData?.startParam) return;

    const cartridgeAccount = JSON.parse(atob(initData.startParam)) as AccountStorage;
    storage.set("account", JSON.stringify(cartridgeAccount));
    setAccountStorage(cartridgeAccount);
  }, [initData, storage]);

  const account = useMemo(() => {
    if (!accountStorage || !sessionSigner) return;

    return CartridgeSessionAccount.new_as_registered(
      RPC_URL,
      sessionSigner.privateKey,
      accountStorage.address,
      accountStorage.ownerGuid,
      Dojo.cairoShortStringToFelt("SN_MAINNET"),
      {
        expiresAt: 3000000000,
        policies: POLICIES,
      }
    );
  }, [accountStorage, sessionSigner]);

  const openConnectionPage = () => {
    if (!sessionSigner) {
      const privateKey = Dojo.signingKeyNew();
      const publicKey = Dojo.verifyingKeyNew(privateKey);

      const newSigner = { privateKey, publicKey };
      storage.set("sessionSigner", JSON.stringify(newSigner));
      setSessionSigner(newSigner);
      return;
    }
    
    utils.openLink(
      encodeUrl(
        `${KEYCHAIN_URL}/session?public_key=${sessionSigner.publicKey}&redirect_uri=${REDIRECT_URI}&redirect_query_name=startapp&policies=${JSON.stringify(POLICIES)}&rpc_url=${RPC_URL}`
      )
    );
    miniApp.close();
  };

  const clearSession = () => {
    storage.delete("sessionSigner");
    storage.delete("account");
    setSessionSigner(undefined);
    setAccountStorage(undefined);
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

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
};

export const useAccount = () => {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
};
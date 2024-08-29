import "./App.css";

import {
  mockTelegramEnv,
  useCloudStorage,
  useLaunchParams,
  useUtils,
} from "@telegram-apps/sdk-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CartridgeSessionAccount } from "./account-wasm/account_wasm";
import * as Dojo from "@dojoengine/torii-wasm";
import { KEYCHAIN_URL, POLICIES, REDIRECT_URI, RPC_URL } from "./constants";
import encodeUrl from "encodeurl";
import { loadFull } from "tsparticles";
import Particles, { initParticlesEngine } from "@tsparticles/react";
// import { useBiometryManager, useSettingsButton } from '@telegram-apps/sdk-react'
// import { useEffect } from 'react'

interface AccountStorage {
  username: string;
  address: string;
  transactionHash?: string;
}

interface SessionSigner {
  privateKey: string;
  publicKey: string;
}

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

function App() {
  const { initData } = useLaunchParams();

  // const bm = useBiometryManager();
  const storage = useCloudStorage();

  const [accountStorage, setAccountStorage] = useState<AccountStorage>();
  const [sessionSigner, setSessionSigner] = useState<SessionSigner>();

  useEffect(() => {
    storage.get("sessionSigner").then((signer) => {
      if (signer) return setSessionSigner(JSON.parse(signer) as SessionSigner);

      const privateKey = Dojo.signingKeyNew();
      const publicKey = Dojo.verifyingKeyNew(privateKey);

      storage.set(
        "sessionSigner",
        JSON.stringify({
          privateKey,
          publicKey,
        })
      );

      setSessionSigner({
        privateKey,
        publicKey,
      });
    });

    storage.get("account").then((account) => {
      if (account) {
        const parsedAccount = JSON.parse(account) as AccountStorage;
        if (!parsedAccount.address) {
          return storage.delete("account");
        }

        setAccountStorage(JSON.parse(account) as AccountStorage);
      }
    });
  }, [storage]);

  const account = useMemo(() => {
    if (!accountStorage || !sessionSigner) return;

    return CartridgeSessionAccount.new_as_registered(
      RPC_URL,
      sessionSigner.privateKey,
      accountStorage.address,
      sessionSigner.publicKey,
      Dojo.cairoShortStringToFelt("SN_SEPOLIA"),
      {
        expiresAt: 3000000000,
        policies: POLICIES,
      }
    );
  }, [accountStorage, sessionSigner]);
  console.log(account);

  useEffect(() => {
    if (!initData?.startParam) return;

    const cartridgeAccount = JSON.parse(
      atob(initData.startParam)
    ) as AccountStorage;

    storage.set("account", JSON.stringify(cartridgeAccount));
  }, [initData, storage]);

  const utils = useUtils();

  const openConnectionPage = useCallback(() => {
    if (!sessionSigner) {
      const privateKey = Dojo.signingKeyNew();
      const publicKey = Dojo.verifyingKeyNew(privateKey);

      storage.set(
        "sessionSigner",
        JSON.stringify({
          privateKey,
          publicKey,
        })
      );

      setSessionSigner({
        privateKey,
        publicKey,
      });

      return;
    }

    utils.openLink(
      encodeUrl(
        `${KEYCHAIN_URL}/session?public_key=${
          sessionSigner.publicKey
        }&redirect_uri=${REDIRECT_URI}&redirect_query_name=startapp&policies=${JSON.stringify(
          POLICIES
        )}`
      )
    );
  }, [sessionSigner, utils, storage]);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      // you can initiate the tsParticles instance (engine) here, adding custom shapes or presets
      // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
      // starting from v2 you can add only the features you need reducing the bundle size
      //await loadAll(engine);
      //await loadFull(engine);
      await loadFull(engine);
      //await loadBasic(engine);
    });
  }, []);

  return (
    <div style={{
      position: "relative",
      flex: 1,
    }}>
      <Particles
        options={{
          fpsLimit: 120,
          particles: {
            groups: {
              z5000: {
                number: {
                  value: 70,
                },
                zIndex: {
                  value: 5000,
                },
              },
              z7500: {
                number: {
                  value: 30,
                },
                zIndex: {
                  value: 75,
                },
              },
              z2500: {
                number: {
                  value: 50,
                },
                zIndex: {
                  value: 25,
                },
              },
              z1000: {
                number: {
                  value: 40,
                },
                zIndex: {
                  value: 10,
                },
              },
            },
            number: {
              value: 200,
              density: {
                enable: false,
                height: 800,
                width: 800,
              },
            },
            color: {
              value: "#fff",
              animation: {
                enable: false,
                speed: 20,
                sync: true,
              },
            },
            shape: {
              type: "circle",
            },
            opacity: {
              value: { min: 0.1, max: 1 },
              animation: {
                enable: false,
                speed: 3,
                sync: false,
              },
            },
            size: {
              value: 3,
            },
            move: {
              angle: {
                value: 10,
                offset: 0,
              },
              enable: true,
              speed: 5,
              direction: "right",
              random: false,
              straight: true,
              outModes: "out",
            },
            zIndex: {
              value: 5,
              opacityRate: 0.5,
            },
          },
          interactivity: {
            detectsOn: "canvas",
            events: {
              onHover: {
                enable: false,
                mode: "repulse",
              },
              onClick: {
                enable: true,
                mode: "push",
              },
              resize: {
                enable: true,
              },
            },
            modes: {
              grab: {
                distance: 400,
                links: {
                  opacity: 1,
                },
              },
              bubble: {
                distance: 400,
                size: 40,
                duration: 2,
                opacity: 0.8,
              },
              repulse: {
                distance: 200,
              },
              push: {
                quantity: 4,
                groups: ["z5000", "z7500", "z2500", "z1000"],
              },
              remove: {
                quantity: 2,
              },
            },
          },
          detectRetina: true,
          background: {
            color: "#000000",
          },
        }}
      />
      <div style={{
        zIndex: 10000
      }}>
        <div className="card">
          <button onClick={openConnectionPage}>Connect</button>
        </div>
        <div className="card">
          <button
            onClick={() => {
              storage.delete("sessionSigner");
              storage.delete("account");
              setSessionSigner(undefined);
              setAccountStorage(undefined);
            }}
          >
            Clear session and account
          </button>
        </div>
        <div className="card">{JSON.stringify(sessionSigner)}</div>
        <div className="card">{JSON.stringify(accountStorage)}</div>
      </div>
    </div>
  );
}

export default App;

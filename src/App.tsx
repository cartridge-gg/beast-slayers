import reactLogo from './assets/react.svg'
import twaLogo from './assets/tapps.png'
import viteLogo from '/vite.svg'
import './App.css'

import { useCloudStorage, useLaunchParams } from '@telegram-apps/sdk-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CartridgeSessionAccount } from './account-wasm/account_wasm'
import * as Dojo from '@dojoengine/torii-wasm'
import { KEYCHAIN_URL, POLICIES, REDIRECT_URI, RPC_URL } from './constants'
// import { useBiometryManager, useSettingsButton } from '@telegram-apps/sdk-react'
// import { useEffect } from 'react'

interface AccountStorage {
  username: string
  address: string
  webauthnPublicKey: string
}

interface SessionSigner {
  privateKey: string
  publicKey: string
}

function App() {
  const { initData } = useLaunchParams()

  // const bm = useBiometryManager();
  const storage = useCloudStorage()

  const [accountStorage, setAccountStorage] = useState<AccountStorage>()
  const [sessionSigner, setSessionSigner] = useState<SessionSigner>()

  useEffect(() => {
    storage.get('sessionSigner').then(signer => {
      if (signer) return setSessionSigner(JSON.parse(signer) as SessionSigner)

      const privateKey = Dojo.signingKeyNew()
      const publicKey = Dojo.verifyingKeyNew(privateKey)

      storage.set('sessionSigner', JSON.stringify({
        privateKey,
        publicKey
      }))

      setSessionSigner({
        privateKey,
        publicKey
      })
    })

    storage.get('account').then(account => {
      if (account) return setAccountStorage(JSON.parse(account) as AccountStorage)
    })
    
  }, [storage])

  const account = useMemo(() => {
    if (!accountStorage || !sessionSigner) return
    
    return CartridgeSessionAccount.new_as_registered(RPC_URL, sessionSigner.privateKey, accountStorage.address, accountStorage.webauthnPublicKey, Dojo.cairoShortStringToFelt('SN_SEPOLIA'), {
      expiresAt: 3000000000,
      policies: POLICIES
    })
  }, [accountStorage, sessionSigner])
  console.log(account)

  useEffect(() => {
    if (!initData?.startParam) return
    
    const cartridgeAccount = JSON.parse(atob(initData.startParam)) as { username: string, address: string, webauthnPublicKey: string, transactionHash?: string }

    storage.set('account', JSON.stringify({
      username: cartridgeAccount.username,
      address: cartridgeAccount.address,
      webauthnPublicKey: cartridgeAccount.webauthnPublicKey
    }))
  }, [initData, storage])

  return (
    <>
      <div>
        <a href="https://ton.org/dev" target="_blank">
          <img src={twaLogo} className="logo" alt="TWA logo" />
        </a>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>TWA + Vite + React</h1>
      <div className="card">
        <button>
        <Link to={encodeURI(`${KEYCHAIN_URL}/session?public_key=${sessionSigner?.publicKey}&redirect_uri=${REDIRECT_URI}&redirect_query_name=startapp&policies=${JSON.stringify(POLICIES)}`)}>Connect controller</Link>
        </button>
      </div>
      <div className="card">
        {JSON.stringify(sessionSigner)}
      </div>
      <div className="card">
        {JSON.stringify(accountStorage)}
      </div>
    </>
  )
}

export default App

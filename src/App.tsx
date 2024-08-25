import reactLogo from './assets/react.svg'
import twaLogo from './assets/tapps.png'
import viteLogo from '/vite.svg'
import './App.css'

import { useBiometryManagerRaw, useLaunchParams } from '@telegram-apps/sdk-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
// import { useBiometryManager, useSettingsButton } from '@telegram-apps/sdk-react'
// import { useEffect } from 'react'

function App() {
  const launchParams = useLaunchParams()

  const policies = JSON.stringify([
    {
      target: '0x77d04bd307605c021a1def7987278475342f4ea2581f7c49930e9269bedf476',
      method: 'flip',
      description: 'Flip a tile at given x and y coordinates'
    }
  ])

  const callbackUri = 'https://localhost:5173/callback'

  const bm = useBiometryManagerRaw();


  useEffect(() => {
    
  }, [])


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
      <span>
        launch params: {JSON.stringify(launchParams)}
      </span>
      <div className="card">
        <button>
        <Link to={encodeURI(`https://x.cartridge.gg/slot/session?policies=${policies}&callback_uri=${callbackUri}&username=nas&rpc_url=https://api.cartridge.gg/x/starknet/sepolia`)}>Connect controller</Link>
        </button>
      </div>

      <button onClick={() => {
        if (!bm.result) return
        bm.result.requestAccess({ reason: 'pwease'}).then(console.log)
      }}>
        gib data
      </button>
      <div className="card">
        <button onClick={() => {
          if (!bm.result) return
          bm.result.openSettings()
        }}>
            Bio settings
        </button>
      </div>
    </>
  )
}

export default App

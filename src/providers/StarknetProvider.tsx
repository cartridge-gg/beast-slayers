import { Chain, mainnet, sepolia } from '@starknet-react/chains'
import { StarknetConfig, starkscan } from '@starknet-react/core'
import { PropsWithChildren } from 'react'
import CartridgeConnector from '@cartridge/connector'
import { RpcProvider, shortString } from 'starknet'

export function StarknetProvider({ children }: PropsWithChildren) {
  return (
    <StarknetConfig autoConnect chains={[sepolia]} connectors={[cartridge]} explorer={starkscan} provider={provider}>
      {children}
    </StarknetConfig>
  )
}

const cartridge = new CartridgeConnector(
  [
    {
      target: '0x77d04bd307605c021a1def7987278475342f4ea2581f7c49930e9269bedf476',
      method: 'flip',
      description: 'Flip a tile at given x and y coordinates'
    }
  ],
  {
    url: 'https://x.cartridge.gg',
    rpc: 'https://api.cartridge.gg/x/starknet/sepolia',
    paymaster: {
      caller: shortString.encodeShortString('ANY_CALLER'),
    },
    theme: 'flippyflop',
  },
)

function provider(chain: Chain) {
  switch (chain) {
    case mainnet:
      return new RpcProvider({
        nodeUrl: 'https://api.cartridge.gg/x/starknet/mainnet',
      })
    case sepolia:
    default:
      return new RpcProvider({
        nodeUrl: 'https://api.cartridge.gg/x/starknet/sepolia',
      })
  }
}

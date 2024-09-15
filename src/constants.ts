export const TORII_URL = "https://api.cartridge.gg/x/beastslayers/torii";
export const RELAY_URL = "/ip4/127.0.0.1/udp/9091/webrtc-direct";
export const RPC_URL = "https://api.cartridge.gg/x/starknet/sepolia?paymaster=true";
export const KEYCHAIN_URL = "https://x.cartridge.gg";
export const REDIRECT_URI = "https://t.me/hitthingbot/hitthing";
export const WORLD_ADDRESS =
  "0x240632e5177b1668147c57d2fb775022bebf3d2ed7bf84abf0b90f9a17343ad";
export const ACTIONS_ADDRESS =
  "0x03661Ea5946211b312e8eC71B94550928e8Fd3D3806e43c6d60F41a6c5203645";

export const POLICIES = [
  {
    target: "0x03661Ea5946211b312e8eC71B94550928e8Fd3D3806e43c6d60F41a6c5203645",
    method: "attack",
    description: "Attack the beast",
  },
  {
    target: "0x03661Ea5946211b312e8eC71B94550928e8Fd3D3806e43c6d60F41a6c5203645",
    method: "claim",
    description: "Claim your tokens",
  },
];

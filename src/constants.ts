export const TORII_URL = "https://api.cartridge.gg/x/beastslayers/torii";
export const RELAY_URL = "/ip4/127.0.0.1/udp/9091/webrtc-direct";
export const RPC_URL = "https://api.cartridge.gg/x/starknet/sepolia";
export const KEYCHAIN_URL = "https://x.cartridge.gg";
export const REDIRECT_URI = "https://t.me/beastslayersbot/play";
export const WORLD_ADDRESS =
  "0x07490d09682fa20ac92f68ab58ec647bef84806408bc39cfbf2d44422b5aff13";
export const ACTIONS_ADDRESS =
  "0x05911a30613b3c48d6e990681db6be1c5d8126c4b7b3fabf24a1dcfd2880004b";

export const POLICIES = [
  {
    target: "0x05911a30613b3c48d6e990681db6be1c5d8126c4b7b3fabf24a1dcfd2880004b",
    method: "attack",
    description: "Attack the beast",
  },
  {
    target: "0x05911a30613b3c48d6e990681db6be1c5d8126c4b7b3fabf24a1dcfd2880004b",
    method: "mega_attack",
    description: "Mega attack the beast",
  },
];

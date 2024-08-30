export const TORII_URL = "https://api.cartridge.gg/x/beastslayers/torii";
export const RELAY_URL = "/ip4/127.0.0.1/udp/9091/webrtc-direct";
export const RPC_URL = "https://api.cartridge.gg/x/starknet/sepolia";
export const KEYCHAIN_URL = "https://x.cartridge.gg";
export const REDIRECT_URI = "https://t.me/beastslayersbot/play";
export const WORLD_ADDRESS =
  "0x37c1bb061637b7b264c00658b325d5ef7d4d12bef3850d358f46a27ec60aeb5";
export const ACTIONS_ADDRESS =
  "0x05fb7ed5efdb120694ca24b2f07343b8349d99cca58662866d5eda2dbc1e7720";

export const POLICIES = [
  {
    target: "0x05fb7ed5efdb120694ca24b2f07343b8349d99cca58662866d5eda2dbc1e7720",
    method: "attack",
    description: "Attack the beast",
  },
  {
    target: "0x05fb7ed5efdb120694ca24b2f07343b8349d99cca58662866d5eda2dbc1e7720",
    method: "mega_attack",
    description: "Mega attack the beast",
  },
];

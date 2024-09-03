# Beast Slayers

Beast Slayers is a simple yet addictive game built using Dojo on Telegram, where players need to spam click to defeat increasingly powerful beasts. The game integrates the cartridge Controller and the Dojo wasm bindings for syncing with the on-chain game state.

## Controller integration

1. We generate a local Stark key pair for the user and store the private key in Telegrams cloud storage.
2. We open the session controller page, passing the user's public key.
3. The controller registers the session public key and returns account information.
4. We create a controller session account on the client.
5. We store the account information in Telegrams cloud storage.

## Using the useAccount Hook

The `useAccount` hook provides an easy way to integrate the controller into your Telegram Mini App.

1. Import the hook:

   ```javascript
   import { useAccount } from "./path/to/AccountProvider";
   ```

2. Use the hook in your component:

   ```javascript
   function MyComponent() {
     const {
       accountStorage,
       sessionSigner,
       account,
       openConnectionPage,
       clearSession,
       address,
       username,
     } = useAccount();

     // Use the account information and functions as needed
   }
   ```

3. Available properties and functions:

   - `accountStorage`: Contains user account information (username, address, ownerGuid)
   - `sessionSigner`: Contains the session's private and public keys
   - `account`: The CartridgeSessionAccount instance
   - `openConnectionPage()`: Function to open the connection page for account setup
   - `clearSession()`: Function to clear the current session
   - `address`: The user's account address
   - `username`: The user's username

4. Ensure your app is wrapped with the AccountProvider:

   ```javascript
   import { AccountProvider } from "./path/to/AccountProvider";

   function App() {
     return <AccountProvider>{/* Your app components */}</AccountProvider>;
   }
   ```

## Dojo integration

1. We create a Torii client in the main App component:

   ```javascript
   const [client, setClient] = useState<ToriiClient | undefined>();

   useEffect(() => {
     createClient({
       toriiUrl: TORII_URL,
       rpcUrl: RPC_URL,
       relayUrl: RELAY_URL,
       worldAddress: WORLD_ADDRESS,
     }).then(setClient);
   }, []);
   ```

2. We subscribe to our game entities

   ```javascript
   const entities = await client.getEntities({
     limit: 1,
     offset: 0,
     clause: {
       Keys: {
         keys: ["0xfea4"], // or [address] for warrior
         models: ["beastslayers-Game"], // or ["beastslayers-Warrior"]
         pattern_matching: "FixedLen",
       },
     },
   });

   subscription.current = await client.onEntityUpdated(
     [{ HashedKeys: Object.keys(entities) }],
     (_hashedKeys, models) => {
       // Update local state based on the new data
     }
   );
   ```

3. We refresh the react state to update the UI

   ```javascript
   const game = Object.values(entities)[0]["beastslayers-Game"];
   updateBeast(game);
   ```

## Running the game

1. Clone the repo
2. Run `pnpm install`
3. Run `pnpm run dev`

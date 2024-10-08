import "./App.css";
import { useState, useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { useAccount, AccountProvider } from "./hooks/useAccount";
import { Button } from "./components/ui/button";
import useSound from "use-sound";
import crySoundFile from "./assets/sfx/cry.mp3";
import nooSoundFile from "./assets/sfx/noo.mp3";
import pssSoundFile from "./assets/sfx/pss.mp3";
import { createClient, ToriiClient } from "@dojoengine/torii-wasm";
import {
  ACTIONS_ADDRESS,
  RELAY_URL,
  RPC_URL,
  TORII_URL,
  WORLD_ADDRESS,
} from "./constants";
import { useBeast } from "./hooks/useBeast";
import { useWarrior } from "./hooks/useWarrior";
import toast from "react-hot-toast";
import { useViewport } from "@telegram-apps/sdk-react";
import { Leaderboard } from './Leaderboard';
import { useThingBalances } from "./hooks/useThingBalances";
import { FundWalletModal } from './FundWallet';

const getBeastColor = (level: number) => {
  if (level <= 2) return "hue-rotate-0";
  if (level <= 3) return "hue-rotate-60";
  if (level <= 4) return "hue-rotate-120";
  if (level <= 5) return "hue-rotate-180";
  return "hue-rotate-240";
};

function AppContent() {
  const viewport = useViewport();

  useEffect(() => {
    viewport?.expand();
  }, [viewport]);

  // Controller session
  const { account, openConnectionPage, address, clearSession, username } = useAccount();
  
  // Game
  const [particles, setParticles] = useState([]);
  const [burstParticles, setBurstParticles] = useState([]);
  const imageControls = useAnimation();
  const animationRef = useRef<number>();
  const [isDefeated, setIsDefeated] = useState(false);

  // Create Torii client
  const [client, setClient] = useState<ToriiClient | undefined>();
  useEffect(() => {
    createClient({
      toriiUrl: TORII_URL,
      rpcUrl: RPC_URL,
      relayUrl: RELAY_URL,
      worldAddress: WORLD_ADDRESS,
    }).then(setClient);
  }, []);

  // Fetch and subscribe to the beast
  const beast = useBeast(client);
  const warrior = useWarrior(client, address);
  const thingBalances = useThingBalances(client);

  // Create particles for the background
  useEffect(() => {
    const createParticle = () => ({
      id: Math.random(),
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      speedX: (Math.random() - 0.5) * 0.1,
      speedY: (Math.random() - 0.5) * 0.1,
    });

    setParticles(Array.from({ length: 100 }, createParticle));

    const animate = () => {
      setParticles((prevParticles) =>
        prevParticles.map((particle) => ({
          ...particle,
          x: (particle.x + particle.speedX + 100) % 100,
          y: (particle.y + particle.speedY + 100) % 100,
        }))
      );
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Particles when you click
  const createBurstParticle = (x, y) => ({
    id: Math.random(),
    x,
    y,
    size: Math.random() * 6 + 2,
    angle: Math.random() * 360,
    distance: Math.random() * 100 + 50,
  });

  const [playCry] = useSound(crySoundFile);
  const [playNoo] = useSound(nooSoundFile);
  const [playPss] = useSound(pssSoundFile);

  const playRandomSound = () => {
    const sounds = [playCry, playNoo, playPss];
    const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
    randomSound();
  };

  const [showFundWalletModal, setShowFundWalletModal] = useState(false);

  // Attack the beast
  const handleImageClick = async (event) => {
    if (!account) {
      openConnectionPage();
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Create burst particles
    const newBurstParticles = Array.from({ length: 20 }, () =>
      createBurstParticle(x, y)
    );
    setBurstParticles(newBurstParticles);

    // Animate image
    await imageControls.start({ scale: 0.95 });
    await imageControls.start({ scale: 1 });

    // Clear burst particles after animation
    setTimeout(() => setBurstParticles([]), 1000);

    playRandomSound();

    try {
      await account?.execute([
        {
          calldata: [],
          entrypoint: "attack",
          contractAddress: ACTIONS_ADDRESS,
        },
      ]);
    } catch (error) {
      if (error.toString().includes("session/not-registered")) {
        // If the user is not registered, open the connection page
        openConnectionPage();
      } else if (error.toString().includes("exceeds balance") || error.toString().includes("Account balance is smaller than the transaction's max_fee") || error.toString().includes("Paymaster not supported") || error.toString().includes("ValidationFailure")) {
        setShowFundWalletModal(true);
      } else {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    if (beast.health === 0 && !isDefeated) {
      setIsDefeated(true);
      imageControls.start({
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.5, ease: "easeInOut" },
      }).then(() => {
        setIsDefeated(false);
      });
    }
  }, [beast.health, imageControls, isDefeated]);

  // Add this new function to handle claiming tokens
  const handleClaimTokens = async () => {
    if (!account) {
      openConnectionPage();
      return;
    }

    try {
      await account.execute([
        {
          calldata: [],
          entrypoint: "claim",
          contractAddress: ACTIONS_ADDRESS,
        },
      ]);
      
      toast.success(`Claimed ${formatEth(warrior.unclaimed_tokens)} $THING`);
    } catch (error) {
      if (error.toString().includes("session/not-registered")) {
        // If the user is not registered, open the connection page
        openConnectionPage();
      } else if (error.toString().includes("exceeds balance") || error.toString().includes("Account balance is smaller than the transaction's max_fee") || error.toString().includes("Paymaster not supported") || error.toString().includes("ValidationFailure")) {
        setShowFundWalletModal(true);
      } else {
        toast.error("Failed to claim tokens");
        console.error(error);
      }
    }
  };

  const formatEth = (wei: bigint): string => {
    const eth = Number(wei) / 1e18;
    return eth.toFixed(2);
  };

  const [showLeaderboard, setShowLeaderboard] = useState(false);

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-black">
      <div className="absolute top-2 right-2 z-50">
        <Button
          className="bg-red-500 text-white text-xs py-1 px-2 hover:bg-red-600 transition-all"
          onClick={clearSession}
        >
          {username ? (
            <>
              {username} - {warrior?.level ? `LVL ${warrior.level}` : ''} ({`${formatEth(thingBalances?.[address] ?? 0n)} $THING`})
            </>
          ) : (
            'CLEAR'
          )}
        </Button>
      </div>

      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white opacity-50"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            x: ["0%", "100%", "0%"],
            y: ["0%", "100%", "0%"],
          }}
          transition={{
            duration: Math.random() * 20 + 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
      <div className="relative z-10 flex flex-col justify-between p-5 h-full">
        <div>
          <h1 className="text-white text-center mt-10 text-6xl">
            Hit Thing
          </h1>
          <Button
            className="bg-blue-500 text-white text-sm py-2 px-4 hover:bg-blue-600 transition-all absolute top-2 left-2"
            onClick={() => setShowLeaderboard(true)}
          >
            Leaderboard
          </Button>
        </div>
        <motion.div
          className="flex justify-center items-center h-1/2 w-full relative overflow-hidden"
          onClick={handleImageClick}
          animate={imageControls}
        >
          <motion.img
            src={`/image.png`}
            alt={`Level ${beast.level} Beast`}
            className={`max-h-full max-w-full object-contain ${getBeastColor(beast.level)}`}
            style={{
              width: `${Math.min(100 + (beast.level - 1) * 5, 200)}%`,
              height: `${Math.min(100 + (beast.level - 1) * 5, 200)}%`,
            }}
          />
          {burstParticles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full bg-white"
              style={{
                left: particle.x,
                top: particle.y,
                width: particle.size,
                height: particle.size,
              }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{
                x: `${Math.cos(particle.angle) * particle.distance}px`,
                y: `${Math.sin(particle.angle) * particle.distance}px`,
                scale: [0, 1, 0],
                opacity: [1, 1, 0],
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          ))}
        </motion.div>
        <div className="flex flex-col gap-2.5 max-h-[60%] overflow-y-auto">
          <Button
            className="bg-white text-black text-3xl py-8 hover:bg-white hover:text-black transition-all"
            onClick={openConnectionPage}
            disabled={!!account}
          >
            <span className="hover:scale-125 transition-all">
              {!account ? "Connect" : `Level ${beast.level} - ${beast.health}HP`}
            </span>
          </Button>
          {account && warrior && warrior.unclaimed_tokens > 0 && (
            <Button
              className="bg-yellow-500 text-black text-2xl py-6 hover:bg-yellow-400 transition-all"
              onClick={handleClaimTokens}
            >
              <span className="hover:scale-110 transition-all">
                Claim {formatEth(warrior.unclaimed_tokens)} $THING
              </span>
            </Button>
          )}
        </div>
      </div>
      {showLeaderboard && (
        <Leaderboard 
          client={client} 
          balances={thingBalances}
          onClose={() => setShowLeaderboard(false)} 
        />
      )}
      {showFundWalletModal && (
        <FundWalletModal 
          address={address}
          onClose={() => setShowFundWalletModal(false)} 
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AccountProvider>
      <AppContent />
    </AccountProvider>
  );
}

export default App;
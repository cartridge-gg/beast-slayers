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
import { useViewport } from "@telegram-apps/sdk-react";
// import { toast } from "sonner";
import { useBeast } from "./hooks/useBeast";
import { useWarrior } from "./hooks/useWarrior";

function AppContent() {
  const viewport = useViewport();
  useEffect(() => {
    viewport?.expand();
  }, [viewport]);

  const { account, openConnectionPage, address, clearSession } = useAccount();
  const [particles, setParticles] = useState([]);
  const [burstParticles, setBurstParticles] = useState([]);
  const imageControls = useAnimation();
  const animationRef = useRef<number>();
  const [isDefeated, setIsDefeated] = useState(false);

  // Add this function to determine the beast's color based on its level
  const getBeastColor = (level: number) => {
    if (level <= 2) return "hue-rotate-0";
    if (level <= 3) return "hue-rotate-60";
    if (level <= 4) return "hue-rotate-120";
    if (level <= 5) return "hue-rotate-180";
    return "hue-rotate-240";
  };

  const [client, setClient] = useState<ToriiClient | undefined>();

  useEffect(() => {
    createClient({
      toriiUrl: TORII_URL,
      rpcUrl: RPC_URL,
      relayUrl: RELAY_URL,
      worldAddress: WORLD_ADDRESS,
    }).then(setClient);
  }, []);

  const beast = useBeast(client);
  useWarrior(client, address);

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

  const handleImageClick = async (event) => {
    if (!account) return;

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
        openConnectionPage();
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

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-black">
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
        <Button
          className="absolute top-2 right-2 bg-red-500 text-white text-xs py-1 px-2 hover:bg-red-600 transition-all"
          onClick={clearSession}
        >
          Clear
        </Button>
        <div>
          <h1 className="text-white text-center mb-5 text-6xl">
            Beast Slayers
          </h1>
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
        </div>
      </div>
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

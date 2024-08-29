import "./App.css";
import { useEffect } from "react";
import { loadFull } from "tsparticles";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import toast from "react-hot-toast";
import { useAccount, AccountProvider } from "./hooks/useAccount";

function AppContent() {
  const { accountStorage, sessionSigner, account, openConnectionPage, clearSession } = useAccount();

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadFull(engine);
    });
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden">
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
      <div className="relative z-10 flex flex-col justify-between p-5 h-full">
        <div>
          <h1 className="text-white text-center mb-5 text-6xl">Beast Slayers</h1>
        </div>
        <div className="flex flex-col gap-2.5 max-h-[60%] overflow-y-auto">
          <button onClick={openConnectionPage} className="btn">
            Connect
          </button>
          <button onClick={clearSession} className="btn">
            Clear session and account
          </button>
          <button
            onClick={async () => {
              const tx = await account?.execute([
                {
                  calldata: [
                    Math.floor(Math.random() * 1000).toString(16),
                    Math.floor(Math.random() * 1000).toString(16),
                  ],
                  entrypoint: "flip",
                  contractAddress:
                    "0x77d04bd307605c021a1def7987278475342f4ea2581f7c49930e9269bedf476",
                },
              ]);
              toast.success(`Transaction hash: ${tx}`);
            }}
            className="btn"
          >
            Flip
          </button>
        </div>
        <div className="mt-5 max-h-[30%] overflow-y-auto">
          <div className="card">
            <strong>Session:</strong>
            <pre>{JSON.stringify(sessionSigner, null, 2)}</pre>
          </div>
          <div className="card">
            <strong>Account:</strong>
            <pre>{JSON.stringify(accountStorage, null, 2)}</pre>
          </div>
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

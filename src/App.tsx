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
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    }}>
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
      <div style={{
        position: "relative",
        zIndex: 2,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "20px",
        height: "100%"
      }}>
        <div>
          <h1 style={{ color: "#fff", textAlign: "center", marginBottom: "20px" }}>Dojo Flip</h1>
        </div>
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          maxHeight: "60%",
          overflowY: "auto"
        }}>
          <button onClick={openConnectionPage} style={buttonStyle}>Connect</button>
          <button onClick={clearSession} style={buttonStyle}>Clear session and account</button>
          <button
            onClick={async () => {
              toast(JSON.stringify(account))
              try {
                const tx = await account?.execute([
                  {
                    calldata: [(Math.floor(Math.random() * 1000)).toString(16), (Math.floor(Math.random() * 1000)).toString(16)],
                    entrypoint: "flip",
                    contractAddress:
                      "0x77d04bd307605c021a1def7987278475342f4ea2581f7c49930e9269bedf476",
                  },
                ]);
                toast.success(`Transaction hash: ${tx}`);
              } catch (e) {
                toast.error(`Error: ${e}`);
              }
            }}
            style={buttonStyle}
          >
            Flip
          </button>
        </div>
        <div style={{
          marginTop: "20px",
          maxHeight: "30%",
          overflowY: "auto"
        }}>
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

const buttonStyle = {
  padding: "10px 15px",
  fontSize: "16px",
  backgroundColor: "#5288c1",
  color: "#ffffff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer"
};

function App() {
  return (
    <AccountProvider>
      <AppContent />
    </AccountProvider>
  );
}

export default App;
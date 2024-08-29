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
          // ... (particle options remain the same)
        }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1
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
                    calldata: [(Math.random() * 1000).toString(), (Math.random() * 1000).toString()],
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
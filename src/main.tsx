import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { StarknetProvider } from "./providers/StarknetProvider.tsx";
import { SDKProvider } from "@telegram-apps/sdk-react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SDKProvider debug acceptCustomStyles>
      <StarknetProvider>
        <Router>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/callback" element={<App />} />
          </Routes>
        </Router>
      </StarknetProvider>
    </SDKProvider>
  </React.StrictMode>
);

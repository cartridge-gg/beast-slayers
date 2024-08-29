import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { SDKProvider } from "@telegram-apps/sdk-react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SDKProvider debug acceptCustomStyles>
      <Router>
        <Routes>
          <Route path="/" element={<App />} />
        </Routes>
      </Router>
    </SDKProvider>
  </React.StrictMode>
);

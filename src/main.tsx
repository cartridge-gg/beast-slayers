import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import toast, { Toaster, useToasterStore } from "react-hot-toast";

function useMaxToasts(max: number) {
  const { toasts } = useToasterStore()

  useEffect(() => {
    toasts
      .filter((t) => t.visible) // Only consider visible toasts
      .filter((_, i) => i >= max) // Is toast index over limit?
      .forEach((t) => toast.dismiss(t.id)) // Dismiss – Use toast.remove(t.id) for no exit animation
  }, [toasts, max])
}

function ToasterWithMax({
  max = 4,
  ...props
}: React.ComponentProps<typeof Toaster> & {
  max?: number
}) {
  useMaxToasts(max)

  return <Toaster {...props} />
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
      <Router>
        <Routes>
          <Route path="/" element={<App />} />
        </Routes>
      </Router>
      <ToasterWithMax position='top-center' max={1} />
  </React.StrictMode>
);

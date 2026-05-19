import { useState } from "react";
import Synth from "./Synth.jsx";
import MusicDiscovery from "./music-discovery.jsx";

export default function App() {
  const [view, setView] = useState("synth");

  return (
    <div style={{ height: "100dvh", overflow: "hidden" }}>
      {view === "synth" ? <Synth /> : <MusicDiscovery />}
      {/* Floating tab toggle */}
      <div style={{
        position: "fixed",
        bottom: "max(20px, env(safe-area-inset-bottom))",
        right: 16,
        display: "flex",
        background: "#1a1710",
        border: "1px solid #3a3218",
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
        zIndex: 100,
        pointerEvents: "auto",
      }}>
        {[["synth", "♩"], ["discover", "⊕"]].map(([v, icon]) => (
          <button
            key={v}
            onClick={() => setView(v)}
            onTouchStart={(e) => { e.stopPropagation(); setView(v); }}
            style={{
              width: 40, height: 32,
              background: view === v ? "#f59e0b22" : "transparent",
              color: view === v ? "#f59e0b" : "#4a4030",
              border: "none",
              fontSize: 14,
              cursor: "pointer",
              touchAction: "manipulation",
            }}
          >
            {icon}
          </button>
        ))}
      </div>
    </div>
  );
}
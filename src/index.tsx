import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import SpectatorTableWrapper from "./screens/SpectatorTableWrapper";

const App = () => {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  if (selectedPlayer) {
    return (
      <div style={{ color: "white", padding: 20 }}>
        <h2>Selected player: {selectedPlayer}</h2>
        <button onClick={() => setSelectedPlayer(null)}>Back</button>
      </div>
    );
  }

  return (
    <SpectatorTableWrapper
      onSelectPlayer={(id) => setSelectedPlayer(id)}
    />
  );
};

const rootEl = document.getElementById("root");
createRoot(rootEl!).render(<App />);

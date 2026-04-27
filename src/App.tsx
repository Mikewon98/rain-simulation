import Phaser from "phaser";
import { useEffect, useRef, useState } from "react";
import { ControlPanel } from "./components/ControlPanel";
import { gameConfig } from "./game/config";

function App() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const [game, setGame] = useState<Phaser.Game | null>(null);

  useEffect(() => {
    const createdGame = new Phaser.Game(gameConfig);
    gameRef.current = createdGame;
    setGame(createdGame);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
      setGame(null);
    };
  }, []);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-slate-950">
      <div id="phaser-container" className="h-full w-full" />
      <div className="pointer-events-none absolute inset-0">
        <div className="pointer-events-auto absolute right-4 top-4">
          <ControlPanel game={game} />
        </div>
      </div>
    </main>
  );
}

export default App;

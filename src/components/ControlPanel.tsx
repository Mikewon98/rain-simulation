import Phaser from "phaser";
import { useEffect, useState } from "react";
import { RainScene } from "../game/RainScene";

interface ControlPanelProps {
  game: Phaser.Game | null;
}

export function ControlPanel({ game }: ControlPanelProps) {
  const [intensity, setIntensity] = useState(50);
  const [wind, setWind] = useState(0);
  const [gravity, setGravity] = useState(50);
  const [runSpeed, setRunSpeed] = useState(50);
  const [hits, setHits] = useState({ abel: 0, cain: 0 });

  useEffect(() => {
    if (!game) {
      return;
    }
    game.events.emit("setIntensity", intensity);
    game.events.emit("setWind", wind);
    game.events.emit("setGravity", gravity);
    game.events.emit("setRunSpeed", runSpeed);
  }, [game, gravity, intensity, runSpeed, wind]);

  useEffect(() => {
    if (!game) {
      return;
    }
    const intervalId = window.setInterval(() => {
      const scene = game.scene.getScene("RainScene") as RainScene;
      if (scene && typeof scene.getHitCounts === "function") {
        setHits(scene.getHitCounts());
      }
    }, 500);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [game]);

  const handleReset = (): void => {
    setIntensity(50);
    setWind(0);
    setGravity(50);
    setRunSpeed(50);
    setHits({ abel: 0, cain: 0 });
    if (game) {
      game.events.emit("setIntensity", 50);
      game.events.emit("setWind", 0);
      game.events.emit("setGravity", 50);
      game.events.emit("setRunSpeed", 50);
      game.events.emit("reset");
    }
  };

  const handleShowResults = (): void => {
    game?.events.emit("showResults");
  };

  return (
    <section className="w-80 rounded-xl border border-white/10 bg-black/60 p-4 text-white backdrop-blur">
      <h2 className="text-lg font-semibold">Rain Simulation Controls</h2>
      <div className="mt-4 space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm">Rain Intensity: {intensity}</span>
          <input
            className="w-full accent-blue-400"
            type="range"
            min={1}
            max={100}
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm">Wind Direction: {wind}</span>
          <input
            className="w-full accent-blue-400"
            type="range"
            min={-100}
            max={100}
            value={wind}
            onChange={(e) => setWind(Number(e.target.value))}
          />
          <div className="mt-1 flex justify-between text-xs text-slate-300">
            <span>L</span>
            <span>Calm</span>
            <span>R</span>
          </div>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm">Gravity: {gravity}</span>
          <input
            className="w-full accent-blue-400"
            type="range"
            min={1}
            max={100}
            value={gravity}
            onChange={(e) => setGravity(Number(e.target.value))}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm">Running Speed: {runSpeed}</span>
          <input
            className="w-full accent-blue-400"
            type="range"
            min={0}
            max={100}
            value={runSpeed}
            onChange={(e) => setRunSpeed(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          className="rounded bg-blue-500 px-3 py-2 text-sm font-medium hover:bg-blue-400"
          onClick={handleReset}
        >
          Reset
        </button>
        <button
          type="button"
          className="rounded bg-indigo-500 px-3 py-2 text-sm font-medium hover:bg-indigo-400"
          onClick={handleShowResults}
        >
          Show Results
        </button>
      </div>

      <div className="mt-4 rounded border border-white/10 bg-white/5 p-3 text-sm">
        <p>Abel: {hits.abel} hits</p>
        <p>Cain: {hits.cain} hits</p>
      </div>
    </section>
  );
}

import Phaser from "phaser";
import { RainScene } from "./RainScene";

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 900,
  height: 500,
  backgroundColor: "#1a1a2e",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 300 },
      debug: false,
    },
  },
  scene: [RainScene],
  parent: "phaser-container",
  transparent: false,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

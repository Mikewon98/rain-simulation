import Phaser from "phaser";
import { Character } from "./Character";
import { RainManager } from "./RainManager";

export class RainScene extends Phaser.Scene {
  private abel!: Character;
  private cain!: Character;
  private rainManager!: RainManager;
  private abelText!: Phaser.GameObjects.Text;
  private cainText!: Phaser.GameObjects.Text;

  constructor() {
    super("RainScene");
  }

  preload(): void {
    this.generateProceduralTextures();
  }

  create(): void {
    const background = this.add.graphics();
    background.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x223a5e, 0x223a5e, 1);
    background.fillRect(0, 0, 900, 500);

    const windLines = this.add.graphics({ lineStyle: { width: 1, color: 0xffffff, alpha: 0.08 } });
    for (let i = 0; i < 15; i += 1) {
      const y = 30 + i * 25;
      windLines.lineBetween(50, y, 850, y);
    }

    const ground = this.add.graphics({ lineStyle: { width: 2, color: 0x93a3b5, alpha: 0.9 } });
    ground.lineBetween(0, 460, 900, 460);

    this.abel = new Character(this, 200, 380, "abel", false, "Abel");
    this.cain = new Character(this, 650, 380, "cain", true, "Cain");
    this.rainManager = new RainManager(this, [this.abel, this.cain]);

    this.add.text(160, 430, "Abel", { color: "#9ac6ff", fontSize: "18px" });
    this.add.text(615, 430, "Cain", { color: "#ff9a9a", fontSize: "18px" });

    this.abelText = this.add.text(30, 20, "Abel hits: 0", { color: "#ffffff", fontSize: "22px" });
    this.cainText = this.add.text(30, 50, "Cain hits: 0", { color: "#ffffff", fontSize: "22px" });

    this.game.events.on("setIntensity", (value: number) => this.rainManager.setIntensity(value));
    this.game.events.on("setWind", (value: number) => this.rainManager.setWindX(value));
    this.game.events.on("setGravity", (value: number) => this.rainManager.setGravity(value));
    this.game.events.on("reset", () => this.rainManager.reset());
  }

  update(): void {
    this.rainManager.checkHits();
    this.abel.update();
    this.cain.update();
    this.abelText.setText(`Abel hits: ${this.abel.getHitCount()}`);
    this.cainText.setText(`Cain hits: ${this.cain.getHitCount()}`);
  }

  public getHitCounts(): { abel: number; cain: number } {
    return {
      abel: this.abel.getHitCount(),
      cain: this.cain.getHitCount(),
    };
  }

  private generateProceduralTextures(): void {
    if (!this.textures.exists("raindrop")) {
      const g = this.add.graphics();
      g.fillStyle(0x88ccff, 0.9);
      g.fillEllipse(2, 7, 3, 12);
      g.generateTexture("raindrop", 4, 14);
      g.destroy();
    }

    if (!this.textures.exists("abel")) {
      const g = this.add.graphics();
      g.lineStyle(3, 0x4f92ff, 1);
      g.fillStyle(0x4f92ff, 1);
      g.fillCircle(16, 10, 7);
      g.fillRect(12, 18, 8, 26);
      g.lineBetween(6, 30, 26, 30);
      g.lineBetween(15, 44, 10, 72);
      g.lineBetween(17, 44, 22, 72);
      g.generateTexture("abel", 32, 80);
      g.destroy();
    }

    if (!this.textures.exists("cain")) {
      const g = this.add.graphics();
      g.lineStyle(3, 0xff6363, 1);
      g.fillStyle(0xff6363, 1);
      g.fillCircle(16, 10, 7);
      g.fillRect(12, 18, 8, 26);
      g.lineBetween(8, 28, 25, 20);
      g.lineBetween(15, 44, 8, 68);
      g.lineBetween(17, 44, 27, 60);
      g.generateTexture("cain", 32, 80);
      g.destroy();
    }
  }
}

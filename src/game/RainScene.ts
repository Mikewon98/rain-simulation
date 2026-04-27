import Phaser from "phaser";
import { Character } from "./Character";
import { RainManager } from "./RainManager";

export class RainScene extends Phaser.Scene {
  private abel!: Character;
  private cain!: Character;
  private rainManager!: RainManager;
  private abelText!: Phaser.GameObjects.Text;
  private cainText!: Phaser.GameObjects.Text;
  private windLines!: Phaser.GameObjects.Graphics;
  private windStrength = 0;
  private windOffset = 0;
  private isFinished = false;
  private startedAt = 0;
  private resultsContainer?: Phaser.GameObjects.Container;

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

    this.windLines = this.add.graphics();
    this.drawWindLines();

    const ground = this.add.graphics({ lineStyle: { width: 2, color: 0x93a3b5, alpha: 0.9 } });
    ground.lineBetween(100, 260, 400, 260);
    ground.lineBetween(500, 440, 850, 440);

    this.abel = new Character(this, 240, 220, "abel", false, "Abel");
    this.cain = new Character(this, 560, 400, "cain", true, "Cain");
    this.cain.setRunBounds(530, 840);
    this.cain.setRunSpeed(180);
    this.rainManager = new RainManager(this, [this.abel, this.cain], [
      { xMin: 100, xMax: 400, y: 260 },
      { xMin: 500, xMax: 850, y: 440 },
    ]);

    this.add.text(205, 272, "Abel", { color: "#9ac6ff", fontSize: "18px" });
    this.add.text(650, 452, "Cain", { color: "#ff9a9a", fontSize: "18px" });

    this.abelText = this.add.text(30, 20, "Abel hits: 0", { color: "#ffffff", fontSize: "22px" });
    this.cainText = this.add.text(30, 50, "Cain hits: 0", { color: "#ffffff", fontSize: "22px" });

    this.game.events.on("setIntensity", (value: number) => this.rainManager.setIntensity(value));
    this.game.events.on("setWind", (value: number) => {
      this.windStrength = value;
      this.rainManager.setWindX(value);
    });
    this.game.events.on("setGravity", (value: number) => this.rainManager.setGravity(value));
    this.game.events.on("setRunSpeed", (value: number) => {
      const mappedSpeed = Phaser.Math.Linear(0, 380, Phaser.Math.Clamp(value, 0, 100) / 100);
      this.cain.setRunSpeed(mappedSpeed);
    });
    this.game.events.on("showResults", () => this.showResults());
    this.game.events.on("reset", () => this.resetSimulation());

    this.startedAt = this.time.now;
    this.isFinished = false;
  }

  update(_time: number, delta: number): void {
    if (!this.isFinished && this.time.now - this.startedAt >= 30000) {
      this.showResults();
    }
    if (this.isFinished) {
      return;
    }

    this.windOffset += (this.windStrength * delta) / 160;
    this.drawWindLines();
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

  private resetSimulation(): void {
    this.rainManager.reset();
    this.rainManager.resumeRain();
    this.isFinished = false;
    this.startedAt = this.time.now;
    this.resultsContainer?.destroy();
    this.resultsContainer = undefined;
  }

  private showResults(): void {
    if (this.isFinished) {
      return;
    }
    this.isFinished = true;
    this.rainManager.pauseRain();

    const abelHits = this.abel.getHitCount();
    const cainHits = this.cain.getHitCount();
    const winner = cainHits >= abelHits ? "Cain" : "Abel";
    const wetDiff = Math.abs(cainHits - abelHits);
    const baseline = Math.max(1, Math.min(abelHits, cainHits));
    const percent = Math.round((wetDiff / baseline) * 100);
    const explanation =
      this.windStrength >= 50
        ? "Tailwind can help Cain run with the rain."
        : this.windStrength <= -50
          ? "Headwind makes Cain run into more drops."
          : "Moving through rainfall intercepts more drops.";

    const panelBg = this.add.rectangle(450, 250, 520, 250, 0x000000, 0.82);
    const title = this.add.text(450, 160, "Simulation Results", {
      color: "#f8fafc",
      fontSize: "30px",
    });
    title.setOrigin(0.5);
    const body = this.add.text(
      450,
      250,
      `Abel: ${abelHits} drops\nCain: ${cainHits} drops\nWinner: ${winner} got ${percent}% more wet\n${explanation}`,
      { color: "#dbeafe", fontSize: "22px", align: "center", lineSpacing: 8 },
    );
    body.setOrigin(0.5);

    this.resultsContainer = this.add.container(0, 0, [panelBg, title, body]);
  }

  private drawWindLines(): void {
    this.windLines.clear();
    this.windLines.lineStyle(1, 0xffffff, 0.09);
    for (let i = 0; i < 12; i += 1) {
      const y = 30 + i * 36;
      const rowOffset = (this.windOffset + i * 22) % 120;
      for (let x = -120 + rowOffset; x < 920; x += 120) {
        this.windLines.lineBetween(x, y, x + 40, y);
      }
    }
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

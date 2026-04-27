import Phaser from "phaser";
import { Character } from "./Character";

export interface GroundZone {
  xMin: number;
  xMax: number;
  y: number;
}

export class RainManager {
  private readonly particles: Phaser.GameObjects.Particles.ParticleEmitter;
  private readonly splashEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly characters: Character[],
    private readonly groundZones: GroundZone[],
  ) {
    this.particles = this.scene.add.particles(0, 0, "raindrop", {
      x: { min: -50, max: 950 },
      y: -10,
      speedX: 0,
      speedY: { min: 200, max: 400 },
      scale: { start: 0.3, end: 0.2 },
      alpha: { start: 0.8, end: 0.6 },
      lifespan: 3000,
      frequency: 30,
      quantity: 2,
      gravityY: 300,
      emitting: true,
    });

    this.splashEmitter = this.scene.add.particles(0, 0, "raindrop", {
      lifespan: 200,
      speedY: { min: -100, max: -50 },
      speedX: { min: -20, max: 20 },
      scale: { start: 0.1, end: 0 },
      alpha: { start: 0.7, end: 0 },
      quantity: 3,
      gravityY: 200,
      emitting: false,
    });
  }

  public setIntensity(value: number): void {
    const clamped = Phaser.Math.Clamp(value, 1, 100);
    this.particles.frequency = Phaser.Math.Linear(100, 5, (clamped - 1) / 99);
    this.particles.quantity = Math.round(Phaser.Math.Linear(1, 8, (clamped - 1) / 99));
  }

  public setWindX(value: number): void {
    const clamped = Phaser.Math.Clamp(value, -100, 100);
    this.particles.speedX = clamped * 2;
  }

  public setGravity(value: number): void {
    const clamped = Phaser.Math.Clamp(value, 1, 100);
    const speedY = Phaser.Math.Linear(80, 600, (clamped - 1) / 99);
    const gravityY = Phaser.Math.Linear(50, 500, (clamped - 1) / 99);
    this.particles.speedY = { min: speedY * 0.75, max: speedY };
    this.particles.gravityY = gravityY;
  }

  public reset(): void {
    this.characters.forEach((character) => character.reset());
  }

  public pauseRain(): void {
    this.particles.stop();
  }

  public resumeRain(): void {
    this.particles.start();
  }

  public checkHits(): void {
    this.particles.forEachAlive((particle) => {
      const pRect = new Phaser.Geom.Rectangle(particle.x - 2, particle.y - 6, 4, 12);

      for (const character of this.characters) {
        const cRect = character.hitbox.getBounds();
        if (Phaser.Geom.Intersects.RectangleToRectangle(pRect, cRect)) {
          character.incrementHit();
          particle.kill();
          break;
        }
      }

      for (const zone of this.groundZones) {
        if (
          particle.x >= zone.xMin &&
          particle.x <= zone.xMax &&
          particle.y >= zone.y - 2 &&
          particle.y <= zone.y + 12
        ) {
          this.splashEmitter.explode(Phaser.Math.Between(2, 3), particle.x, zone.y);
          particle.kill();
          break;
        }
      }
    }, this);
  }
}

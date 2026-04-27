import Phaser from "phaser";

export interface CharacterOptions {
  /** Scales sprite so its on-screen height matches this value (pixels). */
  targetDisplayHeight?: number;
  /** Places the ground at the sprite origin (bottom center). */
  anchorFeet?: boolean;
  /** Wetness tint at max hits (multiplied with sprite — use a saturated blue so art stays readable). */
  wetTintTarget?: number;
}

export class Character {
  public readonly sprite: Phaser.Physics.Arcade.Sprite;
  public readonly hitbox: Phaser.GameObjects.Rectangle;
  public readonly label: string;
  public hitCount = 0;
  private readonly isRunning: boolean;
  private readonly wetTintTarget: number;
  private readonly hitboxCenterFactor: number;
  private readonly anchorFeet: boolean;
  private runSpeed = 180;
  private runMinX = 60;
  private runMaxX = 860;

  constructor(
    private readonly scene: Phaser.Scene,
    x: number,
    y: number,
    textureKey: string,
    isRunning: boolean,
    label: string,
    options?: CharacterOptions,
  ) {
    this.label = label;
    this.isRunning = isRunning;
    this.wetTintTarget = options?.wetTintTarget ?? 0x4488ff;
    this.anchorFeet = Boolean(options?.anchorFeet);
    this.sprite = this.scene.physics.add.sprite(x, y, textureKey);
    this.sprite.setImmovable(true);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body | null;
    body?.setAllowGravity(false);

    if (options?.targetDisplayHeight) {
      const h = this.sprite.frame.height;
      if (h > 0) {
        this.sprite.setScale(options.targetDisplayHeight / h);
      }
    }
    if (this.anchorFeet) {
      this.sprite.setOrigin(0.5, 1);
    }
    this.sprite.refreshBody();

    const dw = this.sprite.displayWidth;
    const dh = this.sprite.displayHeight;
    const hbW = Math.round(Math.max(28, dw * 0.38));
    const hbH = Math.round(Math.max(52, dh * 0.48));
    this.hitboxCenterFactor = this.anchorFeet ? 0.54 : 0.5;

    const hbY = this.anchorFeet ? y - dh * this.hitboxCenterFactor : y;

    this.hitbox = this.scene.add.rectangle(this.sprite.x, hbY, hbW, hbH, 0xffffff, 0);
    this.hitbox.setOrigin(0.5, 0.5);

    if (this.isRunning) {
      this.sprite.setVelocityX(this.runSpeed);
      this.sprite.setFlipX(false);
    }
  }

  public incrementHit(): void {
    this.hitCount += 1;
  }

  public getHitCount(): number {
    return this.hitCount;
  }

  public reset(): void {
    this.hitCount = 0;
    this.sprite.clearTint();
  }

  public setRunBounds(minX: number, maxX: number): void {
    this.runMinX = minX;
    this.runMaxX = maxX;
  }

  public setRunSpeed(speed: number): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body | null;
    this.runSpeed = Math.max(0, speed);
    if (this.isRunning && body) {
      body.setVelocityX(this.runSpeed);
    }
  }

  public update(): void {
    if (this.isRunning) {
      const body = this.sprite.body as Phaser.Physics.Arcade.Body | null;
      if (body && this.runSpeed > 0) {
        body.setVelocityX(this.runSpeed);
      }
      if (this.sprite.x >= this.runMaxX) {
        this.sprite.x = this.runMinX;
      }
      this.hitbox.setPosition(this.sprite.x, this.sprite.y);
      this.sprite.setFlipX(false);
    }

    const tintRatio = Phaser.Math.Clamp(this.hitCount / 200, 0, 1);
    const tintColor = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(0xffffff),
      Phaser.Display.Color.ValueToColor(this.wetTintTarget),
      100,
      Math.floor(tintRatio * 100),
    );
    const tint = Phaser.Display.Color.GetColor(tintColor.r, tintColor.g, tintColor.b);
    this.sprite.setTint(tint);
    const dh = this.sprite.displayHeight;
    const hbY = this.anchorFeet ? this.sprite.y - dh * this.hitboxCenterFactor : this.sprite.y;
    this.hitbox.setPosition(this.sprite.x, hbY);
  }
}

import Phaser from "phaser";

export class Character {
  public readonly sprite: Phaser.Physics.Arcade.Sprite;
  public readonly hitbox: Phaser.GameObjects.Rectangle;
  public readonly label: string;
  public hitCount = 0;
  private readonly isRunning: boolean;

  constructor(
    private readonly scene: Phaser.Scene,
    x: number,
    y: number,
    textureKey: string,
    isRunning: boolean,
    label: string,
  ) {
    this.label = label;
    this.isRunning = isRunning;
    this.sprite = this.scene.physics.add.sprite(x, y, textureKey);
    this.sprite.setImmovable(true);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body | null;
    body?.setAllowGravity(false);

    this.hitbox = this.scene.add.rectangle(this.sprite.x, this.sprite.y, 24, 64, 0xffffff, 0);
    this.hitbox.setOrigin(0.5, 0.5);

    if (this.isRunning) {
      this.scene.tweens.add({
        targets: this.sprite,
        x: { from: 600, to: 850 },
        duration: 2100,
        yoyo: true,
        repeat: -1,
        ease: "Linear",
      });
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

  public update(): void {
    if (this.isRunning) {
      this.hitbox.setPosition(this.sprite.x, this.sprite.y);
      this.sprite.setFlipX(this.sprite.body?.velocity.x ? this.sprite.body.velocity.x < 0 : false);
    }

    const tintRatio = Phaser.Math.Clamp(this.hitCount / 200, 0, 1);
    const tintColor = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(0xffffff),
      Phaser.Display.Color.ValueToColor(0x4488ff),
      100,
      Math.floor(tintRatio * 100),
    );
    const tint = Phaser.Display.Color.GetColor(tintColor.r, tintColor.g, tintColor.b);
    this.sprite.setTint(tint);
    if (!this.isRunning) {
      this.hitbox.setPosition(this.sprite.x, this.sprite.y);
    }
  }
}

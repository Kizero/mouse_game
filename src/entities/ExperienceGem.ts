import Phaser from 'phaser';

export class ExperienceGem extends Phaser.GameObjects.Container {
  public body!: Phaser.Physics.Arcade.Body;
  private sprite: Phaser.GameObjects.Graphics;
  private value: number;

  constructor(scene: Phaser.Scene, x: number, y: number, value: number) {
    super(scene, x, y);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.value = value;

    // 创建宝石图形
    this.sprite = this.createGemSprite();
    this.add(this.sprite);

    // 漂浮动画
    scene.tweens.add({
      targets: this.sprite,
      y: -5,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // 闪烁效果
    scene.tweens.add({
      targets: this.sprite,
      alpha: 0.7,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    this.setSize(16, 16);
  }

  private createGemSprite(): Phaser.GameObjects.Graphics {
    const g = this.scene.add.graphics();

    // 根据价值选择颜色
    let color = 0x00ff00; // 绿色（低价值）
    if (this.value >= 5) color = 0x0099ff; // 蓝色（中等）
    if (this.value >= 10) color = 0xff00ff; // 紫色（高价值）

    // 宝石形状（菱形）
    g.fillStyle(color, 1);
    g.beginPath();
    g.moveTo(0, -8);
    g.lineTo(6, 0);
    g.lineTo(0, 8);
    g.lineTo(-6, 0);
    g.closePath();
    g.fillPath();

    // 高光
    g.fillStyle(0xffffff, 0.5);
    g.fillCircle(-2, -3, 3);

    return g;
  }

  getValue(): number {
    return this.value;
  }
}

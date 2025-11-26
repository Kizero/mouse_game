import Phaser from 'phaser';

export class ExperienceGem extends Phaser.GameObjects.Container {
  public body!: Phaser.Physics.Arcade.Body;
  private sprite: Phaser.GameObjects.Sprite;
  private value: number;

  constructor(scene: Phaser.Scene, x: number, y: number, value: number) {
    super(scene, x, y);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.value = value;

    // 根据价值选择颜色并存储
    let color = 0x00ff00; // 绿色（低价值）
    if (value >= 5) color = 0x0099ff; // 蓝色（中等）
    if (value >= 10) color = 0xff00ff; // 紫色（高价值）
    this.setData('color', color);

    // 创建宝石精灵
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

  private createGemSprite(): Phaser.GameObjects.Sprite {
    // 根据价值选择精灵纹理
    let textureName = 'gem_green'; // 低价值
    if (this.value >= 5) textureName = 'gem_blue'; // 中等
    if (this.value >= 10) textureName = 'gem_purple'; // 高价值

    const sprite = this.scene.add.sprite(0, 0, textureName);
    return sprite;
  }

  getValue(): number {
    return this.value;
  }
}

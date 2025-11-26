import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/GameConfig';

/**
 * 背景管理器 - 创建动态背景和环境元素
 */
export class BackgroundManager {
  private scene: Phaser.Scene;
  private backgroundLayer!: Phaser.GameObjects.Container;
  private groundPattern!: Phaser.GameObjects.TileSprite;
  private decorations: Phaser.GameObjects.Graphics[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createBackground();
  }

  /**
   * 创建背景
   */
  private createBackground() {
    const { WIDTH, HEIGHT } = GAME_CONFIG;

    // 背景层
    this.backgroundLayer = this.scene.add.container(0, 0);
    this.backgroundLayer.setDepth(-100);

    // 渐变背景
    const bgGraphics = this.scene.add.graphics();
    bgGraphics.fillGradientStyle(0x4a2c2a, 0x4a2c2a, 0x2d1b1a, 0x2d1b1a, 1, 1, 1, 1);
    bgGraphics.fillRect(0, 0, WIDTH, HEIGHT);
    this.backgroundLayer.add(bgGraphics);

    // 创建地面纹理
    this.createGroundTexture();

    // 创建装饰元素
    this.createDecorations();

    // 添加环境光效
    this.createAmbientLight();
  }

  /**
   * 创建地面纹理
   */
  private createGroundTexture() {
    const { WIDTH, HEIGHT } = GAME_CONFIG;

    // 创建地面图案纹理
    const groundTexture = this.scene.add.graphics();
    groundTexture.fillStyle(0x3d2820, 0.3);

    // 绘制网格图案
    const gridSize = 40;
    for (let x = 0; x < WIDTH; x += gridSize) {
      for (let y = 0; y < HEIGHT; y += gridSize) {
        if ((x / gridSize + y / gridSize) % 2 === 0) {
          groundTexture.fillRect(x, y, gridSize, gridSize);
        }
      }
    }

    // 添加随机点缀
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * WIDTH;
      const y = Math.random() * HEIGHT;
      const size = 1 + Math.random() * 3;
      groundTexture.fillStyle(0x6d4c41, Math.random() * 0.5);
      groundTexture.fillCircle(x, y, size);
    }

    groundTexture.generateTexture('ground_pattern', WIDTH, HEIGHT);
    groundTexture.destroy();

    // 使用TileSprite实现可平铺的地面
    this.groundPattern = this.scene.add.tileSprite(0, 0, WIDTH, HEIGHT, 'ground_pattern');
    this.groundPattern.setOrigin(0);
    this.groundPattern.setDepth(-99);
    this.backgroundLayer.add(this.groundPattern);
  }

  /**
   * 创建装饰元素（饼干屑、食物碎片等）
   */
  private createDecorations() {
    const { WIDTH, HEIGHT } = GAME_CONFIG;

    // 饼干屑
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * WIDTH;
      const y = Math.random() * HEIGHT;
      const crumb = this.createCrumb(x, y);
      this.backgroundLayer.add(crumb);
      this.decorations.push(crumb);
    }

    // 食物碎片
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * WIDTH;
      const y = Math.random() * HEIGHT;
      const food = this.createFoodPiece(x, y);
      this.backgroundLayer.add(food);
      this.decorations.push(food);
    }

    // 添加漂浮动画
    this.decorations.forEach((decoration, index) => {
      this.scene.tweens.add({
        targets: decoration,
        y: decoration.y + (Math.random() - 0.5) * 10,
        x: decoration.x + (Math.random() - 0.5) * 10,
        duration: 3000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        delay: index * 50,
        ease: 'Sine.easeInOut',
      });
    });
  }

  /**
   * 创建饼干屑
   */
  private createCrumb(x: number, y: number): Phaser.GameObjects.Graphics {
    const g = this.scene.add.graphics();
    const size = 3 + Math.random() * 5;
    const color = Phaser.Utils.Array.GetRandom([0xd2691e, 0xcd853f, 0xdaa520]) as unknown as number;

    g.setPosition(x, y);
    g.setAlpha(0.6);
    g.fillStyle(color, 1);
    g.fillCircle(0, 0, size);

    // 添加细节
    g.fillStyle(0xf5deb3, 0.5);
    g.fillCircle(size * 0.3, -size * 0.3, size * 0.4);

    return g;
  }

  /**
   * 创建食物碎片
   */
  private createFoodPiece(x: number, y: number): Phaser.GameObjects.Graphics {
    const g = this.scene.add.graphics();
    const type = Math.floor(Math.random() * 3);

    g.setPosition(x, y);
    g.setAlpha(0.5);

    switch (type) {
      case 0: // 种子
        g.fillStyle(0x8b4513, 1);
        g.fillEllipse(0, 0, 4, 6);
        break;
      case 1: // 小麦粒
        g.fillStyle(0xf0e68c, 1);
        g.fillRect(-2, -3, 4, 6);
        break;
      case 2: // 小碎片
        g.fillStyle(0xffa500, 1);
        g.fillCircle(0, 0, 3);
        g.fillStyle(0xffff00, 0.8);
        g.fillCircle(0, 0, 2);
        break;
    }

    return g;
  }

  /**
   * 创建环境光效
   */
  private createAmbientLight() {
    const { WIDTH, HEIGHT } = GAME_CONFIG;

    // 添加几个柔和的光晕
    for (let i = 0; i < 3; i++) {
      const x = (i + 1) * (WIDTH / 4);
      const y = HEIGHT / 4;
      const glow = this.scene.add.circle(x, y, 150, 0xffeeaa, 0.05);
      this.backgroundLayer.add(glow);

      // 脉动动画
      this.scene.tweens.add({
        targets: glow,
        alpha: 0.08,
        scale: 1.2,
        duration: 3000 + i * 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  /**
   * 更新（每帧调用）
   */
  update(cameraX: number, cameraY: number) {
    // 视差滚动效果 - 地面缓慢移动
    if (this.groundPattern) {
      this.groundPattern.tilePositionX = cameraX * 0.1;
      this.groundPattern.tilePositionY = cameraY * 0.1;
    }
  }

  /**
   * 销毁背景
   */
  destroy() {
    this.decorations.forEach(d => d.destroy());
    this.decorations = [];
    this.backgroundLayer.destroy();
  }
}

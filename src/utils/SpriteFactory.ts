import Phaser from 'phaser';

/**
 * Sprite工厂 - 生成高质量的程序化sprite
 * 使用纹理缓存避免重复渲染
 */
export class SpriteFactory {
  private scene: Phaser.Scene;
  private textureCache: Set<string> = new Set();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * 创建所有游戏需要的纹理
   */
  createAllTextures() {
    // 玩家纹理
    this.createHamsterTexture('hamster_golden', 0xffd700, 0xffed4e);
    this.createHamsterTexture('hamster_pudding', 0xffe4b5, 0xfff8dc);
    this.createHamsterTexture('hamster_bear', 0x8b4513, 0xa0522d);
    this.createHamsterTexture('hamster_elder', 0xd3d3d3, 0xe0e0e0);
    this.createHamsterTexture('hamster_dwarf', 0xffa07a, 0xffb6a3);

    // 敌人纹理
    this.createAntTexture();
    this.createCockroachTexture();
    this.createSpiderTexture();
    this.createBeetleTexture();
    this.createBossTexture();

    // 武器纹理
    this.createWeaponTextures();

    // UI纹理
    this.createUITextures();

    // 粒子纹理
    this.createParticleTextures();

    console.log('✨ 所有sprite纹理已生成！');
  }

  /**
   * 创建仓鼠纹理（像素风格）
   */
  private createHamsterTexture(key: string, bodyColor: number, lightColor: number) {
    if (this.textureCache.has(key)) return;

    const size = 64;
    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);

    // 身体
    graphics.fillStyle(bodyColor, 1);
    graphics.fillCircle(32, 36, 20);
    graphics.fillCircle(32, 20, 16);

    // 高光
    graphics.fillStyle(lightColor, 1);
    graphics.fillCircle(28, 16, 6);

    // 耳朵
    graphics.fillStyle(bodyColor, 1);
    graphics.fillCircle(22, 10, 8);
    graphics.fillCircle(42, 10, 8);
    graphics.fillStyle(0xffb6c1, 1);
    graphics.fillCircle(22, 10, 5);
    graphics.fillCircle(42, 10, 5);

    // 眼睛
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(26, 20, 3);
    graphics.fillCircle(38, 20, 3);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(27, 19, 1.5);
    graphics.fillCircle(39, 19, 1.5);

    // 鼻子
    graphics.fillStyle(0xff69b4, 1);
    graphics.fillCircle(32, 25, 2);

    // 脚
    graphics.fillStyle(bodyColor, 1);
    graphics.fillEllipse(24, 48, 8, 6);
    graphics.fillEllipse(40, 48, 8, 6);

    graphics.generateTexture(key, size, size);
    graphics.destroy();
    this.textureCache.add(key);
  }

  /**
   * 创建蚂蚁纹理
   */
  private createAntTexture() {
    const key = 'enemy_ant';
    if (this.textureCache.has(key)) return;

    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);

    // 身体（三节）
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(16, 20, 8);
    graphics.fillCircle(16, 32, 6);
    graphics.fillCircle(16, 42, 7);

    // 触角
    graphics.lineStyle(2, 0x000000);
    graphics.lineBetween(16, 12, 12, 4);
    graphics.lineBetween(16, 12, 20, 4);
    graphics.fillCircle(12, 4, 2);
    graphics.fillCircle(20, 4, 2);

    // 腿（简化为线条）
    graphics.lineStyle(1, 0x000000);
    for (let i = 0; i < 3; i++) {
      const y = 26 + i * 8;
      graphics.lineBetween(8, y, 4, y + 4);
      graphics.lineBetween(24, y, 28, y + 4);
    }

    graphics.generateTexture(key, 32, 48);
    graphics.destroy();
    this.textureCache.add(key);
  }

  /**
   * 创建蟑螂纹理
   */
  private createCockroachTexture() {
    const key = 'enemy_cockroach';
    if (this.textureCache.has(key)) return;

    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);

    // 身体
    graphics.fillStyle(0x8b4513, 1);
    graphics.fillEllipse(24, 24, 32, 20);

    // 壳纹路
    graphics.lineStyle(2, 0x654321);
    graphics.lineBetween(24, 14, 24, 34);
    graphics.arc(24, 24, 8, -Math.PI, 0, false);

    // 触角
    graphics.lineStyle(2, 0x654321);
    graphics.lineBetween(16, 12, 12, 4);
    graphics.lineBetween(32, 12, 36, 4);

    // 腿
    graphics.lineStyle(1, 0x654321);
    for (let i = 0; i < 3; i++) {
      const y = 18 + i * 6;
      graphics.lineBetween(10, y, 4, y + 8);
      graphics.lineBetween(38, y, 44, y + 8);
    }

    graphics.generateTexture(key, 48, 40);
    graphics.destroy();
    this.textureCache.add(key);
  }

  /**
   * 创建蜘蛛纹理
   */
  private createSpiderTexture() {
    const key = 'enemy_spider';
    if (this.textureCache.has(key)) return;

    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);

    // 身体
    graphics.fillStyle(0x666666, 1);
    graphics.fillCircle(24, 24, 12);
    graphics.fillCircle(24, 36, 8);

    // 红色眼睛
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(20, 22, 2);
    graphics.fillCircle(28, 22, 2);

    // 8条腿
    graphics.lineStyle(2, 0x333333);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
      const startX = 24 + Math.cos(angle) * 12;
      const startY = 24 + Math.sin(angle) * 12;
      const endX = 24 + Math.cos(angle) * 28;
      const endY = 24 + Math.sin(angle) * 28;

      graphics.lineBetween(startX, startY, endX, endY);
      graphics.fillCircle(endX, endY, 2);
    }

    graphics.generateTexture(key, 56, 56);
    graphics.destroy();
    this.textureCache.add(key);
  }

  /**
   * 创建甲虫纹理
   */
  private createBeetleTexture() {
    const key = 'enemy_beetle';
    if (this.textureCache.has(key)) return;

    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);

    // 甲壳
    graphics.fillStyle(0x2d5016, 1);
    graphics.fillEllipse(24, 28, 28, 36);

    // 壳裂缝
    graphics.lineStyle(3, 0x1a300d);
    graphics.lineBetween(24, 12, 24, 44);

    // 头部
    graphics.fillStyle(0x1a300d, 1);
    graphics.fillCircle(24, 10, 8);

    // 角
    graphics.lineStyle(2, 0x1a300d);
    graphics.lineBetween(24, 4, 24, 0);
    graphics.lineBetween(24, 4, 18, 2);
    graphics.lineBetween(24, 4, 30, 2);

    // 腿
    graphics.lineStyle(2, 0x1a300d);
    for (let i = 0; i < 3; i++) {
      const y = 20 + i * 8;
      graphics.lineBetween(10, y, 4, y + 6);
      graphics.lineBetween(38, y, 44, y + 6);
    }

    graphics.generateTexture(key, 48, 48);
    graphics.destroy();
    this.textureCache.add(key);
  }

  /**
   * 创建Boss纹理
   */
  private createBossTexture() {
    const key = 'enemy_boss';
    if (this.textureCache.has(key)) return;

    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);

    // 身体
    graphics.fillStyle(0xcc0000, 1);
    graphics.fillCircle(64, 72, 48);
    graphics.fillCircle(64, 44, 36);

    // 耳朵
    graphics.fillStyle(0xaa0000, 1);
    graphics.fillCircle(36, 28, 18);
    graphics.fillCircle(92, 28, 18);

    // 眼睛（邪恶）
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(52, 40, 8);
    graphics.fillCircle(76, 40, 8);
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(52, 40, 4);
    graphics.fillCircle(76, 40, 4);
    graphics.fillStyle(0xff0000, 0.5);
    graphics.fillCircle(52, 40, 12);
    graphics.fillCircle(76, 40, 12);

    // 獠牙
    graphics.fillStyle(0xffffff, 1);
    graphics.fillTriangle(50, 52, 46, 52, 48, 64);
    graphics.fillTriangle(78, 52, 82, 52, 80, 64);

    // 伤疤
    graphics.lineStyle(3, 0x8b0000);
    graphics.lineBetween(70, 32, 80, 38);

    // 皇冠
    graphics.fillStyle(0xffd700, 1);
    for (let i = 0; i < 5; i++) {
      const x = 34 + i * 15;
      graphics.fillTriangle(x, 18, x + 10, 18, x + 5, 4);
    }
    graphics.fillRect(34, 18, 60, 6);

    // 宝石
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(64, 21, 4);

    graphics.generateTexture(key, 128, 120);
    graphics.destroy();
    this.textureCache.add(key);
  }

  /**
   * 创建武器纹理
   */
  private createWeaponTextures() {
    // 滚轮
    this.createTexture('weapon_spinner', 32, 32, (g) => {
      g.lineStyle(3, 0x00ff00);
      g.strokeCircle(16, 16, 14);
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        g.lineBetween(16, 16, 16 + Math.cos(angle) * 14, 16 + Math.sin(angle) * 14);
      }
      g.fillStyle(0x00ff00);
      g.fillCircle(16, 16, 6);
    });

    // 瓜子
    this.createTexture('weapon_seed', 16, 12, (g) => {
      g.fillStyle(0xd2691e, 1);
      g.fillEllipse(8, 6, 14, 10);
      g.lineStyle(1, 0x8b4513);
      g.lineBetween(4, 6, 12, 6);
    });

    // 木屑
    this.createTexture('weapon_sawdust', 8, 8, (g) => {
      g.fillStyle(0xdeb887, 1);
      g.fillRect(0, 0, 8, 8);
      g.fillStyle(0xd2b48c, 1);
      g.fillRect(2, 2, 4, 4);
    });

    // 小鸟
    this.createTexture('weapon_bird', 32, 24, (g) => {
      g.fillStyle(0x87ceeb, 1);
      g.fillCircle(16, 12, 10);
      g.fillTriangle(8, 8, 0, 4, 4, 12);
      g.fillTriangle(24, 8, 32, 4, 28, 12);
      g.fillStyle(0x000000, 1);
      g.fillCircle(18, 10, 2);
      g.fillStyle(0xffa500, 1);
      g.fillTriangle(20, 12, 26, 12, 23, 16);
    });

    // 奶酪
    this.createTexture('weapon_cheese', 32, 28, (g) => {
      g.fillStyle(0xffd700, 1);
      g.fillTriangle(4, 24, 28, 24, 16, 4);
      g.fillStyle(0xdaa520, 1);
      g.fillCircle(12, 16, 3);
      g.fillCircle(20, 18, 4);
      g.fillCircle(16, 12, 2);
    });

    // 食物（囤粮）
    this.createTexture('weapon_food', 20, 20, (g) => {
      g.fillStyle(0xff6347, 1);
      g.fillCircle(10, 10, 9);
      g.fillStyle(0x90ee90, 1);
      g.fillRect(8, 2, 4, 6);
    });

    // 水滴
    this.createTexture('weapon_water', 16, 20, (g) => {
      g.fillStyle(0x00bfff, 0.8);
      g.fillCircle(8, 14, 6);
      g.fillTriangle(8, 4, 2, 14, 14, 14);
      g.fillStyle(0xffffff, 0.6);
      g.fillCircle(6, 12, 2);
    });
  }

  /**
   * 创建UI纹理
   */
  private createUITextures() {
    // 经验宝石
    this.createTexture('gem_small', 16, 16, (g) => {
      g.fillStyle(0x00ff00, 1);
      g.fillCircle(8, 8, 7);
      g.fillStyle(0x90ee90, 1);
      g.fillCircle(6, 6, 3);
    });

    this.createTexture('gem_medium', 20, 20, (g) => {
      g.fillStyle(0x0000ff, 1);
      g.fillCircle(10, 10, 9);
      g.fillStyle(0x87ceeb, 1);
      g.fillCircle(7, 7, 4);
    });

    this.createTexture('gem_large', 24, 24, (g) => {
      g.fillStyle(0x9370db, 1);
      g.fillCircle(12, 12, 11);
      g.fillStyle(0xdda0dd, 1);
      g.fillCircle(9, 9, 5);
    });

    // 按钮
    this.createTexture('button_normal', 200, 60, (g) => {
      g.fillStyle(0x4a4a4a, 1);
      g.fillRoundedRect(0, 0, 200, 60, 10);
      g.lineStyle(3, 0x6a6a6a);
      g.strokeRoundedRect(0, 0, 200, 60, 10);
    });

    this.createTexture('button_hover', 200, 60, (g) => {
      g.fillStyle(0x5a5a5a, 1);
      g.fillRoundedRect(0, 0, 200, 60, 10);
      g.lineStyle(3, 0xffff00);
      g.strokeRoundedRect(0, 0, 200, 60, 10);
    });
  }

  /**
   * 创建粒子纹理
   */
  private createParticleTextures() {
    // 圆形粒子（多种颜色）
    const colors = [
      { name: 'red', color: 0xff0000 },
      { name: 'orange', color: 0xff6600 },
      { name: 'yellow', color: 0xffff00 },
      { name: 'green', color: 0x00ff00 },
      { name: 'blue', color: 0x0000ff },
      { name: 'purple', color: 0x9370db },
      { name: 'white', color: 0xffffff },
      { name: 'gold', color: 0xffd700 },
    ];

    colors.forEach(({ name, color }) => {
      this.createTexture(`particle_${name}`, 8, 8, (g) => {
        g.fillStyle(color, 1);
        g.fillCircle(4, 4, 4);
        g.fillStyle(0xffffff, 0.6);
        g.fillCircle(3, 3, 2);
      });
    });

    // 星星粒子
    this.createTexture('particle_star', 16, 16, (g) => {
      g.fillStyle(0xffff00, 1);
      // Draw star manually
      g.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const radius = i % 2 === 0 ? 8 : 4;
        const x = 8 + Math.cos(angle) * radius;
        const y = 8 + Math.sin(angle) * radius;
        if (i === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.closePath();
      g.fillPath();
      g.fillStyle(0xffffff, 0.8);
      g.fillCircle(8, 8, 3);
    });

    // 火花
    this.createTexture('particle_spark', 12, 12, (g) => {
      g.fillStyle(0xffffff, 1);
      g.fillRect(5, 0, 2, 12);
      g.fillRect(0, 5, 12, 2);
    });
  }

  /**
   * 通用纹理创建方法
   */
  private createTexture(
    key: string,
    width: number,
    height: number,
    draw: (g: Phaser.GameObjects.Graphics) => void
  ) {
    if (this.textureCache.has(key)) return;

    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);
    draw(graphics);
    graphics.generateTexture(key, width, height);
    graphics.destroy();
    this.textureCache.add(key);
  }

  /**
   * 检查纹理是否已存在
   */
  hasTexture(key: string): boolean {
    return this.textureCache.has(key);
  }
}

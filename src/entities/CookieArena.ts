import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/GameConfig';
import { Player } from './Player';

export class CookieArena {
  private scene: Phaser.Scene;
  private graphics: Phaser.GameObjects.Graphics;
  private cookieHealth: number = 100;
  private crumbZoneWarning: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.graphics = scene.add.graphics();
    this.crumbZoneWarning = scene.add.graphics();

    this.drawCookie();
  }

  private drawCookie() {
    const { CENTER_X, CENTER_Y, RADIUS } = GAME_CONFIG.ARENA;
    const { CENTER, MIDDLE, CRUMB } = GAME_CONFIG.ARENA.ZONES;

    this.graphics.clear();

    // 饼干主体（浅棕色）
    this.graphics.fillStyle(0xd4a574, 1);
    this.graphics.fillCircle(CENTER_X, CENTER_Y, RADIUS);

    // 饼干边缘（深一点的颜色）
    this.graphics.lineStyle(3, 0xb8935f, 1);
    this.graphics.strokeCircle(CENTER_X, CENTER_Y, RADIUS);

    // 绘制区域标记（调试用，可以设置透明度）
    // 中心区（巧克力区）
    this.graphics.fillStyle(0x8b4513, 0.2);
    this.graphics.fillCircle(CENTER_X, CENTER_Y, CENTER);

    // 中圈（果酱区）
    this.graphics.fillStyle(0xff6b6b, 0.1);
    this.graphics.beginPath();
    this.graphics.arc(CENTER_X, CENTER_Y, MIDDLE, 0, Math.PI * 2);
    this.graphics.arc(CENTER_X, CENTER_Y, CENTER, 0, Math.PI * 2, true);
    this.graphics.closePath();
    this.graphics.fillPath();

    // 外圈（碎屑区）
    this.graphics.fillStyle(0xf4e4c1, 0.3);
    this.graphics.beginPath();
    this.graphics.arc(CENTER_X, CENTER_Y, RADIUS, 0, Math.PI * 2);
    this.graphics.arc(CENTER_X, CENTER_Y, RADIUS - CRUMB, 0, Math.PI * 2, true);
    this.graphics.closePath();
    this.graphics.fillPath();

    // 添加一些装饰性的巧克力豆
    this.drawChocolateChips();
  }

  private drawChocolateChips() {
    const { CENTER_X, CENTER_Y, RADIUS } = GAME_CONFIG.ARENA;
    this.graphics.fillStyle(0x4a2511, 1);

    // 随机分布巧克力豆
    for (let i = 0; i < 25; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * (RADIUS - 50);
      const x = CENTER_X + Math.cos(angle) * distance;
      const y = CENTER_Y + Math.sin(angle) * distance;
      const size = 8 + Math.random() * 6;

      this.graphics.fillCircle(x, y, size);
    }
  }

  update(player: Player, gameTime: number) {
    // 检查玩家是否在碎屑区
    const distanceFromCenter = Phaser.Math.Distance.Between(
      player.x,
      player.y,
      GAME_CONFIG.ARENA.CENTER_X,
      GAME_CONFIG.ARENA.CENTER_Y
    );

    const { RADIUS, ZONES } = GAME_CONFIG.ARENA;
    const inCrumbZone = distanceFromCenter > (RADIUS - ZONES.CRUMB);

    // 显示碎屑区警告
    if (inCrumbZone) {
      this.drawCrumbWarning();
    } else {
      this.crumbZoneWarning.clear();
    }

    // 检查玩家是否超出边界
    if (distanceFromCenter > RADIUS) {
      // 将玩家推回边界内
      const angle = Math.atan2(
        player.y - GAME_CONFIG.ARENA.CENTER_Y,
        player.x - GAME_CONFIG.ARENA.CENTER_X
      );
      player.x = GAME_CONFIG.ARENA.CENTER_X + Math.cos(angle) * RADIUS;
      player.y = GAME_CONFIG.ARENA.CENTER_Y + Math.sin(angle) * RADIUS;
    }
  }

  private drawCrumbWarning() {
    const { CENTER_X, CENTER_Y, RADIUS, ZONES } = GAME_CONFIG.ARENA;

    this.crumbZoneWarning.clear();
    this.crumbZoneWarning.lineStyle(4, 0xff0000, 0.3 + Math.sin(Date.now() / 200) * 0.2);
    this.crumbZoneWarning.strokeCircle(CENTER_X, CENTER_Y, RADIUS - ZONES.CRUMB);
  }

  // 计算玩家的移速惩罚
  getSpeedMultiplier(x: number, y: number): number {
    const distanceFromCenter = Phaser.Math.Distance.Between(
      x, y,
      GAME_CONFIG.ARENA.CENTER_X,
      GAME_CONFIG.ARENA.CENTER_Y
    );

    const { RADIUS, ZONES, SPEED_PENALTY_RATE, MAX_SPEED_PENALTY, CRUMB_SPEED_PENALTY } = GAME_CONFIG.ARENA;

    // 基础距离惩罚
    const distancePenalty = Math.min(
      (distanceFromCenter / 100) * SPEED_PENALTY_RATE,
      MAX_SPEED_PENALTY
    );

    // 碎屑区额外惩罚
    const inCrumbZone = distanceFromCenter > (RADIUS - ZONES.CRUMB);
    const crumbPenalty = inCrumbZone ? CRUMB_SPEED_PENALTY : 0;

    return 1 - distancePenalty - crumbPenalty;
  }

  // 减少饼干耐久度
  damage(amount: number) {
    this.cookieHealth = Math.max(0, this.cookieHealth - amount);
    if (this.cookieHealth <= 0) {
      // 游戏失败
      console.log('💔 饼干被吃光了！');
    }
  }

  getCookieHealth(): number {
    return this.cookieHealth;
  }
}

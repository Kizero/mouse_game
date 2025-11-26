import Phaser from 'phaser';
import { Player } from '../entities/Player';

/**
 * 奶酪陷阱 - 在地上放置减速陷阱
 */
export class CheeseWeapon {
  private scene: Phaser.Scene;
  private player: Player;
  private traps: Phaser.GameObjects.Container[] = [];
  private level: number = 1;
  private damage: number = 3;
  private slowEffect: number = 0.5; // 50%减速
  private placeTimer: number = 0;
  private placeInterval: number = 1500;
  private maxTraps: number = 5;
  private trapDuration: number = 8000; // 8秒

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;
  }

  update(delta: number) {
    this.placeTimer += delta;

    // 放置新陷阱
    if (this.placeTimer >= this.placeInterval && this.traps.length < this.maxTraps) {
      this.placeTrap();
      this.placeTimer = 0;
    }

    // 更新陷阱
    this.traps.forEach((trap, index) => {
      if (!trap.active) {
        this.traps.splice(index, 1);
        return;
      }

      const age = trap.getData('age') + delta;
      trap.setData('age', age);

      // 陷阱过期
      if (age > this.trapDuration) {
        trap.destroy();
        return;
      }

      // 检测敌人
      this.checkTrapCollision(trap);
    });
  }

  private placeTrap() {
    const trap = this.scene.add.container(this.player.x, this.player.y);

    // 绘制奶酪
    const sprite = this.scene.add.graphics();
    sprite.fillStyle(0xffd700, 1);
    sprite.fillRoundedRect(-20, -15, 40, 30, 5);
    sprite.fillStyle(0xffff00, 0.8);
    sprite.fillCircle(-8, -5, 4);
    sprite.fillCircle(5, 0, 3);
    sprite.fillCircle(0, 8, 5);

    trap.add(sprite);
    trap.setData('age', 0);
    trap.setData('radius', 40);
    trap.setData('affectedEnemies', new Set());

    this.traps.push(trap);

    // 出现动画
    trap.setAlpha(0);
    this.scene.tweens.add({
      targets: trap,
      alpha: 1,
      duration: 300,
    });
  }

  private checkTrapCollision(trap: Phaser.GameObjects.Container) {
    const radius = trap.getData('radius');
    const affectedEnemies = trap.getData('affectedEnemies');

    this.scene.events.emit('weapon-area-damage', trap.x, trap.y, radius, this.damage / 10, (enemy: any) => {
      // 标记敌人被减速
      if (!affectedEnemies.has(enemy)) {
        affectedEnemies.add(enemy);
        // TODO: 实际减速效果需要在Enemy类中实现
      }
    });
  }

  upgrade() {
    this.level++;
    this.damage += 2;
    this.trapDuration += 1000;

    if (this.level % 3 === 0) {
      this.maxTraps++;
    }

    this.placeInterval = Math.max(800, this.placeInterval - 100);
    console.log(`⬆️ 奶酪陷阱升级到 Lv.${this.level}`);
  }

  getLevel(): number {
    return this.level;
  }

  destroy() {
    this.traps.forEach(trap => trap.destroy());
    this.traps = [];
  }
}

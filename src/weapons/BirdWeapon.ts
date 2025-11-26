import Phaser from 'phaser';
import { Player } from '../entities/Player';

/**
 * 追踪小鸟 - 召唤小鸟追击敌人
 */
export class BirdWeapon {
  private scene: Phaser.Scene;
  private player: Player;
  private birds: Phaser.GameObjects.Container[] = [];
  private level: number = 1;
  private damage: number = 15;
  private spawnTimer: number = 0;
  private spawnInterval: number = 2000; // 2秒召唤一只
  private maxBirds: number = 3;

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;
  }

  update(delta: number) {
    this.spawnTimer += delta;

    // 生成新鸟
    if (this.spawnTimer >= this.spawnInterval && this.birds.length < this.maxBirds) {
      this.spawnBird();
      this.spawnTimer = 0;
    }

    // 更新所有鸟
    this.birds.forEach((bird, index) => {
      if (!bird.active) {
        this.birds.splice(index, 1);
        return;
      }

      this.updateBird(bird);
    });
  }

  private spawnBird() {
    const bird = this.scene.add.container(this.player.x, this.player.y);

    // 创建小鸟精灵
    const sprite = this.scene.add.sprite(0, 0, 'weapon_bird');
    bird.add(sprite);
    bird.setData('sprite', sprite);
    bird.setData('targetEnemy', null);
    bird.setData('lifetime', 10000); // 10秒生命周期
    bird.setData('age', 0);

    this.scene.physics.add.existing(bird);
    this.birds.push(bird);
  }

  private updateBird(bird: Phaser.GameObjects.Container) {
    const body = bird.body as Phaser.Physics.Arcade.Body;
    const age = bird.getData('age') + 16;
    bird.setData('age', age);

    // 生命周期结束
    if (age > bird.getData('lifetime')) {
      bird.destroy();
      return;
    }

    // 寻找目标
    let target = bird.getData('targetEnemy');
    if (!target || !target.active) {
      target = this.findNearestEnemy(bird.x, bird.y);
      bird.setData('targetEnemy', target);
    }

    if (target) {
      // 追击目标
      const dx = target.x - bird.x;
      const dy = target.y - bird.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const speed = 200;
      body.setVelocity((dx / distance) * speed, (dy / distance) * speed);

      // 翻转方向
      const sprite = bird.getData('sprite');
      sprite.setScale(dx > 0 ? 1 : -1, 1);

      // 碰撞检测
      if (distance < 20) {
        target.takeDamage(this.damage);
        bird.destroy();
      }
    } else {
      // 没有目标，盘旋
      const angle = (age / 500) * Math.PI * 2;
      body.setVelocity(Math.cos(angle) * 100, Math.sin(angle) * 100);
    }
  }

  private findNearestEnemy(x: number, y: number): any {
    let nearest: any = null;
    let minDist = Infinity;

    this.scene.events.emit('get-nearest-enemy', x, y, (enemy: any, dist: number) => {
      if (dist < minDist) {
        minDist = dist;
        nearest = enemy;
      }
    });

    return nearest;
  }

  upgrade() {
    this.level++;
    this.damage += 5;

    if (this.level % 2 === 0) {
      this.maxBirds++;
    }

    this.spawnInterval = Math.max(800, this.spawnInterval - 200);
    console.log(`⬆️ 追踪小鸟升级到 Lv.${this.level}`);
  }

  getLevel(): number {
    return this.level;
  }

  destroy() {
    this.birds.forEach(bird => bird.destroy());
    this.birds = [];
  }
}

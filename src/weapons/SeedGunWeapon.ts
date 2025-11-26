import Phaser from 'phaser';
import { Player } from '../entities/Player';

/**
 * 瓜子机关枪 - 向最近敌人射击
 */
export class SeedGunWeapon {
  private scene: Phaser.Scene;
  private player: Player;
  private bullets: Phaser.GameObjects.Group;
  private level: number = 1;
  private damage: number = 8;
  private fireRate: number = 300; // 毫秒
  private lastFireTime: number = 0;
  private bulletSpeed: number = 300;

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;

    this.bullets = scene.add.group();
  }

  update(delta: number) {
    this.lastFireTime += delta;

    if (this.lastFireTime >= this.fireRate) {
      this.fire();
      this.lastFireTime = 0;
    }

    // 更新子弹
    this.bullets.getChildren().forEach((bullet: any) => {
      if (!bullet.active) return;

      // 检查碰撞
      this.scene.events.emit('weapon-hit-check', bullet.x, bullet.y, 5, this.damage, (hit: boolean) => {
        if (hit) {
          bullet.destroy();
        }
      });

      // 超出范围销毁
      if (Phaser.Math.Distance.Between(bullet.x, bullet.y, this.player.x, this.player.y) > 600) {
        bullet.destroy();
      }
    });
  }

  private fire() {
    // 寻找最近的敌人
    const nearestEnemy = this.findNearestEnemy();
    if (!nearestEnemy) return;

    // 创建瓜子子弹
    const bullet = this.scene.add.sprite(this.player.x, this.player.y, 'weapon_seed');
    this.bullets.add(bullet);

    // 计算方向
    const dx = nearestEnemy.x - this.player.x;
    const dy = nearestEnemy.y - this.player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 添加物理体
    this.scene.physics.add.existing(bullet);
    const body = bullet.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(
      (dx / distance) * this.bulletSpeed,
      (dy / distance) * this.bulletSpeed
    );

    // 旋转子弹
    bullet.setRotation(Math.atan2(dy, dx));
  }

  private findNearestEnemy(): any {
    // 这里需要从EnemyManager获取敌人列表
    // 暂时返回null，后面会通过事件系统连接
    let nearest: any = null;
    let minDist = Infinity;

    this.scene.events.emit('get-nearest-enemy', this.player.x, this.player.y, (enemy: any, dist: number) => {
      if (dist < minDist) {
        minDist = dist;
        nearest = enemy;
      }
    });

    return nearest;
  }

  upgrade() {
    this.level++;
    this.damage += 3;
    this.fireRate = Math.max(100, this.fireRate - 20);

    console.log(`⬆️ 瓜子机关枪升级到 Lv.${this.level}`);
  }

  getLevel(): number {
    return this.level;
  }
}

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
  private evolved: boolean = false;
  private burstCount: number = 1; // 连发数量
  private piercing: boolean = false; // 穿透效果

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

      // 检查碰撞（如果有穿透效果则不销毁子弹）
      this.scene.events.emit('weapon-hit-check', bullet.x, bullet.y, 5, this.damage, (hit: boolean) => {
        if (hit && !this.piercing) {
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

    // 连发机制
    for (let i = 0; i < this.burstCount; i++) {
      this.scene.time.delayedCall(i * 50, () => {
        this.fireBullet(nearestEnemy, i);
      });
    }
  }

  private fireBullet(target: any, index: number) {
    // 创建子弹（进化后使用不同纹理）
    const textureName = this.evolved ? 'weapon_seed' : 'weapon_seed'; // 可以在这里使用不同的纹理
    const bullet = this.scene.add.sprite(this.player.x, this.player.y, textureName);

    // 如果是进化版本，设置不同的颜色
    if (this.evolved) {
      bullet.setTint(0xffaa00); // 金色
    }

    this.bullets.add(bullet);

    // 计算方向（连发时添加轻微散射）
    const dx = target.x - this.player.x;
    const dy = target.y - this.player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 添加散射角度（进化后散射更小）
    const spreadAngle = this.evolved ? 0.1 : 0.15;
    const spread = (index - (this.burstCount - 1) / 2) * spreadAngle;
    const angle = Math.atan2(dy, dx) + spread;

    // 添加物理体
    this.scene.physics.add.existing(bullet);
    const body = bullet.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(
      Math.cos(angle) * this.bulletSpeed,
      Math.sin(angle) * this.bulletSpeed
    );

    // 旋转子弹
    bullet.setRotation(angle);
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

  evolve() {
    if (this.evolved) return;

    this.evolved = true;
    this.burstCount = 5; // 5连发
    this.piercing = true; // 穿透效果
    this.damage *= 1.5; // 伤害提升50%
    this.bulletSpeed *= 1.3; // 子弹速度提升30%

    console.log(`⚡ 瓜子机关枪进化为：坚果风暴！`);
  }
}

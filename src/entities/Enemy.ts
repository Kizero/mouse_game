import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/GameConfig';
import { Player } from './Player';

export type EnemyType = 'ant' | 'cockroach' | 'spider' | 'beetle';

export class Enemy extends Phaser.GameObjects.Container {
  public body!: Phaser.Physics.Arcade.Body;
  private sprite: Phaser.GameObjects.Graphics;
  private enemyType: EnemyType;
  private health: number = 0;
  private maxHealth: number = 0;
  private speed: number = 0;
  private damage: number = 0;
  private expValue: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, type: EnemyType) {
    super(scene, x, y);
    this.enemyType = type;
    this.setEnemyStats();

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.sprite = this.createEnemySprite();
    this.add(this.sprite);

    this.body.setCircle(12);
    this.setSize(24, 24);
  }

  private setEnemyStats() {
    switch (this.enemyType) {
      case 'ant':
        this.health = 10;
        this.maxHealth = 10;
        this.speed = 50;
        this.damage = 5;
        this.expValue = 1;
        break;
      case 'cockroach':
        this.health = 30;
        this.maxHealth = 30;
        this.speed = 30;
        this.damage = 10;
        this.expValue = 3;
        break;
      case 'spider':
        this.health = 15;
        this.maxHealth = 15;
        this.speed = 40;
        this.damage = 8;
        this.expValue = 2;
        break;
      case 'beetle':
        this.health = 50;
        this.maxHealth = 50;
        this.speed = 60;
        this.damage = 15;
        this.expValue = 5;
        break;
    }
  }

  private createEnemySprite(): Phaser.GameObjects.Graphics {
    const g = this.scene.add.graphics();

    switch (this.enemyType) {
      case 'ant':
        // 蚂蚁（黑色小圆）
        g.fillStyle(0x000000, 1);
        g.fillCircle(0, 0, 8);
        g.fillCircle(-6, -3, 5);
        g.fillCircle(6, -3, 5);
        // 触角
        g.lineStyle(2, 0x000000);
        g.lineBetween(-3, -8, -5, -12);
        g.lineBetween(3, -8, 5, -12);
        break;

      case 'cockroach':
        // 蟑螂（棕色椭圆）
        g.fillStyle(0x8b4513, 1);
        g.fillEllipse(0, 0, 16, 12);
        g.fillStyle(0x654321, 1);
        g.fillEllipse(0, 0, 12, 8);
        break;

      case 'spider':
        // 蜘蛛（灰色带腿）
        g.fillStyle(0x666666, 1);
        g.fillCircle(0, 0, 10);
        // 腿
        g.lineStyle(2, 0x333333);
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          g.lineBetween(0, 0, Math.cos(angle) * 12, Math.sin(angle) * 12);
        }
        break;

      case 'beetle':
        // 甲虫（深绿色）
        g.fillStyle(0x2d5016, 1);
        g.fillEllipse(0, 0, 14, 18);
        g.lineStyle(2, 0x1a300d);
        g.lineBetween(0, -9, 0, 9);
        break;
    }

    return g;
  }

  update(player: Player) {
    if (!this.active) return;

    // 朝向玩家移动
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      this.body.setVelocity(
        (dx / distance) * this.speed,
        (dy / distance) * this.speed
      );
    }

    // 检查是否碰撞玩家
    if (distance < 30) {
      this.attackPlayer(player);
    }
  }

  private attackPlayer(player: Player) {
    // 每秒造成一次伤害
    if (!this.getData('lastAttack') || Date.now() - this.getData('lastAttack') > 1000) {
      player.takeDamage(this.damage);
      this.setData('lastAttack', Date.now());
    }
  }

  takeDamage(amount: number) {
    this.health -= amount;

    // 受伤效果
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
    });

    if (this.health <= 0) {
      this.die();
    }
  }

  private die() {
    // 根据敌人类型选择颜色
    let color = 0x000000; // 默认黑色
    switch (this.enemyType) {
      case 'ant':
        color = 0x000000;
        break;
      case 'cockroach':
        color = 0x8b4513;
        break;
      case 'spider':
        color = 0x666666;
        break;
      case 'beetle':
        color = 0x2d5016;
        break;
    }

    // 掉落经验宝石（传递颜色）
    this.scene.events.emit('enemy-killed', this.x, this.y, this.expValue, color);

    this.destroy();
  }

  getExpValue(): number {
    return this.expValue;
  }
}

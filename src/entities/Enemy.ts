import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/GameConfig';
import { Player } from './Player';

export type EnemyType = 'ant' | 'cockroach' | 'spider' | 'beetle' | 'boss';

export class Enemy extends Phaser.GameObjects.Container {
  public body!: Phaser.Physics.Arcade.Body;
  private sprite: Phaser.GameObjects.Sprite;
  private enemyType: EnemyType;
  private health: number = 0;
  private maxHealth: number = 0;
  private speed: number = 0;
  private damage: number = 0;
  private expValue: number = 0;
  private healthBar?: Phaser.GameObjects.Graphics;
  private healthBarBg?: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number, type: EnemyType) {
    super(scene, x, y);
    this.enemyType = type;
    this.setEnemyStats();

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.sprite = this.createEnemySprite();
    this.add(this.sprite);

    // Boss敌人更大
    if (type === 'boss') {
      this.body.setCircle(40);
      this.setSize(80, 80);
      this.createHealthBar();
    } else {
      this.body.setCircle(12);
      this.setSize(24, 24);
    }
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
      case 'boss':
        this.health = 1000;
        this.maxHealth = 1000;
        this.speed = 40;
        this.damage = 30;
        this.expValue = 100;
        break;
    }
  }

  private createEnemySprite(): Phaser.GameObjects.Sprite {
    const textureName = `enemy_${this.enemyType}`;
    const sprite = this.scene.add.sprite(0, 0, textureName);
    return sprite;
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

    // 更新Boss血条
    if (this.enemyType === 'boss' && this.healthBar) {
      this.updateHealthBar();
    }

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
      case 'boss':
        color = 0xcc0000;
        // Boss死亡时额外效果
        this.scene.events.emit('boss-defeated', this.x, this.y);
        break;
    }

    // 掉落经验宝石（传递颜色）
    this.scene.events.emit('enemy-killed', this.x, this.y, this.expValue, color);

    this.destroy();
  }

  private createHealthBar() {
    // 血条背景
    this.healthBarBg = this.scene.add.graphics();
    this.healthBarBg.fillStyle(0x000000, 0.8);
    this.healthBarBg.fillRect(-50, -60, 100, 8);
    this.add(this.healthBarBg);

    // 血条
    this.healthBar = this.scene.add.graphics();
    this.add(this.healthBar);
    this.updateHealthBar();

    // Boss名称
    const bossName = this.scene.add.text(0, -75, '老鼠王', {
      fontSize: '16px',
      color: '#ff0000',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    });
    bossName.setOrigin(0.5);
    this.add(bossName);
  }

  private updateHealthBar() {
    if (!this.healthBar) return;

    this.healthBar.clear();
    const healthPercent = Math.max(0, this.health / this.maxHealth);

    // 根据血量显示不同颜色
    let color = 0x00ff00;
    if (healthPercent < 0.3) {
      color = 0xff0000;
    } else if (healthPercent < 0.6) {
      color = 0xffaa00;
    }

    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(-50, -60, 100 * healthPercent, 8);
  }

  getExpValue(): number {
    return this.expValue;
  }

  isBoss(): boolean {
    return this.enemyType === 'boss';
  }

  getEnemyType(): EnemyType {
    return this.enemyType;
  }
}

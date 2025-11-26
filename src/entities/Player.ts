import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/GameConfig';

export class Player extends Phaser.GameObjects.Container {
  public body!: Phaser.Physics.Arcade.Body;
  private sprite: Phaser.GameObjects.Graphics;
  private health: number;
  private maxHealth: number;
  private baseSpeed: number;
  private currentSpeedMultiplier: number = 1;

  // 经验和等级
  private experience: number = 0;
  private level: number = 1;
  private experienceToNextLevel: number = 10;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.maxHealth = GAME_CONFIG.PLAYER.START_HEALTH;
    this.health = this.maxHealth;
    this.baseSpeed = GAME_CONFIG.PLAYER.START_SPEED;

    // 创建仓鼠图形
    this.sprite = this.createHamsterSprite();
    this.add(this.sprite);

    // 设置物理体
    this.body.setCircle(16);
    this.body.setCollideWorldBounds(false);

    this.setSize(32, 32);
  }

  private createHamsterSprite(): Phaser.GameObjects.Graphics {
    const g = this.scene.add.graphics();

    // 身体（米色）
    g.fillStyle(0xf5deb3, 1);
    g.fillEllipse(0, 0, 28, 24);

    // 耳朵
    g.fillStyle(0xf5deb3, 1);
    g.fillCircle(-10, -12, 6);
    g.fillCircle(10, -12, 6);
    g.fillStyle(0xffc0cb, 1);
    g.fillCircle(-10, -12, 3);
    g.fillCircle(10, -12, 3);

    // 眼睛
    g.fillStyle(0x000000, 1);
    g.fillCircle(-6, -3, 3);
    g.fillCircle(6, -3, 3);

    // 鼻子
    g.fillStyle(0xff69b4, 1);
    g.fillCircle(0, 2, 2);

    // 腮帮子（脸颊囊袋）
    g.fillStyle(0xfff0e1, 0.8);
    g.fillCircle(-12, 4, 6);
    g.fillCircle(12, 4, 6);

    return g;
  }

  update(moveX: number, moveY: number) {
    // 归一化移动向量
    if (moveX !== 0 || moveY !== 0) {
      const length = Math.sqrt(moveX * moveX + moveY * moveY);
      moveX /= length;
      moveY /= length;
    }

    // 应用速度
    const speed = this.baseSpeed * this.currentSpeedMultiplier;
    this.body.setVelocity(moveX * speed, moveY * speed);

    // 面向移动方向
    if (moveX !== 0) {
      this.sprite.setScale(moveX > 0 ? 1 : -1, 1);
    }
  }

  setSpeedMultiplier(multiplier: number) {
    this.currentSpeedMultiplier = multiplier;
  }

  takeDamage(amount: number) {
    this.health = Math.max(0, this.health - amount);

    // 受伤闪烁效果
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 2,
    });

    if (this.health <= 0) {
      this.die();
    }
  }

  heal(amount: number) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  addExperience(amount: number) {
    this.experience += amount;

    if (this.experience >= this.experienceToNextLevel) {
      this.levelUp();
    }
  }

  private levelUp() {
    this.level++;
    this.experience -= this.experienceToNextLevel;
    this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * 1.5);

    // 升级特效
    const circle = this.scene.add.circle(this.x, this.y, 50, 0xffff00, 0.5);
    this.scene.tweens.add({
      targets: circle,
      scale: 2,
      alpha: 0,
      duration: 500,
      onComplete: () => circle.destroy(),
    });

    // 触发升级事件
    this.scene.events.emit('player-levelup', this.level);
  }

  private die() {
    console.log('💀 玩家死亡');
    // TODO: 实现死亡逻辑
  }

  // Getters
  getHealth(): number {
    return this.health;
  }

  getMaxHealth(): number {
    return this.maxHealth;
  }

  getExperience(): number {
    return this.experience;
  }

  getExperienceToNextLevel(): number {
    return this.experienceToNextLevel;
  }

  getLevel(): number {
    return this.level;
  }
}

import Phaser from 'phaser';
import { Player } from '../entities/Player';

/**
 * 木屑旋风 - 以仓鼠为中心的范围伤害
 */
export class SawdustWeapon {
  private scene: Phaser.Scene;
  private player: Player;
  private graphics: Phaser.GameObjects.Graphics;
  private level: number = 1;
  private damage: number = 5;
  private radius: number = 80;
  private damageTimer: number = 0;
  private damageInterval: number = 500; // 每0.5秒造成一次伤害
  private rotationSpeed: number = 3;
  private currentRotation: number = 0;

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;
    this.graphics = scene.add.graphics();
  }

  update(delta: number) {
    this.damageTimer += delta;
    this.currentRotation += (this.rotationSpeed * delta) / 1000;

    // 绘制木屑旋风
    this.drawSawdust();

    // 定期造成伤害
    if (this.damageTimer >= this.damageInterval) {
      this.dealDamage();
      this.damageTimer = 0;
    }
  }

  private drawSawdust() {
    this.graphics.clear();
    this.graphics.setPosition(this.player.x, this.player.y);

    // 绘制旋转的木屑粒子
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2 + this.currentRotation;
      const distance = this.radius * (0.5 + Math.sin(Date.now() / 200 + i) * 0.5);
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;

      this.graphics.fillStyle(0xd2691e, 0.6);
      this.graphics.fillCircle(x, y, 4);
    }
  }

  private dealDamage() {
    // 对范围内的所有敌人造成伤害
    this.scene.events.emit('weapon-area-damage', this.player.x, this.player.y, this.radius, this.damage);
  }

  upgrade() {
    this.level++;
    this.damage += 2;
    this.radius += 10;
    this.damageInterval = Math.max(200, this.damageInterval - 30);
    console.log(`⬆️ 木屑旋风升级到 Lv.${this.level}`);
  }

  getLevel(): number {
    return this.level;
  }

  destroy() {
    this.graphics.destroy();
  }
}

import Phaser from 'phaser';
import { Player } from '../entities/Player';

/**
 * 滚轮飞镖 - 围绕仓鼠旋转的攻击轮
 */
export class SpinnerWeapon {
  private scene: Phaser.Scene;
  private player: Player;
  private spinners: Phaser.GameObjects.Sprite[] = [];
  private level: number = 1;
  private spinnerCount: number = 3;
  private rotationSpeed: number = 2; // 每秒旋转角度
  private damage: number = 10;
  private radius: number = 60;
  private currentAngle: number = 0;
  private evolved: boolean = false;

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;
    this.createSpinners();
  }

  private createSpinners() {
    // 清除旧的
    this.spinners.forEach(s => s.destroy());
    this.spinners = [];

    // 创建新的滚轮
    for (let i = 0; i < this.spinnerCount; i++) {
      const textureName = this.evolved ? 'weapon_spinner_evolved' : 'weapon_spinner';
      const spinner = this.scene.add.sprite(0, 0, textureName);
      this.spinners.push(spinner);
    }
  }

  update(delta: number) {
    // 更新旋转角度
    this.currentAngle += (this.rotationSpeed * delta) / 1000;

    // 更新每个滚轮的位置
    this.spinners.forEach((spinner, index) => {
      const angle = this.currentAngle + (index / this.spinnerCount) * Math.PI * 2;
      const x = this.player.x + Math.cos(angle) * this.radius;
      const y = this.player.y + Math.sin(angle) * this.radius;

      spinner.setPosition(x, y);
      spinner.setRotation(angle);

      // 碰撞检测（与敌人）
      this.checkCollision(spinner, x, y);
    });
  }

  private checkCollision(spinner: Phaser.GameObjects.Sprite, x: number, y: number) {
    // 从场景获取敌人
    this.scene.events.emit('weapon-hit-check', x, y, 15, this.damage);
  }

  upgrade() {
    this.level++;

    if (this.level % 2 === 0) {
      this.spinnerCount++;
      this.createSpinners();
    }

    this.damage += 5;
    this.rotationSpeed += 0.3;

    console.log(`⬆️ 滚轮飞镖升级到 Lv.${this.level}`);
  }

  getLevel(): number {
    return this.level;
  }

  evolve() {
    if (this.evolved) return;

    this.evolved = true;
    this.damage *= 2;
    this.rotationSpeed *= 1.5;
    this.radius *= 1.5; // 范围扩大50%
    this.spinnerCount += 2;

    this.createSpinners();
    console.log(`⚡ 滚轮飞镖进化为：极速转轮！`);
  }
}

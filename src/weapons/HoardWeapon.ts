import Phaser from 'phaser';
import { Player } from '../entities/Player';

/**
 * 囤粮轨道 - 食物在轨道上旋转攻击
 */
export class HoardWeapon {
  private scene: Phaser.Scene;
  private player: Player;
  private orbitItems: Phaser.GameObjects.Graphics[] = [];
  private level: number = 1;
  private itemCount: number = 4;
  private damage: number = 12;
  private orbitRadius: number = 70;
  private rotationSpeed: number = 1.5;
  private currentAngle: number = 0;

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;
    this.createOrbitItems();
  }

  private createOrbitItems() {
    this.orbitItems.forEach(item => item.destroy());
    this.orbitItems = [];

    const foods = [
      { color: 0xff6347, type: 'nut' },      // 坚果
      { color: 0xff8c00, type: 'carrot' },   // 胡萝卜
      { color: 0x90ee90, type: 'apple' },    // 苹果
      { color: 0xffd700, type: 'seed' },     // 种子
    ];

    for (let i = 0; i < this.itemCount; i++) {
      const item = this.scene.add.graphics();
      const food = foods[i % foods.length];

      this.drawFood(item, food.color, food.type);
      this.orbitItems.push(item);
    }
  }

  private drawFood(g: Phaser.GameObjects.Graphics, color: number, type: string) {
    g.clear();

    switch(type) {
      case 'nut':
        g.fillStyle(color, 1);
        g.fillCircle(0, 0, 8);
        g.fillStyle(0x8b4513, 1);
        g.fillCircle(0, 0, 4);
        break;
      case 'carrot':
        g.fillStyle(color, 1);
        g.beginPath();
        g.moveTo(0, -10);
        g.lineTo(-5, 5);
        g.lineTo(5, 5);
        g.closePath();
        g.fillPath();
        break;
      case 'apple':
        g.fillStyle(color, 1);
        g.fillCircle(0, 0, 7);
        g.fillStyle(0x228b22, 1);
        g.fillRect(-2, -10, 4, 5);
        break;
      case 'seed':
        g.fillStyle(color, 1);
        g.fillEllipse(0, 0, 6, 10);
        break;
    }
  }

  update(delta: number) {
    this.currentAngle += (this.rotationSpeed * delta) / 1000;

    this.orbitItems.forEach((item, index) => {
      const angle = this.currentAngle + (index / this.itemCount) * Math.PI * 2;
      const x = this.player.x + Math.cos(angle) * this.orbitRadius;
      const y = this.player.y + Math.sin(angle) * this.orbitRadius;

      item.setPosition(x, y);
      item.setRotation(angle);

      // 碰撞检测
      this.scene.events.emit('weapon-hit-check', x, y, 15, this.damage);
    });
  }

  upgrade() {
    this.level++;
    this.damage += 4;
    this.rotationSpeed += 0.2;

    if (this.level % 2 === 0) {
      this.itemCount++;
      this.createOrbitItems();
    }

    console.log(`⬆️ 囤粮轨道升级到 Lv.${this.level}`);
  }

  getLevel(): number {
    return this.level;
  }

  destroy() {
    this.orbitItems.forEach(item => item.destroy());
    this.orbitItems = [];
  }
}

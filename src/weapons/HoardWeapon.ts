import Phaser from 'phaser';
import { Player } from '../entities/Player';

/**
 * 囤粮轨道 - 食物在轨道上旋转攻击
 */
export class HoardWeapon {
  private scene: Phaser.Scene;
  private player: Player;
  private orbitItems: Phaser.GameObjects.Sprite[] = [];
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

    const foodTypes = ['nut', 'carrot', 'apple', 'seed'];

    for (let i = 0; i < this.itemCount; i++) {
      const type = foodTypes[i % foodTypes.length];
      const item = this.scene.add.sprite(0, 0, `weapon_hoard_${type}`);
      this.orbitItems.push(item);
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

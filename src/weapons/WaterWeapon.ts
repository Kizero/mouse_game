import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { GAME_CONFIG } from '../config/GameConfig';

/**
 * 水壶喷泉 - 从中心向外发射环形水波
 */
export class WaterWeapon {
  private scene: Phaser.Scene;
  private player: Player;
  private waves: Phaser.GameObjects.Graphics[] = [];
  private level: number = 1;
  private damage: number = 8;
  private waveTimer: number = 0;
  private waveInterval: number = 2500;
  private pushForce: number = 50;

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;
  }

  update(delta: number) {
    this.waveTimer += delta;

    // 发射新水波
    if (this.waveTimer >= this.waveInterval) {
      this.createWave();
      this.waveTimer = 0;
    }

    // 更新所有水波
    this.waves.forEach((wave, index) => {
      if (!wave.active) {
        this.waves.splice(index, 1);
        return;
      }

      const radius = wave.getData('radius') + 200 * (delta / 1000);
      wave.setData('radius', radius);

      const age = wave.getData('age') + delta;
      wave.setData('age', age);

      // 绘制水波
      this.drawWave(wave, radius, age);

      // 造成伤害
      this.dealWaveDamage(radius);

      // 水波消失
      if (radius > 400 || age > 2000) {
        wave.destroy();
      }
    });
  }

  private createWave() {
    const wave = this.scene.add.graphics();
    wave.setData('radius', 30);
    wave.setData('age', 0);
    this.waves.push(wave);
  }

  private drawWave(wave: Phaser.GameObjects.Graphics, radius: number, age: number) {
    wave.clear();
    wave.setPosition(this.player.x, this.player.y);

    const alpha = Math.max(0, 1 - age / 2000);
    wave.lineStyle(8, 0x00bfff, alpha);
    wave.strokeCircle(0, 0, radius);
    wave.lineStyle(4, 0xffffff, alpha * 0.5);
    wave.strokeCircle(0, 0, radius);
  }

  private dealWaveDamage(radius: number) {
    // 在环形范围内造成伤害和击退
    this.scene.events.emit('weapon-wave-damage',
      this.player.x,
      this.player.y,
      radius - 10,
      radius + 10,
      this.damage,
      this.pushForce
    );
  }

  upgrade() {
    this.level++;
    this.damage += 3;
    this.pushForce += 10;
    this.waveInterval = Math.max(1000, this.waveInterval - 200);

    console.log(`⬆️ 水壶喷泉升级到 Lv.${this.level}`);
  }

  getLevel(): number {
    return this.level;
  }

  destroy() {
    this.waves.forEach(wave => wave.destroy());
    this.waves = [];
  }
}

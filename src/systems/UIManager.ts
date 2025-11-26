import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/GameConfig';
import { Player } from '../entities/Player';

export class UIManager {
  private scene: Phaser.Scene;
  private player: Player;

  private healthBar!: Phaser.GameObjects.Graphics;
  private healthText!: Phaser.GameObjects.Text;
  private expBar!: Phaser.GameObjects.Graphics;
  private levelText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;
    this.createUI();
  }

  private createUI() {
    const { WIDTH } = GAME_CONFIG;

    // 血条
    this.healthBar = this.scene.add.graphics();
    this.healthText = this.scene.add.text(20, 20, '', {
      fontSize: '18px',
      color: '#fff',
      backgroundColor: '#00000088',
      padding: { x: 10, y: 5 },
    });

    // 经验条
    this.expBar = this.scene.add.graphics();
    this.levelText = this.scene.add.text(20, 60, '', {
      fontSize: '16px',
      color: '#fff',
      backgroundColor: '#00000088',
      padding: { x: 10, y: 5 },
    });

    // 时间显示
    this.timeText = this.scene.add.text(WIDTH - 20, 20, '', {
      fontSize: '24px',
      color: '#fff',
      backgroundColor: '#00000088',
      padding: { x: 10, y: 5 },
    });
    this.timeText.setOrigin(1, 0);

    // 设置UI深度（始终在最上层）
    [this.healthBar, this.healthText, this.expBar, this.levelText, this.timeText].forEach(
      obj => obj.setDepth(1000)
    );
  }

  update(gameTime: number) {
    this.updateHealthBar();
    this.updateExpBar();
    this.updateTime(gameTime);
  }

  private updateHealthBar() {
    const health = this.player.getHealth();
    const maxHealth = this.player.getMaxHealth();
    const percentage = health / maxHealth;

    this.healthBar.clear();

    // 背景
    this.healthBar.fillStyle(0x000000, 0.5);
    this.healthBar.fillRect(20, 45, 200, 10);

    // 血量（爱心颜色）
    const color = percentage > 0.5 ? 0xff69b4 : (percentage > 0.25 ? 0xff9900 : 0xff0000);
    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(20, 45, 200 * percentage, 10);

    this.healthText.setText(`❤️ ${Math.ceil(health)}/${maxHealth}`);
  }

  private updateExpBar() {
    const exp = this.player.getExperience();
    const expToNext = this.player.getExperienceToNextLevel();
    const percentage = exp / expToNext;

    this.expBar.clear();

    // 背景
    this.expBar.fillStyle(0x000000, 0.5);
    this.expBar.fillRect(20, 85, 200, 8);

    // 经验值
    this.expBar.fillStyle(0x00ff00, 1);
    this.expBar.fillRect(20, 85, 200 * percentage, 8);

    this.levelText.setText(`等级 ${this.player.getLevel()} • ${exp}/${expToNext} EXP`);
  }

  private updateTime(gameTime: number) {
    const seconds = Math.floor(gameTime / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    this.timeText.setText(`⏱️ ${minutes}:${secs.toString().padStart(2, '0')}`);
  }
}

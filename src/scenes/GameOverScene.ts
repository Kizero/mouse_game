import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/GameConfig';
import { ProgressionManager } from '../systems/ProgressionManager';

interface GameStats {
  kills: number;
  level: number;
  time: number;
}

export class GameOverScene extends Phaser.Scene {
  private stats!: GameStats;
  private crumbsEarned: number = 0;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: GameStats) {
    this.stats = data;
  }

  create() {
    const { WIDTH, HEIGHT } = GAME_CONFIG;
    const progression = ProgressionManager.getInstance();

    // 计算奖励
    this.crumbsEarned = progression.endSession(this.stats);

    // 半透明黑色背景
    const overlay = this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x000000, 0.9);
    overlay.setOrigin(0);

    // 游戏结束标题
    const title = this.add.text(WIDTH / 2, HEIGHT / 4, '💀 游戏结束', {
      fontSize: '64px',
      color: '#ff6b35',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);

    // 闪烁效果
    this.tweens.add({
      targets: title,
      alpha: 0.7,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // 统计数据
    const statsY = HEIGHT / 2 - 80;
    this.createStatLine('⏱️ 存活时间', this.formatTime(this.stats.time), statsY);
    this.createStatLine('⚔️ 击杀数', this.stats.kills.toString(), statsY + 50);
    this.createStatLine('📈 最高等级', 'Lv.' + this.stats.level, statsY + 100);

    // 奖励显示
    const rewardY = HEIGHT / 2 + 100;
    const rewardBg = this.add.rectangle(WIDTH / 2, rewardY, 500, 80, 0xffd700, 0.2);
    rewardBg.setStrokeStyle(3, 0xffd700);

    const rewardText = this.add.text(WIDTH / 2, rewardY - 15, '🍪 获得饼干碎片', {
      fontSize: '24px',
      color: '#ffd700',
    });
    rewardText.setOrigin(0.5);

    const rewardAmount = this.add.text(WIDTH / 2, rewardY + 15, `+${this.crumbsEarned}`, {
      fontSize: '36px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    rewardAmount.setOrigin(0.5);

    // 闪烁效果
    this.tweens.add({
      targets: [rewardBg, rewardText, rewardAmount],
      scale: 1.05,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    // 按钮区
    const buttonY = HEIGHT - 120;

    // 重新开始按钮
    const restartButton = this.add.text(WIDTH / 2 - 140, buttonY, '再来一次', {
      fontSize: '24px',
      color: '#fff',
      backgroundColor: '#ff6b35',
      padding: { x: 25, y: 15 },
    });
    restartButton.setOrigin(0.5);
    restartButton.setInteractive({ useHandCursor: true });

    restartButton.on('pointerover', () => {
      restartButton.setScale(1.1);
    });

    restartButton.on('pointerout', () => {
      restartButton.setScale(1);
    });

    restartButton.on('pointerdown', () => {
      progression.startNewSession();
      this.scene.start('GameScene');
    });

    // 返回主菜单按钮
    const menuButton = this.add.text(WIDTH / 2 + 140, buttonY, '返回主菜单', {
      fontSize: '24px',
      color: '#fff',
      backgroundColor: '#666',
      padding: { x: 25, y: 15 },
    });
    menuButton.setOrigin(0.5);
    menuButton.setInteractive({ useHandCursor: true });

    menuButton.on('pointerover', () => {
      menuButton.setScale(1.1);
    });

    menuButton.on('pointerout', () => {
      menuButton.setScale(1);
    });

    menuButton.on('pointerdown', () => {
      this.scene.start('MainMenuScene');
    });

    // 淡入效果
    this.cameras.main.fadeIn(500);
  }

  private createStatLine(label: string, value: string, y: number) {
    const { WIDTH } = GAME_CONFIG;

    const labelText = this.add.text(WIDTH / 2 - 150, y, label, {
      fontSize: '24px',
      color: '#cccccc',
    });

    const valueText = this.add.text(WIDTH / 2 + 150, y, value, {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    valueText.setOrigin(1, 0);
  }

  private formatTime(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}

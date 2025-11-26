import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/GameConfig';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    const { WIDTH, HEIGHT } = GAME_CONFIG;

    // 标题
    const title = this.add.text(WIDTH / 2, HEIGHT / 3, '🍪 饼干保卫战', {
      fontSize: '64px',
      color: '#ff6b35',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);

    // 副标题
    const subtitle = this.add.text(WIDTH / 2, HEIGHT / 3 + 70, 'Cookie Defense', {
      fontSize: '24px',
      color: '#666',
    });
    subtitle.setOrigin(0.5);

    // 开始按钮
    const startButton = this.add.text(WIDTH / 2, HEIGHT / 2 + 20, '开始游戏', {
      fontSize: '32px',
      color: '#fff',
      backgroundColor: '#ff6b35',
      padding: { x: 30, y: 15 },
    });
    startButton.setOrigin(0.5);
    startButton.setInteractive({ useHandCursor: true });

    // 按钮交互
    startButton.on('pointerover', () => {
      startButton.setScale(1.1);
    });

    startButton.on('pointerout', () => {
      startButton.setScale(1);
    });

    startButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    // 元进度按钮
    const metaButton = this.add.text(WIDTH / 2, HEIGHT / 2 + 90, '🏠 仓鼠小窝', {
      fontSize: '28px',
      color: '#fff',
      backgroundColor: '#4a90e2',
      padding: { x: 25, y: 12 },
    });
    metaButton.setOrigin(0.5);
    metaButton.setInteractive({ useHandCursor: true });

    metaButton.on('pointerover', () => {
      metaButton.setScale(1.1);
    });

    metaButton.on('pointerout', () => {
      metaButton.setScale(1);
    });

    metaButton.on('pointerdown', () => {
      this.scene.start('MetaProgressScene');
    });

    // 说明文本
    const instructions = this.add.text(WIDTH / 2, HEIGHT - 100,
      'WASD/方向键移动 • 自动攻击 • 拾取经验升级', {
      fontSize: '18px',
      color: '#999',
    });
    instructions.setOrigin(0.5);
  }
}

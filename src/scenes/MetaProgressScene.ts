import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/GameConfig';
import {
  ProgressionManager,
  HAMSTER_INFO,
  COOKIE_INFO,
  PERMANENT_UPGRADE_INFO,
  HamsterType,
  CookieType,
} from '../systems/ProgressionManager';

export class MetaProgressScene extends Phaser.Scene {
  private progression!: ProgressionManager;
  private selectedTab: 'hamsters' | 'cookies' | 'upgrades' = 'upgrades';

  constructor() {
    super({ key: 'MetaProgressScene' });
  }

  create() {
    this.progression = ProgressionManager.getInstance();
    const { WIDTH, HEIGHT } = GAME_CONFIG;

    // 背景
    this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x2a2a2a).setOrigin(0);

    // 标题
    const title = this.add.text(WIDTH / 2, 40, '🏠 仓鼠小窝', {
      fontSize: '48px',
      color: '#ffd700',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);

    // 货币显示
    const crumbsDisplay = this.add.text(WIDTH / 2, 90, '', {
      fontSize: '24px',
      color: '#ffffff',
    });
    crumbsDisplay.setOrigin(0.5);
    this.updateCrumbsDisplay(crumbsDisplay);

    // 标签页按钮
    this.createTabButtons();

    // 内容区域
    this.createContentArea();

    // 返回主菜单按钮
    const backButton = this.add.text(WIDTH - 30, HEIGHT - 30, '返回主菜单', {
      fontSize: '20px',
      color: '#fff',
      backgroundColor: '#666',
      padding: { x: 20, y: 10 },
    });
    backButton.setOrigin(1);
    backButton.setInteractive({ useHandCursor: true });

    backButton.on('pointerover', () => {
      backButton.setBackgroundColor('#888');
    });

    backButton.on('pointerout', () => {
      backButton.setBackgroundColor('#666');
    });

    backButton.on('pointerdown', () => {
      this.scene.start('MainMenuScene');
    });
  }

  private updateCrumbsDisplay(text: Phaser.GameObjects.Text) {
    const crumbs = this.progression.getCookieCrumbs();
    text.setText(`🍪 饼干碎片: ${crumbs}`);
  }

  private createTabButtons() {
    const { WIDTH } = GAME_CONFIG;
    const tabs = [
      { key: 'upgrades', label: '永久升级' },
      { key: 'hamsters', label: '仓鼠' },
      { key: 'cookies', label: '饼干' },
    ];

    const tabWidth = 150;
    const startX = WIDTH / 2 - (tabs.length * tabWidth) / 2;

    tabs.forEach((tab, index) => {
      const x = startX + index * tabWidth;
      const y = 150;

      const button = this.add.text(x, y, tab.label, {
        fontSize: '20px',
        color: '#fff',
        backgroundColor: this.selectedTab === tab.key ? '#ff6b35' : '#444',
        padding: { x: 20, y: 10 },
      });
      button.setInteractive({ useHandCursor: true });

      button.on('pointerover', () => {
        if (this.selectedTab !== tab.key) {
          button.setBackgroundColor('#666');
        }
      });

      button.on('pointerout', () => {
        button.setBackgroundColor(this.selectedTab === tab.key ? '#ff6b35' : '#444');
      });

      button.on('pointerdown', () => {
        this.selectedTab = tab.key as any;
        this.scene.restart();
      });
    });
  }

  private createContentArea() {
    const { WIDTH, HEIGHT } = GAME_CONFIG;

    // 内容容器
    const contentY = 220;
    const contentHeight = HEIGHT - contentY - 100;

    switch (this.selectedTab) {
      case 'upgrades':
        this.showUpgradesContent(contentY, contentHeight);
        break;
      case 'hamsters':
        this.showHamstersContent(contentY, contentHeight);
        break;
      case 'cookies':
        this.showCookiesContent(contentY, contentHeight);
        break;
    }
  }

  private showUpgradesContent(startY: number, height: number) {
    const { WIDTH } = GAME_CONFIG;
    let currentY = startY + 20;

    Object.entries(PERMANENT_UPGRADE_INFO).forEach(([key, info]) => {
      const upgradeKey = key as keyof typeof PERMANENT_UPGRADE_INFO;
      const data = this.progression.getData();
      const currentLevel = data.permanentUpgrades[upgradeKey];
      const cost = this.progression.getUpgradeCost(upgradeKey);
      const maxed = cost === -1;

      // 升级项背景
      const bg = this.add.rectangle(WIDTH / 2, currentY, 700, 80, 0x333333);
      bg.setStrokeStyle(2, maxed ? 0x00ff00 : 0x666666);

      // 升级名称和描述
      const nameText = this.add.text(WIDTH / 2 - 320, currentY - 20, info.name, {
        fontSize: '22px',
        color: maxed ? '#00ff00' : '#ffffff',
        fontStyle: 'bold',
      });

      const descText = this.add.text(WIDTH / 2 - 320, currentY + 5, info.description, {
        fontSize: '16px',
        color: '#cccccc',
      });

      // 当前等级
      const levelText = this.add.text(WIDTH / 2, currentY, `Lv.${currentLevel}/${info.maxLevel}`, {
        fontSize: '20px',
        color: '#ffffff',
      });
      levelText.setOrigin(0.5);

      if (!maxed) {
        // 购买按钮
        const buyButton = this.add.text(WIDTH / 2 + 200, currentY, `购买 (${cost} 🍪)`, {
          fontSize: '18px',
          color: '#fff',
          backgroundColor: '#ff6b35',
          padding: { x: 15, y: 8 },
        });
        buyButton.setOrigin(0.5);
        buyButton.setInteractive({ useHandCursor: true });

        buyButton.on('pointerover', () => {
          buyButton.setScale(1.05);
        });

        buyButton.on('pointerout', () => {
          buyButton.setScale(1);
        });

        buyButton.on('pointerdown', () => {
          if (this.progression.buyPermanentUpgrade(upgradeKey)) {
            this.scene.restart();
          } else {
            // 提示碎片不足
            const warning = this.add.text(WIDTH / 2, 100, '饼干碎片不足！', {
              fontSize: '24px',
              color: '#ff0000',
            });
            warning.setOrigin(0.5);

            this.time.delayedCall(2000, () => warning.destroy());
          }
        });
      } else {
        // 已满级
        const maxText = this.add.text(WIDTH / 2 + 200, currentY, '已满级', {
          fontSize: '18px',
          color: '#00ff00',
        });
        maxText.setOrigin(0.5);
      }

      currentY += 100;
    });
  }

  private showHamstersContent(startY: number, height: number) {
    const { WIDTH } = GAME_CONFIG;
    let currentY = startY + 20;

    Object.entries(HAMSTER_INFO).forEach(([key, info]) => {
      const hamsterKey = key as HamsterType;
      const unlocked = this.progression.isHamsterUnlocked(hamsterKey);

      // 仓鼠卡片
      const bg = this.add.rectangle(WIDTH / 2, currentY, 700, 100, unlocked ? 0x4a4a4a : 0x333333);
      bg.setStrokeStyle(2, unlocked ? 0x00ff00 : 0x666666);

      // 仓鼠图标（简单的emoji或文字）
      const icon = this.add.text(WIDTH / 2 - 320, currentY, '🐹', {
        fontSize: '48px',
      });
      icon.setOrigin(0.5);

      // 名称和描述
      const nameText = this.add.text(WIDTH / 2 - 260, currentY - 25, info.name, {
        fontSize: '24px',
        color: unlocked ? '#00ff00' : '#888',
        fontStyle: 'bold',
      });

      const descText = this.add.text(WIDTH / 2 - 260, currentY + 5, info.description, {
        fontSize: '16px',
        color: '#cccccc',
      });

      // 属性
      const statsText = this.add.text(WIDTH / 2 - 260, currentY + 28,
        `HP: ${info.stats.health} | 速度: ${info.stats.speed} | 伤害: ${info.stats.damage}x`, {
        fontSize: '14px',
        color: '#aaaaaa',
      });

      if (!unlocked && info.cost > 0) {
        // 解锁按钮
        const unlockButton = this.add.text(WIDTH / 2 + 220, currentY, `解锁 (${info.cost} 🍪)`, {
          fontSize: '18px',
          color: '#fff',
          backgroundColor: '#ff6b35',
          padding: { x: 15, y: 8 },
        });
        unlockButton.setOrigin(0.5);
        unlockButton.setInteractive({ useHandCursor: true });

        unlockButton.on('pointerover', () => {
          unlockButton.setScale(1.05);
        });

        unlockButton.on('pointerout', () => {
          unlockButton.setScale(1);
        });

        unlockButton.on('pointerdown', () => {
          if (this.progression.unlockHamster(hamsterKey)) {
            this.scene.restart();
          }
        });
      } else if (unlocked) {
        const ownedText = this.add.text(WIDTH / 2 + 220, currentY, '✅ 已拥有', {
          fontSize: '18px',
          color: '#00ff00',
        });
        ownedText.setOrigin(0.5);
      }

      currentY += 120;
    });
  }

  private showCookiesContent(startY: number, height: number) {
    const { WIDTH } = GAME_CONFIG;
    let currentY = startY + 20;

    Object.entries(COOKIE_INFO).forEach(([key, info]) => {
      const cookieKey = key as CookieType;
      const unlocked = this.progression.isCookieUnlocked(cookieKey);

      // 饼干卡片
      const bg = this.add.rectangle(WIDTH / 2, currentY, 700, 90, unlocked ? 0x4a4a4a : 0x333333);
      bg.setStrokeStyle(2, unlocked ? 0x00ff00 : 0x666666);

      // 饼干图标
      const icon = this.add.text(WIDTH / 2 - 320, currentY, '🍪', {
        fontSize: '48px',
      });
      icon.setOrigin(0.5);

      // 名称和描述
      const nameText = this.add.text(WIDTH / 2 - 260, currentY - 15, info.name, {
        fontSize: '24px',
        color: unlocked ? '#00ff00' : '#888',
        fontStyle: 'bold',
      });

      const descText = this.add.text(WIDTH / 2 - 260, currentY + 15, info.description, {
        fontSize: '16px',
        color: '#cccccc',
      });

      if (!unlocked) {
        // 解锁按钮
        const unlockButton = this.add.text(WIDTH / 2 + 220, currentY, `解锁 (${info.cost} 🍪)`, {
          fontSize: '18px',
          color: '#fff',
          backgroundColor: '#ff6b35',
          padding: { x: 15, y: 8 },
        });
        unlockButton.setOrigin(0.5);
        unlockButton.setInteractive({ useHandCursor: true });

        unlockButton.on('pointerover', () => {
          unlockButton.setScale(1.05);
        });

        unlockButton.on('pointerout', () => {
          unlockButton.setScale(1);
        });

        unlockButton.on('pointerdown', () => {
          if (this.progression.unlockCookie(cookieKey)) {
            this.scene.restart();
          }
        });
      } else {
        const ownedText = this.add.text(WIDTH / 2 + 220, currentY, '✅ 已拥有', {
          fontSize: '18px',
          color: '#00ff00',
        });
        ownedText.setOrigin(0.5);
      }

      currentY += 110;
    });
  }
}

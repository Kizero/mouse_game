import Phaser from 'phaser';
import { WeaponManager, WeaponType, WEAPON_INFO } from '../systems/WeaponManager';
import { PassiveItemManager, PassiveItemType, PASSIVE_ITEM_INFO } from '../systems/PassiveItemManager';
import { GAME_CONFIG } from '../config/GameConfig';

interface LevelUpOption {
  type: 'weapon' | 'upgrade' | 'passive';
  weaponType?: WeaponType;
  passiveType?: PassiveItemType;
  title: string;
  description: string;
}

export class LevelUpScene extends Phaser.Scene {
  private weaponManager!: WeaponManager;
  private passiveItemManager!: PassiveItemManager;
  private currentWeapons: WeaponType[] = [];
  private options: LevelUpOption[] = [];

  constructor() {
    super({ key: 'LevelUpScene' });
  }

  init(data: any) {
    this.weaponManager = data.weaponManager;
    this.passiveItemManager = data.passiveItemManager;
    this.currentWeapons = data.currentWeapons || [];
  }

  create() {
    const { WIDTH, HEIGHT } = GAME_CONFIG;

    // 半透明黑色背景
    const overlay = this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x000000, 0.8);
    overlay.setOrigin(0);

    // 标题
    const title = this.add.text(WIDTH / 2, HEIGHT / 4, '🎉 升级！', {
      fontSize: '48px',
      color: '#ffff00',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);

    // 副标题
    const subtitle = this.add.text(WIDTH / 2, HEIGHT / 4 + 60, '选择一项升级', {
      fontSize: '24px',
      color: '#ffffff',
    });
    subtitle.setOrigin(0.5);

    // 生成3个选项
    this.options = this.generateOptions();

    // 显示选项
    this.displayOptions();
  }

  private generateOptions(): LevelUpOption[] {
    const options: LevelUpOption[] = [];
    const allWeapons: WeaponType[] = ['spinner', 'seedgun', 'sawdust', 'bird', 'cheese', 'hoard', 'water'];
    const availableNewWeapons = allWeapons.filter(w => !this.currentWeapons.includes(w));

    // 获取可用的被动道具
    const availablePassiveItems = this.passiveItemManager.getRandomItemOptions(3);

    // 生成3个随机选项（混合武器和被动道具）
    for (let i = 0; i < 3; i++) {
      const rand = Math.random();

      // 30%几率获得被动道具
      if (rand < 0.3 && availablePassiveItems.length > 0) {
        const passiveType = availablePassiveItems.shift()!;
        const info = PASSIVE_ITEM_INFO[passiveType];
        const currentLevel = this.passiveItemManager.getItemLevel(passiveType);

        options.push({
          type: 'passive',
          passiveType,
          title: `${info.icon} ${info.name}`,
          description: `Lv.${currentLevel} → Lv.${currentLevel + 1} | ${info.description}`,
        });
      }
      // 35%几率获得新武器（如果有可用的）
      else if (rand < 0.65 && availableNewWeapons.length > 0 &&
               (this.currentWeapons.length === 0 || Math.random() < 0.7)) {
        const weaponType = Phaser.Utils.Array.RemoveRandomElement(availableNewWeapons) as unknown as WeaponType | undefined;
        if (weaponType) {
          const info = WEAPON_INFO[weaponType];
          options.push({
            type: 'weapon',
            weaponType,
            title: `🆕 ${info.name}`,
            description: info.description,
          });
        }
      }
      // 35%几率升级现有武器
      else if (this.currentWeapons.length > 0) {
        const weaponType = Phaser.Utils.Array.GetRandom(this.currentWeapons) as unknown as WeaponType;
        const info = WEAPON_INFO[weaponType];
        options.push({
          type: 'upgrade',
          weaponType,
          title: `⬆️ ${info.name}`,
          description: `升级 ${info.name}`,
        });
      }
    }

    // 如果选项不足3个，用被动道具或武器升级填充
    while (options.length < 3) {
      if (availablePassiveItems.length > 0 && Math.random() < 0.5) {
        // 填充被动道具
        const passiveType = availablePassiveItems.shift()!;
        const info = PASSIVE_ITEM_INFO[passiveType];
        const currentLevel = this.passiveItemManager.getItemLevel(passiveType);

        options.push({
          type: 'passive',
          passiveType,
          title: `${info.icon} ${info.name}`,
          description: `Lv.${currentLevel} → Lv.${currentLevel + 1} | ${info.description}`,
        });
      } else if (this.currentWeapons.length > 0) {
        // 填充武器升级
        const weaponType = Phaser.Utils.Array.GetRandom(this.currentWeapons) as unknown as WeaponType;
        const info = WEAPON_INFO[weaponType];
        options.push({
          type: 'upgrade',
          weaponType,
          title: `⬆️ ${info.name}`,
          description: `升级 ${info.name}`,
        });
      } else {
        break; // 无法继续填充
      }
    }

    return options;
  }

  private displayOptions() {
    const { WIDTH, HEIGHT } = GAME_CONFIG;
    const startY = HEIGHT / 2;
    const spacing = 120;

    this.options.forEach((option, index) => {
      const y = startY + index * spacing;

      // 选项背景
      const bg = this.add.rectangle(WIDTH / 2, y, 500, 100, 0x333333, 1);
      bg.setStrokeStyle(3, 0x666666);
      bg.setInteractive({ useHandCursor: true });

      // 选项文字
      const titleText = this.add.text(WIDTH / 2, y - 20, option.title, {
        fontSize: '28px',
        color: '#ffffff',
        fontStyle: 'bold',
      });
      titleText.setOrigin(0.5);

      const descText = this.add.text(WIDTH / 2, y + 15, option.description, {
        fontSize: '18px',
        color: '#cccccc',
      });
      descText.setOrigin(0.5);

      // 鼠标悬停效果
      bg.on('pointerover', () => {
        bg.setFillStyle(0x555555);
        bg.setStrokeStyle(3, 0xffff00);
      });

      bg.on('pointerout', () => {
        bg.setFillStyle(0x333333);
        bg.setStrokeStyle(3, 0x666666);
      });

      // 点击选择
      bg.on('pointerdown', () => {
        this.selectOption(option);
      });

      // 也让文字可以点击
      [titleText, descText].forEach(text => {
        text.setInteractive({ useHandCursor: true });
        text.on('pointerdown', () => {
          this.selectOption(option);
        });
      });
    });

    // 提示文字
    const hint = this.add.text(WIDTH / 2, HEIGHT - 80, '点击选择一项升级', {
      fontSize: '16px',
      color: '#999999',
    });
    hint.setOrigin(0.5);
  }

  private selectOption(option: LevelUpOption) {
    if (option.type === 'passive' && option.passiveType) {
      this.passiveItemManager.addItem(option.passiveType);
    } else if (option.weaponType) {
      this.weaponManager.addWeapon(option.weaponType);
    }

    // 触发事件通知GameScene
    this.events.emit('selection-made');

    // 关闭升级界面
    this.scene.stop();
  }
}

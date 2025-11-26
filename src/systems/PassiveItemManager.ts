import Phaser from 'phaser';
import { Player } from '../entities/Player';

/**
 * 被动道具系统 - 20种被动道具
 */

export type PassiveItemType =
  | 'cheekPouch'       // 脸颊囊袋 - 拾取范围
  | 'thickFur'         // 厚实皮毛 - 最大生命值
  | 'agility'          // 短腿疾跑 - 移动速度
  | 'sharpClaws'       // 尖牙利爪 - 伤害
  | 'nightVision'      // 夜视能力 - 经验获取
  | 'hoarding'         // 储粮本能 - 掉落率
  | 'keenNose'         // 敏锐嗅觉 - 暴击率
  | 'metabolism'       // 快速新陈代谢 - 生命恢复
  | 'nutArmor'         // 坚果盔甲 - 护甲
  | 'tinySize'         // 迷你体型 - 闪避率
  | 'waterCharm'       // 水壶护符 - 冷却缩减
  | 'wheelHeart'       // 转轮之心 - 攻击速度
  | 'sawdustShield'    // 木屑护盾 - 伤害减免
  | 'birdWhisperer'    // 鸟语者 - 召唤持续
  | 'cheesePower'      // 芝士力量 - 范围大小
  | 'nutAmmo'          // 坚果弹药 - 弹射数量
  | 'glutton'          // 贪吃鼠 - 每级生命
  | 'athlete'          // 运动健将 - 移速爆发
  | 'luckyStar'        // 幸运星 - 稀有掉落
  | 'hamsterCrown';    // 仓鼠王冠 - 全属性

export interface PassiveItemInfo {
  name: string;
  description: string;
  icon: string;
  maxLevel: number;
  effects: {
    stat: string;
    valuePerLevel: number;
  }[];
}

export const PASSIVE_ITEM_INFO: Record<PassiveItemType, PassiveItemInfo> = {
  cheekPouch: {
    name: '脸颊囊袋',
    description: '拾取范围 +15',
    icon: '👄',
    maxLevel: 5,
    effects: [{ stat: 'pickupRange', valuePerLevel: 15 }],
  },
  thickFur: {
    name: '厚实皮毛',
    description: '最大生命值 +20',
    icon: '🧶',
    maxLevel: 5,
    effects: [{ stat: 'maxHealth', valuePerLevel: 20 }],
  },
  agility: {
    name: '短腿疾跑',
    description: '移动速度 +8%',
    icon: '💨',
    maxLevel: 5,
    effects: [{ stat: 'moveSpeed', valuePerLevel: 0.08 }],
  },
  sharpClaws: {
    name: '尖牙利爪',
    description: '伤害 +10%',
    icon: '🔪',
    maxLevel: 5,
    effects: [{ stat: 'damage', valuePerLevel: 0.1 }],
  },
  nightVision: {
    name: '夜视能力',
    description: '经验获取 +15%',
    icon: '👁️',
    maxLevel: 3,
    effects: [{ stat: 'expGain', valuePerLevel: 0.15 }],
  },
  hoarding: {
    name: '储粮本能',
    description: '掉落率 +20%',
    icon: '🌰',
    maxLevel: 3,
    effects: [{ stat: 'dropRate', valuePerLevel: 0.2 }],
  },
  keenNose: {
    name: '敏锐嗅觉',
    description: '暴击率 +5%',
    icon: '👃',
    maxLevel: 5,
    effects: [{ stat: 'critChance', valuePerLevel: 0.05 }],
  },
  metabolism: {
    name: '快速新陈代谢',
    description: '每秒恢复 0.5 生命',
    icon: '💚',
    maxLevel: 3,
    effects: [{ stat: 'healthRegen', valuePerLevel: 0.5 }],
  },
  nutArmor: {
    name: '坚果盔甲',
    description: '护甲 +2',
    icon: '🛡️',
    maxLevel: 5,
    effects: [{ stat: 'armor', valuePerLevel: 2 }],
  },
  tinySize: {
    name: '迷你体型',
    description: '闪避率 +3%',
    icon: '🐭',
    maxLevel: 5,
    effects: [{ stat: 'dodgeChance', valuePerLevel: 0.03 }],
  },
  waterCharm: {
    name: '水壶护符',
    description: '冷却缩减 +8%',
    icon: '💧',
    maxLevel: 5,
    effects: [{ stat: 'cooldownReduction', valuePerLevel: 0.08 }],
  },
  wheelHeart: {
    name: '转轮之心',
    description: '攻击速度 +10%',
    icon: '⚙️',
    maxLevel: 5,
    effects: [{ stat: 'attackSpeed', valuePerLevel: 0.1 }],
  },
  sawdustShield: {
    name: '木屑护盾',
    description: '伤害减免 +5%',
    icon: '🪵',
    maxLevel: 3,
    effects: [{ stat: 'damageReduction', valuePerLevel: 0.05 }],
  },
  birdWhisperer: {
    name: '鸟语者',
    description: '召唤物持续时间 +20%',
    icon: '🐦',
    maxLevel: 3,
    effects: [{ stat: 'summonDuration', valuePerLevel: 0.2 }],
  },
  cheesePower: {
    name: '芝士力量',
    description: '范围大小 +15%',
    icon: '🧀',
    maxLevel: 5,
    effects: [{ stat: 'areaSize', valuePerLevel: 0.15 }],
  },
  nutAmmo: {
    name: '坚果弹药',
    description: '弹射数量 +1',
    icon: '🥜',
    maxLevel: 3,
    effects: [{ stat: 'projectileCount', valuePerLevel: 1 }],
  },
  glutton: {
    name: '贪吃鼠',
    description: '每级额外 +5 最大生命',
    icon: '🍖',
    maxLevel: 3,
    effects: [{ stat: 'healthPerLevel', valuePerLevel: 5 }],
  },
  athlete: {
    name: '运动健将',
    description: '移速爆发 +12%',
    icon: '🏃',
    maxLevel: 3,
    effects: [{ stat: 'moveSpeed', valuePerLevel: 0.12 }],
  },
  luckyStar: {
    name: '幸运星',
    description: '稀有掉落率 +10%',
    icon: '⭐',
    maxLevel: 3,
    effects: [{ stat: 'rareDropRate', valuePerLevel: 0.1 }],
  },
  hamsterCrown: {
    name: '仓鼠王冠',
    description: '全属性 +5%',
    icon: '👑',
    maxLevel: 1,
    effects: [
      { stat: 'damage', valuePerLevel: 0.05 },
      { stat: 'moveSpeed', valuePerLevel: 0.05 },
      { stat: 'maxHealth', valuePerLevel: 0.05 },
      { stat: 'expGain', valuePerLevel: 0.05 },
    ],
  },
};

export interface PlayerStats {
  pickupRange: number;
  maxHealth: number;
  moveSpeed: number;
  damage: number;
  expGain: number;
  dropRate: number;
  critChance: number;
  healthRegen: number;
  armor: number;
  dodgeChance: number;
  cooldownReduction: number;
  attackSpeed: number;
  damageReduction: number;
  summonDuration: number;
  areaSize: number;
  projectileCount: number;
  healthPerLevel: number;
  rareDropRate: number;
}

export class PassiveItemManager {
  private scene: Phaser.Scene;
  private player: Player;
  private items: Map<PassiveItemType, number> = new Map();
  private stats: PlayerStats;

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;

    // 初始化基础属性
    this.stats = {
      pickupRange: 80,
      maxHealth: 100,
      moveSpeed: 1.0,
      damage: 1.0,
      expGain: 1.0,
      dropRate: 1.0,
      critChance: 0,
      healthRegen: 0,
      armor: 0,
      dodgeChance: 0,
      cooldownReduction: 0,
      attackSpeed: 1.0,
      damageReduction: 0,
      summonDuration: 1.0,
      areaSize: 1.0,
      projectileCount: 0,
      healthPerLevel: 0,
      rareDropRate: 0,
    };
  }

  /**
   * 添加或升级被动道具
   */
  addItem(itemType: PassiveItemType): boolean {
    const info = PASSIVE_ITEM_INFO[itemType];
    const currentLevel = this.items.get(itemType) || 0;

    if (currentLevel >= info.maxLevel) {
      return false; // 已达最大等级
    }

    this.items.set(itemType, currentLevel + 1);
    this.applyItemEffects(itemType, currentLevel + 1);

    console.log(`✨ 获得道具: ${info.name} Lv.${currentLevel + 1}`);
    return true;
  }

  /**
   * 应用道具效果
   */
  private applyItemEffects(itemType: PassiveItemType, level: number) {
    const info = PASSIVE_ITEM_INFO[itemType];

    info.effects.forEach((effect) => {
      const stat = effect.stat as keyof PlayerStats;
      const baseValue = this.getBaseStat(stat);
      const addedValue = effect.valuePerLevel;

      // 根据属性类型应用效果
      if (stat === 'maxHealth' || stat === 'pickupRange' || stat === 'armor' || stat === 'projectileCount') {
        // 固定值加成
        this.stats[stat] = baseValue + addedValue;
      } else {
        // 百分比或乘法加成
        this.stats[stat] = baseValue + addedValue;
      }
    });

    this.updatePlayerStats();
  }

  /**
   * 获取基础属性（用于计算）
   */
  private getBaseStat(stat: keyof PlayerStats): number {
    return this.stats[stat];
  }

  /**
   * 更新玩家属性
   */
  private updatePlayerStats() {
    // 这里可以将计算好的属性应用到玩家身上
    // 由于Player类可能需要扩展，这里先预留接口
  }

  /**
   * 获取随机道具选项（用于升级界面）
   */
  getRandomItemOptions(count: number = 3): PassiveItemType[] {
    const availableItems: PassiveItemType[] = [];

    // 收集所有可升级的道具
    Object.keys(PASSIVE_ITEM_INFO).forEach((key) => {
      const itemType = key as PassiveItemType;
      const info = PASSIVE_ITEM_INFO[itemType];
      const currentLevel = this.items.get(itemType) || 0;

      if (currentLevel < info.maxLevel) {
        availableItems.push(itemType);
      }
    });

    // 如果可选项不足，直接返回全部
    if (availableItems.length <= count) {
      return availableItems;
    }

    // 随机选择指定数量的道具
    const selected: PassiveItemType[] = [];
    const pool = [...availableItems];

    for (let i = 0; i < count; i++) {
      const index = Math.floor(Math.random() * pool.length);
      selected.push(pool[index]);
      pool.splice(index, 1);
    }

    return selected;
  }

  /**
   * 获取道具当前等级
   */
  getItemLevel(itemType: PassiveItemType): number {
    return this.items.get(itemType) || 0;
  }

  /**
   * 获取所有道具
   */
  getItems(): Map<PassiveItemType, number> {
    return new Map(this.items);
  }

  /**
   * 获取当前属性
   */
  getStats(): PlayerStats {
    return { ...this.stats };
  }

  /**
   * 获取特定属性值
   */
  getStat(stat: keyof PlayerStats): number {
    return this.stats[stat];
  }
}

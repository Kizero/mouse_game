/**
 * 元进度管理器 - 处理永久解锁和货币
 */

export interface ProgressionData {
  // 永久货币
  cookieCrumbs: number;
  totalCrumbsEarned: number;

  // 统计数据
  gamesPlayed: number;
  totalKills: number;
  bestTime: number;
  highestLevel: number;

  // 解锁内容
  unlockedHamsters: string[];
  unlockedCookies: string[];
  unlockedChallenges: string[];

  // 永久升级
  permanentUpgrades: {
    maxHealthBonus: number;      // 最大生命值加成
    damageBonus: number;          // 伤害加成
    speedBonus: number;           // 移速加成
    expGainBonus: number;         // 经验获取加成
    pickupRangeBonus: number;     // 拾取范围加成
  };
}

export type HamsterType = 'golden' | 'pudding' | 'bear' | 'elder' | 'dwarf';
export type CookieType = 'chocolate' | 'cheese' | 'nut' | 'rainbow';

export const HAMSTER_INFO = {
  golden: {
    name: '金毛仓鼠',
    description: '初始仓鼠，平衡型',
    cost: 0,
    stats: { health: 100, speed: 150, damage: 1.0 },
  },
  pudding: {
    name: '布丁仓鼠',
    description: '移速+20%，血量-20%',
    cost: 500,
    stats: { health: 80, speed: 180, damage: 1.0 },
  },
  bear: {
    name: '熊仓鼠',
    description: '体积+50%，伤害+30%，移速-15%',
    cost: 1000,
    stats: { health: 130, speed: 127, damage: 1.3 },
  },
  elder: {
    name: '老公公鼠',
    description: '起始武器+1，升级速度-20%',
    cost: 1500,
    stats: { health: 100, speed: 150, damage: 1.0 },
  },
  dwarf: {
    name: '侏儒仓鼠',
    description: '体积-30%，暴击+25%',
    cost: 2000,
    stats: { health: 90, speed: 150, damage: 1.0 },
  },
};

export const COOKIE_INFO = {
  chocolate: {
    name: '巧克力饼干',
    description: '敌人移速-10%',
    cost: 300,
  },
  cheese: {
    name: '芝士饼干',
    description: '经验获取+30%',
    cost: 500,
  },
  nut: {
    name: '坚果饼干',
    description: '起始护甲+2',
    cost: 700,
  },
  rainbow: {
    name: '彩虹饼干',
    description: '随机刷新Buff区域',
    cost: 1000,
  },
};

export const PERMANENT_UPGRADE_INFO = {
  maxHealthBonus: {
    name: '强壮体魄',
    description: '最大生命值+10',
    baseCost: 100,
    costMultiplier: 1.5,
    maxLevel: 10,
  },
  damageBonus: {
    name: '力量训练',
    description: '伤害+5%',
    baseCost: 150,
    costMultiplier: 1.5,
    maxLevel: 10,
  },
  speedBonus: {
    name: '敏捷训练',
    description: '移速+5%',
    baseCost: 120,
    costMultiplier: 1.5,
    maxLevel: 10,
  },
  expGainBonus: {
    name: '学习能力',
    description: '经验获取+10%',
    baseCost: 200,
    costMultiplier: 1.5,
    maxLevel: 5,
  },
  pickupRangeBonus: {
    name: '脸颊囊袋',
    description: '拾取范围+10',
    baseCost: 80,
    costMultiplier: 1.4,
    maxLevel: 5,
  },
};

export class ProgressionManager {
  private static instance: ProgressionManager;
  private data: ProgressionData;
  private currentSessionCrumbs: number = 0;

  private constructor() {
    this.data = this.loadData();
  }

  static getInstance(): ProgressionManager {
    if (!ProgressionManager.instance) {
      ProgressionManager.instance = new ProgressionManager();
    }
    return ProgressionManager.instance;
  }

  /**
   * 从localStorage加载数据
   */
  private loadData(): ProgressionData {
    const saved = localStorage.getItem('cookie-defense-progression');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load progression data', e);
      }
    }

    // 默认数据
    return {
      cookieCrumbs: 0,
      totalCrumbsEarned: 0,
      gamesPlayed: 0,
      totalKills: 0,
      bestTime: 0,
      highestLevel: 1,
      unlockedHamsters: ['golden'],
      unlockedCookies: [],
      unlockedChallenges: [],
      permanentUpgrades: {
        maxHealthBonus: 0,
        damageBonus: 0,
        speedBonus: 0,
        expGainBonus: 0,
        pickupRangeBonus: 0,
      },
    };
  }

  /**
   * 保存数据到localStorage
   */
  private saveData() {
    localStorage.setItem('cookie-defense-progression', JSON.stringify(this.data));
  }

  /**
   * 开始新游戏会话
   */
  startNewSession() {
    this.currentSessionCrumbs = 0;
    this.data.gamesPlayed++;
    this.saveData();
  }

  /**
   * 结束游戏会话
   */
  endSession(stats: { kills: number; level: number; time: number }) {
    // 计算获得的饼干碎片（基于击杀和等级）
    const crumbsEarned = Math.floor(stats.kills * 0.5 + stats.level * 10);
    this.addCookieCrumbs(crumbsEarned);

    // 更新统计
    this.data.totalKills += stats.kills;
    if (stats.level > this.data.highestLevel) {
      this.data.highestLevel = stats.level;
    }
    if (stats.time > this.data.bestTime) {
      this.data.bestTime = stats.time;
    }

    this.saveData();
    return crumbsEarned;
  }

  /**
   * 添加饼干碎片
   */
  addCookieCrumbs(amount: number) {
    this.data.cookieCrumbs += amount;
    this.data.totalCrumbsEarned += amount;
    this.currentSessionCrumbs += amount;
    this.saveData();
  }

  /**
   * 消费饼干碎片
   */
  spendCookieCrumbs(amount: number): boolean {
    if (this.data.cookieCrumbs >= amount) {
      this.data.cookieCrumbs -= amount;
      this.saveData();
      return true;
    }
    return false;
  }

  /**
   * 解锁仓鼠
   */
  unlockHamster(hamsterType: HamsterType): boolean {
    const cost = HAMSTER_INFO[hamsterType].cost;
    if (this.spendCookieCrumbs(cost)) {
      this.data.unlockedHamsters.push(hamsterType);
      this.saveData();
      return true;
    }
    return false;
  }

  /**
   * 解锁饼干
   */
  unlockCookie(cookieType: CookieType): boolean {
    const cost = COOKIE_INFO[cookieType].cost;
    if (this.spendCookieCrumbs(cost)) {
      this.data.unlockedCookies.push(cookieType);
      this.saveData();
      return true;
    }
    return false;
  }

  /**
   * 购买永久升级
   */
  buyPermanentUpgrade(upgradeType: keyof ProgressionData['permanentUpgrades']): boolean {
    const upgradeKey = upgradeType as keyof typeof PERMANENT_UPGRADE_INFO;
    const info = PERMANENT_UPGRADE_INFO[upgradeKey];
    const currentLevel = this.data.permanentUpgrades[upgradeType];

    if (currentLevel >= info.maxLevel) {
      return false; // 已达最大等级
    }

    const cost = Math.floor(info.baseCost * Math.pow(info.costMultiplier, currentLevel));

    if (this.spendCookieCrumbs(cost)) {
      this.data.permanentUpgrades[upgradeType]++;
      this.saveData();
      return true;
    }

    return false;
  }

  /**
   * 计算永久升级的花费
   */
  getUpgradeCost(upgradeType: keyof ProgressionData['permanentUpgrades']): number {
    const upgradeKey = upgradeType as keyof typeof PERMANENT_UPGRADE_INFO;
    const info = PERMANENT_UPGRADE_INFO[upgradeKey];
    const currentLevel = this.data.permanentUpgrades[upgradeType];

    if (currentLevel >= info.maxLevel) {
      return -1; // 已达最大等级
    }

    return Math.floor(info.baseCost * Math.pow(info.costMultiplier, currentLevel));
  }

  // Getters
  getCookieCrumbs(): number {
    return this.data.cookieCrumbs;
  }

  getData(): ProgressionData {
    return { ...this.data };
  }

  isHamsterUnlocked(hamsterType: HamsterType): boolean {
    return this.data.unlockedHamsters.includes(hamsterType);
  }

  isCookieUnlocked(cookieType: CookieType): boolean {
    return this.data.unlockedCookies.includes(cookieType);
  }

  getCurrentSessionCrumbs(): number {
    return this.currentSessionCrumbs;
  }

  /**
   * 重置所有进度（调试用）
   */
  resetAll() {
    localStorage.removeItem('cookie-defense-progression');
    this.data = this.loadData();
  }
}

import Phaser from 'phaser';

// 游戏常量配置
export const GAME_CONFIG = {
  // 画布尺寸
  WIDTH: 1200,
  HEIGHT: 900,

  // 圆形战场配置
  ARENA: {
    DIAMETER: 800,
    RADIUS: 400,
    CENTER_X: 600,
    CENTER_Y: 450,

    // 区域定义
    ZONES: {
      CENTER: 200,        // 中心区半径
      MIDDLE: 300,        // 中圈外半径
      CRUMB: 100,         // 碎屑区宽度（外圈）
    },

    // 移速惩罚
    SPEED_PENALTY_RATE: 0.05,  // 每100单位-5%
    MAX_SPEED_PENALTY: 0.30,   // 最多-30%
    CRUMB_SPEED_PENALTY: 0.20, // 碎屑区额外-20%
    CRUMB_DAMAGE_DELAY: 5000,  // 5秒后开始扣血
  },

  // 玩家配置
  PLAYER: {
    START_HEALTH: 100,
    START_SPEED: 150,
    SIZE: 32,
  },

  // 游戏时间节点（毫秒）
  TIMELINE: {
    DUAL_SPAWN: 120000,      // 2分钟：双向刷新
    QUAD_SPAWN: 300000,      // 5分钟：四向刷新
    RANDOM_SPAWN: 480000,    // 8分钟：360°随机
    SECTOR_SPAWN: 720000,    // 12分钟：扇形集群
    BOSS_SPAWN: 900000,      // 15分钟：Boss登场
    COOKIE_MELT_START: 600000, // 10分钟：饼干开始融化
  },

  // 游戏平衡配置
  BALANCE: {
    // 暴击系统
    CRIT: {
      DAMAGE_MULTIPLIER: 2.0,  // 暴击伤害倍率
      MAX_CHANCE: 0.75,        // 最大暴击率（75%）
    },

    // 闪避系统
    DODGE: {
      MAX_CHANCE: 0.75,        // 最大闪避率（75%）
    },

    // 经验和升级
    EXPERIENCE: {
      BASE_LEVEL_EXP: 10,      // 1级所需经验
      EXP_MULTIPLIER: 1.5,     // 每级经验倍率
    },

    // 拾取范围
    PICKUP: {
      BASE_RANGE: 80,          // 基础拾取范围
      COLLECT_RANGE: 30,       // 实际收集范围
    },

    // 武器平衡
    WEAPON: {
      EVOLUTION_LEVEL: 7,      // 武器进化等级要求
      MAX_WEAPONS: 6,          // 最大武器槽位
    },

    // 被动道具平衡
    PASSIVE: {
      MAX_ITEMS: 20,           // 最大道具种类
      OPTIONS_PER_LEVEL: 3,    // 每次升级可选道具数
    },

    // 技能平衡
    SKILL: {
      MOVE_SPEED_CAP: 3.0,     // 移速上限倍率
      ATTACK_SPEED_CAP: 5.0,   // 攻速上限倍率
      DAMAGE_CAP: 10.0,        // 伤害上限倍率
    },
  },

  // 性能配置
  PERFORMANCE: {
    MAX_PARTICLES: 500,        // 最大粒子数
    MAX_ENEMIES: 200,          // 最大敌人数
    SOUND_POOL_SIZE: 20,       // 音效池大小
    CLEANUP_INTERVAL: 5000,    // 清理间隔（毫秒）
  },
};

// Phaser游戏配置
export const phaserConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.WIDTH,
  height: GAME_CONFIG.HEIGHT,
  parent: 'game-container',
  backgroundColor: '#f4e4c1',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

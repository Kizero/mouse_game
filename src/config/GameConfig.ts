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

import Phaser from 'phaser';
import { phaserConfig } from './config/GameConfig';
import { BootScene } from './scenes/BootScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { GameScene } from './scenes/GameScene';
import { LevelUpScene } from './scenes/LevelUpScene';

// 创建游戏实例
const game = new Phaser.Game({
  ...phaserConfig,
  scene: [BootScene, MainMenuScene, GameScene, LevelUpScene],
});

// 导出游戏实例供调试使用
(window as any).game = game;

console.log('🍪 饼干保卫战启动中...');

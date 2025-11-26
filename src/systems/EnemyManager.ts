import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/GameConfig';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';

export class EnemyManager {
  private scene: Phaser.Scene;
  private player: Player;
  private enemies: Phaser.GameObjects.Group;
  private spawnTimer: number = 0;
  private spawnInterval: number = 1000; // 1秒生成一批

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;
    this.enemies = scene.add.group({
      classType: Enemy,
      runChildUpdate: true,
    });
  }

  startSpawning() {
    // 敌人生成已经在update中处理
  }

  update(delta: number, gameTime: number) {
    this.spawnTimer += delta;

    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnEnemies(gameTime);
    }

    // 更新所有敌人
    this.enemies.getChildren().forEach((enemy: any) => {
      if (enemy.active) {
        enemy.update(this.player);
      }
    });
  }

  private spawnEnemies(gameTime: number) {
    const gameTimeSeconds = gameTime / 1000;

    // 根据游戏时间调整生成数量
    let count = 1;
    if (gameTimeSeconds > 120) count = 2;
    if (gameTimeSeconds > 300) count = 3;
    if (gameTimeSeconds > 480) count = 5;

    for (let i = 0; i < count; i++) {
      this.spawnEnemy(gameTimeSeconds);
    }
  }

  private spawnEnemy(gameTimeSeconds: number) {
    // 从饼干边缘随机位置生成
    const angle = Math.random() * Math.PI * 2;
    const radius = GAME_CONFIG.ARENA.RADIUS;
    const x = GAME_CONFIG.ARENA.CENTER_X + Math.cos(angle) * radius;
    const y = GAME_CONFIG.ARENA.CENTER_Y + Math.sin(angle) * radius;

    const enemy = new Enemy(this.scene, x, y, 'ant');
    this.enemies.add(enemy);
  }

  getEnemies(): Phaser.GameObjects.Group {
    return this.enemies;
  }
}

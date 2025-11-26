import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/GameConfig';
import { Player } from '../entities/Player';
import { Enemy, EnemyType } from '../entities/Enemy';

interface WaveConfig {
  timeStart: number;
  timeEnd: number;
  spawnRate: number; // 每秒生成数量
  enemyTypes: { type: EnemyType; weight: number }[];
}

export class EnemyManager {
  private scene: Phaser.Scene;
  private player: Player;
  private enemies: Phaser.GameObjects.Group;
  private spawnTimer: number = 0;
  private currentWave: number = 0;
  private bossesSpawned: number = 0;
  private lastBossSpawnTime: number = 0;

  // 波次配置
  private waves: WaveConfig[] = [
    {
      timeStart: 0,
      timeEnd: 120,
      spawnRate: 1.5,
      enemyTypes: [{ type: 'ant', weight: 1 }],
    },
    {
      timeStart: 120,
      timeEnd: 300,
      spawnRate: 2.5,
      enemyTypes: [
        { type: 'ant', weight: 0.6 },
        { type: 'cockroach', weight: 0.4 },
      ],
    },
    {
      timeStart: 300,
      timeEnd: 480,
      spawnRate: 4,
      enemyTypes: [
        { type: 'ant', weight: 0.4 },
        { type: 'cockroach', weight: 0.3 },
        { type: 'spider', weight: 0.3 },
      ],
    },
    {
      timeStart: 480,
      timeEnd: 720,
      spawnRate: 6,
      enemyTypes: [
        { type: 'ant', weight: 0.3 },
        { type: 'cockroach', weight: 0.3 },
        { type: 'spider', weight: 0.2 },
        { type: 'beetle', weight: 0.2 },
      ],
    },
    {
      timeStart: 720,
      timeEnd: Infinity,
      spawnRate: 10,
      enemyTypes: [
        { type: 'ant', weight: 0.25 },
        { type: 'cockroach', weight: 0.25 },
        { type: 'spider', weight: 0.25 },
        { type: 'beetle', weight: 0.25 },
      ],
    },
  ];

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
    const gameTimeSeconds = gameTime / 1000;

    // 更新当前波次
    this.updateCurrentWave(gameTimeSeconds);

    // 检查Boss生成（每15分钟）
    this.checkBossSpawn(gameTime);

    // 生成敌人
    const wave = this.waves[this.currentWave];
    const spawnInterval = 1000 / wave.spawnRate; // 转换为毫秒间隔

    this.spawnTimer += delta;
    if (this.spawnTimer >= spawnInterval) {
      this.spawnTimer = 0;
      this.spawnEnemy(wave);
    }

    // 更新所有敌人
    this.enemies.getChildren().forEach((enemy: any) => {
      if (enemy.active) {
        enemy.update(this.player);
      }
    });
  }

  private updateCurrentWave(gameTimeSeconds: number) {
    for (let i = 0; i < this.waves.length; i++) {
      const wave = this.waves[i];
      if (gameTimeSeconds >= wave.timeStart && gameTimeSeconds < wave.timeEnd) {
        if (this.currentWave !== i) {
          this.currentWave = i;
          console.log(`🌊 进入第 ${i + 1} 波！生成速度: ${wave.spawnRate}/秒`);

          // 触发波次开始事件
          this.scene.events.emit('wave-start', i + 1);
        }
        break;
      }
    }
  }

  private spawnEnemy(wave: WaveConfig) {
    // 根据权重随机选择敌人类型
    const enemyType = this.selectEnemyType(wave.enemyTypes);

    // 从饼干边缘随机位置生成
    const angle = Math.random() * Math.PI * 2;
    const radius = GAME_CONFIG.ARENA.RADIUS;
    const x = GAME_CONFIG.ARENA.CENTER_X + Math.cos(angle) * radius;
    const y = GAME_CONFIG.ARENA.CENTER_Y + Math.sin(angle) * radius;

    const enemy = new Enemy(this.scene, x, y, enemyType);
    this.enemies.add(enemy);
  }

  private selectEnemyType(types: { type: EnemyType; weight: number }[]): EnemyType {
    const totalWeight = types.reduce((sum, t) => sum + t.weight, 0);
    let random = Math.random() * totalWeight;

    for (const typeConfig of types) {
      random -= typeConfig.weight;
      if (random <= 0) {
        return typeConfig.type;
      }
    }

    return types[0].type;
  }

  private checkBossSpawn(gameTime: number) {
    const bossInterval = GAME_CONFIG.TIMELINE.BOSS_SPAWN; // 15分钟

    // 检查是否到达Boss生成时间
    if (gameTime - this.lastBossSpawnTime >= bossInterval) {
      // 检查当前是否没有Boss存在
      const hasBoss = this.enemies.getChildren().some((enemy: any) =>
        enemy.active && enemy.isBoss && enemy.isBoss()
      );

      if (!hasBoss) {
        this.spawnBoss();
        this.lastBossSpawnTime = gameTime;
        this.bossesSpawned++;
      }
    }
  }

  private spawnBoss() {
    // Boss从饼干边缘生成（随机角度）
    const angle = Math.random() * Math.PI * 2;
    const radius = GAME_CONFIG.ARENA.RADIUS;
    const x = GAME_CONFIG.ARENA.CENTER_X + Math.cos(angle) * radius;
    const y = GAME_CONFIG.ARENA.CENTER_Y + Math.sin(angle) * radius;

    const boss = new Enemy(this.scene, x, y, 'boss');
    this.enemies.add(boss);

    console.log(`👑 Boss #${this.bossesSpawned + 1} 已出现！`);

    // 触发Boss生成事件
    this.scene.events.emit('boss-spawned', this.bossesSpawned + 1);
  }

  getEnemies(): Phaser.GameObjects.Group {
    return this.enemies;
  }

  getEnemyCount(): number {
    return this.enemies.getLength();
  }
}


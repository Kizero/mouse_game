import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/GameConfig';
import { CookieArena } from '../entities/CookieArena';
import { Player } from '../entities/Player';
import { WeaponManager } from '../systems/WeaponManager';
import { EnemyManager } from '../systems/EnemyManager';
import { UIManager } from '../systems/UIManager';
import { ExperienceGem } from '../entities/ExperienceGem';

export class GameScene extends Phaser.Scene {
  private arena!: CookieArena;
  private player!: Player;
  private weaponManager!: WeaponManager;
  private enemyManager!: EnemyManager;
  private uiManager!: UIManager;
  private expGems!: Phaser.GameObjects.Group;

  private gameTime: number = 0;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: any;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    console.log('🎮 游戏开始！');

    // 创建圆形饼干战场
    this.arena = new CookieArena(this);

    // 创建玩家（仓鼠）
    this.player = new Player(
      this,
      GAME_CONFIG.ARENA.CENTER_X,
      GAME_CONFIG.ARENA.CENTER_Y
    );

    // 经验宝石组
    this.expGems = this.add.group({
      classType: ExperienceGem,
    });

    // 初始化系统
    this.weaponManager = new WeaponManager(this, this.player);
    this.enemyManager = new EnemyManager(this, this.player);
    this.uiManager = new UIManager(this, this.player);

    // 设置输入
    this.setupInput();

    // 给玩家初始武器（滚轮飞镖）
    this.weaponManager.addWeapon('spinner');

    // 开始生成敌人
    this.enemyManager.startSpawning();

    // 设置事件监听
    this.setupEventListeners();
  }

  private setupInput() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
  }

  private setupEventListeners() {
    // 敌人被击杀 - 生成经验宝石
    this.events.on('enemy-killed', (x: number, y: number, expValue: number) => {
      const gem = new ExperienceGem(this, x, y, expValue);
      this.expGems.add(gem);
    });

    // 武器碰撞检测
    this.events.on('weapon-hit-check', (x: number, y: number, radius: number, damage: number, callback?: Function) => {
      const enemies = this.enemyManager.getEnemies().getChildren();
      let hit = false;

      enemies.forEach((enemy: any) => {
        if (!enemy.active) return;

        const dist = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
        if (dist < radius + 12) {
          enemy.takeDamage(damage);
          hit = true;
        }
      });

      if (callback) callback(hit);
    });

    // 获取最近的敌人
    this.events.on('get-nearest-enemy', (x: number, y: number, callback: Function) => {
      const enemies = this.enemyManager.getEnemies().getChildren();
      let nearest: any = null;
      let minDist = Infinity;

      enemies.forEach((enemy: any) => {
        if (!enemy.active) return;

        const dist = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
        if (dist < minDist) {
          minDist = dist;
          nearest = enemy;
        }
      });

      if (nearest) callback(nearest, minDist);
    });

    // 玩家升级
    this.events.on('player-levelup', (level: number) => {
      console.log(`🎉 升级到 Lv.${level}!`);
      // TODO: 显示升级选择界面
    });
  }

  update(time: number, delta: number) {
    this.gameTime += delta;

    // 处理玩家输入
    const moveX = (this.cursors.left.isDown || this.wasd.A.isDown ? -1 : 0) +
                  (this.cursors.right.isDown || this.wasd.D.isDown ? 1 : 0);
    const moveY = (this.cursors.up.isDown || this.wasd.W.isDown ? -1 : 0) +
                  (this.cursors.down.isDown || this.wasd.S.isDown ? 1 : 0);

    // 更新玩家位置速度（根据在战场的位置）
    const speedMultiplier = this.arena.getSpeedMultiplier(this.player.x, this.player.y);
    this.player.setSpeedMultiplier(speedMultiplier);

    // 更新实体
    this.player.update(moveX, moveY);
    this.arena.update(this.player, this.gameTime);
    this.weaponManager.update(delta);
    this.enemyManager.update(delta, this.gameTime);
    this.uiManager.update(this.gameTime);

    // 检查玩家拾取经验宝石
    this.checkExpGemCollection();
  }

  private checkExpGemCollection() {
    this.expGems.getChildren().forEach((gem: any) => {
      if (!gem.active) return;

      const dist = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        gem.x,
        gem.y
      );

      if (dist < 30) {
        this.player.addExperience(gem.getValue());
        gem.destroy();
      }
    });
  }

  // 获取当前游戏时间（秒）
  getGameTimeSeconds(): number {
    return this.gameTime / 1000;
  }
}

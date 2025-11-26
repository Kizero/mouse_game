import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/GameConfig';
import { CookieArena } from '../entities/CookieArena';
import { Player } from '../entities/Player';
import { WeaponManager } from '../systems/WeaponManager';
import { EnemyManager } from '../systems/EnemyManager';
import { UIManager } from '../systems/UIManager';
import { ExperienceGem } from '../entities/ExperienceGem';
import { ParticleManager } from '../effects/ParticleManager';
import { CameraEffects } from '../effects/CameraEffects';
import { ProgressionManager } from '../systems/ProgressionManager';

export class GameScene extends Phaser.Scene {
  private arena!: CookieArena;
  private player!: Player;
  private weaponManager!: WeaponManager;
  private enemyManager!: EnemyManager;
  private uiManager!: UIManager;
  private expGems!: Phaser.GameObjects.Group;
  private particleManager!: ParticleManager;
  private cameraEffects!: CameraEffects;

  private gameTime: number = 0;
  private totalKills: number = 0;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: any;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    console.log('🎮 游戏开始！');

    // 重置统计
    this.gameTime = 0;
    this.totalKills = 0;

    // 开始新会话
    ProgressionManager.getInstance().startNewSession();

    // 初始化特效系统
    this.particleManager = new ParticleManager(this);
    this.cameraEffects = new CameraEffects(this);

    // 淡入效果
    this.cameraEffects.fadeIn(500);

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
    // 敌人被击杀 - 生成经验宝石 + 特效
    this.events.on('enemy-killed', (x: number, y: number, expValue: number, color?: number) => {
      const gem = new ExperienceGem(this, x, y, expValue);
      this.expGems.add(gem);

      // 统计击杀
      this.totalKills++;

      // 死亡特效
      this.particleManager.enemyDeath(x, y, color || 0xff0000);
      this.cameraEffects.shakeLight();
    });

    // 玩家死亡
    this.events.on('player-death', () => {
      this.handlePlayerDeath();
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

          // 击中特效
          this.particleManager.weaponHit(x, y);
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

      // 升级特效
      this.particleManager.levelUp(this.player.x, this.player.y);
      this.cameraEffects.shakeMedium();
      this.cameraEffects.flash(0xffff00, 150);
      this.cameraEffects.zoom(1.15, 200);

      this.showLevelUpScreen();
    });

    // 区域伤害（用于木屑旋风、奶酪陷阱等）
    this.events.on('weapon-area-damage', (x: number, y: number, radius: number, damage: number, callback?: Function) => {
      const enemies = this.enemyManager.getEnemies().getChildren();

      enemies.forEach((enemy: any) => {
        if (!enemy.active) return;

        const dist = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
        if (dist < radius) {
          enemy.takeDamage(damage);
          if (callback) callback(enemy);

          // 击中特效（但频率降低）
          if (Math.random() < 0.3) {
            this.particleManager.weaponHit(enemy.x, enemy.y, 0xffa500);
          }
        }
      });
    });

    // 环形水波伤害（用于水壶喷泉）
    this.events.on('weapon-wave-damage', (x: number, y: number, innerRadius: number, outerRadius: number, damage: number, pushForce: number) => {
      const enemies = this.enemyManager.getEnemies().getChildren();

      enemies.forEach((enemy: any) => {
        if (!enemy.active) return;

        const dist = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
        if (dist >= innerRadius && dist <= outerRadius) {
          enemy.takeDamage(damage);

          // 击退效果
          const angle = Math.atan2(enemy.y - y, enemy.x - x);
          const body = enemy.body as Phaser.Physics.Arcade.Body;
          body.setVelocity(
            body.velocity.x + Math.cos(angle) * pushForce,
            body.velocity.y + Math.sin(angle) * pushForce
          );
        }
      });
    });
  }

  private showLevelUpScreen() {
    // 暂停游戏
    this.scene.pause();
    this.scene.launch('LevelUpScene', {
      weaponManager: this.weaponManager,
      currentWeapons: Array.from(this.weaponManager.getWeapons().keys()),
    });

    // 监听升级选择完成
    this.scene.get('LevelUpScene').events.once('selection-made', () => {
      this.scene.resume();
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

      // 磁铁效果：靠近时吸引
      if (dist < 80) {
        const angle = Math.atan2(this.player.y - gem.y, this.player.x - gem.x);
        const attractSpeed = 200;
        const body = gem.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(
          Math.cos(angle) * attractSpeed,
          Math.sin(angle) * attractSpeed
        );
      }

      if (dist < 30) {
        this.player.addExperience(gem.getValue());

        // 收集特效
        this.particleManager.collectGem(
          gem.x,
          gem.y,
          this.player.x,
          this.player.y,
          gem.getData('color') || 0x00ff00
        );

        gem.destroy();
      }
    });
  }

  private handlePlayerDeath() {
    // 死亡特效
    this.particleManager.playerDeath(this.player.x, this.player.y);
    this.cameraEffects.deathEffect();

    // 等待特效播放完毕后跳转
    this.time.delayedCall(2000, () => {
      this.scene.start('GameOverScene', {
        kills: this.totalKills,
        level: this.player.getLevel(),
        time: this.gameTime,
      });
    });
  }

  // 获取当前游戏时间（秒）
  getGameTimeSeconds(): number {
    return this.gameTime / 1000;
  }
}

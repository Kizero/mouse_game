import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/GameConfig';
import { CookieArena } from '../entities/CookieArena';
import { Player } from '../entities/Player';
import { WeaponManager } from '../systems/WeaponManager';
import { EnemyManager } from '../systems/EnemyManager';
import { UIManager } from '../systems/UIManager';
import { PassiveItemManager } from '../systems/PassiveItemManager';
import { SkillManager, HamsterType } from '../systems/SkillManager';
import { ExperienceGem } from '../entities/ExperienceGem';
import { ParticleManager } from '../effects/ParticleManager';
import { CameraEffects } from '../effects/CameraEffects';
import { BackgroundManager } from '../effects/BackgroundManager';
import { AudioManager } from '../systems/AudioManager';
import { ProgressionManager } from '../systems/ProgressionManager';

export class GameScene extends Phaser.Scene {
  private arena!: CookieArena;
  private player!: Player;
  private weaponManager!: WeaponManager;
  private enemyManager!: EnemyManager;
  private uiManager!: UIManager;
  private passiveItemManager!: PassiveItemManager;
  private skillManager!: SkillManager;
  private expGems!: Phaser.GameObjects.Group;
  private particleManager!: ParticleManager;
  private cameraEffects!: CameraEffects;
  private backgroundManager!: BackgroundManager;
  private audioManager!: AudioManager;

  private gameTime: number = 0;
  private totalKills: number = 0;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: any;
  private skillKey!: Phaser.Input.Keyboard.Key;

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
    this.backgroundManager = new BackgroundManager(this);

    // 初始化音频系统
    this.audioManager = new AudioManager(this);
    this.audioManager.init().then(() => {
      this.audioManager.playMusic();
    });

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
    this.passiveItemManager = new PassiveItemManager(this, this.player);

    // 设置音频UI（必须在AudioManager初始化后）
    this.uiManager.setAudioSettingsUI(this.audioManager);

    // 初始化技能系统（默认金仓鼠）
    this.skillManager = new SkillManager(this, this.player, 'golden');

    // 连接武器管理器和被动道具管理器
    this.weaponManager.setPassiveItemManager(this.passiveItemManager);

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

    // 技能按键（空格键）
    this.skillKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
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

      // 死亡音效
      this.audioManager.playSound('enemy_death', 0.6);
    });

    // 玩家死亡
    this.events.on('player-death', () => {
      this.handlePlayerDeath();
    });

    // 波次开始
    this.events.on('wave-start', (waveNumber: number) => {
      this.showWaveNotification(waveNumber);
    });

    // Boss生成
    this.events.on('boss-spawned', (bossNumber: number) => {
      this.showBossNotification(bossNumber);
    });

    // Boss被击败
    this.events.on('boss-defeated', (x: number, y: number) => {
      this.handleBossDefeat(x, y);
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

          // 击中音效
          this.audioManager.playSound('weapon_hit', 0.3);
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

      // 升级音效
      this.audioManager.playSound('levelup', 1);

      this.showLevelUpScreen();
    });

    // 武器进化
    this.events.on('weapon-evolved', (x: number, y: number, weaponName: string) => {
      this.handleWeaponEvolution(x, y, weaponName);
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

    // 技能使用事件
    this.events.on('skill-used', (hamsterType: string, x: number, y: number) => {
      this.handleSkillUsed(hamsterType, x, y);

      // 技能音效
      const skillSounds: { [key: string]: string } = {
        golden: 'skill_avatar',
        pudding: 'skill_wind',
        bear: 'skill_stomp',
        elder: 'skill_use',
        dwarf: 'skill_use',
      };
      this.audioManager.playSound(skillSounds[hamsterType] || 'skill_use', 0.8);
    });

    // 技能范围效果（战争践踏）
    this.events.on('skill-area-effect', (x: number, y: number, radius: number, damage: number, stunDuration: number) => {
      const enemies = this.enemyManager.getEnemies().getChildren();

      enemies.forEach((enemy: any) => {
        if (!enemy.active) return;

        const dist = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
        if (dist < radius) {
          enemy.takeDamage(damage);

          // 眩晕效果（减速）
          if (enemy.body) {
            const originalSpeed = enemy.body.velocity.length();
            enemy.setData('stunned', true);
            enemy.body.setVelocity(0, 0);

            this.time.delayedCall(stunDuration, () => {
              enemy.setData('stunned', false);
            });
          }

          // 击中特效
          this.particleManager.weaponHit(enemy.x, enemy.y, 0xff6600);
        }
      });
    });

    // 技能减速场（时间回溯）
    this.events.on('skill-slow-field', (x: number, y: number, radius: number, slowFactor: number) => {
      const enemies = this.enemyManager.getEnemies().getChildren();

      enemies.forEach((enemy: any) => {
        if (!enemy.active || !enemy.body) return;

        const dist = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
        if (dist < radius) {
          // 减速效果
          enemy.body.setVelocity(
            enemy.body.velocity.x * slowFactor,
            enemy.body.velocity.y * slowFactor
          );
        }
      });
    });

    // 玩家治疗事件
    this.events.on('player-healed', (x: number, y: number, amount: number) => {
      // 治疗特效
      for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const particle = this.add.circle(x, y, 3, 0x00ff00);

        this.tweens.add({
          targets: particle,
          x: x + Math.cos(angle) * 40,
          y: y + Math.sin(angle) * 40 - 50,
          alpha: 0,
          duration: 800,
          ease: 'Cubic.easeOut',
          onComplete: () => particle.destroy(),
        });
      }
    });
  }

  private showLevelUpScreen() {
    // 暂停游戏
    this.scene.pause();
    this.scene.launch('LevelUpScene', {
      weaponManager: this.weaponManager,
      passiveItemManager: this.passiveItemManager,
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

    // 检查技能按键
    if (Phaser.Input.Keyboard.JustDown(this.skillKey)) {
      this.skillManager.useSkill(this.gameTime);
    }

    // 更新实体
    this.player.update(moveX, moveY);
    this.arena.update(this.player, this.gameTime);
    this.weaponManager.update(delta);
    this.enemyManager.update(delta, this.gameTime);
    this.skillManager.update();
    this.uiManager.update(this.gameTime, this.skillManager);
    this.backgroundManager.update(this.player.x, this.player.y);

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

        // 收集音效
        this.audioManager.playSound('collect_gem', 0.4);

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

  private showWaveNotification(waveNumber: number) {
    const { WIDTH, HEIGHT } = GAME_CONFIG;

    // 波次提示
    const waveText = this.add.text(WIDTH / 2, HEIGHT / 2, `第 ${waveNumber} 波`, {
      fontSize: '64px',
      color: '#ff6b35',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6,
    });
    waveText.setOrigin(0.5);
    waveText.setDepth(2000);
    waveText.setAlpha(0);

    // 动画
    this.tweens.add({
      targets: waveText,
      alpha: 1,
      scale: 1.2,
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(1500, () => {
          this.tweens.add({
            targets: waveText,
            alpha: 0,
            scale: 0.8,
            duration: 300,
            onComplete: () => waveText.destroy(),
          });
        });
      },
    });

    // 震动
    this.cameraEffects.shakeMedium();
  }

  private showBossNotification(bossNumber: number) {
    const { WIDTH, HEIGHT } = GAME_CONFIG;

    // Boss警告
    const bossText = this.add.text(WIDTH / 2, HEIGHT / 2, '⚠️ Boss 出现 ⚠️', {
      fontSize: '72px',
      color: '#ff0000',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 8,
    });
    bossText.setOrigin(0.5);
    bossText.setDepth(2000);
    bossText.setAlpha(0);

    // 动画
    this.tweens.add({
      targets: bossText,
      alpha: 1,
      scale: 1.3,
      duration: 400,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(2000, () => {
          this.tweens.add({
            targets: bossText,
            alpha: 0,
            scale: 0.8,
            duration: 400,
            onComplete: () => bossText.destroy(),
          });
        });
      },
    });

    // 强烈震动 + 闪光
    this.cameraEffects.shakeHeavy();
    this.cameraEffects.flash(0xff0000, 300);
  }

  private handleBossDefeat(x: number, y: number) {
    console.log('🎉 Boss已被击败！');

    // Boss死亡特效
    this.particleManager.bossDefeat(x, y);
    this.cameraEffects.shakeHeavy();
    this.cameraEffects.flash(0xffd700, 500);
    this.cameraEffects.zoom(1.2, 300);

    // Boss死亡音效
    this.audioManager.playSound('boss_death', 1);

    // 显示击败提示
    const { WIDTH, HEIGHT } = GAME_CONFIG;
    const victoryText = this.add.text(WIDTH / 2, HEIGHT / 2 - 100, '🏆 Boss 击败！🏆', {
      fontSize: '64px',
      color: '#ffd700',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6,
    });
    victoryText.setOrigin(0.5);
    victoryText.setDepth(2000);
    victoryText.setAlpha(0);

    this.tweens.add({
      targets: victoryText,
      alpha: 1,
      scale: 1.2,
      duration: 400,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(3000, () => {
          this.tweens.add({
            targets: victoryText,
            alpha: 0,
            duration: 400,
            onComplete: () => victoryText.destroy(),
          });
        });
      },
    });
  }

  private handleWeaponEvolution(x: number, y: number, weaponName: string) {
    console.log(`⚡ 武器进化成功！${weaponName}`);

    // 进化特效
    this.particleManager.weaponEvolution(x, y);
    this.cameraEffects.shakeHeavy();
    this.cameraEffects.flash(0x00ffff, 500);
    this.cameraEffects.zoom(1.3, 400);

    // 显示进化提示
    const { WIDTH, HEIGHT } = GAME_CONFIG;
    const evolutionText = this.add.text(WIDTH / 2, HEIGHT / 2, `${weaponName}`, {
      fontSize: '72px',
      color: '#00ffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 8,
    });
    evolutionText.setOrigin(0.5);
    evolutionText.setDepth(2000);
    evolutionText.setAlpha(0);

    const subtitleText = this.add.text(WIDTH / 2, HEIGHT / 2 + 80, '武器进化完成！', {
      fontSize: '36px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    });
    subtitleText.setOrigin(0.5);
    subtitleText.setDepth(2000);
    subtitleText.setAlpha(0);

    this.tweens.add({
      targets: [evolutionText, subtitleText],
      alpha: 1,
      scale: 1.2,
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(2500, () => {
          this.tweens.add({
            targets: [evolutionText, subtitleText],
            alpha: 0,
            duration: 400,
            onComplete: () => {
              evolutionText.destroy();
              subtitleText.destroy();
            },
          });
        });
      },
    });
  }

  private handleSkillUsed(hamsterType: string, x: number, y: number) {
    const skillInfo = this.skillManager.getSkillInfo();
    console.log(`🔥 技能释放：${skillInfo.name}`);

    // 通用技能特效
    this.cameraEffects.shakeHeavy();
    this.cameraEffects.flash(0xffff00, 200);

    // 根据不同仓鼠类型显示不同特效
    switch (hamsterType) {
      case 'golden':
        // 法天象地 - 金色爆发
        this.createSkillEffect(x, y, 0xffd700, '法天象地！', 80);
        break;

      case 'pudding':
        // 疾风步 - 青色疾风
        this.createSkillEffect(x, y, 0x00ffff, '疾风步！', 60);
        for (let i = 0; i < 30; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 50 + Math.random() * 100;
          const particle = this.add.circle(x, y, 2, 0x00ffff);

          this.tweens.add({
            targets: particle,
            x: x + Math.cos(angle) * speed,
            y: y + Math.sin(angle) * speed,
            alpha: 0,
            duration: 300,
            onComplete: () => particle.destroy(),
          });
        }
        break;

      case 'bear':
        // 战争践踏 - 橙色冲击波
        this.createSkillEffect(x, y, 0xff6600, '战争践踏！', 70);
        for (let i = 0; i < 5; i++) {
          const shockwave = this.add.circle(x, y, 20, 0xff6600, 0);
          shockwave.setStrokeStyle(5, 0xff6600, 1);

          this.tweens.add({
            targets: shockwave,
            scale: 10,
            alpha: 0,
            duration: 800,
            delay: i * 100,
            onComplete: () => shockwave.destroy(),
          });
        }
        break;

      case 'elder':
        // 时间回溯 - 紫色时光
        this.createSkillEffect(x, y, 0x9966ff, '时间回溯！', 65);
        // 时光粒子
        for (let i = 0; i < 40; i++) {
          const angle = (i / 40) * Math.PI * 2;
          const particle = this.add.star(x, y, 4, 3, 6, 0x9966ff);

          this.tweens.add({
            targets: particle,
            x: x + Math.cos(angle) * 250,
            y: y + Math.sin(angle) * 250,
            alpha: 0,
            rotation: Math.PI * 2,
            duration: 1000,
            onComplete: () => particle.destroy(),
          });
        }
        break;

      case 'dwarf':
        // 狂暴 - 红色能量
        this.createSkillEffect(x, y, 0xff0000, '狂暴！', 70);
        // 火焰粒子
        for (let i = 0; i < 50; i++) {
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * 50;
          const particle = this.add.circle(x + Math.cos(angle) * distance, y + Math.sin(angle) * distance, 3, 0xff0000);

          this.tweens.add({
            targets: particle,
            y: particle.y - 100,
            alpha: 0,
            duration: 800 + Math.random() * 400,
            onComplete: () => particle.destroy(),
          });
        }
        break;
    }
  }

  private createSkillEffect(x: number, y: number, color: number, text: string, size: number) {
    const { WIDTH, HEIGHT } = GAME_CONFIG;

    // 技能名称
    const skillText = this.add.text(WIDTH / 2, HEIGHT / 3, text, {
      fontSize: `${size}px`,
      color: `#${color.toString(16).padStart(6, '0')}`,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6,
    });
    skillText.setOrigin(0.5);
    skillText.setDepth(2000);
    skillText.setAlpha(0);

    this.tweens.add({
      targets: skillText,
      alpha: 1,
      scale: 1.3,
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(1200, () => {
          this.tweens.add({
            targets: skillText,
            alpha: 0,
            y: skillText.y - 50,
            duration: 300,
            onComplete: () => skillText.destroy(),
          });
        });
      },
    });

    // 中心爆发
    const flash = this.add.circle(x, y, 50, color, 0.8);
    this.tweens.add({
      targets: flash,
      scale: 8,
      alpha: 0,
      duration: 600,
      onComplete: () => flash.destroy(),
    });
  }

  // 获取当前游戏时间（秒）
  getGameTimeSeconds(): number {
    return this.gameTime / 1000;
  }
}

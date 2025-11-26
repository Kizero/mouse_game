import Phaser from 'phaser';

/**
 * 粒子效果管理器 - 使用Phaser粒子系统
 */
export class ParticleManager {
  private scene: Phaser.Scene;
  private emitters: Map<string, Phaser.GameObjects.Particles.ParticleEmitter> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createEmitters();
  }

  /**
   * 创建所有粒子发射器
   */
  private createEmitters() {
    // 红色粒子发射器（敌人死亡、伤害等）
    const redEmitter = this.scene.add.particles(0, 0, 'particle_red', {
      speed: { min: 50, max: 150 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 500,
      blendMode: 'ADD',
      emitting: false,
    });
    this.emitters.set('red', redEmitter);

    // 黄色粒子发射器（升级、收集等）
    const yellowEmitter = this.scene.add.particles(0, 0, 'particle_yellow', {
      speed: { min: 30, max: 100 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 800,
      blendMode: 'ADD',
      emitting: false,
    });
    this.emitters.set('yellow', yellowEmitter);

    // 橙色粒子发射器（武器击中）
    const orangeEmitter = this.scene.add.particles(0, 0, 'particle_orange', {
      speed: { min: 20, max: 80 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 300,
      blendMode: 'ADD',
      emitting: false,
    });
    this.emitters.set('orange', orangeEmitter);

    // 绿色粒子发射器（治疗）
    const greenEmitter = this.scene.add.particles(0, 0, 'particle_green', {
      speed: { min: 40, max: 120 },
      scale: { start: 0.7, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 800,
      gravityY: -50,
      blendMode: 'ADD',
      emitting: false,
    });
    this.emitters.set('green', greenEmitter);

    // 蓝色粒子发射器（冰冻、水系）
    const blueEmitter = this.scene.add.particles(0, 0, 'particle_blue', {
      speed: { min: 30, max: 90 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 600,
      blendMode: 'ADD',
      emitting: false,
    });
    this.emitters.set('blue', blueEmitter);

    // 紫色粒子发射器（高价值宝石）
    const purpleEmitter = this.scene.add.particles(0, 0, 'particle_purple', {
      speed: { min: 20, max: 60 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 500,
      blendMode: 'ADD',
      emitting: false,
    });
    this.emitters.set('purple', purpleEmitter);

    // 白色粒子发射器（闪光、特殊效果）
    const whiteEmitter = this.scene.add.particles(0, 0, 'particle_white', {
      speed: { min: 50, max: 150 },
      scale: { start: 1.2, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 400,
      blendMode: 'ADD',
      emitting: false,
    });
    this.emitters.set('white', whiteEmitter);

    // 金色粒子发射器（Boss、奖励）
    const goldEmitter = this.scene.add.particles(0, 0, 'particle_gold', {
      speed: { min: 60, max: 180 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 1000,
      blendMode: 'ADD',
      emitting: false,
    });
    this.emitters.set('gold', goldEmitter);

    // 星星粒子发射器（升级）
    const starEmitter = this.scene.add.particles(0, 0, 'particle_star', {
      speed: { min: 30, max: 120 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 1, end: 0 },
      rotate: { start: 0, end: 360 },
      lifespan: 1000,
      gravityY: -30,
      blendMode: 'ADD',
      emitting: false,
    });
    this.emitters.set('star', starEmitter);
  }

  /**
   * 敌人死亡爆炸效果
   */
  enemyDeath(x: number, y: number, color: number = 0xff0000) {
    // 根据颜色选择发射器
    let emitterName = 'red';
    if (color === 0x000000) emitterName = 'white'; // 蚂蚁
    else if (color === 0x8b4513) emitterName = 'orange'; // 蟑螂
    else if (color === 0x666666) emitterName = 'white'; // 蜘蛛
    else if (color === 0x2d5016) emitterName = 'green'; // 甲虫

    const emitter = this.emitters.get(emitterName);
    if (emitter) {
      emitter.emitParticleAt(x, y, 20);
    }

    // 中心闪光
    const flash = this.scene.add.circle(x, y, 30, 0xffffff, 0.8);
    this.scene.tweens.add({
      targets: flash,
      scale: 2,
      alpha: 0,
      duration: 300,
      onComplete: () => flash.destroy(),
    });
  }

  /**
   * 升级光效
   */
  levelUp(x: number, y: number) {
    // 星星粒子爆发
    const starEmitter = this.emitters.get('star');
    const yellowEmitter = this.emitters.get('yellow');

    if (starEmitter) {
      starEmitter.emitParticleAt(x, y, 30);
    }

    if (yellowEmitter) {
      yellowEmitter.emitParticleAt(x, y, 20);
    }

    // 扩散光环
    const rings = 3;
    for (let i = 0; i < rings; i++) {
      const ring = this.scene.add.circle(x, y, 10, 0xffff00, 0);
      ring.setStrokeStyle(3, 0xffff00, 1);

      this.scene.tweens.add({
        targets: ring,
        scale: 3,
        alpha: 0,
        duration: 800,
        delay: i * 100,
        ease: 'Sine.easeOut',
        onComplete: () => ring.destroy(),
      });
    }
  }

  /**
   * 武器击中效果
   */
  weaponHit(x: number, y: number, color: number = 0xffa500) {
    // 选择发射器
    let emitterName = 'orange';
    if (color === 0xff6600) emitterName = 'orange';

    const emitter = this.emitters.get(emitterName);
    if (emitter) {
      emitter.emitParticleAt(x, y, 5);
    }

    // 简单的冲击波
    const impact = this.scene.add.circle(x, y, 5, color, 0.6);
    this.scene.tweens.add({
      targets: impact,
      scale: 2.5,
      alpha: 0,
      duration: 200,
      ease: 'Cubic.easeOut',
      onComplete: () => impact.destroy(),
    });
  }

  /**
   * 经验宝石收集效果
   */
  collectGem(x: number, y: number, targetX: number, targetY: number, color: number) {
    // 根据颜色选择发射器
    let emitterName = 'green';
    if (color === 0x0099ff) emitterName = 'blue';
    else if (color === 0xff00ff) emitterName = 'purple';

    // 创建粒子轨迹
    const emitter = this.emitters.get(emitterName);
    if (emitter) {
      // 沿路径发射粒子
      for (let i = 0; i < 5; i++) {
        const t = i / 5;
        const px = x + (targetX - x) * t;
        const py = y + (targetY - y) * t;
        this.scene.time.delayedCall(i * 60, () => {
          emitter.emitParticleAt(px, py, 3);
        });
      }
    }

    // 到达时的爆发
    this.scene.time.delayedCall(300, () => {
      this.collectEffect(targetX, targetY, color);
    });
  }

  /**
   * 收集时的爆发效果
   */
  private collectEffect(x: number, y: number, color: number) {
    let emitterName = 'green';
    if (color === 0x0099ff) emitterName = 'blue';
    else if (color === 0xff00ff) emitterName = 'purple';

    const emitter = this.emitters.get(emitterName);
    if (emitter) {
      emitter.emitParticleAt(x, y, 8);
    }
  }

  /**
   * 受伤血液效果
   */
  damageEffect(x: number, y: number) {
    const redEmitter = this.emitters.get('red');
    if (redEmitter) {
      redEmitter.emitParticleAt(x, y, 10);
    }
  }

  /**
   * 玩家死亡效果
   */
  playerDeath(x: number, y: number) {
    // 多色粒子大爆炸
    const redEmitter = this.emitters.get('red');
    const orangeEmitter = this.emitters.get('orange');
    const yellowEmitter = this.emitters.get('yellow');

    if (redEmitter) redEmitter.emitParticleAt(x, y, 30);
    if (orangeEmitter) orangeEmitter.emitParticleAt(x, y, 25);
    if (yellowEmitter) yellowEmitter.emitParticleAt(x, y, 20);

    // 扩散冲击波
    const shockwave = this.scene.add.circle(x, y, 20, 0xff0000, 0);
    shockwave.setStrokeStyle(5, 0xff0000, 1);

    this.scene.tweens.add({
      targets: shockwave,
      scale: 8,
      alpha: 0,
      duration: 1000,
      ease: 'Cubic.easeOut',
      onComplete: () => shockwave.destroy(),
    });
  }

  /**
   * 武器进化效果
   */
  weaponEvolution(x: number, y: number) {
    // 使用蓝色和白色粒子螺旋上升
    const blueEmitter = this.emitters.get('blue');
    const whiteEmitter = this.emitters.get('white');

    // 螺旋发射
    for (let i = 0; i < 20; i++) {
      const delay = i * 50;
      const angle = (i / 20) * Math.PI * 4;
      const radius = 30;
      const px = x + Math.cos(angle) * radius;

      this.scene.time.delayedCall(delay, () => {
        if (blueEmitter) blueEmitter.emitParticleAt(px, y, 3);
        if (whiteEmitter && i % 2 === 0) whiteEmitter.emitParticleAt(px, y, 2);
      });
    }

    // 闪电环绕
    const lightning = this.scene.add.graphics();
    let time = 0;

    const timer = this.scene.time.addEvent({
      delay: 50,
      repeat: 20,
      callback: () => {
        lightning.clear();
        lightning.lineStyle(2, 0xffffff, 1);

        const points = 8;
        for (let i = 0; i < points; i++) {
          const angle1 = ((i / points) * Math.PI * 2) + time;
          const angle2 = (((i + 1) / points) * Math.PI * 2) + time;
          const r = 40 + Math.random() * 10;

          lightning.lineBetween(
            x + Math.cos(angle1) * r,
            y + Math.sin(angle1) * r,
            x + Math.cos(angle2) * r,
            y + Math.sin(angle2) * r
          );
        }

        time += 0.2;
      },
      callbackScope: this,
    });

    this.scene.time.delayedCall(1000, () => {
      timer.destroy();
      lightning.destroy();
    });
  }

  /**
   * Boss击败效果
   */
  bossDefeat(x: number, y: number) {
    // 超大多色粒子爆炸
    const redEmitter = this.emitters.get('red');
    const orangeEmitter = this.emitters.get('orange');
    const yellowEmitter = this.emitters.get('yellow');
    const goldEmitter = this.emitters.get('gold');
    const whiteEmitter = this.emitters.get('white');
    const starEmitter = this.emitters.get('star');

    if (redEmitter) redEmitter.emitParticleAt(x, y, 50);
    if (orangeEmitter) orangeEmitter.emitParticleAt(x, y, 40);
    if (yellowEmitter) yellowEmitter.emitParticleAt(x, y, 40);
    if (goldEmitter) goldEmitter.emitParticleAt(x, y, 30);
    if (whiteEmitter) whiteEmitter.emitParticleAt(x, y, 20);
    if (starEmitter) starEmitter.emitParticleAt(x, y, 40);

    // 多重冲击波
    for (let i = 0; i < 5; i++) {
      const shockwave = this.scene.add.circle(x, y, 30, 0xff0000, 0);
      shockwave.setStrokeStyle(8, 0xffd700, 1);

      this.scene.tweens.add({
        targets: shockwave,
        scale: 10,
        alpha: 0,
        duration: 1500,
        delay: i * 100,
        ease: 'Cubic.easeOut',
        onComplete: () => shockwave.destroy(),
      });
    }

    // 中心闪光
    const flash = this.scene.add.circle(x, y, 80, 0xffffff, 1);
    this.scene.tweens.add({
      targets: flash,
      scale: 5,
      alpha: 0,
      duration: 500,
      onComplete: () => flash.destroy(),
    });
  }
}

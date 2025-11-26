import Phaser from 'phaser';

/**
 * 粒子效果管理器
 */
export class ParticleManager {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * 敌人死亡爆炸效果
   */
  enemyDeath(x: number, y: number, color: number = 0xff0000) {
    // 创建爆炸粒子
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20;
      const speed = 100 + Math.random() * 100;
      const particle = this.scene.add.circle(x, y, 3 + Math.random() * 3, color);

      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * (50 + Math.random() * 50),
        y: y + Math.sin(angle) * (50 + Math.random() * 50),
        alpha: 0,
        scale: 0,
        duration: 500 + Math.random() * 300,
        ease: 'Cubic.easeOut',
        onComplete: () => particle.destroy(),
      });
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
    // 向上飞的星星
    for (let i = 0; i < 30; i++) {
      const offsetX = (Math.random() - 0.5) * 100;
      const offsetY = (Math.random() - 0.5) * 100;
      const star = this.scene.add.star(x + offsetX, y + offsetY, 5, 3, 6, 0xffff00);

      this.scene.tweens.add({
        targets: star,
        y: y - 150 - Math.random() * 100,
        alpha: 0,
        duration: 1000 + Math.random() * 500,
        ease: 'Cubic.easeOut',
        onComplete: () => star.destroy(),
      });
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

    // 飞溅粒子
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      const particle = this.scene.add.circle(x, y, 2, color);

      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * 20,
        y: y + Math.sin(angle) * 20,
        alpha: 0,
        duration: 300,
        ease: 'Cubic.easeOut',
        onComplete: () => particle.destroy(),
      });
    }
  }

  /**
   * 经验宝石收集效果
   */
  collectGem(x: number, y: number, targetX: number, targetY: number, color: number) {
    const trail = this.scene.add.graphics();
    const points: { x: number; y: number; alpha: number }[] = [];

    // 创建轨迹点
    for (let i = 0; i < 5; i++) {
      points.push({ x, y, alpha: 1 - i * 0.2 });
    }

    // 更新轨迹
    const updateTrail = () => {
      trail.clear();
      points.forEach((point, index) => {
        if (point.alpha > 0) {
          trail.fillStyle(color, point.alpha);
          trail.fillCircle(point.x, point.y, 4);
        }
      });
    };

    // 移动到玩家
    this.scene.tweens.add({
      targets: { x, y },
      x: targetX,
      y: targetY,
      duration: 300,
      ease: 'Back.easeIn',
      onUpdate: (tween, target: any) => {
        points.unshift({ x: target.x, y: target.y, alpha: 1 });
        if (points.length > 8) points.pop();
        points.forEach(p => (p.alpha -= 0.05));
        updateTrail();
      },
      onComplete: () => {
        trail.destroy();
        this.collectEffect(targetX, targetY, color);
      },
    });
  }

  /**
   * 收集时的爆发效果
   */
  private collectEffect(x: number, y: number, color: number) {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const particle = this.scene.add.circle(x, y, 3, color);

      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * 15,
        y: y + Math.sin(angle) * 15,
        alpha: 0,
        scale: 0,
        duration: 300,
        ease: 'Cubic.easeOut',
        onComplete: () => particle.destroy(),
      });
    }
  }

  /**
   * 受伤血液效果
   */
  damageEffect(x: number, y: number) {
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 20 + Math.random() * 20;
      const particle = this.scene.add.circle(x, y, 2, 0xff0000);

      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        alpha: 0,
        duration: 400 + Math.random() * 200,
        ease: 'Cubic.easeOut',
        onComplete: () => particle.destroy(),
      });
    }
  }

  /**
   * 玩家死亡效果
   */
  playerDeath(x: number, y: number) {
    // 大爆炸
    for (let i = 0; i < 50; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 150;
      const size = 3 + Math.random() * 5;
      const colors = [0xff6b35, 0xf7931e, 0xfdc82f, 0xff0000];
      const particle = this.scene.add.circle(
        x,
        y,
        size,
        Phaser.Utils.Array.GetRandom(colors)
      );

      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * (speed + Math.random() * 100),
        y: y + Math.sin(angle) * (speed + Math.random() * 100),
        alpha: 0,
        scale: 0,
        duration: 800 + Math.random() * 400,
        ease: 'Cubic.easeOut',
        onComplete: () => particle.destroy(),
      });
    }

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
    // 螺旋上升的光柱
    for (let i = 0; i < 20; i++) {
      const delay = i * 50;
      const angle = (i / 20) * Math.PI * 4;
      const radius = 30;

      const particle = this.scene.add.circle(
        x + Math.cos(angle) * radius,
        y,
        5,
        0x00ffff
      );

      this.scene.tweens.add({
        targets: particle,
        y: y - 200,
        alpha: 0,
        delay,
        duration: 1000,
        ease: 'Cubic.easeOut',
        onComplete: () => particle.destroy(),
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
}

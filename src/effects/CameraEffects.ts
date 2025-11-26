import Phaser from 'phaser';

/**
 * 相机特效管理器
 */
export class CameraEffects {
  private scene: Phaser.Scene;
  private camera: Phaser.Cameras.Scene2D.Camera;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.camera = scene.cameras.main;
  }

  /**
   * 屏幕震动
   * @param intensity 强度 (1-10)
   * @param duration 持续时间（毫秒）
   */
  shake(intensity: number = 5, duration: number = 200) {
    this.camera.shake(duration, intensity / 1000);
  }

  /**
   * 轻微震动（击中敌人）
   */
  shakeLight() {
    this.shake(2, 100);
  }

  /**
   * 中等震动（敌人死亡）
   */
  shakeMedium() {
    this.shake(5, 200);
  }

  /**
   * 强烈震动（玩家受伤/大爆炸）
   */
  shakeHeavy() {
    this.shake(10, 400);
  }

  /**
   * 闪烁效果（受伤）
   */
  flash(color: number = 0xff0000, duration: number = 100) {
    this.camera.flash(duration,
      ((color >> 16) & 0xff),
      ((color >> 8) & 0xff),
      (color & 0xff)
    );
  }

  /**
   * 淡入效果
   */
  fadeIn(duration: number = 500) {
    this.camera.fadeIn(duration);
  }

  /**
   * 淡出效果
   */
  fadeOut(duration: number = 500, callback?: Function) {
    this.camera.fadeOut(duration);
    if (callback) {
      this.scene.time.delayedCall(duration, callback as () => void);
    }
  }

  /**
   * 放大效果（升级、特殊事件）
   */
  zoom(targetZoom: number = 1.2, duration: number = 300, returnToNormal: boolean = true) {
    this.scene.tweens.add({
      targets: this.camera,
      zoom: targetZoom,
      duration,
      ease: 'Cubic.easeInOut',
      yoyo: returnToNormal,
    });
  }

  /**
   * 慢动作效果
   */
  slowMotion(duration: number = 1000, timeScale: number = 0.3) {
    this.scene.time.timeScale = timeScale;

    this.scene.time.delayedCall(duration, () => {
      this.scene.time.timeScale = 1;
    });
  }

  /**
   * 屏幕扭曲效果（通过快速震动模拟）
   */
  twist(intensity: number = 0.05, duration: number = 200) {
    // 用快速连续的震动模拟扭曲效果
    this.camera.shake(duration, intensity / 5, true);
  }

  /**
   * 打击暂停效果（格斗游戏风格）
   */
  hitPause(duration: number = 50) {
    const originalTimeScale = this.scene.time.timeScale;
    this.scene.time.timeScale = 0;

    this.scene.time.delayedCall(duration, () => {
      this.scene.time.timeScale = originalTimeScale;
    });
  }

  /**
   * Boss登场效果
   */
  bossEntrance() {
    // 震动
    this.shake(8, 1000);

    // 缩放
    this.zoom(0.8, 500, false);

    this.scene.time.delayedCall(1000, () => {
      this.zoom(1, 500, false);
    });
  }

  /**
   * 玩家死亡效果
   */
  deathEffect() {
    this.shake(15, 500);
    this.flash(0xff0000, 200);

    this.scene.time.delayedCall(500, () => {
      this.fadeOut(1000);
    });
  }
}

import Phaser from 'phaser';
import { AudioManager } from '../systems/AudioManager';
import { GAME_CONFIG } from '../config/GameConfig';

/**
 * 音频设置UI - 音量控制面板
 */
export class AudioSettingsUI {
  private scene: Phaser.Scene;
  private audioManager: AudioManager;
  private container!: Phaser.GameObjects.Container;
  private visible: boolean = false;

  // UI元素
  private panel!: Phaser.GameObjects.Graphics;
  private closeButton!: Phaser.GameObjects.Text;

  // 音量滑块
  private masterSlider!: SliderControl;
  private musicSlider!: SliderControl;
  private sfxSlider!: SliderControl;
  private muteButton!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, audioManager: AudioManager) {
    this.scene = scene;
    this.audioManager = audioManager;
    this.createUI();
  }

  /**
   * 创建设置UI
   */
  private createUI() {
    const { WIDTH, HEIGHT } = GAME_CONFIG;

    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(2000);
    this.container.setVisible(false);

    // 半透明背景遮罩
    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, WIDTH, HEIGHT);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, WIDTH, HEIGHT), Phaser.Geom.Rectangle.Contains);
    this.container.add(overlay);

    // 设置面板
    const panelWidth = 400;
    const panelHeight = 350;
    const panelX = WIDTH / 2 - panelWidth / 2;
    const panelY = HEIGHT / 2 - panelHeight / 2;

    this.panel = this.scene.add.graphics();
    this.panel.fillStyle(0x2d2d2d, 1);
    this.panel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 10);
    this.panel.lineStyle(3, 0x4a4a4a, 1);
    this.panel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 10);
    this.container.add(this.panel);

    // 标题
    const title = this.scene.add.text(WIDTH / 2, panelY + 30, '🔊 音频设置', {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);
    this.container.add(title);

    // 关闭按钮
    this.closeButton = this.scene.add.text(panelX + panelWidth - 40, panelY + 20, '✕', {
      fontSize: '32px',
      color: '#ff6666',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    });
    this.closeButton.setOrigin(0.5);
    this.closeButton.setInteractive({ useHandCursor: true });
    this.closeButton.on('pointerdown', () => this.hide());
    this.closeButton.on('pointerover', () => this.closeButton.setColor('#ff0000'));
    this.closeButton.on('pointerout', () => this.closeButton.setColor('#ff6666'));
    this.container.add(this.closeButton);

    // 创建音量滑块
    const volumes = this.audioManager.getVolumes();
    const sliderStartY = panelY + 80;
    const sliderSpacing = 70;

    this.masterSlider = new SliderControl(
      this.scene,
      WIDTH / 2 - 150,
      sliderStartY,
      300,
      '主音量',
      volumes.master,
      (value) => this.audioManager.setMasterVolume(value)
    );
    this.container.add(this.masterSlider.getContainer());

    this.musicSlider = new SliderControl(
      this.scene,
      WIDTH / 2 - 150,
      sliderStartY + sliderSpacing,
      300,
      '音乐',
      volumes.music,
      (value) => this.audioManager.setMusicVolume(value)
    );
    this.container.add(this.musicSlider.getContainer());

    this.sfxSlider = new SliderControl(
      this.scene,
      WIDTH / 2 - 150,
      sliderStartY + sliderSpacing * 2,
      300,
      '音效',
      volumes.sfx,
      (value) => this.audioManager.setSfxVolume(value)
    );
    this.container.add(this.sfxSlider.getContainer());

    // 静音按钮
    const muteText = volumes.muted ? '🔇 取消静音' : '🔊 静音';
    this.muteButton = this.scene.add.text(WIDTH / 2, sliderStartY + sliderSpacing * 3 + 20, muteText, {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#444444',
      padding: { x: 20, y: 10 },
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    });
    this.muteButton.setOrigin(0.5);
    this.muteButton.setInteractive({ useHandCursor: true });
    this.muteButton.on('pointerdown', () => {
      this.audioManager.toggleMute();
      const volumes = this.audioManager.getVolumes();
      this.muteButton.setText(volumes.muted ? '🔇 取消静音' : '🔊 静音');
    });
    this.muteButton.on('pointerover', () => this.muteButton.setBackgroundColor('#666666'));
    this.muteButton.on('pointerout', () => this.muteButton.setBackgroundColor('#444444'));
    this.container.add(this.muteButton);
  }

  /**
   * 显示设置面板
   */
  show() {
    this.visible = true;
    this.container.setVisible(true);
    this.scene.scene.pause();
  }

  /**
   * 隐藏设置面板
   */
  hide() {
    this.visible = false;
    this.container.setVisible(false);
    this.scene.scene.resume();
  }

  /**
   * 切换显示/隐藏
   */
  toggle() {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
  }

  isVisible(): boolean {
    return this.visible;
  }

  destroy() {
    this.container.destroy();
  }
}

/**
 * 滑块控制组件
 */
class SliderControl {
  private container: Phaser.GameObjects.Container;
  private handle: Phaser.GameObjects.Graphics;
  private isDragging: boolean = false;
  private value: number;
  private onChange: (value: number) => void;
  private width: number;
  private x: number;
  private y: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    label: string,
    initialValue: number,
    onChange: (value: number) => void
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.value = initialValue;
    this.onChange = onChange;

    this.container = scene.add.container(0, 0);

    // 标签
    const labelText = scene.add.text(x, y - 20, label, {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
    });
    this.container.add(labelText);

    // 滑块轨道
    const track = scene.add.graphics();
    track.fillStyle(0x1a1a1a, 1);
    track.fillRoundedRect(x, y, width, 8, 4);
    this.container.add(track);

    // 滑块填充（已选择部分）
    const fill = scene.add.graphics();
    fill.fillStyle(0x4a90e2, 1);
    fill.fillRoundedRect(x, y, width * initialValue, 8, 4);
    this.container.add(fill);

    // 滑块手柄
    this.handle = scene.add.graphics();
    this.handle.fillStyle(0xffffff, 1);
    this.handle.fillCircle(x + width * initialValue, y + 4, 12);
    this.handle.lineStyle(2, 0x4a90e2, 1);
    this.handle.strokeCircle(x + width * initialValue, y + 4, 12);
    this.handle.setInteractive(
      new Phaser.Geom.Circle(x + width * initialValue, y + 4, 12),
      Phaser.Geom.Circle.Contains
    );
    this.container.add(this.handle);

    // 数值显示
    const valueText = scene.add.text(x + width + 15, y - 3, `${Math.round(initialValue * 100)}%`, {
      fontSize: '16px',
      color: '#aaaaaa',
      fontFamily: 'Arial, sans-serif',
    });
    this.container.add(valueText);

    // 拖拽事件
    this.handle.on('pointerdown', () => {
      this.isDragging = true;
    });

    scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging) {
        const newX = Math.max(x, Math.min(x + width, pointer.x));
        const newValue = (newX - x) / width;
        this.setValue(newValue);

        // 更新视觉
        this.handle.clear();
        this.handle.fillStyle(0xffffff, 1);
        this.handle.fillCircle(newX, y + 4, 12);
        this.handle.lineStyle(2, 0x4a90e2, 1);
        this.handle.strokeCircle(newX, y + 4, 12);

        fill.clear();
        fill.fillStyle(0x4a90e2, 1);
        fill.fillRoundedRect(x, y, width * newValue, 8, 4);

        valueText.setText(`${Math.round(newValue * 100)}%`);

        this.onChange(newValue);
      }
    });

    scene.input.on('pointerup', () => {
      this.isDragging = false;
    });
  }

  setValue(value: number) {
    this.value = Math.max(0, Math.min(1, value));
  }

  getValue(): number {
    return this.value;
  }

  getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }
}

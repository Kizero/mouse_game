import Phaser from 'phaser';
import { SoundGenerator } from '../utils/SoundGenerator';

/**
 * 音频管理器 - 管理所有游戏音效和音乐
 */
export class AudioManager {
  private scene: Phaser.Scene;
  private sounds: Map<string, Phaser.Sound.BaseSound> = new Map();
  private backgroundMusic?: Phaser.Sound.BaseSound;
  private soundGenerator: SoundGenerator;
  private isInitialized: boolean = false;

  // 音量设置
  private masterVolume: number = 0.7;
  private musicVolume: number = 0.5;
  private sfxVolume: number = 0.8;
  private muted: boolean = false;

  // 音效播放限制（防止同时播放过多相同音效）
  private lastPlayTime: Map<string, number> = new Map();
  private minPlayInterval: number = 50; // 最小间隔50ms

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.soundGenerator = new SoundGenerator();
    this.loadVolumesFromStorage();
  }

  /**
   * 初始化音频系统
   */
  async init(): Promise<void> {
    if (this.isInitialized) {
      console.log('⚠️ 音频系统已初始化，跳过');
      return;
    }

    console.log('🔊 初始化音频系统...');

    try {
      // 生成所有音效
      const soundBuffers = await this.soundGenerator.generateAllSounds();

      // 将AudioBuffer转换为Phaser Sound
      soundBuffers.forEach((buffer, name) => {
        this.createSoundFromBuffer(name, buffer);
      });

      // 生成背景音乐
      const musicBuffer = await this.soundGenerator.generateBackgroundMusic();
      this.createMusicFromBuffer(musicBuffer);

      this.isInitialized = true;
      console.log('✅ 音频系统初始化完成');
    } catch (error) {
      console.error('❌ 音频系统初始化失败:', error);
      this.isInitialized = false;
    }
  }

  /**
   * 检查音频系统是否已初始化
   */
  isAudioReady(): boolean {
    return this.isInitialized;
  }

  /**
   * 从AudioBuffer创建Phaser Sound
   */
  private createSoundFromBuffer(name: string, buffer: AudioBuffer): void {
    // 将AudioBuffer转换为base64编码的WAV
    const wav = this.audioBufferToWav(buffer);
    const blob = new Blob([wav], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);

    // 加载到Phaser
    this.scene.load.audio(name, url);
    this.scene.load.once('complete', () => {
      const sound = this.scene.sound.add(name, {
        volume: this.sfxVolume * this.masterVolume,
      });
      this.sounds.set(name, sound);
      URL.revokeObjectURL(url);
    });
    this.scene.load.start();
  }

  /**
   * 从AudioBuffer创建背景音乐
   */
  private createMusicFromBuffer(buffer: AudioBuffer): void {
    const wav = this.audioBufferToWav(buffer);
    const blob = new Blob([wav], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);

    this.scene.load.audio('bgm', url);
    this.scene.load.once('complete', () => {
      this.backgroundMusic = this.scene.sound.add('bgm', {
        loop: true,
        volume: this.musicVolume * this.masterVolume,
      });
      URL.revokeObjectURL(url);
    });
    this.scene.load.start();
  }

  /**
   * 将AudioBuffer转换为WAV格式
   */
  private audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
    const length = buffer.length * buffer.numberOfChannels * 2;
    const arrayBuffer = new ArrayBuffer(44 + length);
    const view = new DataView(arrayBuffer);

    // WAV文件头
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, buffer.numberOfChannels, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * buffer.numberOfChannels * 2, true);
    view.setUint16(32, buffer.numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length, true);

    // 写入PCM数据
    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
        offset += 2;
      }
    }

    return arrayBuffer;
  }

  /**
   * 播放音效
   */
  playSound(name: string, volume: number = 1): void {
    if (this.muted) return;

    // 检查播放间隔
    const now = Date.now();
    const lastTime = this.lastPlayTime.get(name) || 0;
    if (now - lastTime < this.minPlayInterval) return;

    const sound = this.sounds.get(name);
    if (sound) {
      sound.play({
        volume: volume * this.sfxVolume * this.masterVolume,
      });
      this.lastPlayTime.set(name, now);
    }
  }

  /**
   * 播放背景音乐
   */
  playMusic(): void {
    if (this.backgroundMusic && !this.muted) {
      this.backgroundMusic.play();
    }
  }

  /**
   * 停止背景音乐
   */
  stopMusic(): void {
    if (this.backgroundMusic) {
      this.backgroundMusic.stop();
    }
  }

  /**
   * 设置主音量
   */
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
    this.saveVolumesToStorage();
  }

  /**
   * 设置音乐音量
   */
  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.backgroundMusic && this.backgroundMusic.isPlaying) {
      (this.backgroundMusic as any).setVolume(this.musicVolume * this.masterVolume);
    }
    this.saveVolumesToStorage();
  }

  /**
   * 设置音效音量
   */
  setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
    this.saveVolumesToStorage();
  }

  /**
   * 静音/取消静音
   */
  toggleMute(): void {
    this.muted = !this.muted;
    if (this.muted) {
      this.scene.sound.mute = true;
    } else {
      this.scene.sound.mute = false;
    }
    this.saveVolumesToStorage();
  }

  /**
   * 更新所有音效的音量
   */
  private updateAllVolumes(): void {
    this.sounds.forEach(sound => {
      if ((sound as any).setVolume) {
        (sound as any).setVolume(this.sfxVolume * this.masterVolume);
      }
    });
    if (this.backgroundMusic && (this.backgroundMusic as any).setVolume) {
      (this.backgroundMusic as any).setVolume(this.musicVolume * this.masterVolume);
    }
  }

  /**
   * 从localStorage加载音量设置
   */
  private loadVolumesFromStorage(): void {
    try {
      const saved = localStorage.getItem('audio_settings');
      if (saved) {
        const settings = JSON.parse(saved);
        this.masterVolume = settings.masterVolume ?? 0.7;
        this.musicVolume = settings.musicVolume ?? 0.5;
        this.sfxVolume = settings.sfxVolume ?? 0.8;
        this.muted = settings.muted ?? false;
      }
    } catch (error) {
      console.error('Failed to load audio settings:', error);
    }
  }

  /**
   * 保存音量设置到localStorage
   */
  private saveVolumesToStorage(): void {
    try {
      const settings = {
        masterVolume: this.masterVolume,
        musicVolume: this.musicVolume,
        sfxVolume: this.sfxVolume,
        muted: this.muted,
      };
      localStorage.setItem('audio_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save audio settings:', error);
    }
  }

  /**
   * 获取音量设置
   */
  getVolumes() {
    return {
      master: this.masterVolume,
      music: this.musicVolume,
      sfx: this.sfxVolume,
      muted: this.muted,
    };
  }

  /**
   * 销毁音频系统
   */
  destroy(): void {
    this.stopMusic();
    this.sounds.clear();
  }
}

/**
 * 音效生成器 - 使用Web Audio API程序化生成所有游戏音效
 */
export class SoundGenerator {
  private audioContext: AudioContext;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  /**
   * 生成音效并返回AudioBuffer
   */
  private async generateSound(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    envelope?: { attack: number; decay: number; sustain: number; release: number }
  ): Promise<AudioBuffer> {
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    const attack = envelope?.attack || 0.01;
    const decay = envelope?.decay || 0.1;
    const sustain = envelope?.sustain || 0.7;
    const release = envelope?.release || 0.2;

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const progress = i / length;

      // ADSR包络
      let amplitude = 1;
      const attackSamples = attack * sampleRate;
      const decaySamples = decay * sampleRate;
      const releaseSamples = release * sampleRate;
      const releaseStart = length - releaseSamples;

      if (i < attackSamples) {
        amplitude = i / attackSamples;
      } else if (i < attackSamples + decaySamples) {
        amplitude = 1 - ((i - attackSamples) / decaySamples) * (1 - sustain);
      } else if (i < releaseStart) {
        amplitude = sustain;
      } else {
        amplitude = sustain * (1 - (i - releaseStart) / releaseSamples);
      }

      // 生成波形
      let value = 0;
      switch (type) {
        case 'sine':
          value = Math.sin(2 * Math.PI * frequency * t);
          break;
        case 'square':
          value = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1;
          break;
        case 'sawtooth':
          value = 2 * ((frequency * t) % 1) - 1;
          break;
        case 'triangle':
          value = Math.abs(4 * ((frequency * t) % 1) - 2) - 1;
          break;
      }

      data[i] = value * amplitude * 0.3; // 降低整体音量
    }

    return buffer;
  }

  /**
   * 生成带频率扫描的音效
   */
  private async generateSweepSound(
    startFreq: number,
    endFreq: number,
    duration: number,
    type: OscillatorType = 'sine'
  ): Promise<AudioBuffer> {
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const progress = i / length;
      const frequency = startFreq + (endFreq - startFreq) * progress;
      const amplitude = 1 - progress; // 渐弱

      let value = 0;
      switch (type) {
        case 'sine':
          value = Math.sin(2 * Math.PI * frequency * t);
          break;
        case 'square':
          value = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1;
          break;
      }

      data[i] = value * amplitude * 0.3;
    }

    return buffer;
  }

  /**
   * 生成噪音音效
   */
  private async generateNoiseSound(duration: number, filter?: 'lowpass' | 'highpass'): Promise<AudioBuffer> {
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const progress = i / length;
      const amplitude = 1 - progress; // 渐弱
      data[i] = (Math.random() * 2 - 1) * amplitude * 0.2;
    }

    return buffer;
  }

  /**
   * 生成所有游戏音效
   */
  async generateAllSounds(): Promise<Map<string, AudioBuffer>> {
    const sounds = new Map<string, AudioBuffer>();

    // 武器音效
    sounds.set('weapon_shoot', await this.generateSound(800, 0.1, 'square', { attack: 0.01, decay: 0.05, sustain: 0.3, release: 0.05 }));
    sounds.set('weapon_hit', await this.generateSound(200, 0.15, 'sine', { attack: 0.01, decay: 0.1, sustain: 0, release: 0.05 }));
    sounds.set('weapon_spinner', await this.generateSound(400, 0.2, 'triangle', { attack: 0.02, decay: 0.1, sustain: 0.5, release: 0.08 }));

    // 技能音效
    sounds.set('skill_use', await this.generateSweepSound(400, 800, 0.3, 'sine'));
    sounds.set('skill_avatar', await this.generateSweepSound(200, 600, 0.5, 'square'));
    sounds.set('skill_wind', await this.generateSweepSound(800, 400, 0.4, 'sine'));
    sounds.set('skill_stomp', await this.generateSound(80, 0.3, 'square', { attack: 0.01, decay: 0.2, sustain: 0, release: 0.1 }));

    // 敌人音效
    sounds.set('enemy_hit', await this.generateSound(150, 0.1, 'sine', { attack: 0.01, decay: 0.05, sustain: 0, release: 0.05 }));
    sounds.set('enemy_death', await this.generateSweepSound(400, 100, 0.3, 'square'));
    sounds.set('boss_spawn', await this.generateSweepSound(100, 300, 0.6, 'square'));
    sounds.set('boss_death', await this.generateSweepSound(600, 50, 1, 'square'));

    // UI音效
    sounds.set('levelup', await this.generateSweepSound(440, 880, 0.4, 'sine'));
    sounds.set('collect_gem', await this.generateSound(660, 0.1, 'sine', { attack: 0.01, decay: 0.05, sustain: 0.2, release: 0.05 }));
    sounds.set('upgrade_select', await this.generateSound(523, 0.15, 'sine', { attack: 0.02, decay: 0.08, sustain: 0.4, release: 0.06 }));
    sounds.set('button_click', await this.generateSound(440, 0.08, 'sine', { attack: 0.01, decay: 0.04, sustain: 0, release: 0.03 }));

    // 环境音效
    sounds.set('wave_start', await this.generateSweepSound(300, 500, 0.4, 'square'));
    sounds.set('damage_player', await this.generateSound(200, 0.2, 'sawtooth', { attack: 0.02, decay: 0.15, sustain: 0, release: 0.05 }));
    sounds.set('heal', await this.generateSweepSound(440, 660, 0.3, 'sine'));

    return sounds;
  }

  /**
   * 生成简单的背景音乐循环
   */
  async generateBackgroundMusic(): Promise<AudioBuffer> {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 8; // 8秒循环
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(2, length, sampleRate); // 立体声

    // 简单的和弦进行：C - Am - F - G
    const chords = [
      [262, 330, 392], // C大调和弦
      [220, 262, 330], // A小调和弦
      [175, 220, 262], // F大调和弦
      [196, 247, 294], // G大调和弦
    ];

    const chordDuration = duration / chords.length;

    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel);

      for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        const chordIndex = Math.floor(t / chordDuration) % chords.length;
        const chord = chords[chordIndex];

        let value = 0;
        // 每个和弦的3个音符
        chord.forEach((freq, idx) => {
          const weight = [0.4, 0.3, 0.3][idx]; // 根音稍强
          value += Math.sin(2 * Math.PI * freq * t) * weight;
        });

        // 添加包络让音乐更柔和
        const chordProgress = (t % chordDuration) / chordDuration;
        const envelope = Math.sin(chordProgress * Math.PI); // 淡入淡出

        channelData[i] = value * envelope * 0.08; // 背景音乐音量很低
      }
    }

    return buffer;
  }

  getAudioContext(): AudioContext {
    return this.audioContext;
  }
}

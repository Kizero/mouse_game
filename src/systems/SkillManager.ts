import Phaser from 'phaser';
import { Player } from '../entities/Player';

/**
 * 技能系统 - 每个仓鼠都有独特的主动技能
 */

export type HamsterType = 'golden' | 'pudding' | 'bear' | 'elder' | 'dwarf';

export interface SkillInfo {
  name: string;
  description: string;
  icon: string;
  cooldown: number; // 冷却时间（毫秒）
  duration?: number; // 持续时间（毫秒）
}

// 5个仓鼠的技能配置
export const HAMSTER_SKILLS: Record<HamsterType, SkillInfo> = {
  golden: {
    name: '法天象地',
    description: '化身巨人！体型+100%，伤害+100%，移速+50%',
    icon: '⚡',
    cooldown: 30000, // 30秒
    duration: 5000,  // 5秒
  },
  pudding: {
    name: '疾风步',
    description: '化作疾风！隐身无敌，移速+200%',
    icon: '💨',
    cooldown: 25000, // 25秒
    duration: 3000,  // 3秒
  },
  bear: {
    name: '战争践踏',
    description: '重踏大地！范围眩晕+200伤害',
    icon: '💥',
    cooldown: 20000, // 20秒
    duration: 0,     // 瞬发
  },
  elder: {
    name: '时间回溯',
    description: '回溯时光！回复50%生命，减速周围敌人',
    icon: '⏰',
    cooldown: 35000, // 35秒
    duration: 4000,  // 4秒减速区域
  },
  dwarf: {
    name: '狂暴',
    description: '狂暴爆发！攻速+150%，伤害+50%',
    icon: '🔥',
    cooldown: 28000, // 28秒
    duration: 8000,  // 8秒
  },
};

export class SkillManager {
  private scene: Phaser.Scene;
  private player: Player;
  private hamsterType: HamsterType;
  private lastSkillUseTime: number = -999999; // 上次使用技能的时间
  private skillActive: boolean = false;
  private skillEndTime: number = 0;

  // 技能效果状态
  private effectMultipliers = {
    damageMultiplier: 1,
    moveSpeedMultiplier: 1,
    attackSpeedMultiplier: 1,
    sizeMultiplier: 1,
    invincible: false,
    invisible: false,
  };

  constructor(scene: Phaser.Scene, player: Player, hamsterType: HamsterType = 'golden') {
    this.scene = scene;
    this.player = player;
    this.hamsterType = hamsterType;
  }

  /**
   * 使用技能
   */
  useSkill(currentTime: number): boolean {
    const skillInfo = HAMSTER_SKILLS[this.hamsterType];

    // 检查冷却
    if (currentTime - this.lastSkillUseTime < skillInfo.cooldown) {
      return false; // 技能冷却中
    }

    // 检查技能是否已激活
    if (this.skillActive) {
      return false;
    }

    // 使用技能
    this.lastSkillUseTime = currentTime;
    this.activateSkill(skillInfo);

    // 触发技能使用事件
    this.scene.events.emit('skill-used', this.hamsterType, this.player.x, this.player.y);

    console.log(`🎯 使用技能：${skillInfo.name}`);
    return true;
  }

  /**
   * 激活技能效果
   */
  private activateSkill(skillInfo: SkillInfo) {
    switch (this.hamsterType) {
      case 'golden':
        this.activateAvatar(skillInfo.duration!);
        break;
      case 'pudding':
        this.activateWindWalk(skillInfo.duration!);
        break;
      case 'bear':
        this.activateWarStomp();
        break;
      case 'elder':
        this.activateTimeWarp(skillInfo.duration!);
        break;
      case 'dwarf':
        this.activateBerserk(skillInfo.duration!);
        break;
    }
  }

  /**
   * 金仓鼠 - 法天象地
   */
  private activateAvatar(duration: number) {
    this.skillActive = true;
    this.skillEndTime = Date.now() + duration;

    // 设置效果
    this.effectMultipliers.damageMultiplier = 2.0;  // 伤害+100%
    this.effectMultipliers.moveSpeedMultiplier = 1.5; // 移速+50%
    this.effectMultipliers.sizeMultiplier = 2.0;   // 体型+100%

    // 应用视觉效果
    this.player.setScale(2.0);

    // 持续时间结束
    this.scene.time.delayedCall(duration, () => {
      this.deactivateSkill();
    });
  }

  /**
   * 布丁鼠 - 疾风步
   */
  private activateWindWalk(duration: number) {
    this.skillActive = true;
    this.skillEndTime = Date.now() + duration;

    // 设置效果
    this.effectMultipliers.moveSpeedMultiplier = 3.0; // 移速+200%
    this.effectMultipliers.invincible = true;
    this.effectMultipliers.invisible = true;

    // 应用视觉效果
    this.player.setAlpha(0.3); // 半透明

    // 持续时间结束
    this.scene.time.delayedCall(duration, () => {
      this.deactivateSkill();
    });
  }

  /**
   * 熊仓鼠 - 战争践踏
   */
  private activateWarStomp() {
    const radius = 200;
    const damage = 200;
    const stunDuration = 2000; // 2秒眩晕

    // 范围伤害+眩晕
    this.scene.events.emit('skill-area-effect', this.player.x, this.player.y, radius, damage, stunDuration);
  }

  /**
   * 长老鼠 - 时间回溯
   */
  private activateTimeWarp(duration: number) {
    this.skillActive = true;
    this.skillEndTime = Date.now() + duration;

    // 回复生命值（回复50%最大生命值）
    const maxHealth = this.player.getMaxHealth();
    const healAmount = Math.floor(maxHealth * 0.5);
    this.player.heal(healAmount);

    // 触发治疗事件
    this.scene.events.emit('player-healed', this.player.x, this.player.y, healAmount);

    // 减速区域持续4秒
    this.applySlowField(duration);

    // 持续时间结束
    this.scene.time.delayedCall(duration, () => {
      this.deactivateSkill();
    });
  }

  /**
   * 侏儒鼠 - 狂暴
   */
  private activateBerserk(duration: number) {
    this.skillActive = true;
    this.skillEndTime = Date.now() + duration;

    // 设置效果
    this.effectMultipliers.attackSpeedMultiplier = 2.5; // 攻速+150%
    this.effectMultipliers.damageMultiplier = 1.5;    // 伤害+50%

    // 持续时间结束
    this.scene.time.delayedCall(duration, () => {
      this.deactivateSkill();
    });
  }

  /**
   * 应用减速场
   */
  private applySlowField(duration: number) {
    const interval = 100; // 每100ms检查一次
    const iterations = duration / interval;
    let count = 0;

    const timer = this.scene.time.addEvent({
      delay: interval,
      repeat: iterations,
      callback: () => {
        count++;
        // 减速周围敌人
        this.scene.events.emit('skill-slow-field', this.player.x, this.player.y, 250, 0.5);

        if (count >= iterations) {
          timer.destroy();
        }
      },
    });
  }

  /**
   * 取消技能效果
   */
  private deactivateSkill() {
    this.skillActive = false;

    // 重置效果
    this.effectMultipliers.damageMultiplier = 1;
    this.effectMultipliers.moveSpeedMultiplier = 1;
    this.effectMultipliers.attackSpeedMultiplier = 1;
    this.effectMultipliers.sizeMultiplier = 1;
    this.effectMultipliers.invincible = false;
    this.effectMultipliers.invisible = false;

    // 重置视觉效果
    this.player.setScale(1.0);
    this.player.setAlpha(1.0);
  }

  /**
   * 更新（每帧调用）
   */
  update() {
    // 检查技能是否应该结束
    if (this.skillActive && Date.now() >= this.skillEndTime) {
      this.deactivateSkill();
    }
  }

  /**
   * 获取技能冷却百分比（0-1）
   */
  getCooldownPercent(currentTime: number): number {
    const skillInfo = HAMSTER_SKILLS[this.hamsterType];
    const timeSinceUse = currentTime - this.lastSkillUseTime;

    if (timeSinceUse >= skillInfo.cooldown) {
      return 1; // 技能可用
    }

    return timeSinceUse / skillInfo.cooldown;
  }

  /**
   * 技能是否可用
   */
  isSkillReady(currentTime: number): boolean {
    return this.getCooldownPercent(currentTime) >= 1;
  }

  /**
   * 获取剩余冷却时间（秒）
   */
  getRemainingCooldown(currentTime: number): number {
    const skillInfo = HAMSTER_SKILLS[this.hamsterType];
    const timeSinceUse = currentTime - this.lastSkillUseTime;
    const remaining = skillInfo.cooldown - timeSinceUse;

    return Math.max(0, Math.ceil(remaining / 1000));
  }

  /**
   * 获取当前技能信息
   */
  getSkillInfo(): SkillInfo {
    return HAMSTER_SKILLS[this.hamsterType];
  }

  /**
   * 获取效果倍率
   */
  getEffectMultipliers() {
    return { ...this.effectMultipliers };
  }

  /**
   * 是否技能激活中
   */
  isSkillActive(): boolean {
    return this.skillActive;
  }

  /**
   * 更改仓鼠类型
   */
  setHamsterType(type: HamsterType) {
    this.hamsterType = type;
    this.deactivateSkill(); // 重置所有效果
  }
}

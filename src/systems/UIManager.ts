import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/GameConfig';
import { Player } from '../entities/Player';
import { SkillManager } from './SkillManager';

export class UIManager {
  private scene: Phaser.Scene;
  private player: Player;

  private healthBar!: Phaser.GameObjects.Graphics;
  private healthText!: Phaser.GameObjects.Text;
  private expBar!: Phaser.GameObjects.Graphics;
  private levelText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;

  // 技能UI
  private skillIcon!: Phaser.GameObjects.Text;
  private skillCooldownOverlay!: Phaser.GameObjects.Graphics;
  private skillCooldownText!: Phaser.GameObjects.Text;
  private skillNameText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;
    this.createUI();
  }

  private createUI() {
    const { WIDTH } = GAME_CONFIG;

    // 血条
    this.healthBar = this.scene.add.graphics();
    this.healthText = this.scene.add.text(20, 20, '', {
      fontSize: '18px',
      color: '#fff',
      backgroundColor: '#00000088',
      padding: { x: 10, y: 5 },
    });

    // 经验条
    this.expBar = this.scene.add.graphics();
    this.levelText = this.scene.add.text(20, 60, '', {
      fontSize: '16px',
      color: '#fff',
      backgroundColor: '#00000088',
      padding: { x: 10, y: 5 },
    });

    // 时间显示
    this.timeText = this.scene.add.text(WIDTH - 20, 20, '', {
      fontSize: '24px',
      color: '#fff',
      backgroundColor: '#00000088',
      padding: { x: 10, y: 5 },
    });
    this.timeText.setOrigin(1, 0);

    // 技能UI（屏幕底部中央）
    const skillX = WIDTH / 2;
    const skillY = GAME_CONFIG.HEIGHT - 100;

    // 技能图标背景
    const skillBg = this.scene.add.circle(skillX, skillY, 35, 0x000000, 0.7);
    skillBg.setStrokeStyle(3, 0xffffff, 0.8);
    skillBg.setDepth(1000);

    // 技能图标
    this.skillIcon = this.scene.add.text(skillX, skillY, '⚡', {
      fontSize: '48px',
    });
    this.skillIcon.setOrigin(0.5);
    this.skillIcon.setDepth(1001);

    // 冷却遮罩
    this.skillCooldownOverlay = this.scene.add.graphics();
    this.skillCooldownOverlay.setDepth(1002);

    // 冷却时间文本
    this.skillCooldownText = this.scene.add.text(skillX, skillY, '', {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    });
    this.skillCooldownText.setOrigin(0.5);
    this.skillCooldownText.setDepth(1003);

    // 技能名称
    this.skillNameText = this.scene.add.text(skillX, skillY + 50, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#00000088',
      padding: { x: 8, y: 4 },
    });
    this.skillNameText.setOrigin(0.5, 0);
    this.skillNameText.setDepth(1000);

    // 提示文字
    const hintText = this.scene.add.text(skillX, skillY + 75, '[空格] 释放技能', {
      fontSize: '14px',
      color: '#cccccc',
      backgroundColor: '#00000066',
      padding: { x: 6, y: 3 },
    });
    hintText.setOrigin(0.5, 0);
    hintText.setDepth(1000);

    // 设置UI深度（始终在最上层）
    [this.healthBar, this.healthText, this.expBar, this.levelText, this.timeText].forEach(
      obj => obj.setDepth(1000)
    );
  }

  update(gameTime: number, skillManager?: SkillManager) {
    this.updateHealthBar();
    this.updateExpBar();
    this.updateTime(gameTime);

    if (skillManager) {
      this.updateSkillUI(gameTime, skillManager);
    }
  }

  private updateHealthBar() {
    const health = this.player.getHealth();
    const maxHealth = this.player.getMaxHealth();
    const percentage = health / maxHealth;

    this.healthBar.clear();

    // 背景
    this.healthBar.fillStyle(0x000000, 0.5);
    this.healthBar.fillRect(20, 45, 200, 10);

    // 血量（爱心颜色）
    const color = percentage > 0.5 ? 0xff69b4 : (percentage > 0.25 ? 0xff9900 : 0xff0000);
    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(20, 45, 200 * percentage, 10);

    this.healthText.setText(`❤️ ${Math.ceil(health)}/${maxHealth}`);
  }

  private updateExpBar() {
    const exp = this.player.getExperience();
    const expToNext = this.player.getExperienceToNextLevel();
    const percentage = exp / expToNext;

    this.expBar.clear();

    // 背景
    this.expBar.fillStyle(0x000000, 0.5);
    this.expBar.fillRect(20, 85, 200, 8);

    // 经验值
    this.expBar.fillStyle(0x00ff00, 1);
    this.expBar.fillRect(20, 85, 200 * percentage, 8);

    this.levelText.setText(`等级 ${this.player.getLevel()} • ${exp}/${expToNext} EXP`);
  }

  private updateTime(gameTime: number) {
    const seconds = Math.floor(gameTime / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    this.timeText.setText(`⏱️ ${minutes}:${secs.toString().padStart(2, '0')}`);
  }

  private updateSkillUI(gameTime: number, skillManager: SkillManager) {
    const skillInfo = skillManager.getSkillInfo();
    const cooldownPercent = skillManager.getCooldownPercent(gameTime);
    const remainingCooldown = skillManager.getRemainingCooldown(gameTime);
    const isReady = skillManager.isSkillReady(gameTime);
    const isActive = skillManager.isSkillActive();

    // 更新技能图标
    this.skillIcon.setText(skillInfo.icon);

    // 更新技能名称
    this.skillNameText.setText(skillInfo.name);

    // 清除冷却遮罩
    this.skillCooldownOverlay.clear();

    const { WIDTH, HEIGHT } = GAME_CONFIG;
    const skillX = WIDTH / 2;
    const skillY = HEIGHT - 100;
    const radius = 35;

    if (!isReady && !isActive) {
      // 冷却中 - 绘制遮罩
      this.skillCooldownOverlay.fillStyle(0x000000, 0.7);

      // 绘制圆形遮罩（从顶部开始顺时针）
      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + (1 - cooldownPercent) * Math.PI * 2;

      this.skillCooldownOverlay.slice(skillX, skillY, radius, startAngle, endAngle, false);
      this.skillCooldownOverlay.fillPath();

      // 显示剩余秒数
      this.skillCooldownText.setText(`${remainingCooldown}`);
      this.skillCooldownText.setVisible(true);

      // 图标变暗
      this.skillIcon.setAlpha(0.5);
    } else if (isActive) {
      // 技能激活中 - 发光效果
      this.skillCooldownText.setVisible(false);
      this.skillIcon.setAlpha(1);

      // 绘制发光圈
      this.skillCooldownOverlay.lineStyle(3, 0xffff00, 1);
      this.skillCooldownOverlay.strokeCircle(skillX, skillY, radius + 5);
    } else {
      // 技能准备就绪
      this.skillCooldownText.setVisible(false);
      this.skillIcon.setAlpha(1);

      // 绘制就绪提示（脉冲效果）
      const pulse = Math.sin(gameTime / 200) * 0.3 + 0.7;
      this.skillCooldownOverlay.lineStyle(3, 0x00ff00, pulse);
      this.skillCooldownOverlay.strokeCircle(skillX, skillY, radius + 5);
    }
  }
}

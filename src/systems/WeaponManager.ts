import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { PassiveItemType } from './PassiveItemManager';
import { SpinnerWeapon } from '../weapons/SpinnerWeapon';
import { SeedGunWeapon } from '../weapons/SeedGunWeapon';
import { SawdustWeapon } from '../weapons/SawdustWeapon';
import { BirdWeapon } from '../weapons/BirdWeapon';
import { CheeseWeapon } from '../weapons/CheeseWeapon';
import { HoardWeapon } from '../weapons/HoardWeapon';
import { WaterWeapon } from '../weapons/WaterWeapon';

export type WeaponType = 'spinner' | 'seedgun' | 'sawdust' | 'bird' | 'cheese' | 'hoard' | 'water';

export interface WeaponEvolutionRequirement {
  requiredLevel: number;
  requiredItem: PassiveItemType;
  evolvedName: string;
  evolvedDescription: string;
}

export const WEAPON_INFO = {
  spinner: { name: '滚轮飞镖', description: '围绕仓鼠旋转攻击' },
  seedgun: { name: '瓜子机关枪', description: '向最近敌人射击' },
  sawdust: { name: '木屑旋风', description: '范围持续伤害' },
  bird: { name: '追踪小鸟', description: '召唤小鸟追击敌人' },
  cheese: { name: '奶酪陷阱', description: '放置减速陷阱' },
  hoard: { name: '囤粮轨道', description: '食物环绕攻击' },
  water: { name: '水壶喷泉', description: '发射环形水波' },
};

export const WEAPON_EVOLUTION_INFO: Record<WeaponType, WeaponEvolutionRequirement> = {
  spinner: {
    requiredLevel: 7,
    requiredItem: 'wheelHeart',
    evolvedName: '⚡ 极速转轮',
    evolvedDescription: '超高速旋转，范围扩大50%',
  },
  seedgun: {
    requiredLevel: 7,
    requiredItem: 'nutAmmo',
    evolvedName: '⚡ 坚果风暴',
    evolvedDescription: '5连发穿透弹幕',
  },
  sawdust: {
    requiredLevel: 7,
    requiredItem: 'sawdustShield',
    evolvedName: '⚡ 木屑龙卷风',
    evolvedDescription: '巨型旋风，伤害翻倍',
  },
  bird: {
    requiredLevel: 7,
    requiredItem: 'birdWhisperer',
    evolvedName: '⚡ 猛禽军团',
    evolvedDescription: '召唤3只巨鹰同时攻击',
  },
  cheese: {
    requiredLevel: 7,
    requiredItem: 'cheesePower',
    evolvedName: '⚡ 奶酪迷宫',
    evolvedDescription: '陷阱数量+5，范围扩大',
  },
  hoard: {
    requiredLevel: 7,
    requiredItem: 'hoarding',
    evolvedName: '⚡ 仓鼠宝库',
    evolvedDescription: '10个食物轨道，全屏打击',
  },
  water: {
    requiredLevel: 7,
    requiredItem: 'waterCharm',
    evolvedName: '⚡ 海啸喷泉',
    evolvedDescription: '超大水波，击退并冰冻敌人',
  },
};

export class WeaponManager {
  private scene: Phaser.Scene;
  private player: Player;
  private weapons: Map<WeaponType, any> = new Map();
  private evolvedWeapons: Set<WeaponType> = new Set();
  private passiveItemManager?: any; // Will be set from GameScene

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;
  }

  setPassiveItemManager(manager: any) {
    this.passiveItemManager = manager;
  }

  addWeapon(type: WeaponType) {
    if (this.weapons.has(type)) {
      // 升级现有武器
      this.weapons.get(type).upgrade();

      // 检查是否可以进化
      this.checkEvolution(type);
      return true;
    }

    let weapon;
    switch (type) {
      case 'spinner':
        weapon = new SpinnerWeapon(this.scene, this.player);
        break;
      case 'seedgun':
        weapon = new SeedGunWeapon(this.scene, this.player);
        break;
      case 'sawdust':
        weapon = new SawdustWeapon(this.scene, this.player);
        break;
      case 'bird':
        weapon = new BirdWeapon(this.scene, this.player);
        break;
      case 'cheese':
        weapon = new CheeseWeapon(this.scene, this.player);
        break;
      case 'hoard':
        weapon = new HoardWeapon(this.scene, this.player);
        break;
      case 'water':
        weapon = new WaterWeapon(this.scene, this.player);
        break;
      default:
        console.warn(`武器类型 ${type} 尚未实现`);
        return false;
    }

    this.weapons.set(type, weapon);
    console.log(`✅ 获得新武器: ${WEAPON_INFO[type].name}`);
    return true;
  }

  update(delta: number) {
    this.weapons.forEach(weapon => weapon.update(delta));
  }

  getWeapons(): Map<WeaponType, any> {
    return this.weapons;
  }

  /**
   * 检查武器是否满足进化条件
   */
  private checkEvolution(weaponType: WeaponType) {
    // 如果已经进化，跳过
    if (this.evolvedWeapons.has(weaponType)) {
      return;
    }

    const weapon = this.weapons.get(weaponType);
    if (!weapon) return;

    const evolutionReq = WEAPON_EVOLUTION_INFO[weaponType];

    // 检查等级要求
    const weaponLevel = weapon.getLevel ? weapon.getLevel() : 1;
    if (weaponLevel < evolutionReq.requiredLevel) {
      return;
    }

    // 检查是否有所需道具
    if (!this.passiveItemManager) {
      return;
    }

    const itemLevel = this.passiveItemManager.getItemLevel(evolutionReq.requiredItem);
    if (itemLevel <= 0) {
      return;
    }

    // 满足条件，触发进化！
    this.evolveWeapon(weaponType);
  }

  /**
   * 进化武器
   */
  private evolveWeapon(weaponType: WeaponType) {
    const weapon = this.weapons.get(weaponType);
    if (!weapon) return;

    this.evolvedWeapons.add(weaponType);

    // 调用武器的进化方法
    if (weapon.evolve) {
      weapon.evolve();
    }

    const evolutionInfo = WEAPON_EVOLUTION_INFO[weaponType];

    console.log(`🌟 武器进化！${WEAPON_INFO[weaponType].name} → ${evolutionInfo.evolvedName}`);

    // 触发进化特效
    this.scene.events.emit('weapon-evolved', this.player.x, this.player.y, evolutionInfo.evolvedName);
  }

  /**
   * 检查武器是否已进化
   */
  isWeaponEvolved(weaponType: WeaponType): boolean {
    return this.evolvedWeapons.has(weaponType);
  }

  /**
   * 获取所有进化的武器
   */
  getEvolvedWeapons(): Set<WeaponType> {
    return new Set(this.evolvedWeapons);
  }
}

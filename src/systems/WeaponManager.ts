import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { SpinnerWeapon } from '../weapons/SpinnerWeapon';
import { SeedGunWeapon } from '../weapons/SeedGunWeapon';
import { SawdustWeapon } from '../weapons/SawdustWeapon';
import { BirdWeapon } from '../weapons/BirdWeapon';
import { CheeseWeapon } from '../weapons/CheeseWeapon';
import { HoardWeapon } from '../weapons/HoardWeapon';
import { WaterWeapon } from '../weapons/WaterWeapon';

export type WeaponType = 'spinner' | 'seedgun' | 'sawdust' | 'bird' | 'cheese' | 'hoard' | 'water';

export const WEAPON_INFO = {
  spinner: { name: '滚轮飞镖', description: '围绕仓鼠旋转攻击' },
  seedgun: { name: '瓜子机关枪', description: '向最近敌人射击' },
  sawdust: { name: '木屑旋风', description: '范围持续伤害' },
  bird: { name: '追踪小鸟', description: '召唤小鸟追击敌人' },
  cheese: { name: '奶酪陷阱', description: '放置减速陷阱' },
  hoard: { name: '囤粮轨道', description: '食物环绕攻击' },
  water: { name: '水壶喷泉', description: '发射环形水波' },
};

export class WeaponManager {
  private scene: Phaser.Scene;
  private player: Player;
  private weapons: Map<WeaponType, any> = new Map();

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;
  }

  addWeapon(type: WeaponType) {
    if (this.weapons.has(type)) {
      // 升级现有武器
      this.weapons.get(type).upgrade();
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
}

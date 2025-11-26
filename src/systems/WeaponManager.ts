import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { SpinnerWeapon } from '../weapons/SpinnerWeapon';
import { SeedGunWeapon } from '../weapons/SeedGunWeapon';

export type WeaponType = 'spinner' | 'seedgun' | 'sawdust' | 'bird' | 'cheese' | 'hoard' | 'water';

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
      return;
    }

    let weapon;
    switch (type) {
      case 'spinner':
        weapon = new SpinnerWeapon(this.scene, this.player);
        break;
      case 'seedgun':
        weapon = new SeedGunWeapon(this.scene, this.player);
        break;
      // TODO: 实现其他武器
      default:
        console.warn(`武器类型 ${type} 尚未实现`);
        return;
    }

    this.weapons.set(type, weapon);
  }

  update(delta: number) {
    this.weapons.forEach(weapon => weapon.update(delta));
  }

  getWeapons(): Map<WeaponType, any> {
    return this.weapons;
  }
}

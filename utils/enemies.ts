// utils/enemies.ts
import type { Traits, Equipped } from '../store/slices/playerSlice';
import { weapons, armors } from './items';
import type { Weapon, Armor } from './items';

export interface Enemy {
  id: string;
  name: string;
  traits: Traits;
  inventory: Array<Weapon | Armor>;
  equipped: Equipped;
  initiative: number;
  attack: number;
  defense: number;
  damage: number;
  damageReduction: number;
  hp: number;
  currentHp: number;
}

function makeEnemy(id: string, name: string, traits: Traits): Enemy {
  // select all items matching the strength requirement
  const inv: Array<Weapon | Armor> = [
    ...weapons.filter((w) => w.strengthRequirement === traits.str),
    ...armors.filter((a) => a.strengthRequirement === traits.str),
  ];
  // equip the normal-quality ones
  const weapon = weapons.find(
    (w) => w.strengthRequirement === traits.str && w.quality === 'normal'
  )!;
  const armor = armors.find(
    (a) => a.strengthRequirement === traits.str && a.quality === 'normal'
  )!;
  const equip: Equipped = { weapon, armor };

  const initiative = traits.smr + traits.spd;
  const attack = traits.smr + traits.spd;
  const defense = traits.smr + traits.spd;
  const damage = traits.str + weapon.damage;
  const damageReduction = armor.damageReduction;
  const hp = traits.stm * 10;

  return {
    id,
    name,
    traits,
    inventory: inv,
    equipped: equip,
    initiative,
    attack,
    defense,
    damage,
    damageReduction,
    hp,
    currentHp: hp,
  };
}

const defaultEnemyTraits: Omit<Traits, 'str' | 'spd' | 'smr' | 'stm'> = {
  reputation: 0,
  gatherInformation: 0,
  travel: 0,
  heal: 0,
  craft: 0,
  perception: 1, // Give enemies basic perception
  stealth: 1,    // Give enemies basic stealth
  athletics: 1,  // Give enemies basic athletics
};

export const enemies: Enemy[] = [
  makeEnemy('enemy-1', 'Brute',   { ...defaultEnemyTraits, str: 2, spd: 1, smr: 1, stm: 1 }),
  makeEnemy('enemy-2', 'Scout',   { ...defaultEnemyTraits, str: 1, spd: 2, smr: 1, stm: 1 }),
  makeEnemy('enemy-3', 'Mage',    { ...defaultEnemyTraits, str: 1, spd: 1, smr: 2, stm: 1 }),
  makeEnemy('enemy-4', 'Tank',    { ...defaultEnemyTraits, str: 1, spd: 1, smr: 1, stm: 2 }),
  makeEnemy('orc_fighter', 'Orc', { ...defaultEnemyTraits, str: 2, spd: 1, smr: 1, stm: 2 }),
];

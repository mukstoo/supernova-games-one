// utils/items.ts
import weaponImg from '../assets/images/weapon.png';
import armorImg from '../assets/images/armor.png';

export type Quality = 'low' | 'normal' | 'high';

export interface Weapon {
  id: string;
  name: string;
  strengthRequirement: number;
  attack: number;
  defense: number;
  damage: number;
  quality: Quality;
  image: typeof weaponImg;
}

export interface Armor {
  id: string;
  name: string;
  strengthRequirement: number;
  defense: number;
  damageReduction: number;
  quality: Quality;
  image: typeof armorImg;
}

const strengths = [1, 2, 3, 4, 5] as const;

const qualities: { quality: Quality; modifier: number }[] = [
  { quality: 'low', modifier: -1 },
  { quality: 'normal', modifier: 0 },
  { quality: 'high', modifier: +1 },
];

export const weapons: Weapon[] = strengths.flatMap((str) =>
  qualities.map(({ quality, modifier }) => ({
    id: `weapon-${str}-${quality}`,
    name: `${quality.charAt(0).toUpperCase() + quality.slice(1)} Weapon (STR ${str})`,
    strengthRequirement: str,
    attack: 0,
    defense: 0,
    damage: Math.max(0, str + modifier),
    quality,
    image: weaponImg,
  }))
);

export const armors: Armor[] = strengths.flatMap((str) =>
  qualities.map(({ quality, modifier }) => ({
    id: `armor-${str}-${quality}`,
    name: `${quality.charAt(0).toUpperCase() + quality.slice(1)} Armor (STR ${str})`,
    strengthRequirement: str,
    defense: 0,
    damageReduction: Math.max(0, str + modifier),
    quality,
    image: armorImg,
  }))
);

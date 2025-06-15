import weaponImg from '../assets/images/weapon.png';

export type Quality = 'poor' | 'common' | 'rare' | 'epic' | 'legendary';
export type WeaponType = 'sword' | 'axe' | 'spear' | 'bow' | 'mace' | 'staff';

export interface Weapon {
  id: string;
  name: string;
  type: WeaponType;
  strengthRequirement: number;
  attack: number;
  defense: number;
  damage: number;
  size: string;
  lethality: number;
  rarity: number;
  quality: Quality;
  image: typeof weaponImg;
  value: number;
  description: string;
}

/*
WEAPON TYPE BONUSES:
- Swords: +1 Attack (precision and finesse)
- Axes: +2 Damage (raw cutting power)
- Spears: +3 Lethality (piercing and reach advantage)

RARITY CALCULATION:
- Base rarity = Strength Requirement
- Poor quality: -1 rarity
- Common quality: +0 rarity
- Rare quality: +1 rarity
*/

// Expanded weapon system - 3 variants per strength requirement (poor, common, rare)
export const allWeapons: Weapon[] = [
  // SWORDS - Strength 1 weapons
  {
    id: 'rusty-knife',
    name: 'Rusty Knife',
    type: 'sword',
    strengthRequirement: 1,
    attack: 1,
    defense: 0,
    damage: 0,
    size: '2x1',
    lethality: 0,
    rarity: 0,
    quality: 'poor',
    image: weaponImg,
    value: 5,
    description: 'A corroded old knife. Barely sharp enough to cut bread.'
  },
  {
    id: 'iron-dagger',
    name: 'Iron Dagger',
    type: 'sword',
    strengthRequirement: 1,
    attack: 1,
    defense: 0,
    damage: 1,
    size: '2x1',
    lethality: 0,
    rarity: 1,
    quality: 'common',
    image: weaponImg,
    value: 15,
    description: 'A simple iron dagger. Light and easy to handle.'
  },
  {
    id: 'sharp-dagger',
    name: 'Sharp Dagger',
    type: 'sword',
    strengthRequirement: 1,
    attack: 1,
    defense: 0,
    damage: 2,
    size: '2x1',
    lethality: 0,
    rarity: 2,
    quality: 'rare',
    image: weaponImg,
    value: 30,
    description: 'A well-honed dagger with an exceptionally sharp edge.'
  },

  // Strength 2 swords
  {
    id: 'dull-blade',
    name: 'Dull Blade',
    type: 'sword',
    strengthRequirement: 2,
    attack: 1,
    defense: 0,
    damage: 1,
    size: '2x1',
    lethality: 0,
    rarity: 1,
    quality: 'poor',
    image: weaponImg,
    value: 10,
    description: 'A worn short sword that has seen better days.'
  },
  {
    id: 'short-sword',
    name: 'Short Sword',
    type: 'sword',
    strengthRequirement: 2,
    attack: 1,
    defense: 0,
    damage: 2,
    size: '2x1',
    lethality: 0,
    rarity: 2,
    quality: 'common',
    image: weaponImg,
    value: 25,
    description: 'A reliable short sword. Good balance and reach.'
  },
  {
    id: 'keen-blade',
    name: 'Keen Blade',
    type: 'sword',
    strengthRequirement: 2,
    attack: 1,
    defense: 0,
    damage: 3,
    size: '2x1',
    lethality: 0,
    rarity: 3,
    quality: 'rare',
    image: weaponImg,
    value: 45,
    description: 'A finely crafted short sword with superior sharpness.'
  },

  // Strength 3 swords
  {
    id: 'worn-sword',
    name: 'Worn Sword',
    type: 'sword',
    strengthRequirement: 3,
    attack: 2,
    defense: 0,
    damage: 2,
    size: '2x1',
    lethality: 0,
    rarity: 2,
    quality: 'poor',
    image: weaponImg,
    value: 20,
    description: 'An old longsword showing signs of wear but still serviceable.'
  },
  {
    id: 'steel-sword',
    name: 'Steel Sword',
    type: 'sword',
    strengthRequirement: 3,
    attack: 2,
    defense: 0,
    damage: 3,
    size: '2x1',
    lethality: 0,
    rarity: 3,
    quality: 'common',
    image: weaponImg,
    value: 40,
    description: 'A solid steel sword. Well-balanced and effective in combat.'
  },
  {
    id: 'masterwork-blade',
    name: 'Masterwork Blade',
    type: 'sword',
    strengthRequirement: 3,
    attack: 2,
    defense: 0,
    damage: 4,
    size: '2x1',
    lethality: 0,
    rarity: 4,
    quality: 'rare',
    image: weaponImg,
    value: 70,
    description: 'A beautifully crafted sword by a master smith. Superior in every way.'
  },

  // Strength 4 swords
  {
    id: 'heavy-blade',
    name: 'Heavy Blade',
    type: 'sword',
    strengthRequirement: 4,
    attack: 2,
    defense: 0,
    damage: 3,
    size: '2x1',
    lethality: 0,
    rarity: 3,
    quality: 'poor',
    image: weaponImg,
    value: 35,
    description: 'A thick, heavy sword. Powerful but unwieldy due to poor craftsmanship.'
  },
  {
    id: 'bastard-sword',
    name: 'Bastard Sword',
    type: 'sword',
    strengthRequirement: 4,
    attack: 2,
    defense: 0,
    damage: 4,
    size: '2x1',
    lethality: 0,
    rarity: 4,
    quality: 'common',
    image: weaponImg,
    value: 60,
    description: 'A versatile hand-and-a-half sword. Can be wielded with one or two hands.'
  },
  {
    id: 'fine-longsword',
    name: 'Fine Longsword',
    type: 'sword',
    strengthRequirement: 4,
    attack: 2,
    defense: 0,
    damage: 5,
    size: '2x1',
    lethality: 0,
    rarity: 5,
    quality: 'rare',
    image: weaponImg,
    value: 100,
    description: 'An expertly forged longsword with perfect balance and deadly precision.'
  },

  // Strength 5 swords
  {
    id: 'crude-greatsword',
    name: 'Crude Greatsword',
    type: 'sword',
    strengthRequirement: 5,
    attack: 3,
    defense: 0,
    damage: 4,
    size: '2x1',
    lethality: 0,
    rarity: 4,
    quality: 'poor',
    image: weaponImg,
    value: 50,
    description: 'A massive two-handed sword. Roughly made but devastatingly powerful.'
  },
  {
    id: 'great-sword',
    name: 'Great Sword',
    type: 'sword',
    strengthRequirement: 5,
    attack: 3,
    defense: 0,
    damage: 5,
    size: '2x1',
    lethality: 0,
    rarity: 5,
    quality: 'common',
    image: weaponImg,
    value: 80,
    description: 'A mighty two-handed sword. Requires great strength but deals tremendous damage.'
  },
  {
    id: 'legendary-blade',
    name: 'Legendary Blade',
    type: 'sword',
    strengthRequirement: 5,
    attack: 3,
    defense: 0,
    damage: 6,
    size: '2x1',
    lethality: 0,
    rarity: 6,
    quality: 'rare',
    image: weaponImg,
    value: 150,
    description: 'A legendary two-handed sword of incredible craftsmanship. Few can wield such power.'
  },

  // AXES - Strength 1 axes
  {
    id: 'rusty-hatchet',
    name: 'Rusty Hatchet',
    type: 'axe',
    strengthRequirement: 1,
    attack: 0,
    defense: 0,
    damage: 2,
    size: '2x1',
    lethality: 0,
    rarity: 0,
    quality: 'poor',
    image: weaponImg,
    value: 8,
    description: 'A corroded old hatchet. The head is loose and barely attached.'
  },
  {
    id: 'woodcutters-axe',
    name: 'Woodcutter\'s Axe',
    type: 'axe',
    strengthRequirement: 1,
    attack: 0,
    defense: 0,
    damage: 3,
    size: '2x1',
    lethality: 0,
    rarity: 1,
    quality: 'common',
    image: weaponImg,
    value: 18,
    description: 'A simple axe used for chopping wood. Functional but basic.'
  },
  {
    id: 'sharp-hatchet',
    name: 'Sharp Hatchet',
    type: 'axe',
    strengthRequirement: 1,
    attack: 0,
    defense: 0,
    damage: 4,
    size: '2x1',
    lethality: 0,
    rarity: 2,
    quality: 'rare',
    image: weaponImg,
    value: 35,
    description: 'A well-maintained hatchet with a razor-sharp edge.'
  },

  // Strength 2 axes
  {
    id: 'worn-axe',
    name: 'Worn Axe',
    type: 'axe',
    strengthRequirement: 2,
    attack: 0,
    defense: 0,
    damage: 3,
    size: '2x1',
    lethality: 0,
    rarity: 1,
    quality: 'poor',
    image: weaponImg,
    value: 12,
    description: 'A battle axe that has seen better days. Still functional but worn.'
  },
  {
    id: 'battle-axe',
    name: 'Battle Axe',
    type: 'axe',
    strengthRequirement: 2,
    attack: 0,
    defense: 0,
    damage: 4,
    size: '2x1',
    lethality: 0,
    rarity: 2,
    quality: 'common',
    image: weaponImg,
    value: 28,
    description: 'A sturdy battle axe designed for combat. Heavy but effective.'
  },
  {
    id: 'keen-axe',
    name: 'Keen Axe',
    type: 'axe',
    strengthRequirement: 2,
    attack: 0,
    defense: 0,
    damage: 5,
    size: '2x1',
    lethality: 0,
    rarity: 3,
    quality: 'rare',
    image: weaponImg,
    value: 50,
    description: 'A finely crafted battle axe with superior balance and sharpness.'
  },

  // Strength 3 axes
  {
    id: 'heavy-axe',
    name: 'Heavy Axe',
    type: 'axe',
    strengthRequirement: 3,
    attack: 1,
    defense: 0,
    damage: 4,
    size: '2x1',
    lethality: 0,
    rarity: 2,
    quality: 'poor',
    image: weaponImg,
    value: 22,
    description: 'A large axe with a thick, heavy head. Crude but powerful.'
  },
  {
    id: 'war-axe',
    name: 'War Axe',
    type: 'axe',
    strengthRequirement: 3,
    attack: 1,
    defense: 0,
    damage: 5,
    size: '2x1',
    lethality: 0,
    rarity: 3,
    quality: 'common',
    image: weaponImg,
    value: 45,
    description: 'A proper war axe built for battle. Well-balanced and deadly.'
  },
  {
    id: 'masterwork-axe',
    name: 'Masterwork Axe',
    type: 'axe',
    strengthRequirement: 3,
    attack: 1,
    defense: 0,
    damage: 6,
    size: '2x1',
    lethality: 0,
    rarity: 4,
    quality: 'rare',
    image: weaponImg,
    value: 75,
    description: 'An expertly crafted war axe with perfect weight distribution.'
  },

  // Strength 4 axes
  {
    id: 'crude-greataxe',
    name: 'Crude Greataxe',
    type: 'axe',
    strengthRequirement: 4,
    attack: 1,
    defense: 0,
    damage: 5,
    size: '2x1',
    lethality: 0,
    rarity: 3,
    quality: 'poor',
    image: weaponImg,
    value: 38,
    description: 'A massive two-handed axe. Roughly made but devastatingly powerful.'
  },
  {
    id: 'great-axe',
    name: 'Great Axe',
    type: 'axe',
    strengthRequirement: 4,
    attack: 1,
    defense: 0,
    damage: 6,
    size: '2x1',
    lethality: 0,
    rarity: 4,
    quality: 'common',
    image: weaponImg,
    value: 65,
    description: 'A mighty two-handed battle axe. Requires great strength to wield effectively.'
  },
  {
    id: 'fine-greataxe',
    name: 'Fine Greataxe',
    type: 'axe',
    strengthRequirement: 4,
    attack: 1,
    defense: 0,
    damage: 7,
    size: '2x1',
    lethality: 0,
    rarity: 5,
    quality: 'rare',
    image: weaponImg,
    value: 110,
    description: 'An expertly forged greataxe with perfect balance and deadly precision.'
  },

  // Strength 5 axes
  {
    id: 'massive-axe',
    name: 'Massive Axe',
    type: 'axe',
    strengthRequirement: 5,
    attack: 2,
    defense: 0,
    damage: 6,
    size: '2x1',
    lethality: 0,
    rarity: 4,
    quality: 'poor',
    image: weaponImg,
    value: 55,
    description: 'An enormous two-handed axe. Crudely made but capable of splitting a man in two.'
  },
  {
    id: 'executioners-axe',
    name: 'Executioner\'s Axe',
    type: 'axe',
    strengthRequirement: 5,
    attack: 2,
    defense: 0,
    damage: 7,
    size: '2x1',
    lethality: 0,
    rarity: 5,
    quality: 'common',
    image: weaponImg,
    value: 85,
    description: 'A fearsome two-handed axe designed for maximum damage. Heavy and brutal.'
  },
  {
    id: 'legendary-axe',
    name: 'Legendary Axe',
    type: 'axe',
    strengthRequirement: 5,
    attack: 2,
    defense: 0,
    damage: 8,
    size: '2x1',
    lethality: 0,
    rarity: 6,
    quality: 'rare',
    image: weaponImg,
    value: 160,
    description: 'A legendary two-handed axe of incredible craftsmanship. The stuff of legends.'
  },

  // SPEARS - Strength 1 spears
  {
    id: 'broken-spear',
    name: 'Broken Spear',
    type: 'spear',
    strengthRequirement: 1,
    attack: 0,
    defense: 0,
    damage: 0,
    size: '2x1',
    lethality: 3,
    rarity: 0,
    quality: 'poor',
    image: weaponImg,
    value: 6,
    description: 'A damaged spear with a cracked shaft. The tip is barely attached.'
  },
  {
    id: 'hunting-spear',
    name: 'Hunting Spear',
    type: 'spear',
    strengthRequirement: 1,
    attack: 0,
    defense: 0,
    damage: 1,
    size: '2x1',
    lethality: 3,
    rarity: 1,
    quality: 'common',
    image: weaponImg,
    value: 16,
    description: 'A simple spear used for hunting. Light and easy to handle.'
  },
  {
    id: 'sharp-spear',
    name: 'Sharp Spear',
    type: 'spear',
    strengthRequirement: 1,
    attack: 0,
    defense: 0,
    damage: 2,
    size: '2x1',
    lethality: 3,
    rarity: 2,
    quality: 'rare',
    image: weaponImg,
    value: 32,
    description: 'A well-crafted spear with a razor-sharp iron tip.'
  },

  // Strength 2 spears
  {
    id: 'crude-spear',
    name: 'Crude Spear',
    type: 'spear',
    strengthRequirement: 2,
    attack: 0,
    defense: 0,
    damage: 1,
    size: '2x1',
    lethality: 3,
    rarity: 1,
    quality: 'poor',
    image: weaponImg,
    value: 11,
    description: 'A roughly made spear. Functional but lacks finesse.'
  },
  {
    id: 'soldier-spear',
    name: 'Soldier Spear',
    type: 'spear',
    strengthRequirement: 2,
    attack: 0,
    defense: 0,
    damage: 2,
    size: '2x1',
    lethality: 3,
    rarity: 2,
    quality: 'common',
    image: weaponImg,
    value: 26,
    description: 'A standard military spear. Reliable and well-balanced.'
  },
  {
    id: 'keen-spear',
    name: 'Keen Spear',
    type: 'spear',
    strengthRequirement: 2,
    attack: 0,
    defense: 0,
    damage: 3,
    size: '2x1',
    lethality: 3,
    rarity: 3,
    quality: 'rare',
    image: weaponImg,
    value: 48,
    description: 'A finely crafted spear with superior reach and precision.'
  },

  // Strength 3 spears
  {
    id: 'heavy-spear',
    name: 'Heavy Spear',
    type: 'spear',
    strengthRequirement: 3,
    attack: 1,
    defense: 0,
    damage: 2,
    size: '2x1',
    lethality: 3,
    rarity: 2,
    quality: 'poor',
    image: weaponImg,
    value: 21,
    description: 'A thick, heavy spear. Powerful but unwieldy due to poor balance.'
  },
  {
    id: 'war-spear',
    name: 'War Spear',
    type: 'spear',
    strengthRequirement: 3,
    attack: 1,
    defense: 0,
    damage: 3,
    size: '2x1',
    lethality: 3,
    rarity: 3,
    quality: 'common',
    image: weaponImg,
    value: 42,
    description: 'A proper war spear built for battle. Excellent reach and penetration.'
  },
  {
    id: 'masterwork-spear',
    name: 'Masterwork Spear',
    type: 'spear',
    strengthRequirement: 3,
    attack: 1,
    defense: 0,
    damage: 4,
    size: '2x1',
    lethality: 3,
    rarity: 4,
    quality: 'rare',
    image: weaponImg,
    value: 72,
    description: 'An expertly crafted war spear with perfect balance and deadly accuracy.'
  },

  // Strength 4 spears
  {
    id: 'crude-pike',
    name: 'Crude Pike',
    type: 'spear',
    strengthRequirement: 4,
    attack: 1,
    defense: 0,
    damage: 3,
    size: '2x1',
    lethality: 3,
    rarity: 3,
    quality: 'poor',
    image: weaponImg,
    value: 36,
    description: 'A long, heavy pike. Roughly made but with impressive reach.'
  },
  {
    id: 'battle-pike',
    name: 'Battle Pike',
    type: 'spear',
    strengthRequirement: 4,
    attack: 1,
    defense: 0,
    damage: 4,
    size: '2x1',
    lethality: 3,
    rarity: 4,
    quality: 'common',
    image: weaponImg,
    value: 62,
    description: 'A mighty pike designed for formation fighting. Excellent reach and power.'
  },
  {
    id: 'fine-pike',
    name: 'Fine Pike',
    type: 'spear',
    strengthRequirement: 4,
    attack: 1,
    defense: 0,
    damage: 5,
    size: '2x1',
    lethality: 3,
    rarity: 5,
    quality: 'rare',
    image: weaponImg,
    value: 105,
    description: 'An expertly forged pike with perfect balance and deadly precision.'
  },

  // Strength 5 spears
  {
    id: 'massive-lance',
    name: 'Massive Lance',
    type: 'spear',
    strengthRequirement: 5,
    attack: 2,
    defense: 0,
    damage: 4,
    size: '2x1',
    lethality: 3,
    rarity: 4,
    quality: 'poor',
    image: weaponImg,
    value: 52,
    description: 'An enormous lance. Crudely made but capable of devastating charges.'
  },
  {
    id: 'great-lance',
    name: 'Great Lance',
    type: 'spear',
    strengthRequirement: 5,
    attack: 2,
    defense: 0,
    damage: 5,
    size: '2x1',
    lethality: 3,
    rarity: 5,
    quality: 'common',
    image: weaponImg,
    value: 82,
    description: 'A mighty lance built for mounted combat. Tremendous reach and impact.'
  },
  {
    id: 'legendary-lance',
    name: 'Legendary Lance',
    type: 'spear',
    strengthRequirement: 5,
    attack: 2,
    defense: 0,
    damage: 6,
    size: '2x1',
    lethality: 3,
    rarity: 6,
    quality: 'rare',
    image: weaponImg,
    value: 155,
    description: 'A legendary lance of incredible craftsmanship. The weapon of heroes.'
  }
];

// Helper function to get weapon by strength requirement
export function getWeaponsByStrength(strengthReq: number): Weapon[] {
  return allWeapons.filter(weapon => weapon.strengthRequirement === strengthReq);
}

// Helper function to get appropriate starting weapon (lowest requirement, common quality)
export function getStartingWeaponForCharacter(): Weapon {
  return allWeapons[1]; // Return the iron dagger (str 1, common)
}

// Helper function to get weapons by strength requirement range
export function getWeaponsByStrengthRange(minStr: number, maxStr: number = 5): Weapon[] {
  return allWeapons.filter(weapon => 
    weapon.strengthRequirement >= minStr && weapon.strengthRequirement <= maxStr
  );
}

// Helper function to get specific weapon by strength and quality
export function getWeaponByStrengthAndQuality(strengthReq: number, quality: Quality): Weapon | undefined {
  return allWeapons.find(weapon => 
    weapon.strengthRequirement === strengthReq && weapon.quality === quality
  );
}

// Helper function to get weapon by type (keeping for backwards compatibility)
export function getWeaponsByType(type: WeaponType): Weapon[] {
  return allWeapons.filter(weapon => weapon.type === type);
}

// Helper function to get starting weapon by type (keeping for backwards compatibility)
export function getStartingWeapon(type: WeaponType): Weapon | undefined {
  return allWeapons.find(weapon => weapon.type === type && weapon.quality === 'common');
} 

// Legacy exports for backwards compatibility
export const startingWeapons: Weapon[] = allWeapons.filter(weapon => weapon.quality === 'common');
export const commonWeapons: Weapon[] = allWeapons.filter(weapon => weapon.quality === 'common');
export const rareWeapons: Weapon[] = allWeapons.filter(weapon => weapon.quality === 'rare'); 
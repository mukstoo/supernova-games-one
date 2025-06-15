import armorImg from '../assets/images/armor.png';

export type Quality = 'poor' | 'common' | 'rare' | 'epic' | 'legendary';

export interface Armor {
  id: string;
  name: string;
  strengthRequirement: number;
  defense: number;
  damageReduction: number;
  rarity: number;
  quality: Quality;
  image: typeof armorImg;
  value: number;
  description: string;
}

/*
RARITY CALCULATION:
- Base rarity = Strength Requirement
- Poor quality: -1 rarity
- Common quality: +0 rarity
- Rare quality: +1 rarity
*/

// Expanded armor system - 3 variants per strength requirement
export const allArmor: Armor[] = [
  // Strength 1 armors
  {
    id: 'cloth-rags',
    name: 'Cloth Rags',
    strengthRequirement: 1,
    defense: 0,
    damageReduction: 0,
    rarity: 0,
    quality: 'poor',
    image: armorImg,
    value: 5,
    description: 'Tattered cloth pieces. Better than nothing, but barely.'
  },
  {
    id: 'leather-clothes',
    name: 'Leather Clothes',
    strengthRequirement: 1,
    defense: 0,
    damageReduction: 1,
    rarity: 1,
    quality: 'common',
    image: armorImg,
    value: 15,
    description: 'Simple leather clothing that provides basic protection from cuts and scrapes.'
  },
  {
    id: 'reinforced-leather',
    name: 'Reinforced Leather',
    strengthRequirement: 1,
    defense: 0,
    damageReduction: 2,
    rarity: 2,
    quality: 'rare',
    image: armorImg,
    value: 25,
    description: 'Leather clothing with extra patches and reinforcement in key areas.'
  },

  // Strength 2 armors
  {
    id: 'light-padding',
    name: 'Light Padding',
    strengthRequirement: 2,
    defense: 0,
    damageReduction: 1,
    rarity: 1,
    quality: 'poor',
    image: armorImg,
    value: 20,
    description: 'Minimal padding sewn into cloth. Lightweight protection.'
  },
  {
    id: 'padded-vest',
    name: 'Padded Vest',
    strengthRequirement: 2,
    defense: 0,
    damageReduction: 2,
    rarity: 2,
    quality: 'common',
    image: armorImg,
    value: 30,
    description: 'A quilted vest with padding that absorbs impact from blows.'
  },
  {
    id: 'thick-padding',
    name: 'Thick Padding',
    strengthRequirement: 2,
    defense: 0,
    damageReduction: 3,
    rarity: 3,
    quality: 'rare',
    image: armorImg,
    value: 45,
    description: 'Heavy quilted armor with thick padding throughout.'
  },

  // Strength 3 armors
  {
    id: 'basic-leather',
    name: 'Basic Leather',
    strengthRequirement: 3,
    defense: 1,
    damageReduction: 2,
    rarity: 2,
    quality: 'poor',
    image: armorImg,
    value: 40,
    description: 'Standard leather armor offering decent protection.'
  },
  {
    id: 'studded-leather',
    name: 'Studded Leather',
    strengthRequirement: 3,
    defense: 1,
    damageReduction: 3,
    rarity: 3,
    quality: 'common',
    image: armorImg,
    value: 60,
    description: 'Leather armor reinforced with metal studs. Provides good protection and mobility.'
  },
  {
    id: 'reinforced-studded',
    name: 'Reinforced Studded',
    strengthRequirement: 3,
    defense: 1,
    damageReduction: 4,
    rarity: 4,
    quality: 'rare',
    image: armorImg,
    value: 80,
    description: 'Studded leather with additional metal reinforcement and thicker hide.'
  },

  // Strength 4 armors
  {
    id: 'light-chain',
    name: 'Light Chain',
    strengthRequirement: 4,
    defense: 1,
    damageReduction: 3,
    rarity: 3,
    quality: 'poor',
    image: armorImg,
    value: 70,
    description: 'Chainmail with lighter links. Good protection with reasonable weight.'
  },
  {
    id: 'chain-mail',
    name: 'Chain Mail',
    strengthRequirement: 4,
    defense: 1,
    damageReduction: 4,
    rarity: 4,
    quality: 'common',
    image: armorImg,
    value: 100,
    description: 'Interlocking metal rings form a protective mesh. Heavy but effective.'
  },
  {
    id: 'heavy-chain',
    name: 'Heavy Chain',
    strengthRequirement: 4,
    defense: 1,
    damageReduction: 5,
    rarity: 5,
    quality: 'rare',
    image: armorImg,
    value: 130,
    description: 'Dense chainmail with reinforced links. Maximum chain armor protection.'
  },

  // Strength 5 armors
  {
    id: 'light-plate',
    name: 'Light Plate',
    strengthRequirement: 5,
    defense: 2,
    damageReduction: 4,
    rarity: 4,
    quality: 'poor',
    image: armorImg,
    value: 150,
    description: 'Plate armor with thinner steel. Good protection without excessive weight.'
  },
  {
    id: 'plate-armor',
    name: 'Plate Armor',
    strengthRequirement: 5,
    defense: 2,
    damageReduction: 5,
    rarity: 5,
    quality: 'common',
    image: armorImg,
    value: 200,
    description: 'Full plate armor made of steel. Maximum protection for those strong enough to wear it.'
  },
  {
    id: 'heavy-plate',
    name: 'Heavy Plate',
    strengthRequirement: 5,
    defense: 2,
    damageReduction: 6,
    rarity: 6,
    quality: 'rare',
    image: armorImg,
    value: 280,
    description: 'Thick steel plate armor with extra reinforcement. Ultimate protection.'
  }
];

// Helper function to get armor by strength requirement
export function getArmorByStrength(strengthReq: number): Armor[] {
  return allArmor.filter(armor => armor.strengthRequirement === strengthReq);
}

// Helper function to get appropriate starting armor (lowest requirement, lowest DR)
export function getStartingArmorForCharacter(): Armor {
  return allArmor[1]; // Return the leather clothes (str 1, DR 1)
}

// Helper function to get armor by strength requirement range
export function getArmorByStrengthRange(minStr: number, maxStr: number = 5): Armor[] {
  return allArmor.filter(armor => 
    armor.strengthRequirement >= minStr && armor.strengthRequirement <= maxStr
  );
}

// Helper function to get specific armor by strength and damage reduction
export function getArmorByStrengthAndDR(strengthReq: number, damageReduction: number): Armor | undefined {
  return allArmor.find(armor => 
    armor.strengthRequirement === strengthReq && armor.damageReduction === damageReduction
  );
} 
// app/character-sheet.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import {
  equipWeapon,
  equipArmor,
  incrementTrait,
} from '../store/slices/playerSlice';
import type { Weapon, Armor } from '../data/items';
import type { Traits } from '../store/slices/playerSlice';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { useRouter } from 'expo-router';
import { allQuests } from '../utils/quests';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTAINER_WIDTH = SCREEN_WIDTH * 0.98;
const COLUMN_WIDTH = CONTAINER_WIDTH * 0.49;

// Define Attribute and Skill Keys for proper organization
const ATTRIBUTE_KEYS: Array<keyof Pick<Traits, 'str' | 'agility' | 'endurance' | 'intelligence'>> = [
  'str', 'agility', 'endurance', 'intelligence'
];

const SKILL_KEYS: Array<keyof Pick<Traits, 'athletics' | 'persuade' | 'survival' | 'stealth' | 'medicine' | 'craft' | 'perception'>> = [
  'athletics', 'persuade', 'survival', 'stealth', 'medicine', 'craft', 'perception'
];

const ATTRIBUTE_LABELS: Record<typeof ATTRIBUTE_KEYS[number], string> = {
  str: 'Strength',
  agility: 'Agility',
  endurance: 'Endurance',
  intelligence: 'Intelligence',
};

const SKILL_LABELS: Record<typeof SKILL_KEYS[number], string> = {
  athletics: 'Athletics',
  persuade: 'Persuade',
  survival: 'Survival',
  stealth: 'Stealth',
  medicine: 'Medicine',
  craft: 'Craft',
  perception: 'Perception',
};

export default function CharacterSheet() {
  const dispatch = useDispatch();
  const router = useRouter();
  const {
    name,
    traits,
    initiative,
    attack,
    defense,
    damage,
    damageReduction,
    hp,
    currentHp,
    stamina,
    currentStamina,
    inventory,
    equipped,
    attributePoints,
    gold,
    quests,
  } = useSelector((s: RootState) => s.player);

  const weapons = inventory.filter(
    (i): i is Weapon => 'damage' in i
  );
  const armors = inventory.filter(
    (i): i is Armor => 'damageReduction' in i
  );

  // Helper function to check if an item is equipped
  const isWeaponEquipped = (weapon: Weapon): boolean => {
    if (!equipped.weapon) return false;
    // Compare by multiple properties to ensure accurate matching
    return equipped.weapon.id === weapon.id ||
           (equipped.weapon.name === weapon.name && 
            equipped.weapon.type === weapon.type &&
            equipped.weapon.strengthRequirement === weapon.strengthRequirement &&
            equipped.weapon.quality === weapon.quality);
  };

  const isArmorEquipped = (armor: Armor): boolean => {
    if (!equipped.armor) return false;
    // Compare by multiple properties to ensure accurate matching
    return equipped.armor.id === armor.id ||
           (equipped.armor.name === armor.name && 
            equipped.armor.strengthRequirement === armor.strengthRequirement &&
            equipped.armor.quality === armor.quality);
  };

  const activePlayerQuestIds = Object.values(quests)
    .filter(qInfo => qInfo.status === 'active')
    .map(qInfo => qInfo.id);

  const activeQuests = allQuests.filter(qDef => 
    activePlayerQuestIds.includes(qDef.id)
  );

  const onAllocate = (key: keyof typeof traits) => {
    dispatch(incrementTrait({ key, cost: 1 }));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.characterName}>{name}</Text>
        {attributePoints > 0 && (
          <Text style={styles.unspentPoints}>
            Unspent Points: {attributePoints}
          </Text>
        )}
      </View>

      <View style={styles.columnsContainer}>
        {/* Left Column */}
        <View style={styles.column}>
          {/* Primary Attributes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Primary Attributes</Text>
            {ATTRIBUTE_KEYS.map((key) => (
              <View key={key} style={styles.statRow}>
                <Text style={styles.statLabel}>{ATTRIBUTE_LABELS[key]}</Text>
                <View style={styles.statValueContainer}>
                  <Text style={styles.statValue}>{traits[key]}</Text>
                  {attributePoints > 0 && (
                    <TouchableOpacity
                      style={styles.plusBtn}
                      onPress={() => onAllocate(key)}
                    >
                      <Text style={styles.plusText}>+</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* Skills */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            {SKILL_KEYS.map((key) => (
              <View key={key} style={styles.statRow}>
                <Text style={styles.statLabel}>{SKILL_LABELS[key]}</Text>
                <View style={styles.statValueContainer}>
                  <Text style={styles.statValue}>{traits[key]}</Text>
                  {attributePoints > 0 && (
                    <TouchableOpacity
                      style={styles.plusBtn}
                      onPress={() => onAllocate(key)}
                    >
                      <Text style={styles.plusText}>+</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* Secondary Attributes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Secondary Attributes</Text>
            <View style={styles.secondaryStatsContainer}>
              <View style={styles.secondaryStatRow}>
                <Text style={styles.secondaryStatLabel}>Initiative:</Text>
                <Text style={styles.secondaryStatValue}>{initiative}</Text>
              </View>
              <View style={styles.secondaryStatRow}>
                <Text style={styles.secondaryStatLabel}>Attack:</Text>
                <Text style={styles.secondaryStatValue}>{attack}</Text>
              </View>
              <View style={styles.secondaryStatRow}>
                <Text style={styles.secondaryStatLabel}>Defense:</Text>
                <Text style={styles.secondaryStatValue}>{defense}</Text>
              </View>
              <View style={styles.secondaryStatRow}>
                <Text style={styles.secondaryStatLabel}>Damage:</Text>
                <Text style={styles.secondaryStatValue}>{damage}</Text>
              </View>
              <View style={styles.secondaryStatRow}>
                <Text style={styles.secondaryStatLabel}>Damage Reduction:</Text>
                <Text style={styles.secondaryStatValue}>{damageReduction}</Text>
              </View>
              <View style={styles.secondaryStatRow}>
                <Text style={styles.secondaryStatLabel}>Hit Points:</Text>
                <Text style={styles.secondaryStatValue}>{currentHp} / {hp}</Text>
              </View>
              <View style={styles.secondaryStatRow}>
                <Text style={styles.secondaryStatLabel}>Stamina:</Text>
                <Text style={styles.secondaryStatValue}>{currentStamina} / {stamina}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Right Column */}
        <View style={styles.column}>
          {/* Gold */}
          <View style={styles.goldContainer}>
            <Text style={styles.goldText}>Gold: {gold}</Text>
          </View>

          {/* Equipment */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Equipment</Text>
            
            {/* Current Weapon */}
            <View style={styles.equipmentSlot}>
              <Text style={styles.equipmentSlotTitle}>Weapon:</Text>
              {equipped.weapon ? (
                <View style={styles.equippedItem}>
                  <Text style={styles.equippedItemName}>{equipped.weapon.name}</Text>
                  <Text style={styles.equippedItemStats}>
                    Att: {equipped.weapon.attack}, Def: {equipped.weapon.defense}, Dam: {equipped.weapon.damage}
                  </Text>
                </View>
              ) : (
                <Text style={styles.noEquipment}>None equipped</Text>
              )}
            </View>

            {/* Current Armor */}
            <View style={styles.equipmentSlot}>
              <Text style={styles.equipmentSlotTitle}>Armor:</Text>
              {equipped.armor ? (
                <View style={styles.equippedItem}>
                  <Text style={styles.equippedItemName}>{equipped.armor.name}</Text>
                  <Text style={styles.equippedItemStats}>
                    DR: {equipped.armor.damageReduction}
                  </Text>
                </View>
              ) : (
                <Text style={styles.noEquipment}>None equipped</Text>
              )}
            </View>
          </View>

          {/* Available Weapons */}
          {weapons.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Available Weapons</Text>
              {weapons.map((w) => (
                <View key={w.id} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{w.name}</Text>
                    <Text style={styles.itemStats}>
                      Att: {w.attack}, Def: {w.defense}, Dam: {w.damage}
                    </Text>
                  </View>
                  {isWeaponEquipped(w) ? (
                    <Text style={styles.equippedLabel}>Equipped</Text>
                  ) : (
                    <TouchableOpacity
                      style={styles.equipBtn}
                      onPress={() => dispatch(equipWeapon(w))}
                    >
                      <Text style={styles.equipBtnText}>Equip</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Available Armors */}
          {armors.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Available Armor</Text>
              {armors.map((a) => (
                <View key={a.id} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{a.name}</Text>
                    <Text style={styles.itemStats}>
                      DR: {a.damageReduction}
                    </Text>
                  </View>
                  {isArmorEquipped(a) ? (
                    <Text style={styles.equippedLabel}>Equipped</Text>
                  ) : (
                    <TouchableOpacity
                      style={styles.equipBtn}
                      onPress={() => dispatch(equipArmor(a))}
                    >
                      <Text style={styles.equipBtnText}>Equip</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Active Quests */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Quests</Text>
            {activeQuests.length > 0 ? (
              activeQuests.map((q) => (
                <View key={q.id} style={styles.questItem}>
                  <Text style={styles.questTitle}>{q.title}</Text>
                  <Text style={styles.questDesc}>{q.description}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noQuestsText}>
                No active quests.
              </Text>
            )}
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.back()}
      >
        <Text style={styles.backBtnText}>Back to Map</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundBase,
  },
  header: {
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.steelGrey,
  },
  characterName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.ivoryWhite,
    marginBottom: spacing.xs,
  },
  unspentPoints: {
    fontSize: 16,
    color: colors.accentGold,
    fontWeight: '600',
  },
  columnsContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
    justifyContent: 'center',
  },
  column: {
    width: COLUMN_WIDTH,
    gap: spacing.lg,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.steelGrey,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.accentGold,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.steelGrey,
  },
  statLabel: {
    fontSize: 16,
    color: colors.ivoryWhite,
    fontWeight: '500',
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statValue: {
    fontSize: 18,
    color: colors.accentGold,
    fontWeight: 'bold',
    minWidth: 24,
    textAlign: 'center',
  },
  plusBtn: {
    backgroundColor: colors.accentGold,
    width: 28,
    height: 28,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusText: {
    color: colors.backgroundBase,
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryStatsContainer: {
    gap: spacing.xs,
  },
  secondaryStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  secondaryStatLabel: {
    fontSize: 14,
    color: colors.ivoryWhite,
    fontWeight: '500',
  },
  secondaryStatValue: {
    fontSize: 16,
    color: colors.accentGold,
    fontWeight: 'bold',
  },
  goldContainer: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.accentGold,
    alignItems: 'center',
  },
  goldText: {
    fontSize: 20,
    color: colors.accentGold,
    fontWeight: 'bold',
  },
  equipmentSlot: {
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.steelGrey,
  },
  equipmentSlotTitle: {
    fontSize: 16,
    color: colors.accentGold,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  equippedItem: {
    paddingLeft: spacing.sm,
  },
  equippedItemName: {
    fontSize: 16,
    color: colors.ivoryWhite,
    fontWeight: '600',
  },
  equippedItemStats: {
    fontSize: 14,
    color: colors.steelGrey,
    fontStyle: 'italic',
  },
  noEquipment: {
    fontSize: 14,
    color: colors.steelGrey,
    fontStyle: 'italic',
    paddingLeft: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.steelGrey,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: colors.ivoryWhite,
    fontWeight: '600',
  },
  itemStats: {
    fontSize: 14,
    color: colors.steelGrey,
    fontStyle: 'italic',
  },
  equipBtn: {
    backgroundColor: colors.accentGold,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 4,
  },
  equipBtnText: {
    color: colors.backgroundBase,
    fontWeight: '600',
    fontSize: 14,
  },
  equippedLabel: {
    color: colors.steelGrey,
    fontStyle: 'italic',
    fontSize: 14,
  },
  questItem: {
    marginBottom: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.backgroundBase,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.steelGrey,
  },
  questTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.accentGold,
    marginBottom: spacing.xs,
  },
  questDesc: {
    fontSize: 14,
    color: colors.ivoryWhite,
  },
  noQuestsText: {
    fontSize: 14,
    color: colors.steelGrey,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  backBtn: {
    margin: spacing.lg,
    backgroundColor: colors.accentGold,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.obsidianBlack,
  },
  backBtnText: {
    color: colors.backgroundBase,
    fontWeight: '600',
    fontSize: 18,
  },
});

// app/character-creation.tsx
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ScrollView,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { resetGameState } from '../store/slices/gameSlice';
import { initializeCharacter } from '../store/slices/playerSlice';
import type { Traits } from '../store/slices/playerSlice';
import { resetUI } from '../store/slices/uiSlice';
import { resetLocations } from '../store/slices/locationSlice';
import { resetMerchant } from '../store/slices/merchantSlice';
import { allWeapons, type WeaponType } from '../data/weapons';
import { allArmor } from '../data/armor';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTAINER_WIDTH = SCREEN_WIDTH * 0.9;
const COLUMN_WIDTH = CONTAINER_WIDTH * 0.4;

type StatKey = 'strength' | 'agility' | 'intelligence' | 'endurance';
type SkillKey = 'athletics' | 'persuade' | 'survival' | 'stealth' | 'medicine' | 'craft' | 'perception';

const STAT_LABELS: Record<StatKey, string> = {
  strength: 'Strength',
  agility: 'Agility',
  intelligence: 'Intelligence',
  endurance: 'Endurance',
};

const SKILL_LABELS: Record<SkillKey, string> = {
  athletics: 'Athletics',
  persuade: 'Persuade',
  survival: 'Survival',
  stealth: 'Stealth',
  medicine: 'Medicine',
  craft: 'Craft',
  perception: 'Perception',
};

// Available weapon types for character creation
const STARTING_WEAPON_TYPES: WeaponType[] = ['sword', 'axe', 'spear'];

const BASE_SKILL_VALUE = 0;
const MAX_SKILL_VALUE = 5;
const MIN_SKILL_VALUE = 0;

const MIN_STAT_VALUE = 1;
const MAX_STAT_VALUE = 5;
const BASE_STAT_VALUE = 2;

export default function CharacterCreation() {
  const [name, setLocalName] = useState('Conan');
  const [stats, setStats] = useState<Record<StatKey, number>>({
    strength: BASE_STAT_VALUE,
    agility: BASE_STAT_VALUE,
    intelligence: BASE_STAT_VALUE,
    endurance: BASE_STAT_VALUE,
  });

  const [skills, setSkills] = useState<Record<SkillKey, number>>({
    athletics: BASE_SKILL_VALUE,
    persuade: BASE_SKILL_VALUE,
    survival: 2,
    stealth: 2,
    medicine: BASE_SKILL_VALUE,
    craft: BASE_SKILL_VALUE,
    perception: BASE_SKILL_VALUE,
  });

  const [selectedWeapon, setSelectedWeapon] = useState<WeaponType | null>('sword');

  const dispatch = useDispatch();
  const router = useRouter();

  // Get poor quality weapon and armor based on character stats
  const currentWeapon = useMemo(() => {
    if (!selectedWeapon) return null;
    return allWeapons.find(weapon => 
      weapon.type === selectedWeapon && 
      weapon.strengthRequirement === stats.strength && 
      weapon.quality === 'poor'
    ) || allWeapons.find(weapon => 
      weapon.type === selectedWeapon && 
      weapon.strengthRequirement === stats.strength
    ) || null;
  }, [selectedWeapon, stats.strength]);

  const currentArmor = useMemo(() => {
    return allArmor.find(armor => 
      armor.strengthRequirement === stats.strength && 
      armor.quality === 'poor'
    ) || allArmor.find(armor => 
      armor.strengthRequirement === stats.strength
    ) || null;
  }, [stats.strength]);

  // Calculate secondary characteristics
  const secondaryStats = useMemo(() => {
    const weapon = currentWeapon;
    const armor = currentArmor;
    
    return {
      initiative: stats.agility + stats.intelligence,
      attack: stats.agility + stats.intelligence + (weapon?.attack || 0),
      defense: stats.agility + stats.intelligence + (weapon?.defense || 0),
      damage: stats.strength + (weapon?.damage || 0),
      damageReduction: armor?.damageReduction || 0,
      hitPoints: stats.endurance * 10,
      woundResistance: stats.endurance,
    };
  }, [stats, currentWeapon, currentArmor]);

  const pointsGainedFromLoweringStat = Object.values(stats).filter(v => v < BASE_STAT_VALUE).length;
  const pointsSpentOnIncreasingStat = Object.values(stats).reduce((sum, v) => sum + Math.max(0, v - BASE_STAT_VALUE), 0);
  const statPointsLeft = pointsGainedFromLoweringStat - pointsSpentOnIncreasingStat;
  const loweredStatsCount = Object.values(stats).filter(v => v === MIN_STAT_VALUE).length;

  const totalSkillPoints = useMemo(() => (stats.intelligence || BASE_STAT_VALUE) * 2, [stats.intelligence]);
  const spentSkillPoints = useMemo(() => {
    return (Object.values(skills) as number[]).reduce((sum, val) => sum + (val - BASE_SKILL_VALUE), 0);
  }, [skills]);
  const skillPointsLeft = useMemo(() => totalSkillPoints - spentSkillPoints, [totalSkillPoints, spentSkillPoints]);

  const adjustStat = (key: StatKey, delta: number) => {
    setStats((prev) => {
      const currentVal = prev[key];
      const newVal = currentVal + delta;

      if (newVal < MIN_STAT_VALUE || newVal > MAX_STAT_VALUE) return prev;

      if (delta > 0) {
        if (statPointsLeft <= 0) return prev;
      } else if (delta < 0) {
        if (currentVal === BASE_STAT_VALUE && loweredStatsCount >= 3 && newVal < BASE_STAT_VALUE) return prev;
      }
      return { ...prev, [key]: newVal };
    });
  };

  const adjustSkill = (key: SkillKey, delta: number) => {
    setSkills((prevSkills) => {
      const currentVal = prevSkills[key];
      const newVal = currentVal + delta;

      if (newVal < MIN_SKILL_VALUE || newVal > MAX_SKILL_VALUE) return prevSkills;

      if (delta > 0) {
        if (skillPointsLeft <= 0) return prevSkills;
      }
      return { ...prevSkills, [key]: newVal };
    });
  };

  const startGame = () => {
    const finalName = name.trim();
    if (!finalName) {
      Alert.alert('Name Required', 'Please enter a character name.');
      return;
    }

    if (statPointsLeft !== 0) {
      Alert.alert('Stat Points Issue', `Please ensure all stat points are allocated. Points left: ${statPointsLeft}`);
      return;
    }

    if (skillPointsLeft !== 0) {
      Alert.alert('Skill Points Issue', `Please ensure all skill points are allocated. Points left: ${skillPointsLeft}`);
      return;
    }

    if (!selectedWeapon) {
      Alert.alert('Weapon Required', 'Please select a starting weapon.');
      return;
    }

    dispatch(resetGameState());
    dispatch(resetUI());
    dispatch(resetLocations());
    dispatch(resetMerchant());

    const finalTraits: Partial<Traits> = {
      str: stats.strength,
      agility: stats.agility,
      endurance: stats.endurance,
      intelligence: stats.intelligence,
      athletics: skills.athletics,
      persuade: skills.persuade,
      survival: skills.survival,
      stealth: skills.stealth,
      medicine: skills.medicine,
      craft: skills.craft,
      perception: skills.perception,
    };

    dispatch(
      initializeCharacter({
        name: finalName,
        traits: finalTraits,
        startingWeapon: selectedWeapon,
      })
    );

    router.replace('/map');
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.outerContainer}>
        <Text style={styles.title}>Forge Your Legend</Text>

        <View style={styles.nameInputSection}>
          <Text style={styles.label}>Name:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Name..."
            placeholderTextColor={colors.steelGrey}
            value={name}
            onChangeText={setLocalName}
            maxLength={20}
            selectionColor={colors.accentGold}
          />
        </View>
        
        <View style={styles.columnsContainer}>
          <View style={styles.column}>
            <Text style={styles.columnTitle}>Attributes</Text>
            <Text style={styles.points}>Stat Points: {statPointsLeft}</Text>
            <Text style={styles.instructions}>
              Lower stats from {BASE_STAT_VALUE} to {MIN_STAT_VALUE} to gain points (max 3). Spend points to raise stats (max {MAX_STAT_VALUE}).
            </Text>
            {(Object.keys(stats) as StatKey[]).map((key) => (
              <View key={key} style={styles.itemRow}>
                <Text style={styles.itemLabel}>{STAT_LABELS[key]}</Text>
                <View style={styles.controls}>
                  <TouchableOpacity
                    style={[
                      styles.adjustButton,
                      (stats[key] <= MIN_STAT_VALUE || (stats[key] === BASE_STAT_VALUE && loweredStatsCount >= 3 && stats[key] -1 < BASE_STAT_VALUE) ) && styles.adjustDisabled,
                    ]}
                    onPress={() => adjustStat(key, -1)}
                    disabled={stats[key] <= MIN_STAT_VALUE || (stats[key] === BASE_STAT_VALUE && loweredStatsCount >= 3 && stats[key] -1 < BASE_STAT_VALUE)}
                  >
                    <Text style={styles.adjustText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.itemValue}>{stats[key]}</Text>
                  <TouchableOpacity
                    style={[
                      styles.adjustButton,
                      (stats[key] >= MAX_STAT_VALUE || statPointsLeft <= 0) && styles.adjustDisabled,
                    ]}
                    onPress={() => adjustStat(key, +1)}
                    disabled={stats[key] >= MAX_STAT_VALUE || statPointsLeft <= 0}
                  >
                    <Text style={styles.adjustText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* Secondary Characteristics */}
            <Text style={[styles.columnTitle, { marginTop: spacing.lg }]}>Secondary Characteristics</Text>
            <View style={styles.secondaryStatsContainer}>
              <View style={styles.secondaryStatRow}>
                <Text style={styles.secondaryStatLabel}>Initiative:</Text>
                <Text style={styles.secondaryStatValue}>{secondaryStats.initiative}</Text>
                <Text style={styles.secondaryStatFormula}>(Agi + Int)</Text>
              </View>
              <View style={styles.secondaryStatRow}>
                <Text style={styles.secondaryStatLabel}>Attack:</Text>
                <Text style={styles.secondaryStatValue}>{secondaryStats.attack}</Text>
                <Text style={styles.secondaryStatFormula}>(Agi + Int + Weapon)</Text>
              </View>
              <View style={styles.secondaryStatRow}>
                <Text style={styles.secondaryStatLabel}>Defense:</Text>
                <Text style={styles.secondaryStatValue}>{secondaryStats.defense}</Text>
                <Text style={styles.secondaryStatFormula}>(Agi + Int + Weapon)</Text>
              </View>
              <View style={styles.secondaryStatRow}>
                <Text style={styles.secondaryStatLabel}>Damage:</Text>
                <Text style={styles.secondaryStatValue}>{secondaryStats.damage}</Text>
                <Text style={styles.secondaryStatFormula}>(Str + Weapon)</Text>
              </View>
              <View style={styles.secondaryStatRow}>
                <Text style={styles.secondaryStatLabel}>DR:</Text>
                <Text style={styles.secondaryStatValue}>{secondaryStats.damageReduction}</Text>
                <Text style={styles.secondaryStatFormula}>(Armor)</Text>
              </View>
              <View style={styles.secondaryStatRow}>
                <Text style={styles.secondaryStatLabel}>HP:</Text>
                <Text style={styles.secondaryStatValue}>{secondaryStats.hitPoints}</Text>
                <Text style={styles.secondaryStatFormula}>(End × 10)</Text>
              </View>
              <View style={styles.secondaryStatRow}>
                <Text style={styles.secondaryStatLabel}>Wound Resist:</Text>
                <Text style={styles.secondaryStatValue}>{secondaryStats.woundResistance}</Text>
                <Text style={styles.secondaryStatFormula}>(End)</Text>
              </View>
            </View>
          </View>

          <View style={styles.column}>
            <Text style={styles.columnTitle}>Skills</Text>
            <Text style={styles.points}>Skill Points: {skillPointsLeft} (from Intelligence: {stats.intelligence} * 2 = {totalSkillPoints})</Text>
            <Text style={styles.instructions}>
              Allocate points into skills (Min: {MIN_SKILL_VALUE}, Max: {MAX_SKILL_VALUE}).
            </Text>
            {(Object.keys(skills) as SkillKey[]).map((key) => (
              <View key={key} style={styles.itemRow}>
                <Text style={styles.itemLabel}>{SKILL_LABELS[key]}</Text>
                <View style={styles.controls}>
                  <TouchableOpacity
                    style={[
                      styles.adjustButton,
                      skills[key] <= MIN_SKILL_VALUE && styles.adjustDisabled,
                    ]}
                    onPress={() => adjustSkill(key, -1)}
                    disabled={skills[key] <= MIN_SKILL_VALUE}
                  >
                    <Text style={styles.adjustText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.itemValue}>{skills[key]}</Text>
                  <TouchableOpacity
                    style={[
                      styles.adjustButton,
                      (skills[key] >= MAX_SKILL_VALUE || skillPointsLeft <= 0) && styles.adjustDisabled,
                    ]}
                    onPress={() => adjustSkill(key, +1)}
                    disabled={skills[key] >= MAX_SKILL_VALUE || skillPointsLeft <= 0}
                  >
                    <Text style={styles.adjustText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <Text style={[styles.columnTitle, { marginTop: spacing.lg }]}>Starting Weapon</Text>
            <View style={styles.weaponSelectionContainer}>
              {STARTING_WEAPON_TYPES.map((weaponType) => (
                <TouchableOpacity
                  key={weaponType}
                  style={[
                    styles.weaponButton,
                    selectedWeapon === weaponType && styles.weaponButtonSelected,
                  ]}
                  onPress={() => setSelectedWeapon(weaponType)}
                >
                  <Text style={[
                    styles.weaponButtonText,
                    selectedWeapon === weaponType && styles.weaponButtonTextSelected
                  ]}>
                    {weaponType.charAt(0).toUpperCase() + weaponType.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Current Equipment Display */}
            <View style={styles.equipmentContainer}>
              <Text style={styles.equipmentTitle}>Current Equipment</Text>
              {currentWeapon && (
                <View style={styles.equipmentItem}>
                  <Text style={styles.equipmentName}>Weapon: {currentWeapon.name}</Text>
                  <Text style={styles.equipmentStats}>
                    Att: {currentWeapon.attack}, Def: {currentWeapon.defense}, Dam: {currentWeapon.damage}
                  </Text>
                </View>
              )}
              {currentArmor && (
                <View style={styles.equipmentItem}>
                  <Text style={styles.equipmentName}>Armor: {currentArmor.name}</Text>
                  <Text style={styles.equipmentStats}>
                    DR: {currentArmor.damageReduction}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.startButton} onPress={startGame}>
          <Text style={styles.startButtonText}>Begin Your Journey</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.obsidianBlack,
  },
  outerContainer: {
    width: CONTAINER_WIDTH,
    maxWidth: 900,
    alignSelf: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.accentGold,
    shadowColor: colors.obsidianBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'serif',
    color: colors.accentGold,
    textAlign: 'center',
    marginBottom: spacing.md,
    textShadowColor: colors.obsidianBlack,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  nameInputSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  label: {
    fontSize: 18,
    color: colors.ivoryWhite,
    width: 100,
    textAlign: 'right',
    fontWeight: '500',
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: colors.steelGrey,
    backgroundColor: colors.backgroundBase,
    color: colors.ivoryWhite,
    paddingHorizontal: spacing.md,
    borderRadius: 6,
    fontSize: 16,
  },
  columnsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  column: {
    width: COLUMN_WIDTH,
    gap: spacing.sm,
  },
  columnTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.accentGold,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  points: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.accentGold,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  instructions: {
    fontSize: 13,
    color: colors.steelGrey,
    textAlign: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
    fontStyle: 'italic',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.steelGrey,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.ivoryWhite,
    flexShrink: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  adjustButton: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: colors.accentGold,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.obsidianBlack,
  },
  adjustDisabled: {
    backgroundColor: colors.steelGrey,
    opacity: 0.6,
  },
  adjustText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.obsidianBlack,
    lineHeight: 24,
  },
  itemValue: {
    width: 30,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.ivoryWhite,
  },
  secondaryStatsContainer: {
    backgroundColor: colors.backgroundBase,
    borderRadius: 8,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.steelGrey,
  },
  secondaryStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  secondaryStatLabel: {
    fontSize: 14,
    color: colors.ivoryWhite,
    fontWeight: '500',
    flex: 1,
  },
  secondaryStatValue: {
    fontSize: 16,
    color: colors.accentGold,
    fontWeight: 'bold',
    width: 30,
    textAlign: 'center',
  },
  secondaryStatFormula: {
    fontSize: 12,
    color: colors.steelGrey,
    fontStyle: 'italic',
    flex: 1,
    textAlign: 'right',
  },
  weaponSelectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.sm,
  },
  weaponButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.steelGrey,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.obsidianBlack,
  },
  weaponButtonSelected: {
    backgroundColor: colors.accentGold,
    borderColor: colors.ivoryWhite,
  },
  weaponButtonText: {
    color: colors.ivoryWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
  weaponButtonTextSelected: {
    color: colors.obsidianBlack,
  },
  equipmentContainer: {
    backgroundColor: colors.backgroundBase,
    borderRadius: 8,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.steelGrey,
    marginTop: spacing.md,
  },
  equipmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.accentGold,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  equipmentItem: {
    marginBottom: spacing.sm,
  },
  equipmentName: {
    fontSize: 14,
    color: colors.ivoryWhite,
    fontWeight: '600',
  },
  equipmentStats: {
    fontSize: 12,
    color: colors.steelGrey,
    fontStyle: 'italic',
  },
  startButton: {
    marginTop: spacing.xl,
    backgroundColor: colors.accentGold,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.obsidianBlack,
    shadowColor: colors.obsidianBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  startButtonText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.obsidianBlack,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
});

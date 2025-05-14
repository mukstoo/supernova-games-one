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
import { initializeCharacter, resetPlayer } from '../store/slices/playerSlice';
import type { Traits } from '../store/slices/playerSlice';
import { resetUI } from '../store/slices/uiSlice';
import { resetLocations } from '../store/slices/locationSlice';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTAINER_WIDTH = SCREEN_WIDTH * 0.9;
const COLUMN_WIDTH = CONTAINER_WIDTH * 0.4;

type StatKey = 'strength' | 'agility' | 'intelligence' | 'endurance';
type SkillKey = 'athletics' | 'persuade' | 'survival' | 'stealth' | 'medicine' | 'craft' | 'perception';
type StartingWeapon = 'sword' | 'axe' | 'spear';

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

const STARTING_WEAPONS: StartingWeapon[] = ['sword', 'axe', 'spear'];

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

  const [selectedWeapon, setSelectedWeapon] = useState<StartingWeapon | null>('sword');

  const dispatch = useDispatch();
  const router = useRouter();

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
    dispatch(resetPlayer());
    dispatch(resetUI());
    dispatch(resetLocations());

    const finalTraits: Partial<Traits> = {
      str: stats.strength,
      spd: stats.agility,
      stm: stats.endurance,
      smr: stats.intelligence,
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
              {STARTING_WEAPONS.map((weapon) => (
                <TouchableOpacity
                  key={weapon}
                  style={[
                    styles.weaponButton,
                    selectedWeapon === weapon && styles.weaponButtonSelected,
                  ]}
                  onPress={() => setSelectedWeapon(weapon)}
                >
                  <Text style={[
                    styles.weaponButtonText,
                    selectedWeapon === weapon && styles.weaponButtonTextSelected
                  ]}>
                    {weapon.charAt(0).toUpperCase() + weapon.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
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

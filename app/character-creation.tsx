// app/character-creation.tsx
import React, { useState } from 'react';
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
import { resetUI } from '../store/slices/uiSlice';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTAINER_WIDTH = SCREEN_WIDTH * 0.8;

type StatKey = 'strength' | 'agility' | 'intelligence' | 'endurance';

const STAT_LABELS: Record<StatKey, string> = {
  strength: 'Strength',
  agility: 'Agility',
  intelligence: 'Intelligence',
  endurance: 'Endurance',
};

export default function CharacterCreation() {
  const [name, setLocalName] = useState('Conan');
  const [stats, setStats] = useState<Record<StatKey, number>>({
    strength: 2,
    agility: 2,
    intelligence: 2,
    endurance: 2,
  });

  const dispatch = useDispatch();
  const router = useRouter();

  const pointsGainedFromLowering = Object.values(stats).filter(v => v === 1).length;
  const pointsSpentOnIncreasing = Object.values(stats).reduce((sum, v) => sum + Math.max(0, v - 2), 0);
  const pointsLeft = pointsGainedFromLowering - pointsSpentOnIncreasing;
  const loweredStatsCount = pointsGainedFromLowering;

  const adjustStat = (key: StatKey, delta: number) => {
    setStats((prev) => {
      const currentVal = prev[key];
      const newVal = currentVal + delta;

      if (newVal < 1 || newVal > 5) return prev;

      if (delta > 0) {
        if (pointsLeft <= 0 || newVal > 5) return prev;
      }
      else if (delta < 0) {
        if (newVal < 1) return prev;
        if (currentVal === 2 && loweredStatsCount >= 3) return prev;
      }

      return { ...prev, [key]: newVal };
    });
  };

  const startGame = () => {
    const finalName = name.trim();
    if (!finalName) {
      Alert.alert('Name required', 'Please enter a character name.');
      return;
    }

    if (pointsLeft !== 0) {
        Alert.alert('Stat points issue', `Please ensure all points are allocated correctly. Points left: ${pointsLeft}`);
        return;
    }

    dispatch(resetGameState());
    dispatch(resetPlayer());
    dispatch(resetUI());

    dispatch(
      initializeCharacter({
        name: finalName,
        traits: {
          str: stats.strength,
          spd: stats.agility,
          stm: stats.endurance,
          smr: stats.intelligence,
          reputation: 2,
          gatherInformation: 2,
          travel: 2,
          heal: 2,
          craft: 2,
          perception: 2,
          stealth: 2,
          athletics: 2,
        },
      })
    );

    router.replace('/map');
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        <Text style={styles.title}>Forge Your Legend</Text>

        <View style={styles.inputRow}>
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

        <Text style={styles.points}>Points Available: {pointsLeft}</Text>
        <Text style={styles.instructions}>
          Decrease a stat from 2 to 1 to gain a point (max 3).
          Use points to increase other stats (max 5).
        </Text>

        {(Object.keys(stats) as StatKey[]).map((key) => (
          <View key={key} style={styles.statRow}>
            <Text style={styles.statLabel}>{STAT_LABELS[key]}</Text>
            <View style={styles.controls}>
              <TouchableOpacity
                style={[
                  styles.adjustButton,
                  (stats[key] <= 1 || (stats[key] === 2 && loweredStatsCount >= 3)) && styles.adjustDisabled,
                ]}
                onPress={() => adjustStat(key, -1)}
                disabled={stats[key] <= 1 || (stats[key] === 2 && loweredStatsCount >= 3)}
              >
                <Text style={styles.adjustText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.statValue}>{stats[key]}</Text>
              <TouchableOpacity
                style={[
                  styles.adjustButton,
                  (stats[key] >= 5 || pointsLeft <= 0) && styles.adjustDisabled,
                ]}
                onPress={() => adjustStat(key, +1)}
                disabled={stats[key] >= 5 || pointsLeft <= 0}
              >
                <Text style={styles.adjustText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

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
  container: {
    width: CONTAINER_WIDTH,
    maxWidth: 500,
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
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
  points: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.accentGold,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 14,
    color: colors.steelGrey,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
    fontStyle: 'italic',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.steelGrey,
  },
  statLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.ivoryWhite,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  adjustButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.accentGold,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.obsidianBlack,
  },
  adjustDisabled: {
    backgroundColor: colors.steelGrey,
    borderColor: colors.obsidianBlack,
    opacity: 0.6,
  },
  adjustText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.obsidianBlack,
    lineHeight: 26,
  },
  statValue: {
    width: 40,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.ivoryWhite,
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

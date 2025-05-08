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
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTAINER_WIDTH = SCREEN_WIDTH * 0.9;

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

  // extra 4 points beyond base 8
  const pointsSpent =
    Object.values(stats).reduce((sum, v) => sum + v, 0) - 8;
  const pointsLeft = 4 - pointsSpent;

  const adjustStat = (key: StatKey, delta: number) => {
    setStats((prev) => {
      const newVal = prev[key] + delta;
      if (newVal < 1 || newVal > 5) return prev;
      if (delta > 0 && pointsLeft <= 0) return prev;
      return { ...prev, [key]: newVal };
    });
  };

  const startGame = () => {
    const finalName = name.trim();
    if (!finalName) {
      Alert.alert('Name required', 'Please enter a character name.');
      return;
    }

    // Fully reset both game & player slices
    dispatch(resetGameState());
    dispatch(resetPlayer());

    // Initialize with inventory, equipped, and computed stats
    dispatch(
      initializeCharacter({
        name: finalName,
        traits: {
          str: stats.strength,
          spd: stats.agility,
          stm: stats.endurance,
          smr: stats.intelligence,
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
        <Text style={styles.title}>Create Your Hero</Text>

        <View style={styles.inputRow}>
          <Text style={styles.label}>Name:</Text>
          <TextInput
            style={styles.input}
            placeholder="Hero name"
            placeholderTextColor={colors.fadedBeige}
            value={name}
            onChangeText={setLocalName}
            maxLength={20}
          />
        </View>

        <Text style={styles.points}>Points left: {pointsLeft}</Text>

        {(Object.keys(stats) as StatKey[]).map((key) => (
          <View key={key} style={styles.statRow}>
            <Text style={styles.statLabel}>{STAT_LABELS[key]}</Text>
            <View style={styles.controls}>
              <TouchableOpacity
                style={[
                  styles.adjustButton,
                  stats[key] <= 1 && styles.adjustDisabled,
                ]}
                onPress={() => adjustStat(key, -1)}
                disabled={stats[key] <= 1}
              >
                <Text style={styles.adjustText}>–</Text>
              </TouchableOpacity>
              <Text style={styles.statValue}>{stats[key]}</Text>
              <TouchableOpacity
                style={[
                  styles.adjustButton,
                  (stats[key] >= 5 || pointsLeft <= 0) &&
                    styles.adjustDisabled,
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
          <Text style={styles.startButtonText}>Start Adventure</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    backgroundColor: colors.backgroundBase,
  },
  container: {
    width: CONTAINER_WIDTH,
    alignSelf: 'center',
    gap: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.ivoryWhite,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    fontSize: 18,
    color: colors.ivoryWhite,
    width: 80,
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: colors.steelGrey,
    backgroundColor: colors.surface,
    color: colors.ivoryWhite,
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
  },
  points: {
    fontSize: 16,
    color: colors.accentGold,
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statLabel: {
    fontSize: 18,
    color: colors.ivoryWhite,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  adjustButton: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: colors.accentGold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adjustDisabled: {
    backgroundColor: colors.steelGrey,
  },
  adjustText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.obsidianBlack,
  },
  statValue: {
    width: 32,
    textAlign: 'center',
    fontSize: 18,
    color: colors.ivoryWhite,
  },
  startButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.accentGold,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.obsidianBlack,
  },
});

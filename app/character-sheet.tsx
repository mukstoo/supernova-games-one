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
  allocatePoint,
} from '../store/slices/playerSlice';
import type { Weapon, Armor } from '../utils/items';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { useRouter } from 'expo-router';
import { allQuests } from '../utils/quests';
import type { Quest } from '../utils/questTypes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
    inventory,
    equipped,
    attributePoints,
    gold,
    xp,
    quests,
  } = useSelector((s: RootState) => s.player);

  const weapons = inventory.filter(
    (i): i is Weapon => 'damage' in i
  );
  const armors = inventory.filter(
    (i): i is Armor => 'damageReduction' in i
  );

  const activeQuests = allQuests.filter((q) =>
    quests.active.includes(q.id)
  );

  const onAllocate = (key: keyof typeof traits) => {
    dispatch(allocatePoint(key));
  };

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <Text style={styles.header}>{name}'s Sheet</Text>
      <Text style={styles.points}>
        Unspent Points: {attributePoints}
      </Text>
      <View style={styles.goldXpContainer}>
        <Text style={styles.goldXpText}>Gold: {gold}</Text>
        <Text style={styles.goldXpText}>XP: {xp}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Primary Traits</Text>
        {(['str', 'spd', 'smr', 'stm'] as (keyof typeof traits)[]).map(
          (key) => (
            <View key={key} style={styles.statRow}>
              <Text style={styles.statLabel}>
                {key === 'str'
                  ? 'Strength'
                  : key === 'spd'
                  ? 'Agility'
                  : key === 'smr'
                  ? 'Intelligence'
                  : 'Endurance'}
                : {traits[key]}
              </Text>
              {attributePoints > 0 && (
                <TouchableOpacity
                  style={styles.plusBtn}
                  onPress={() => onAllocate(key)}
                >
                  <Text style={styles.plusText}>+</Text>
                </TouchableOpacity>
              )}
            </View>
          )
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Secondary Stats</Text>
        <Text style={styles.stat}>
          Initiative: {initiative}
        </Text>
        <Text style={styles.stat}>
          Attack: {attack}
        </Text>
        <Text style={styles.stat}>
          Defense: {defense}
        </Text>
        <Text style={styles.stat}>
          Damage: {damage}
        </Text>
        <Text style={styles.stat}>
          Damage Reduction: {damageReduction}
        </Text>
        <Text style={styles.stat}>
          HP: {currentHp} / {hp}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weapons</Text>
        {weapons.map((w) => (
          <View key={w.id} style={styles.itemRow}>
            <Text style={styles.itemText}>
              {w.name} (DMG {w.damage})
            </Text>
            {equipped.weapon?.id === w.id ? (
              <Text style={styles.equipped}>Equipped</Text>
            ) : (
              <TouchableOpacity
                style={styles.equipBtn}
                onPress={() => dispatch(equipWeapon(w))}
              >
                <Text style={styles.equipText}>Equip</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Armors</Text>
        {armors.map((a) => (
          <View key={a.id} style={styles.itemRow}>
            <Text style={styles.itemText}>
              {a.name} (DR {a.damageReduction})
            </Text>
            {equipped.armor?.id === a.id ? (
              <Text style={styles.equipped}>Equipped</Text>
            ) : (
              <TouchableOpacity
                style={styles.equipBtn}
                onPress={() => dispatch(equipArmor(a))}
              >
                <Text style={styles.equipText}>Equip</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

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

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.back()}
      >
        <Text style={styles.backText}>Back to Map</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    padding: spacing.lg,
    backgroundColor: colors.backgroundBase,
    alignItems: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.ivoryWhite,
    marginBottom: spacing.sm,
  },
  points: {
    fontSize: 16,
    color: colors.accentGold,
    marginBottom: spacing.lg,
  },
  goldXpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: SCREEN_WIDTH * 0.9,
    marginBottom: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 6,
  },
  goldXpText: {
    fontSize: 16,
    color: colors.ivoryWhite,
    fontWeight: '600',
  },
  section: {
    width: SCREEN_WIDTH * 0.9,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.accentGold,
    marginBottom: spacing.sm,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 16,
    color: colors.ivoryWhite,
  },
  plusBtn: {
    backgroundColor: colors.accentGold,
    padding: spacing.xs,
    borderRadius: 4,
  },
  plusText: {
    color: colors.backgroundBase,
    fontWeight: '600',
    fontSize: 16,
  },
  stat: {
    fontSize: 16,
    color: colors.ivoryWhite,
    marginBottom: spacing.xs,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  itemText: {
    color: colors.ivoryWhite,
    flex: 1,
  },
  equipBtn: {
    backgroundColor: colors.accentGold,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 4,
  },
  equipText: {
    color: colors.backgroundBase,
    fontWeight: '600',
  },
  equipped: {
    color: colors.steelGrey,
    fontStyle: 'italic',
  },
  backBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 6,
  },
  backText: {
    color: colors.ivoryWhite,
    fontWeight: '600',
  },
  questItem: {
    marginBottom: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 4,
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
  },
});

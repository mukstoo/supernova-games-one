// app/battle.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { enemies } from '../utils/enemies';
import { rollFudgeDice } from '../utils/dice';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { incrementAttributePoints } from '../store/slices/playerSlice';

export default function BattleScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const player = useSelector((s: RootState) => s.player);

  const [enemy, setEnemy] = useState(enemies[0]);
  const [playerHp, setPlayerHp] = useState(player.currentHp);
  const [enemyHp, setEnemyHp] = useState(enemy.currentHp);
  const [log, setLog] = useState<string[]>([]);
  const [turn, setTurn] = useState<'player' | 'enemy'>('player');
  const [battleOver, setBattleOver] = useState(false);
  const [winner, setWinner] = useState<'player' | 'enemy' | null>(null);

  useEffect(() => {
    const e = enemies[Math.floor(Math.random() * enemies.length)];
    setEnemy(e);
    setEnemyHp(e.currentHp);

    const initRoll = rollFudgeDice(4);
    const pInit = initRoll + player.initiative;
    const eInit = e.initiative;
    const first = pInit >= eInit ? 'player' : 'enemy';
    addLog(
      `Initiative: you roll ${initRoll} + ${player.initiative} = ${pInit} vs enemy ${eInit} → ${first} goes first.`
    );
    setTurn(first);
  }, []);

  const addLog = (entry: string) => {
    setLog((l) => [entry, ...l]);
  };

  const doPlayerAttack = () => {
    const roll = rollFudgeDice(4);
    const atkRoll = roll + player.attack;
    const diff = atkRoll - enemy.defense;
    if (diff >= 0) {
      const raw = player.damage + diff;
      const dmg = Math.max(0, raw - enemy.damageReduction);
      setEnemyHp((h) => {
        const nh = h - dmg;
        addLog(
          `You roll ${roll}+atk ${player.attack} = ${atkRoll} vs def ${enemy.defense} → bonus ${diff}. Damage ${player.damage}+${diff}=${raw} - DR ${enemy.damageReduction} = ${dmg}. Enemy HP ${h}→${nh}.`
        );
        return nh;
      });
    } else {
      addLog(
        `You roll ${roll}+atk ${player.attack} = ${atkRoll} vs def ${enemy.defense} → miss.`
      );
    }
    setTurn('enemy');
  };

  const doEnemyAttack = () => {
    const roll = rollFudgeDice(4);
    const defRoll = roll + player.defense;
    const diff = enemy.attack - defRoll;
    if (diff >= 0) {
      const raw = enemy.damage + diff;
      const dmg = Math.max(0, raw - player.damageReduction);
      setPlayerHp((h) => {
        const nh = h - dmg;
        addLog(
          `Enemy attacks ${enemy.attack} vs your roll ${roll}+def ${player.defense} = ${defRoll} → bonus ${diff}. Damage ${enemy.damage}+${diff}=${raw} - DR ${player.damageReduction} = ${dmg}. Your HP ${h}→${nh}.`
        );
        return nh;
      });
    } else {
      addLog(
        `Enemy attacks ${enemy.attack} vs your roll ${roll}+def ${player.defense} = ${defRoll} → miss.`
      );
    }
    setTurn('player');
  };

  useEffect(() => {
    if (enemyHp <= 0 && !battleOver) {
      addLog('Enemy defeated!');
      setWinner('player');
      setBattleOver(true);
      dispatch(incrementAttributePoints(1));
    }
    if (playerHp <= 0 && !battleOver) {
      addLog('You have been defeated...');
      setWinner('enemy');
      setBattleOver(true);
    }
  }, [enemyHp, playerHp]);

  const onAttack = () => {
    if (turn === 'player' && !battleOver) doPlayerAttack();
  };
  const onDefend = () => {
    if (turn === 'enemy' && !battleOver) doEnemyAttack();
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.root}>
        <Text style={styles.header}>Battle!</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBlock}>
            <Text style={styles.statHeader}>You</Text>
            <Text>HP: {playerHp} / {player.hp}</Text>
            <Text>Init: {player.initiative}</Text>
            <Text>Atk: {player.attack}</Text>
            <Text>Def: {player.defense}</Text>
            <Text>Dmg: {player.damage}</Text>
            <Text>DR: {player.damageReduction}</Text>
          </View>
          <View style={styles.statBlock}>
            <Text style={styles.statHeader}>{enemy.name}</Text>
            <Text>HP: {enemyHp} / {enemy.hp}</Text>
            <Text>Init: {enemy.initiative}</Text>
            <Text>Atk: {enemy.attack}</Text>
            <Text>Def: {enemy.defense}</Text>
            <Text>Dmg: {enemy.damage}</Text>
            <Text>DR: {enemy.damageReduction}</Text>
          </View>
        </View>

        {!battleOver && (
          <View style={styles.actionsRow}>
            {turn === 'player' ? (
              <TouchableOpacity style={styles.btn} onPress={onAttack}>
                <Text style={styles.btnText}>Attack</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.btn} onPress={onDefend}>
                <Text style={styles.btnText}>Defend</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <Text style={styles.logHeader}>Battle Log</Text>
        {log.map((l, i) => (
          <Text key={i} style={styles.logText}>{l}</Text>
        ))}
      </ScrollView>

      <Modal transparent visible={battleOver} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>
              {winner === 'player' ? 'Victory!' : 'Defeat'}
            </Text>
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => {
                if (winner === 'player') router.push('/map');
                else router.push('/main-menu');
              }}
            >
              <Text style={styles.modalBtnText}>
                {winner === 'player' ? 'Back to Map' : 'Main Menu'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    padding: spacing.lg,
    backgroundColor: colors.backgroundBase,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.ivoryWhite,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  statBlock: {
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 6,
  },
  statHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.accentGold,
    marginBottom: spacing.xs,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  btn: {
    backgroundColor: colors.accentGold,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 6,
  },
  btnText: {
    color: colors.backgroundBase,
    fontWeight: '600',
    fontSize: 16,
  },
  logHeader: {
    marginTop: spacing.lg,
    fontSize: 20,
    fontWeight: '600',
    color: colors.ivoryWhite,
  },
  logText: {
    color: colors.ivoryWhite,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalHeader: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.ivoryWhite,
    marginBottom: spacing.md,
  },
  modalBtn: {
    backgroundColor: colors.accentGold,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 6,
  },
  modalBtnText: {
    color: colors.backgroundBase,
    fontWeight: '600',
    fontSize: 16,
  },
});

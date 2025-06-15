// app/battle.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  ScrollView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import DiceRoller, { TraitContribution } from '../components/DiceRoller';
import { RootState } from '../store';
import { getRandomEnemy } from '../data/enemies';
import { colors } from '../theme/colors';
import { incrementAttributePoints, takeDamage } from '../store/slices/playerSlice';

const STANCES = ['Powerful', 'Precise', 'Normal', 'Defensive'];
const ACTIONS = ['Light Attack', 'Heavy Attack'];

export default function BattleScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const player = useSelector((s: RootState) => s.player);

  const [enemy, setEnemy] = useState(getRandomEnemy());
  const [enemyHp, setEnemyHp] = useState(enemy.currentHp);
  const [log, setLog] = useState<string[]>([]);
  const [turn, setTurn] = useState<'player' | 'enemy'>('player');
  const [battleOver, setBattleOver] = useState(false);
  const [winner, setWinner] = useState<'player' | 'enemy' | null>(null);
  const [stance, setStance] = useState<'Normal' | 'Precise' | 'Powerful' | 'Defensive'>('Normal');

  const [rolling, setRolling] = useState(false);
  const [rollContext, setRollContext] = useState<string>();

  // stance modifiers
  const stanceMods = {
    Normal: { atk: 0, def: 0, dmg: 0 },
    Precise: { atk: 1, def: -1, dmg: 0 },
    Powerful: { atk: 0, def: -1, dmg: 2 },
    Defensive: { atk: -1, def: 1, dmg: 0 },
  };

  useEffect(() => {
    // pick enemy then roll initiative
    const e = getRandomEnemy();
    setEnemy(e);
    setEnemyHp(e.currentHp);
    setRollContext('Initiative');
    setRolling(true);
  }, []);

  const addLog = (entry: string) =>
    setLog(l => [entry, ...l]);

  const formatSigned = (n: number) => (n >= 0 ? `+${n}` : `${n}`);

  // Get trait contributions for different roll contexts
  const getTraitContributions = (): TraitContribution[] => {
    if (rollContext === 'Initiative') {
      return [
        { name: 'Agility', value: player.traits.agility },
        { name: 'Intelligence', value: player.traits.intelligence }
      ];
    } else if (rollContext === 'Defense') {
      const stanceMod = stanceMods[stance].def;
      const contributions: TraitContribution[] = [
        { name: 'Agility', value: player.traits.agility },
        { name: 'Intelligence', value: player.traits.intelligence }
      ];
      if (player.equipped.weapon?.defense) {
        contributions.push({ name: 'Weapon Def', value: player.equipped.weapon.defense });
      }
      if (stanceMod !== 0) {
        contributions.push({ name: 'Stance', value: stanceMod });
      }
      return contributions;
    } else {
      // Attack rolls
      const stanceMod = stanceMods[stance].atk;
      const actionMod = rollContext === 'Light Attack' ? 1 : -1;
      const contributions: TraitContribution[] = [
        { name: 'Agility', value: player.traits.agility },
        { name: 'Intelligence', value: player.traits.intelligence }
      ];
      if (player.equipped.weapon?.attack) {
        contributions.push({ name: 'Weapon Atk', value: player.equipped.weapon.attack });
      }
      if (stanceMod !== 0) {
        contributions.push({ name: 'Stance', value: stanceMod });
      }
      if (actionMod !== 0) {
        contributions.push({ name: 'Action', value: actionMod });
      }
      return contributions;
    }
  };

  const handleRollComplete = (total: number, diceResult: number, faces: string[]) => {
    if (rollContext === 'Initiative') {
      // Battle system: Initiative determines turn order
      const playerInit = total;
      const enemyInit = enemy.initiative;
      addLog('Initiative:');
      addLog(` Player ${playerInit} vs Enemy ${enemyInit}`);
      
      // Extremely high dice rolls can provide combat bonuses
      if (diceResult >= 3) {
        addLog(' → Exceptional initiative! +1 attack next turn');
        // Could store this bonus for next attack
      }
      
      setTurn(playerInit >= enemyInit ? 'player' : 'enemy');
    } else if (rollContext === 'Defense') {
      // Battle system: Defense roll vs enemy attack
      const defTotal = total;
      const atk = enemy.attack;
      const diff = atk - defTotal;
      addLog('Defense:');
      addLog(` Defense ${defTotal} vs Enemy Attack ${atk}`);
      
      if (diff >= 0) {
        const raw = enemy.damage + diff;
        const dmg = Math.max(0, raw - player.damageReduction);
        dispatch(takeDamage(dmg));
        addLog(` → Hit for ${dmg} damage`);
        
        // Critical failure on very low dice rolls
        if (diceResult <= -3) {
          addLog(' → Critical defense failure! Stunned next turn');
          // Could apply stun effect
        }
      } else {
        addLog(` → Miss`);
        
        // Perfect defense on high dice rolls
        if (diceResult >= 3) {
          addLog(' → Perfect defense! Counter-attack opportunity');
          // Could enable immediate counter-attack
        }
      }
      setTurn('player');
    } else {
      // Battle system: Attack rolls
      const action = rollContext!;
      const atkTotal = total;
      const diff = atkTotal - enemy.defense;
      addLog(`${action}:`);
      addLog(` Attack ${atkTotal} vs Enemy Defense ${enemy.defense}`);
      
      if (diff >= 0) {
        const mods = stanceMods[stance];
        const actionMods = action === 'Light Attack' ? { dmg: -2 } : { dmg: 2 };
        let raw = player.damage + mods.dmg + actionMods.dmg + diff;
        
        // Critical hit on high dice rolls - different from quest system!
        if (diceResult >= 3) {
          raw += 5; // Extra damage for critical hit
          addLog(' → Critical hit! +5 damage');
        }
        
        const dmg = Math.max(0, raw - enemy.damageReduction);
        setEnemyHp(h => h - dmg);
        addLog(` → Hit for ${dmg} damage`);
      } else {
        addLog(` → Miss`);
        
        // Critical miss on very low dice rolls
        if (diceResult <= -3) {
          addLog(' → Critical miss! Lost balance, -1 defense next turn');
          // Could apply debuff
        }
      }
      setTurn('enemy');
    }

    setRolling(false);
    setRollContext(undefined);
  };

  // trigger defense roll on enemy turn
  useEffect(() => {
    if (!battleOver && turn === 'enemy' && !rolling) {
      setRollContext('Defense');
      setRolling(true);
    }
  }, [turn]);

  // check for end
  useEffect(() => {
    if (!battleOver) {
      if (enemyHp <= 0) {
        addLog('Enemy defeated!');
        setWinner('player');
        setBattleOver(true);
        dispatch(incrementAttributePoints(1));
      } else if (player.currentHp <= 0) {
        addLog('You have been defeated...');
        setWinner('enemy');
        setBattleOver(true);
      }
    }
  }, [enemyHp, player.currentHp]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Main Row */}
      <View style={styles.mainRow}>
        <View style={styles.charCol}>
          <View style={styles.imagePlaceholder}>
            <Text style={styles.nameLabel}>You</Text>
          </View>
          <View style={styles.hpBarBackground}>
            <Animated.View
              style={[
                styles.hpBarFill,
                {
                  width: `${(player.currentHp / player.hp) * 100}%`,
                  backgroundColor: `rgb(${Math.round((1 - player.currentHp / player.hp) * 255)},${Math.round((player.currentHp / player.hp) * 255)},0)`,
                },
              ]}
            />
            <Text style={styles.hpLabel}>HP {player.currentHp}/{player.hp}</Text>
          </View>
        </View>
        <View style={styles.logCol}>
          <ScrollView 
            style={styles.logScrollView}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.logContent}
          >
            {log.map((l, i) => (
              <Text key={i} style={styles.logText}>{l}</Text>
            ))}
          </ScrollView>
        </View>
        <View style={styles.charCol}>
          <View style={styles.imagePlaceholder}>
            <Text style={styles.nameLabel}>{enemy.name}</Text>
          </View>
          <View style={styles.hpBarBackground}>
            <Animated.View
              style={[
                styles.hpBarFill,
                {
                  width: `${(enemyHp / enemy.hp) * 100}%`,
                  backgroundColor: `rgb(${Math.round((1 - enemyHp / enemy.hp) * 255)},${Math.round((enemyHp / enemy.hp) * 255)},0)`,
                },
              ]}
            />
            <Text style={styles.hpLabel}>HP {enemyHp}/{enemy.hp}</Text>
          </View>
        </View>
      </View>

      {/* Stance Row */}
      <View style={styles.controlRow}>
        {STANCES.map(s => (
          <TouchableOpacity
            key={s}
            style={[
              styles.stanceBtn,
              stance === s && styles.stanceBtnSelected,
            ]}
            onPress={() => setStance(s)}
            disabled={turn !== 'player'}
          >
            <Text
              style={[
                styles.stanceBtnText,
                stance === s && styles.stanceBtnTextSelected,
              ]}
            >
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Action Row */}
      <View style={styles.controlRow}>
        {ACTIONS.map(a => (
          <TouchableOpacity
            key={a}
            style={styles.actionBtn}
            onPress={() => {
              if (turn === 'player') {
                setRollContext(a);
                setRolling(true);
              }
            }}
          >
            <Text style={styles.actionBtnText}>{a}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Dice Roller */}
      <DiceRoller
        visible={rolling}
        title={rollContext}
        traitContributions={getTraitContributions()}
        onComplete={handleRollComplete}
      />

      {/* Outcome */}
      <Modal transparent visible={battleOver} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>
              {winner === 'player' ? 'Victory!' : 'Defeat'}
            </Text>
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() =>
                winner === 'player'
                  ? router.push('/map')
                  : router.push('/main-menu')
              }
            >
              <Text style={styles.modalBtnText}>
                {winner === 'player' ? 'Map' : 'Menu'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingHorizontal: 50 },
  mainRow: {
    height: '64%', flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'flex-start',
  },
  charCol: { width: '30%', alignItems: 'center' },
  imagePlaceholder: {
    width: '100%', flexGrow: 1,
    backgroundColor: colors.surface, borderRadius: 6, padding: '2%',
  },
  nameLabel: { color: colors.ivoryWhite, fontWeight: '600', fontSize: 14 },
  hpBarBackground: {
    width: '100%', height: '12%', marginVertical: '2%',
    backgroundColor: '#444', borderRadius: 4, justifyContent: 'center',
  },
  hpBarFill: { height: '100%' },
  hpLabel: {
    position: 'absolute', alignSelf: 'center',
    color: colors.ivoryWhite, fontSize: 12, fontWeight: '600',
  },
  logCol: {
    width: '30%', 
    height: '100%',
    justifyContent: 'flex-start',
  },
  logScrollView: {
    flex: 1,
    backgroundColor: 'rgba(34, 34, 34, 0.8)',
    borderRadius: 6,
    padding: 8,
    maxHeight: '100%',
  },
  logContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  logText: {
    color: colors.ivoryWhite, fontSize: 12, marginBottom: 2,
  },
  controlRow: {
    height: '8%', flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
    marginVertical: '1%',
  },
  stanceBtn: {
    width: '23%', backgroundColor: colors.surface,
    borderRadius: 4, justifyContent: 'center',
    alignItems: 'center', height: '100%',
  },
  stanceBtnSelected: { backgroundColor: colors.ivoryWhite },
  stanceBtnText: { color: colors.ivoryWhite, fontWeight: '600' },
  stanceBtnTextSelected: { color: colors.accentGold },
  actionBtn: {
    width: '23%', backgroundColor: colors.accentGold,
    borderRadius: 6, justifyContent: 'center',
    alignItems: 'center', height: '100%',
  },
  actionBtnText: { color: colors.backgroundBase, fontWeight: '600' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalContent: {
    width: '60%', padding: '4%',
    backgroundColor: colors.surface, borderRadius: 6,
    alignItems: 'center',
  },
  modalHeader: {
    color: colors.ivoryWhite, fontSize: 20,
    fontWeight: '700', marginBottom: '2%',
  },
  modalBtn: {
    width: '50%', paddingVertical: '2%',
    backgroundColor: colors.accentGold, borderRadius: 6,
    justifyContent: 'center', alignItems: 'center',
  },
  modalBtnText: { color: colors.backgroundBase, fontWeight: '600' },
});

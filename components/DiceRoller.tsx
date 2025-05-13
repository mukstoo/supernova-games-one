// components/DiceRoller.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Animated } from 'react-native';
import { colors } from '../theme/colors';

const FUDGE_FACES = ['+', '+', '-', '-', '\u00A0', '\u00A0'];

type DiceRollerProps = {
  visible: boolean;
  title?: string;
  onComplete: (total: number, faces: string[]) => void;
  baseModifier?: number;
};

export default function DiceRoller({ visible, title, onComplete, baseModifier = 0 }: DiceRollerProps) {
  const [faces, setFaces] = useState<string[]>(['\u00A0', '\u00A0', '\u00A0', '\u00A0']);
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    if (!visible) return;
    setTotal(null);
    let ticks = 0;
    const interval = setInterval(() => {
      const newFaces = Array.from({ length: 4 }, () =>
        FUDGE_FACES[Math.floor(Math.random() * 6)]
      );
      setFaces(newFaces);
      ticks++;
      if (ticks >= 10) {
        clearInterval(interval);
        const sum = newFaces.reduce((currentSum, f) => {
          if (f === '+') return currentSum + 1;
          if (f === '-') return currentSum - 1;
          return currentSum;
        }, 0);
        const finalTotal = sum + baseModifier;
        setTotal(finalTotal);
        setTimeout(() => onComplete(finalTotal, newFaces), 800);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{title ?? 'Roll'}</Text>
          {total !== null && (
            <Text style={styles.total}>
              {total !== null ? (total >= 0 ? `+${total}` : total.toString()) : ''}
            </Text>
          )}
          <View style={styles.diceRow}>
            {faces.map((face, i) => (
              <View key={i} style={styles.die}>
                <Animated.Text style={styles.face}>{face}</Animated.Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#222',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    color: colors.ivoryWhite,
    marginBottom: 8,
    fontWeight: '600',
  },
  total: {
    fontSize: 32,
    color: colors.accentGold,
    fontWeight: '700',
    marginBottom: 12,
  },
  diceRow: {
    flexDirection: 'row',
  },
  die: {
    width: 48,
    height: 48,
    backgroundColor: colors.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.accentGold,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  face: {
    fontSize: 24,
    color: colors.ivoryWhite,
    fontWeight: '700',
  },
});

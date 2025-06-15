// components/DiceRoller.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Animated } from 'react-native';
import { colors } from '../theme/colors';
import { Traits } from '../store/slices/playerSlice';

// Fudge dice faces: -1, 0, +1 (represented as -, blank, +)
const FUDGE_FACES = ['-', '-', '\u00A0', '\u00A0', '+', '+'];
const FUDGE_VALUES = [-1, -1, 0, 0, 1, 1];

export interface TraitContribution {
  name: string;
  value: number;
}

type DiceRollerProps = {
  visible: boolean;
  title?: string;
  onComplete: (total: number, diceResult: number, faces: string[]) => void;
  traitContributions?: TraitContribution[];
  equipmentBonus?: number;
};

export default function DiceRoller({ 
  visible, 
  title = 'Roll', 
  onComplete, 
  traitContributions = [],
  equipmentBonus = 0
}: DiceRollerProps) {
  const [faces, setFaces] = useState<string[]>(['\u00A0', '\u00A0', '\u00A0', '\u00A0']);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  useEffect(() => {
    if (!visible) {
      setDiceResult(null);
      setIsRolling(false);
      return;
    }

    setIsRolling(true);
    setDiceResult(null);
    let ticks = 0;
    
    const interval = setInterval(() => {
      // Generate random faces for animation
      const newFaces = Array.from({ length: 4 }, () => {
        const index = Math.floor(Math.random() * 6);
        return FUDGE_FACES[index];
      });
      setFaces(newFaces);
      ticks++;
      
      if (ticks >= 10) {
        clearInterval(interval);
        setIsRolling(false);
        
        // Calculate final dice result
        const finalFaces = Array.from({ length: 4 }, () => {
          const index = Math.floor(Math.random() * 6);
          return FUDGE_FACES[index];
        });
        
        const finalDiceResult = finalFaces.reduce((sum, face) => {
          if (face === '+') return sum + 1;
          if (face === '-') return sum - 1;
          return sum;
        }, 0);
        
        setFaces(finalFaces);
        setDiceResult(finalDiceResult);
        
        // Calculate total with trait contributions and equipment
        const traitTotal = traitContributions.reduce((sum, trait) => sum + trait.value, 0);
        const total = finalDiceResult + traitTotal + equipmentBonus;
        
        // Wait a moment to show the result, then call completion
        setTimeout(() => {
          onComplete(total, finalDiceResult, finalFaces);
        }, 2000);
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [visible, onComplete, traitContributions, equipmentBonus]);

  if (!visible) return null;

  // Calculate totals for display
  const traitTotal = traitContributions.reduce((sum, trait) => sum + trait.value, 0);
  const grandTotal = (diceResult ?? 0) + traitTotal + equipmentBonus;

  // Create the formula string with trait values inline
  const createFormulaString = () => {
    const parts: string[] = [];
    
    // Add dice result
    if (diceResult !== null) {
      parts.push(`4dF(${diceResult >= 0 ? `+${diceResult}` : diceResult})`);
    }
    
    // Add each trait with its value
    traitContributions.forEach(trait => {
      parts.push(`${trait.name}(${trait.value})`);
    });
    
    // Add equipment bonus if present
    if (equipmentBonus !== 0) {
      parts.push(`Equipment(${equipmentBonus >= 0 ? `+${equipmentBonus}` : equipmentBonus})`);
    }
    
    return parts.join(' + ').replace('+ -', '- '); // Clean up double signs
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{title}</Text>
          
          {/* Dice Result Display */}
          {diceResult !== null && (
            <Text style={styles.diceTotal}>
              {grandTotal >= 0 ? `+${grandTotal}` : grandTotal.toString()}
            </Text>
          )}
          
          {/* Dice Row */}
          <View style={styles.diceRow}>
            {faces.map((face, i) => (
              <View key={i} style={styles.die}>
                <Animated.Text style={styles.face}>{face}</Animated.Text>
              </View>
            ))}
          </View>
          
          {/* Breakdown */}
          {diceResult !== null && (traitContributions.length > 0 || equipmentBonus !== 0) && (
            <View style={styles.breakdownContainer}>
              <Text style={styles.breakdownFormula}>
                {createFormulaString()}
              </Text>
            </View>
          )}
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
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 300,
    maxWidth: '90%',
  },
  title: {
    fontSize: 20,
    color: colors.ivoryWhite,
    marginBottom: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
  diceTotal: {
    fontSize: 32,
    color: colors.accentGold,
    fontWeight: '700',
    marginBottom: 12,
  },
  diceRow: {
    flexDirection: 'row',
    marginBottom: 16,
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
  breakdownContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  breakdownFormula: {
    fontSize: 14,
    color: colors.ivoryWhite,
    marginBottom: 8,
    textAlign: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
});

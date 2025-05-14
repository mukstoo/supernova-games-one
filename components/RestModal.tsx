import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { rest as restPlayer } from '../store/slices/playerSlice';
import { advanceTime } from '../store/slices/gameSlice';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface RestModalProps {
  visible: boolean;
  onClose: () => void;
  maxRestTicks?: number; // Optional: to limit how many ticks a player can rest
}

const MIN_REST_TICKS = 1;
const DEFAULT_MAX_REST_TICKS = 24; // Example: Max 1 day of rest

export function RestModal({ 
  visible, 
  onClose, 
  maxRestTicks = DEFAULT_MAX_REST_TICKS 
}: RestModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [ticksToRest, setTicksToRest] = useState<string>(MIN_REST_TICKS.toString());

  const handleRestAmountChange = (amount: string) => {
    const numericAmount = parseInt(amount, 10);
    if (amount === '' || (numericAmount >= MIN_REST_TICKS && numericAmount <= maxRestTicks)) {
      setTicksToRest(amount);
    } else if (numericAmount < MIN_REST_TICKS) {
      setTicksToRest(MIN_REST_TICKS.toString());
    } else if (numericAmount > maxRestTicks) {
      setTicksToRest(maxRestTicks.toString());
    }
  };

  const incrementTicks = () => {
    setTicksToRest(prev => {
      const current = parseInt(prev, 10) || 0;
      return Math.min(current + 1, maxRestTicks).toString();
    });
  };

  const decrementTicks = () => {
    setTicksToRest(prev => {
      const current = parseInt(prev, 10) || 0;
      return Math.max(current - 1, MIN_REST_TICKS).toString();
    });
  };

  const handleConfirmRest = () => {
    const numTicks = parseInt(ticksToRest, 10);
    if (isNaN(numTicks) || numTicks < MIN_REST_TICKS || numTicks > maxRestTicks) {
      Alert.alert('Invalid Input', `Please enter a number between ${MIN_REST_TICKS} and ${maxRestTicks}.`);
      return;
    }

    dispatch(restPlayer({ ticksRested: numTicks }));
    dispatch(advanceTime(numTicks)); 
    Alert.alert('Rested', `You rested for ${numTicks} tick(s) and recovered some HP and stamina.`);
    onClose(); 
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose} // Allows closing with hardware back button on Android
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Rest</Text>
          
          <Text style={styles.label}>How many ticks to rest?</Text>
          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.adjustButton} onPress={decrementTicks}>
              <Text style={styles.adjustButtonText}>-</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={ticksToRest}
              onChangeText={handleRestAmountChange}
              textAlign="center"
              maxLength={3} // Assuming maxRestTicks won't exceed 999
            />
            <TouchableOpacity style={styles.adjustButton} onPress={incrementTicks}>
              <Text style={styles.adjustButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.infoText}>(Min: {MIN_REST_TICKS}, Max: {maxRestTicks})</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={handleConfirmRest}>
              <Text style={[styles.buttonText, styles.confirmButtonText]}>Confirm Rest</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.accentGold,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.accentGold,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 16,
    color: colors.ivoryWhite,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  adjustButton: {
    backgroundColor: colors.steelGrey,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm, 
    borderRadius: 6,
    marginHorizontal: spacing.sm,
  },
  adjustButtonText: {
    color: colors.ivoryWhite,
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.steelGrey,
    color: colors.ivoryWhite,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm, 
    fontSize: 18,
    borderRadius: 6,
    width: 80, 
    backgroundColor: colors.obsidianBlack,
  },
  infoText: {
    fontSize: 12,
    color: colors.fadedBeige,
    marginBottom: spacing.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: spacing.md,
  },
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.steelGrey,
  },
  confirmButton: {
    backgroundColor: colors.accentGold,
  },
  buttonText: {
    color: colors.ivoryWhite,
    fontWeight: 'bold',
    fontSize: 16,
  },
  confirmButtonText: {
    color: colors.obsidianBlack,
  },
});

export default RestModal; 
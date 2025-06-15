import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import {
  Traits,
  selectPlayerTraits,
  setTrainingFocus,
  applyTraining,
} from '../store/slices/playerSlice';
import { advanceTime } from '../store/slices/gameSlice';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface TrainModalProps {
  visible: boolean;
  onClose: () => void;
}

const MIN_TRAIN_TICKS = 1;
const DEFAULT_MAX_TRAIN_TICKS = 10; // Max ticks to train in one go (can be adjusted)

const TRAIT_LABELS: Record<keyof Traits, string> = {
  str: 'Strength',
  agility: 'Agility',
  endurance: 'Endurance',
  intelligence: 'Intelligence',
  reputation: 'Reputation',
  persuade: 'Persuade',
  medicine: 'Medicine',
  craft: 'Craft',
  perception: 'Perception',
  stealth: 'Stealth',
  athletics: 'Athletics',
  survival: 'Survival',
};

export function TrainModal({ visible, onClose }: TrainModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const playerTraits = useSelector(selectPlayerTraits);
  const trainingFocus = useSelector((state: RootState) => state.player.trainingFocus);
  const trainingProgressData = useSelector((state: RootState) => state.player.trainingProgress);

  const [selectedTraitKey, setSelectedTraitKey] = useState<keyof Traits | null>(trainingFocus);
  const [ticksToTrain, setTicksToTrain] = useState<string>(MIN_TRAIN_TICKS.toString());

  useEffect(() => {
    // Sync local state if global focus changes (e.g. modal reopened)
    setSelectedTraitKey(trainingFocus);
  }, [trainingFocus]);

  useEffect(() => {
    // When modal becomes visible, if no trait is selected, select the first one.
    // Also, dispatch setTrainingFocus if a trait is selected locally.
    if (visible) {
      if (!selectedTraitKey && playerTraits) {
        const firstTrait = Object.keys(playerTraits)[0] as keyof Traits;
        setSelectedTraitKey(firstTrait);
        dispatch(setTrainingFocus(firstTrait));
      } else if (selectedTraitKey) {
        dispatch(setTrainingFocus(selectedTraitKey));
      }
      setTicksToTrain(MIN_TRAIN_TICKS.toString()); // Reset ticks input
    }
  }, [visible, dispatch, playerTraits, selectedTraitKey]);

  const handleTraitSelection = (traitKey: keyof Traits) => {
    setSelectedTraitKey(traitKey);
    dispatch(setTrainingFocus(traitKey));
  };

  const handleTrainAmountChange = (amount: string) => {
    const numericAmount = parseInt(amount, 10);
    if (amount === '' || (numericAmount >= MIN_TRAIN_TICKS && numericAmount <= DEFAULT_MAX_TRAIN_TICKS)) {
      setTicksToTrain(amount);
    } else if (numericAmount < MIN_TRAIN_TICKS) {
      setTicksToTrain(MIN_TRAIN_TICKS.toString());
    } else if (numericAmount > DEFAULT_MAX_TRAIN_TICKS) {
      setTicksToTrain(DEFAULT_MAX_TRAIN_TICKS.toString());
    }
  };

  const incrementTicks = () => {
    setTicksToTrain(prev => Math.min(parseInt(prev, 10) || 0 + 1, DEFAULT_MAX_TRAIN_TICKS).toString());
  };

  const decrementTicks = () => {
    setTicksToTrain(prev => Math.max(parseInt(prev, 10) || 0 - 1, MIN_TRAIN_TICKS).toString());
  };

  const handleConfirmTraining = () => {
    if (!selectedTraitKey) {
      Alert.alert('No Trait Selected', 'Please select an attribute or skill to train.');
      return;
    }
    const numTicks = parseInt(ticksToTrain, 10);
    if (isNaN(numTicks) || numTicks < MIN_TRAIN_TICKS || numTicks > DEFAULT_MAX_TRAIN_TICKS) {
      Alert.alert('Invalid Input', `Please enter a number between ${MIN_TRAIN_TICKS} and ${DEFAULT_MAX_TRAIN_TICKS}.`);
      return;
    }

    const traitName = TRAIT_LABELS[selectedTraitKey] || selectedTraitKey;
    const oldLevel = playerTraits[selectedTraitKey];

    dispatch(applyTraining({ ticksApplied: numTicks }));
    dispatch(advanceTime(numTicks));

    // To get the new level, we need to access the state *after* the dispatch.
    // This is tricky directly. For now, we'll show a generic message.
    // A better way might be to have applyTraining return the new level or use a selector.
    Alert.alert('Training Session', `You trained ${traitName} for ${numTicks} tick(s).`);
    // We could enhance this by reading the new level from the store if really needed for the alert,
    // but that might add complexity here for just a message.

    onClose();
  };

  const renderTraitOption = (traitKey: keyof Traits) => {
    const currentLevel = playerTraits[traitKey];
    const progress = trainingProgressData[traitKey] || 0;
    const costForNextLevel = currentLevel + 1;
    const displayName = TRAIT_LABELS[traitKey] || traitKey;

    return (
      <TouchableOpacity
        key={traitKey}
        style={[styles.traitOption, selectedTraitKey === traitKey && styles.traitOptionSelected]}
        onPress={() => handleTraitSelection(traitKey)}
      >
        <Text style={styles.traitName}>{displayName} (Lvl: {currentLevel})</Text>
        <Text style={styles.traitProgress}>
          Progress to Lvl {currentLevel + 1}: {progress}/{costForNextLevel} ticks
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView contentContainerStyle={styles.outerScrollViewContentContainer}>
            <Text style={styles.modalTitle}>Train Attribute / Skill</Text>

            <Text style={styles.subHeader}>Select what to train:</Text>
            <ScrollView style={styles.traitListContainer}>
              {Object.keys(playerTraits).map(key => renderTraitOption(key as keyof Traits))}
            </ScrollView>

            {selectedTraitKey && (
              <View style={styles.selectedTraitInfoContainer}>
                <Text style={styles.selectedTraitText}>
                  Training: {TRAIT_LABELS[selectedTraitKey]} (Lvl: {playerTraits[selectedTraitKey]})
                </Text>
                <Text style={styles.selectedTraitProgressText}>
                  (Progress: {trainingProgressData[selectedTraitKey] || 0}/{
                    (playerTraits[selectedTraitKey] || 0) + 1
                  } ticks to next)
                </Text>
              </View>
            )}

            <Text style={styles.label}>How many ticks to train this session?</Text>
            <View style={styles.inputContainer}>
              <TouchableOpacity style={styles.adjustButton} onPress={decrementTicks}>
                <Text style={styles.adjustButtonText}>-</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={ticksToTrain}
                onChangeText={handleTrainAmountChange}
                textAlign="center"
                maxLength={2} // Max 99 ticks for DEFAULT_MAX_TRAIN_TICKS = 10, adjust if needed
              />
              <TouchableOpacity style={styles.adjustButton} onPress={incrementTicks}>
                <Text style={styles.adjustButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.infoText}>(Min: {MIN_TRAIN_TICKS}, Max: {DEFAULT_MAX_TRAIN_TICKS} per session)</Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.confirmButton, !selectedTraitKey && styles.disabledButton]} 
                onPress={handleConfirmTraining}
                disabled={!selectedTraitKey}
              >
                <Text style={[styles.buttonText, styles.confirmButtonText]}>Confirm Training</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.sm, 
  },
  modalContent: {
    width: '95%',
    maxWidth: 500,
    maxHeight: '90%', // Ensure modal fits screen
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.accentGold,
  },
  outerScrollViewContentContainer: {
    flexGrow: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.accentGold,
    textAlign: 'center',
    marginBottom: spacing.md,
    alignSelf: 'flex-start',
  },
  subHeader: {
    fontSize: 16,
    color: colors.ivoryWhite,
    marginBottom: spacing.sm,
  },
  traitListContainer: {
    minHeight: 100,
    flexGrow: 1,
    flexShrink: 1,
    width: '100%',
    borderColor: colors.steelGrey,
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: spacing.md,
    padding: spacing.xs,
  },
  traitOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.steelGrey,
  },
  traitOptionSelected: {
    backgroundColor: colors.accentGold,
    borderColor: colors.accentGold,
    borderWidth: 1,
    borderRadius: 4,
  },
  traitName: {
    color: colors.ivoryWhite,
    fontSize: 15,
    fontWeight: '500',
  },
  traitProgress: {
    color: colors.fadedBeige,
    fontSize: 12,
  },
  selectedTraitInfoContainer: {
    marginVertical: spacing.sm,
    padding: spacing.xs,
    backgroundColor: colors.obsidianBlack,
    borderRadius: 4,
    alignItems: 'center',
  },
  selectedTraitText: {
    fontSize: 14,
    color: colors.accentGold,
    fontWeight: 'bold',
  },
  selectedTraitProgressText: {
    fontSize: 12,
    color: colors.fadedBeige,
  },
  label: {
    fontSize: 16,
    color: colors.ivoryWhite,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    alignSelf: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : spacing.xs,
    fontSize: 18,
    borderRadius: 6,
    width: 70,
    backgroundColor: colors.obsidianBlack,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 12,
    color: colors.fadedBeige,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    minWidth: 130, // Adjusted for potentially longer text
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
  disabledButton: {
    opacity: 0.5,
  },
});

export default TrainModal; 
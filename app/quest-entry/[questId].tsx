import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { allQuests } from '../../utils/quests';
import { Quest, QuestActionType } from '../../utils/questTypes';
import { Traits, completeQuest, failQuest } from '../../store/slices/playerSlice';
import { advanceTime } from '../../store/slices/gameSlice';
import DiceRoller from '../../components/DiceRoller';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

type QuestEntryStep = 
  | 'initialising'
  | 'rollingEntryChecks' 
  | 'showingEntryResults'
  | 'choosingAction'
  | 'rollingAction'
  | 'showingActionResult'
  | 'battlePending'
  | 'escapePending'
  | 'questFailed' // e.g. trap damage too high
  | 'questComplete'; // Or some other terminal state

// --- New types for Kill Orcs quest flow ---
type OrcQuestStep = 
  | 'idle' 
  | 'start_kill_orcs'
  | 'rolling_stealth_kill_orcs'
  | 'awaiting_perception_kill_orcs'
  | 'rolling_perception_kill_orcs'
  | 'stealth_success_choose_action' // NEW: Player succeeded initial stealth, choosing next action
  | 'awaiting_ambush_stealth_roll' // NEW: Player chose to ambush, awaiting roll
  | 'rolling_ambush_stealth'      // NEW: Rolling the ambush stealth check
  | 'battle_direct_kick_door'     // NEW: Battle initiated via kick door (no ambush)
  | 'battle_ambushed_enemies'     // NEW: Player successfully ambushed enemies
  | 'battle_ambushed_player'      // NEW: Player failed ambush/perception, player is ambushed
  | 'battle_direct_no_ambush' ;   // NEW: Player failed initial stealth but succeeded perception (direct confrontation)

// Refined DiceRollContext
type DiceRollContext = 'none' | 'orc_initial_stealth' | 'orc_perception' | 'orc_ambush_stealth';

export default function QuestEntryScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { questId } = useLocalSearchParams<{ questId: string }>();
  
  const playerTraits = useSelector((s: RootState) => s.player.traits);
  const gameTicks = useSelector((s: RootState) => s.game.ticks); // For quest completion/failure

  const [step, setStep] = useState<QuestEntryStep>('initialising');
  const [currentQuest, setCurrentQuest] = useState<Quest | null>(null);

  // --- State for Kill Orcs quest ---
  const [isOrcQuest, setIsOrcQuest] = useState(false);
  const [orcQuestStep, setOrcQuestStep] = useState<OrcQuestStep>('idle');
  const [isDiceRollerVisible, setIsDiceRollerVisible] = useState(false);
  const [diceRollContext, setDiceRollContext] = useState<DiceRollContext>('none');
  const [currentDiceModifier, setCurrentDiceModifier] = useState(0);
  const [currentDiceTitle, setCurrentDiceTitle] = useState('');
  // --- End State for Kill Orcs quest ---

  // Entry rolls and outcomes
  const [perceptionRoll, setPerceptionRoll] = useState<number | null>(null);
  const [stealthRoll, setStealthRoll] = useState<number | null>(null);
  const [wasAttackedOnEntry, setWasAttackedOnEntry] = useState(false);
  const [wasAmbushedOnEntry, setWasAmbushedOnEntry] = useState(false);
  
  // Action-related states
  const [chosenAction, setChosenAction] = useState<QuestActionType | null>(null);
  const [actionRoll, setActionRoll] = useState<number | null>(null);
  const [watchBonusActive, setWatchBonusActive] = useState(false);
  const [actionResultText, setActionResultText] = useState<string>('');

  useEffect(() => {
    if (questId) {
      const foundQuest = allQuests.find(q => q.id === questId);
      if (foundQuest) {
        setCurrentQuest(foundQuest);
        if (foundQuest.questType === 'kill_orcs') {
          setIsOrcQuest(true);
          setOrcQuestStep('start_kill_orcs');
          setStep('initialising'); // Don't use generic steps for orc quest
        } else {
          setIsOrcQuest(false);
          setOrcQuestStep('idle');
          setStep('rollingEntryChecks'); // Proceed with generic flow
        }
      } else {
        Alert.alert('Error', 'Quest not found.', [{ text: 'OK', onPress: () => router.back() }]);
      }
    } else {
      Alert.alert('Error', 'No Quest ID provided.', [{ text: 'OK', onPress: () => router.back() }]);
    }
  }, [questId, router]);

  if (!currentQuest) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading Quest...</Text>
      </View>
    );
  }

  const handleEntryRollsComplete = (perceptionResult: number, stealthResult: number) => {
    setPerceptionRoll(perceptionResult);
    setStealthRoll(stealthResult);

    const perceptionDC = currentQuest.perceptionDC || 0; // Enemies trying to perceive player
    const stealthDC = currentQuest.stealthDC || 0;     // Player trying to perceive enemies/traps

    // Player's perception vs quest's stealthDC (for spotting traps/ambushes)
    const spottedAmbush = perceptionResult >= stealthDC;
    // Player's stealth vs quest's perceptionDC (for not being seen)
    const playerStealthed = stealthResult >= perceptionDC;

    if (!spottedAmbush) {
        setWasAmbushedOnEntry(true);
        // Player is ambushed regardless of their own stealth if they fail to spot it.
    }
    if (!playerStealthed) {
        setWasAttackedOnEntry(true);
        // Player is attacked if they fail their stealth, even if they spotted an ambush.
    }

    setActionResultText(`Entry Rolls: Perception ${perceptionResult} (DC ${stealthDC}), Stealth ${stealthResult} (DC ${perceptionDC})`);
    setStep('showingEntryResults');
  };

  const proceedFromEntryResults = () => {
    if (wasAttackedOnEntry || wasAmbushedOnEntry) {
        setStep('battlePending');
    } else {
        // Player successfully sneaked in AND spotted everything (or there was nothing to spot)
        if (currentQuest.availableActions && currentQuest.availableActions.length > 0) {
            setStep('choosingAction');
        } else {
            // No actions, perhaps quest is just an observation or auto-completes?
            // For now, let's assume this means direct completion or objective achieved.
            setActionResultText('No further actions. Objective likely achieved by stealth.');
            setStep('questComplete'); 
        }
    }
  };

  // --- Handler for Kill Orcs dice rolls ---
  const handleOrcQuestRollComplete = (rollValue: number) => {
    setIsDiceRollerVisible(false);
    dispatch(advanceTime()); // Each roll takes time

    if (!currentQuest) return; // Should not happen
    
    let dc: number;
    // Determine DC based on context
    if (diceRollContext === 'orc_initial_stealth' || diceRollContext === 'orc_ambush_stealth') {
      dc = currentQuest.stealthDC || 2;
    } else if (diceRollContext === 'orc_perception') {
      dc = currentQuest.perceptionDC || 2;
    } else {
      console.error('Unknown dice roll context:', diceRollContext);
      return; // Should not happen
    }

    const totalRollValue = rollValue; // DiceRoller already incorporates modifier

    if (diceRollContext === 'orc_initial_stealth') {
      if (totalRollValue >= dc) {
        setOrcQuestStep('stealth_success_choose_action');
      } else {
        // Failed initial stealth, go to perception check
        setOrcQuestStep('rolling_perception_kill_orcs'); 
      }
    } else if (diceRollContext === 'orc_perception') {
      if (totalRollValue >= dc) {
        // Success on perception after failing initial stealth -> direct battle
        setOrcQuestStep('battle_direct_no_ambush');
      } else {
        // Failure on perception after failing initial stealth -> player ambushed
        setOrcQuestStep('battle_ambushed_player');
      }
    } else if (diceRollContext === 'orc_ambush_stealth') {
       // This roll happens AFTER succeeding initial stealth and choosing to ambush
      if (totalRollValue >= dc) {
        // Success on ambush stealth -> enemies ambushed
        setOrcQuestStep('battle_ambushed_enemies');
      } else {
        // Failure on ambush stealth -> player caught off guard (ambushed)
        setOrcQuestStep('battle_ambushed_player');
      }
    }
    setDiceRollContext('none');
  };

  // More handlers will go here for choosingAction, rollingAction, etc.

  // --- Render logic for Kill Orcs Quest ---
  if (isOrcQuest && currentQuest) {
    return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>{currentQuest.title}</Text>
          <Text style={styles.description}>{currentQuest.description}</Text>
          <View style={styles.separator} />

          {orcQuestStep === 'start_kill_orcs' && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Approach the Orcs</Text>
              <Text style={styles.stepInstruction}>You attempt to approach the orcs unseen. Make a Stealth check.</Text>
              <Text style={styles.stepInstruction}>(DC: {currentQuest.stealthDC || 'N/A'}, Your Stealth: {playerTraits.stealth})</Text>
              <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                  setCurrentDiceModifier(playerTraits.stealth);
                  setCurrentDiceTitle('Stealth Check');
                  setDiceRollContext('orc_initial_stealth');
                  setIsDiceRollerVisible(true);
                }}
              >
                <Text style={styles.buttonText}>Attempt Stealth</Text>
              </TouchableOpacity>
            </View>
          )}

          {orcQuestStep === 'awaiting_ambush_stealth_roll' && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Ambush Decision</Text>
              <Text style={styles.stepInstruction}>You can either ambush the orcs or try to sneak past them. Choose your action.</Text>
              <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                  setOrcQuestStep('rolling_ambush_stealth');
                }}
              >
                <Text style={styles.buttonText}>Ambush</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                  setOrcQuestStep('rolling_perception_kill_orcs');
                }}
              >
                <Text style={styles.buttonText}>Sneak Past</Text>
              </TouchableOpacity>
            </View>
          )}

          {orcQuestStep === 'rolling_ambush_stealth' && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Ambush Stealth Check</Text>
              <Text style={styles.stepInstruction}>Roll for ambush stealth.</Text>
              <Text style={styles.stepInstruction}>(DC: {currentQuest.stealthDC || 'N/A'}, Your Stealth: {playerTraits.stealth})</Text>
              <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                  setCurrentDiceModifier(playerTraits.stealth);
                  setCurrentDiceTitle('Ambush Stealth Check');
                  setDiceRollContext('orc_ambush_stealth');
                  setIsDiceRollerVisible(true);
                }}
              >
                <Text style={styles.buttonText}>Roll</Text>
              </TouchableOpacity>
            </View>
          )}

          {orcQuestStep === 'stealth_success_choose_action' && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Stealth Successful!</Text>
              <Text style={styles.stepInstruction}>You've managed to approach undetected. What's the plan?</Text>
              
              {/* --- NEW OPTIONS --- */}
              <TouchableOpacity 
                style={[styles.button, styles.disabledButton]} // Disabled for now
                onPress={() => Alert.alert('Observe', 'Observation logic not yet implemented.')}
                disabled={true} // Disable Observe for now
              >
                <Text style={styles.buttonText}>Observe Orcs (Disabled)</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                  // Directly go to non-ambush battle
                  setOrcQuestStep('battle_direct_kick_door');
                }}
              >
                <Text style={styles.buttonText}>Kick the Door In!</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                  // Proceed to ambush stealth check
                  setOrcQuestStep('rolling_ambush_stealth');
                }}
              >
                <Text style={styles.buttonText}>Attempt Ambush (Stealth DC: {currentQuest.stealthDC || 'N/A'})</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {(orcQuestStep === 'battle_direct_kick_door' || orcQuestStep === 'battle_direct_no_ambush') && (
            // Covers: Kick Door OR (Failed Initial Stealth + Success Perception)
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Battle!</Text>
              <Text style={styles.outcomeNeutral}>You confront the Orcs directly!</Text>
              <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                  router.push({ 
                    pathname: '/battle', 
                    params: { 
                      enemyId: 'orc_fighter', 
                      // ambushed: 'false', // OLD - Replace with specific params
                      playerAmbushed: 'false', // NEW
                      enemyAmbushed: 'false', // NEW
                      questId: currentQuest.id 
                    } 
                  });
                }}
              >
                <Text style={styles.buttonText}>Engage Orcs</Text>
              </TouchableOpacity>
            </View>
          )}

          {orcQuestStep === 'battle_ambushed_enemies' && (
            // Covers: Success Ambush Stealth
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Ambush!</Text>
              <Text style={styles.outcomeGood}>You caught the Orcs by surprise!</Text> 
              <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                  router.push({ 
                    pathname: '/battle', 
                    params: { 
                      enemyId: 'orc_fighter', 
                      // ambushed: 'true', // OLD
                      playerAmbushed: 'false', // NEW
                      enemyAmbushed: 'true', // NEW
                      questId: currentQuest.id
                    } 
                  });
                }}
              >
                <Text style={styles.buttonText}>Attack!</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {orcQuestStep === 'battle_ambushed_player' && (
             // Covers: (Failed Initial Stealth + Failed Perception) OR (Failed Ambush Stealth)
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Ambushed!</Text>
              <Text style={styles.outcomeBad}>The Orcs got the drop on you!</Text>
              <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                  router.push({ 
                    pathname: '/battle', 
                    params: { 
                      enemyId: 'orc_fighter', 
                      // ambushed: 'true', // OLD
                      playerAmbushed: 'true', // NEW
                      enemyAmbushed: 'false', // NEW
                      questId: currentQuest.id 
                    } 
                  });
                }}
              >
                <Text style={styles.buttonText}>Defend Yourself!</Text>
              </TouchableOpacity>
            </View>
          )}

          {orcQuestStep === 'rolling_perception_kill_orcs' && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Stealth Failed!</Text>
              <Text style={styles.stepInstruction}>You failed to sneak past. You can try to spot them before they spot you. Make a Perception check.</Text>
              <Text style={styles.stepInstruction}>(DC: {currentQuest.perceptionDC || 'N/A'}, Your Perception: {playerTraits.perception})</Text>
              <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                  setCurrentDiceModifier(playerTraits.perception);
                  setCurrentDiceTitle('Perception Check');
                  setDiceRollContext('orc_perception');
                  setIsDiceRollerVisible(true);
                }}
              >
                <Text style={styles.buttonText}>Attempt Perception</Text>
              </TouchableOpacity>
            </View>
          )}

          {isDiceRollerVisible && currentQuest && (
            <DiceRoller
              visible={isDiceRollerVisible}
              title={currentDiceTitle}
              baseModifier={currentDiceModifier}
              onComplete={(rollValue, _faces) => handleOrcQuestRollComplete(rollValue)}
            />
          )}
        </View>
      </ScrollView>
    );
  }

  // --- Original Render Logic for Generic Quests ---
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>{currentQuest.title}</Text>
        <Text style={styles.description}>{currentQuest.description}</Text>
        <View style={styles.separator} />

        {step === 'rollingEntryChecks' && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Initial Approach...</Text>
            <Text style={styles.stepInstruction}>Roll for Perception and Stealth to enter the area.</Text>
            {/* This will need two DiceRollers or one that handles two rolls */}
            {/* For simplicity, let's assume one DiceRoller can be used twice or we adapt it */}
            <Text style={styles.hintText}>(Simulating two separate rolls for now)</Text>
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    // Simulate rolls for now, replace with actual DiceRoller calls
                    const pRoll = Math.floor(Math.random() * 10) + 1 + playerTraits.perception + (watchBonusActive ? 1 : 0);
                    const sRoll = Math.floor(Math.random() * 10) + 1 + playerTraits.stealth + (watchBonusActive ? 1 : 0);
                    handleEntryRollsComplete(pRoll, sRoll);
                }}
            >
                <Text style={styles.buttonText}>Roll Perception & Stealth</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'showingEntryResults' && (
            <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>Entry Attempt</Text>
                <Text style={styles.resultText}>{actionResultText}</Text>
                {wasAmbushedOnEntry && <Text style={styles.outcomeBad}>You were ambushed!</Text>}
                {wasAttackedOnEntry && !wasAmbushedOnEntry && <Text style={styles.outcomeBad}>You were detected!</Text>}
                {!(wasAttackedOnEntry || wasAmbushedOnEntry) && <Text style={styles.outcomeGood}>You entered undetected and aware.</Text>}
                <TouchableOpacity style={styles.button} onPress={proceedFromEntryResults}>
                    <Text style={styles.buttonText}>Continue</Text>
                </TouchableOpacity>
            </View>
        )}

        {step === 'battlePending' && (
            <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>Engagement!</Text>
                {wasAmbushedOnEntry && <Text style={styles.outcomeBad}>Ambushed! Enemies get the first strike!</Text>}
                {wasAttackedOnEntry && !wasAmbushedOnEntry && <Text style={styles.outcomeBad}>Detected! Prepare for battle!</Text>}
                <TouchableOpacity style={styles.button} onPress={() => router.replace('/map')}> 
                    <Text style={styles.buttonText}>To Battle (Back to Map for now)</Text>
                </TouchableOpacity>
            </View>
        )}

        {step === 'choosingAction' && (
            <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>Choose Your Action</Text>
                {/* Action buttons will be rendered here */}
                <Text>Actions TBD</Text>
                 <TouchableOpacity style={styles.button} onPress={() => router.back()}> 
                    <Text style={styles.buttonText}>Leave (Back to Map)</Text>
                </TouchableOpacity>
            </View>
        )}
        
        {step === 'questComplete' && (
             <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>Objective Achieved!</Text>
                <Text style={styles.resultText}>{actionResultText}</Text>
                <TouchableOpacity style={styles.button} onPress={() => router.replace('/map')}> 
                    <Text style={styles.buttonText}>Return to Map</Text>
                </TouchableOpacity>
            </View>
        )}

        {/* Other steps (rollingAction, showingActionResult) will be added here */}

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.backgroundBase,
  },
  loadingText: {
    fontSize: 20,
    color: colors.ivoryWhite,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.accentGold,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: 16,
    color: colors.ivoryWhite,
    marginBottom: spacing.md,
    textAlign: 'justify',
  },
  separator: {
    height: 1,
    backgroundColor: colors.steelGrey,
    marginVertical: spacing.md,
  },
  stepContainer: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.steelGrey,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.accentGold,
    marginBottom: spacing.sm,
  },
  stepInstruction: {
    fontSize: 15,
    color: colors.ivoryWhite,
    marginBottom: spacing.md,
  },
  hintText: {
    fontSize: 13,
    color: colors.steelGrey,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  button: {
    backgroundColor: colors.accentGold,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.obsidianBlack,
  },
  buttonText: {
    color: colors.obsidianBlack,
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultText: {
    fontSize: 16,
    color: colors.ivoryWhite,
    marginBottom: spacing.sm,
    fontStyle: 'italic',
  },
  outcomeGood: {
    fontSize: 16,
    color: colors.lightGreen, // Or a success green
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  outcomeBad: {
    fontSize: 16,
    color: colors.bloodRed, // Or an error red
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  outcomeNeutral: {
    fontSize: 16,
    color: colors.ivoryWhite,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  disabledButton: {
    backgroundColor: colors.steelGrey,
    opacity: 0.6,
  },
}); 
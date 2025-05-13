// components/LocationScreen.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  Text,
  TouchableOpacity,
  Dimensions,
  Alert,
  DimensionValue,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { startQuest } from '../store/slices/playerSlice';
import { advanceTime } from '../store/slices/gameSlice';
import { 
    pruneExpiredQuests, 
    selectDiscoveredQuestsForLocation,
    selectLastRollResultForLocation,
    DiscoveredQuestInfo
} from '../store/slices/locationSlice';
import { updateDiscoveredQuestsAsync } from '../store/slices/locationSlice';
import { discoverQuests as fetchQuestsFromLogic } from '../utils/questLogic';
import { Quest } from '../utils/questTypes';
import { LocationConfig, LocationType } from '../utils/locationConfig';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import DiceRoller from './DiceRoller';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  config: LocationConfig;
  locationType: LocationType;
}

// Define a specific type for position styles used
type PositionStyle = {
  top?: DimensionValue | undefined;
  left?: DimensionValue | undefined;
  right?: DimensionValue | undefined;
  bottom?: DimensionValue | undefined;
};

export default function LocationScreen({ config, locationType }: Props) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { row, col } = useLocalSearchParams<{ row: string; col: string }>();
  const locationId = useMemo(() => `${row}-${col}`, [row, col]);

  // --- Global State ---
  const ticks = useSelector((s: RootState) => s.game.ticks); // Get current time
  const playerTraits = useSelector((s: RootState) => s.player.traits);
  const playerQuests = useSelector((s: RootState) => s.player.quests); // Get the whole quests object

  // --- Location Specific State from Redux ---
  // Use the potentially problematic selector
  const discoveredQuestsInfoRaw = useSelector(selectDiscoveredQuestsForLocation(locationId));
  // Memoize the result based on the raw array reference changing
  const discoveredQuestsInfo = useMemo(() => discoveredQuestsInfoRaw, [discoveredQuestsInfoRaw]);

  const lastRollResultForLocation = useSelector(selectLastRollResultForLocation(locationId));

  // --- Component State ---
  const [isRolling, setIsRolling] = useState(false);
  const [isQuestOverlayVisible, setIsQuestOverlayVisible] = useState(false); // State to control overlay visibility
  const [currentDiceRollResult, setCurrentDiceRollResult] = useState<number | null>(null);
  const [showLookForQuestsButton, setShowLookForQuestsButton] = useState(true); // Control visibility of the search button

  // Calculate modifier for the dice roll
  const gatherModifier = (playerTraits.gatherInformation || 0) + (playerTraits.reputation || 0);

  // Prune expired quests for this location when component mounts or time changes
  useEffect(() => {
    if (locationId) {
      dispatch(pruneExpiredQuests({ locationId, currentTick: ticks }));
    }
  }, [dispatch, locationId, ticks]);

  // --- Action Handler ---
  const onAction = (key: string) => {
    if (key === 'gather') {
      // --- MODIFIED: Just show the overlay initially ---
      setIsQuestOverlayVisible(true); 
      // Reset button visibility when opening
      setShowLookForQuestsButton(true); 
      // Do NOT advance time or start rolling here anymore
    } else {
      Alert.alert('Action', `Triggered: ${key}`);
    }
  };

  // --- ADDED: Handler for "Look for New Quests" button ---
  const handleLookForQuests = () => {
    // Prevent multiple searches while one is in progress
    if (isRolling) return; 

    dispatch(advanceTime()); // Advance time ONLY when searching
    setIsRolling(true);
    setIsQuestOverlayVisible(false); // Hide overlay while rolling
    setShowLookForQuestsButton(false); // Hide button after searching once per overlay view
    setCurrentDiceRollResult(null); // Clear previous roll result display
  };

  // --- Dice Roll Completion Handler ---
  const handleRollComplete = (totalFromDice: number) => {
    setIsRolling(false); 
    setCurrentDiceRollResult(totalFromDice); 
    
    const questsToExclude = new Set(
      Object.values(playerQuests)
        .filter(qInfo => qInfo.status === 'active' || qInfo.status === 'completed')
        .map(qInfo => qInfo.id)
    );
    const newlyPossibleQuests = fetchQuestsFromLogic({
      playerTraits,
      activeQuestIds: Array.from(questsToExclude), 
      completedQuestIds: [], 
      diceRollResult: totalFromDice,
    });

    // --- MODIFIED: Dispatch the async thunk --- 
    dispatch(
      updateDiscoveredQuestsAsync({
        locationId,
        quests: newlyPossibleQuests,
        rollResult: totalFromDice,
        currentTick: ticks,
      })
    );
    
    setIsQuestOverlayVisible(true); 
  };

  // --- Quest Acceptance Handler ---
  const handleAcceptQuest = (questInfo: DiscoveredQuestInfo) => { // Accept DiscoveredQuestInfo
    const questToAccept = questInfo.quest;
    // --- MODIFIED: Pass assignedLocation to startQuest ---
    dispatch(startQuest({ 
      questId: questToAccept.id, 
      currentTick: ticks, 
      location: questInfo.assignedLocation // Pass the location
    })); 
    Alert.alert('Quest Started', `"${questToAccept.title}" added to your active quests.`);
  };

  const getButtonPosition = (key: string): PositionStyle => {
    if (locationType === 'settlement') {
      switch (key) {
        case 'gather': return { top: '30%', left: '15%' };
        case 'train': return { top: '65%', left: '25%' };
        case 'trade': return { top: '40%', right: '15%' };
        case 'rest': return { bottom: '15%', right: '20%' };
        default: return {};
      }
    }
    return {};
  };

  return (
    <ImageBackground
      source={config.bg}
      style={styles.bg}
      resizeMode="cover"
    >
      {/* Action Buttons (Hide if rolling or showing results?) */}
      {!isRolling && !isQuestOverlayVisible && config.actions.map((a) => (
            <TouchableOpacity
              key={a.key}
              style={[styles.actionButton, getButtonPosition(a.key)]}
              onPress={() => onAction(a.key)}
            >
              <Text style={styles.actionButtonText}>{a.label}</Text>
            </TouchableOpacity>
      ))}

      {/* Time Display */}
      <View style={styles.timeDisplayContainer}>
        <Text style={styles.timeDisplayText}>Time: {ticks}</Text>
      </View>

      {/* Back Button (Always visible?) */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
            // If showing results or rolling, back button should cancel that first
            if (isRolling || isQuestOverlayVisible) {
                setIsRolling(false);
                setIsQuestOverlayVisible(false);
                setCurrentDiceRollResult(null);
            } else {
                router.back(); // Otherwise, go back to map
            }
        }}
      >
        <Text style={styles.backButtonText}>
          {isRolling || isQuestOverlayVisible ? 'Cancel' : 'Map'}
        </Text>
      </TouchableOpacity>

      {/* Quest Results Overlay */} 
      {isQuestOverlayVisible && (
        <View style={styles.resultsOverlay}>
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>
                {/* MODIFIED: Title reflects last search roll OR just 'Leads' */}
                {currentDiceRollResult !== null 
                  ? `Gather Results (Last Roll: ${currentDiceRollResult ?? '-'})` 
                  : lastRollResultForLocation !== null
                  ? `Known Leads (Best Roll: ${lastRollResultForLocation})`
                  : 'Known Leads'}
            </Text>
            {/* --- ADDED: Look for New Quests Button --- */}
            {showLookForQuestsButton && (
              <TouchableOpacity 
                style={styles.lookForQuestsButton} 
                onPress={handleLookForQuests}
                disabled={isRolling} // Disable while rolling
              >
                <Text style={styles.lookForQuestsButtonText}>
                  {isRolling ? 'Searching...' : 'Look for New Leads (Costs 1 Tick)'}
                </Text>
              </TouchableOpacity>
            )}
            <ScrollView style={styles.resultsScrollView}>
              {discoveredQuestsInfo.length === 0 ? (
                <Text style={styles.resultsText}>No leads found here yet.</Text>
              ) : (
                discoveredQuestsInfo.map(questInfo => {
                  const quest = questInfo.quest;
                  const questStatusInfo = playerQuests[quest.id];
                  const isAccepted = questStatusInfo?.status === 'active';
                  const isCompleted = questStatusInfo?.status === 'completed';
                  const isFailed = questStatusInfo?.status === 'failed';
                  const discoveredAt = questInfo.discoveredAtTick;
                  const acceptedAt = isAccepted ? questStatusInfo.acceptedAtTick : null;
                  
                  // Deadline is duration AFTER acceptance tick (if applicable)
                  // --- MODIFIED: Use quest.duration for DEADLINE calculation AFTER acceptance ---
                  const deadlineTick = (acceptedAt !== undefined && acceptedAt !== null && quest.duration) 
                                     ? acceptedAt + quest.duration 
                                     : null;
                  // Expiry is duration AFTER discovery tick
                  // --- Use quest.duration for EXPIRY calculation AFTER discovery ---
                  const expiryTick = quest.duration ? discoveredAt + quest.duration : null;

                  const ticksRemainingForDeadline = deadlineTick ? deadlineTick - ticks : null;
                  const ticksRemainingForExpiry = expiryTick ? expiryTick - ticks : null;

                  // --- MODIFIED: Can accept only if not expired ---
                  const isExpired = ticksRemainingForExpiry !== null && ticksRemainingForExpiry <= 0;
                  const canAccept = !isAccepted && !isCompleted && !isFailed && !isExpired;
                  const acceptButtonText = isExpired ? 'Expired' : 'Accept';

                  return (
                    <View key={quest.id} style={[styles.questItem, isAccepted && styles.questItemAccepted, isFailed && styles.questItemFailed, isExpired && !isAccepted && styles.questItemExpired]}>
                      {/* --- MODIFIED: Ensure display values --- */}
                      <Text style={styles.questTitle}>
                        {quest.title ?? 'Unknown Quest'} (Rarity: {quest.rarity ?? 'N/A'})
                      </Text>
                      <Text style={styles.questDesc}>
                        {quest.description ?? ''}
                      </Text>
                      
                      {/* Duration/Deadline/Expiry Info */} 
                      {/* --- MODIFIED: Display based on status and remaining ticks --- */}
                      {quest.duration && (
                        <Text style={styles.questDurationText}>
                          {isAccepted && deadlineTick !== null && ticksRemainingForDeadline !== null ? 
                             (ticksRemainingForDeadline > 0 ? `Deadline in: ${ticksRemainingForDeadline} ticks (at Tick ${deadlineTick})` : 'Deadline Passed') :
                           isCompleted ? 
                             `Completed` : 
                           isFailed ?
                              `Failed` :
                           isExpired ?
                              `Expired (at Tick ${expiryTick})` :
                           ticksRemainingForExpiry !== null ?
                              `Expires in: ${ticksRemainingForExpiry} ticks (at Tick ${expiryTick})` :
                              'Duration unknown'}
                        </Text>
                      )}
                      
                      {/* Status Label or Accept Button */} 
                      {/* --- No change needed here, logic handles statuses including 'Expired' via canAccept --- */}
                      {isAccepted ? (
                        <Text style={styles.questAcceptedLabel}>In Progress</Text>
                      ) : isCompleted ? (
                         <Text style={styles.questStatusLabel}>Completed</Text>
                      ) : isFailed ? (
                         <Text style={styles.questStatusLabel}>Failed</Text>
                      ) : ( // Includes expired case where canAccept is false
                        <TouchableOpacity 
                          style={[styles.acceptButton, !canAccept && styles.acceptButtonDisabled ]}
                          onPress={() => handleAcceptQuest(questInfo)} // Pass full questInfo
                          disabled={!canAccept} 
                        >
                          <Text style={styles.acceptButtonText}>
                            {acceptButtonText} 
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })
              )}
            </ScrollView>
             <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => {
                    setIsQuestOverlayVisible(false); // Hide the overlay
                    setCurrentDiceRollResult(null); // Clear the specific roll result from title
                    setIsRolling(false); // Ensure rolling stops if overlay closed prematurely
                }}
            >
                <Text style={styles.closeButtonText}>Close</Text> 
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Dice Roller (Renders on top when visible) */} 
      <DiceRoller
        visible={isRolling}
        title={'Gather Information'} // Context for the roll
        onComplete={handleRollComplete}
        baseModifier={gatherModifier} // Pass the calculated modifier
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  actionButton: {
    position: 'absolute',
    backgroundColor: colors.surface,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.accentGold,
    minWidth: 100,
    alignItems: 'center',
  },
  actionButtonText: {
    color: colors.accentGold,
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 4,
    zIndex: 10,
  },
  backButtonText: {
    color: colors.ivoryWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Styles for Quest Results Overlay
  resultsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)', // Darker overlay
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  resultsContainer: {
    backgroundColor: colors.surface, // Use surface color
    borderRadius: 8,
    padding: spacing.md,
    width: '90%', 
    maxWidth: 600, // Max width for larger screens
    maxHeight: '80%', // Limit height
    borderWidth: 1,
    borderColor: colors.accentGold,
  },
  resultsTitle: {
    color: colors.accentGold,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  resultsScrollView: {
    flexGrow: 0, // Prevent ScrollView from taking all height initially
    marginBottom: spacing.md,
  },
  resultsText: {
    color: colors.ivoryWhite,
    fontSize: 16,
    textAlign: 'center',
  },
  questItem: {
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.steelGrey,
    padding: spacing.sm,
    borderRadius: 4,
  },
  questItemAccepted: {
    backgroundColor: colors.ashBlue, // Example: different background for accepted quests
    borderColor: colors.accentGold, // Example: different border
  },
  questItemFailed: { // Style for failed quests
    backgroundColor: colors.bloodRed, 
    opacity: 0.7,
  },
  questItemExpired: {
    backgroundColor: colors.steelGrey,
    opacity: 0.6,
  },
  questTitle: {
    color: colors.ivoryWhite,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  questDesc: {
    color: colors.fadedBeige,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  questDurationText: {
    color: colors.steelGrey,
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: spacing.xs,
  },
  questAcceptedLabel: { // Label for 'In Progress'
    color: colors.accentGold,
    fontSize: 14,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  questStatusLabel: { // Generic label for Completed/Failed
    color: colors.steelGrey,
    fontSize: 14,
    fontWeight: 'bold',
    fontStyle: 'italic',
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  acceptButton: {
    backgroundColor: colors.accentGold,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 4,
    alignSelf: 'flex-start', // Align button left
  },
  acceptButtonDisabled: { // Style for disabled accept button
    backgroundColor: colors.steelGrey,
    opacity: 0.6,
  },
  acceptButtonText: {
    color: colors.obsidianBlack,
    fontWeight: 'bold',
  },
  closeButton: {
     backgroundColor: colors.steelGrey,
     paddingVertical: spacing.sm,
     paddingHorizontal: spacing.md,
     borderRadius: 4,
     alignSelf: 'center',
  },
  closeButtonText: {
    color: colors.ivoryWhite,
    fontWeight: 'bold',
    fontSize: 16,
  },
  timeDisplayContainer: {
    position: 'absolute',
    top: spacing.md + 50, // Adjust as needed to not overlap back button
    left: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 4,
    zIndex: 10,
  },
  timeDisplayText: {
    color: colors.ivoryWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
  // --- ADDED: Styles for "Look for New Quests" Button ---
  lookForQuestsButton: {
    backgroundColor: colors.forestGreen, // Example color
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 4,
    alignSelf: 'center',
    marginBottom: spacing.md, // Space below button
    borderWidth: 1,
    borderColor: colors.ivoryWhite,
  },
  lookForQuestsButtonText: {
    color: colors.ivoryWhite,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

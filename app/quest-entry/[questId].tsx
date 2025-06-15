import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { allQuests } from '../../utils/quests';
import {
  Quest,
  QuestNode,
  QuestDecisionOption,
  QuestCheckOption,
  QuestBattleOption,
  QuestNarrativeOption,
  QuestReward,
} from '../../utils/questTypes';
import { Traits, completeQuest, failQuest, addGold, addXp, takeDamage } from '../../store/slices/playerSlice';
import { advanceTime } from '../../store/slices/gameSlice';
import DiceRoller, { TraitContribution } from '../../components/DiceRoller';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

// Path for require should be relative from this file: app/quest-entry/[questId].tsx to assets/
const REQUIRED_PLACEHOLDER_IMG = require('../../assets/images/menu_background.png');
const FADE_DURATION = 300;

// Get screen height for full height image - REMOVED as height: '100%' should work
// const screenHeight = Dimensions.get('window').height;

interface DiceRollPayload {
  option: QuestCheckOption;
  baseModifier: number;
  title: string;
}

export default function QuestEntryScreen() {
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const { questId } = useLocalSearchParams<{ questId: string }>();

  const playerTraits = useSelector((s: RootState) => s.player.traits);
  const gameTicks = useSelector((s: RootState) => s.game.ticks); // For quest completion/failure actions

  const [currentQuestData, setCurrentQuestData] = useState<Quest | null>(null);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [currentNode, setCurrentNode] = useState<QuestNode | null>(null);
  
  // Store the string URI from quest data, or undefined if it should use the placeholder
  const [imageStringUri, setImageStringUri] = useState<string | undefined>(undefined);

  const [isDiceRollerVisible, setIsDiceRollerVisible] = useState(false);
  const [diceRollPayload, setDiceRollPayload] = useState<DiceRollPayload | null>(null);

  const animationOpacity = useRef(new Animated.Value(0)).current;
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (questId) {
      const foundQuest = allQuests.find((q) => q.id === questId);
      if (foundQuest && 'nodes' in foundQuest && 'entryNodeId' in foundQuest) {
        const typedQuest = foundQuest as Quest;
        setCurrentQuestData(typedQuest);
        setCurrentNodeId(typedQuest.entryNodeId);
        setImageStringUri(typedQuest.img); // Set initial quest image URI

        Animated.timing(animationOpacity, {
          toValue: 1,
          duration: FADE_DURATION,
          useNativeDriver: true,
        }).start();
      } else {
        Alert.alert('Error', 'Quest not found or has invalid structure.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } else {
      Alert.alert('Error', 'No Quest ID provided.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  }, [questId, router, animationOpacity]);

  useEffect(() => {
    if (currentQuestData && currentNodeId) {
      const node = currentQuestData.nodes[currentNodeId];
      setCurrentNode(node || null);
      setImageStringUri(node?.img || currentQuestData.img);
      setActionFeedback(null);
      if (node && (node.nodeType === 'questComplete' || node.nodeType === 'questFail')) {
        setTimeout(() => handleTerminalNode(node), FADE_DURATION + 50);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestData, currentNodeId]);

  const triggerNodeTransition = useCallback((nextNodeId: string | null) => {
    if (!nextNodeId || isTransitioning) return;
    
    setIsTransitioning(true);
    Animated.timing(animationOpacity, {
      toValue: 0,
      duration: FADE_DURATION,
      useNativeDriver: true,
    }).start(() => {
      setCurrentNodeId(nextNodeId);
      Animated.timing(animationOpacity, {
        toValue: 1,
        duration: FADE_DURATION,
        useNativeDriver: true,
      }).start(() => {
        setIsTransitioning(false);
      });
    });
  }, [animationOpacity, isTransitioning]);

  const grantRewards = useCallback((rewards: QuestReward) => {
    if (rewards.xp && dispatch && typeof addXp === 'function') dispatch(addXp(rewards.xp));
    if (rewards.gold && dispatch && typeof addGold === 'function') dispatch(addGold(rewards.gold));
    // if (rewards.items && rewards.items.length > 0 && typeof dispatch === 'function' && typeof addItems === 'function') dispatch(addItems(rewards.items));
    // if (rewards.reputationChange && typeof dispatch === 'function' && typeof updateReputation === 'function') dispatch(updateReputation(rewards.reputationChange));
    console.log('Granted rewards:', rewards);
  }, [dispatch]);

  const handleTerminalNode = useCallback((node: QuestNode) => {
    if (!currentQuestData) return;
    if (node.nodeType === 'questComplete') {
      if (node.rewards) grantRewards(node.rewards);
      if (currentQuestData.reward) grantRewards(currentQuestData.reward);
      dispatch(completeQuest({ questId: currentQuestData.id, currentTick: gameTicks }));
    } else if (node.nodeType === 'questFail') {
      if (node.rewards) grantRewards(node.rewards);
      dispatch(failQuest({ questId: currentQuestData.id, currentTick: gameTicks }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestData, dispatch, gameTicks, grantRewards]);
  
  const handleCheckOption = (option: QuestCheckOption) => {
    const skillValue = playerTraits[option.skill] || 0;
    setDiceRollPayload({
        option,
        baseModifier: skillValue,
        title: `Check: ${option.description} (DC ${option.dc})`
    });
    setIsDiceRollerVisible(true);
  };

  const handleDiceRollComplete = (total: number, diceResult: number, faces: string[]) => {
    setIsDiceRollerVisible(false);
    if (!diceRollPayload || !currentQuestData) return;

    const { option } = diceRollPayload;
    dispatch(advanceTime());

    // The parent receives the results and determines what they mean
    const skillValue = playerTraits[option.skill] || 0;
    const success = total >= option.dc;
    const margin = total - option.dc; // How much over/under the DC
    
    let nextNodeId: string;
    let feedback = `Rolled ${total} vs DC ${option.dc} (${success ? 'Success' : 'Failure'})`;
    
    // Different outcomes based on dice results and skill check context
    if (success) {
      feedback += ' - Success!';
      nextNodeId = option.successOutcome;
      
      // Critical success on natural +3 or +4 dice result
      if (diceResult >= 3) {
        feedback += ' Critical success! (Natural +' + diceResult + ')';
        // Could add bonus rewards or different outcomes here
      }
      
      // Marginal success - just barely made it
      if (margin <= 1) {
        feedback += ' (Barely made it)';
      }
    } else {
      feedback += ' - Failure!';
      nextNodeId = option.failureOutcome;
      
      // Critical failure on natural -3 or -4 dice result  
      if (diceResult <= -3) {
        feedback += ' Critical failure! (Natural ' + diceResult + ')';
        // Could add extra consequences here
      }
      
      if (option.failureConsequence) {
        feedback += ` ${option.failureConsequence.description || ''}`;
        if (option.failureConsequence.damage) {
          dispatch(takeDamage(option.failureConsequence.damage));
          feedback += ` You take ${option.failureConsequence.damage} damage.`;
        }
      }
    }
    
    setActionFeedback(feedback);
    
    const targetNode = currentQuestData.nodes[nextNodeId];
    if(targetNode?.rewards) grantRewards(targetNode.rewards);

    triggerNodeTransition(nextNodeId);
    setDiceRollPayload(null);
  };

  const handleBattleOption = (option: QuestBattleOption) => {
    if (!currentQuestData) return;

    let battleAlertMessage = `Battle! Facing Enemy: ${option.enemyPartyId}!`;
    if (option.playerAdvantage === 'ambush') {
      battleAlertMessage = `Battle! Ambushing Enemy: ${option.enemyPartyId}!`;
    } else if (option.playerAdvantage === 'ambushed') {
      battleAlertMessage = `Battle! Ambushed by Enemy: ${option.enemyPartyId}!`;
    }
    
    // Set action feedback for UI update before alert
    setActionFeedback(`Initiating battle with ${option.enemyPartyId}. Advantage: ${option.playerAdvantage || 'none'}.`);
    console.log('Battle initiated:', option);

    // Use Alert for placeholder
    Alert.alert('Battle System Engage', battleAlertMessage + '\n\n(Battle system not yet implemented. Assuming player victory for quest progression.)', [
        { text: 'Proceed (Victory)', onPress: () => {
            dispatch(advanceTime(5)); // Example time advance
            const targetNode = currentQuestData.nodes[option.outcome];
            if(targetNode?.rewards) grantRewards(targetNode.rewards);
            triggerNodeTransition(option.outcome);
        }}
    ]);
  };

  const handleNarrativeOption = (option: QuestNarrativeOption) => {
    if (!currentQuestData) return;
    dispatch(advanceTime());
    const targetNode = currentQuestData.nodes[option.outcome];
    if(targetNode?.rewards) grantRewards(targetNode.rewards);
    triggerNodeTransition(option.outcome);
  };
  
  const handleQuestLinkOption = (node: QuestNode) => {
    if (!node.linkedQuestId || !currentQuestData) return;
    Alert.alert('Quest Link', `This quest leads to: ${node.linkedQuestId}. You may need to find its new location or it might start immediately.`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  }

  const handleOptionClick = (option: QuestDecisionOption) => {
    if (isTransitioning) return;
    switch (option.type) {
      case 'check': handleCheckOption(option as QuestCheckOption); break;
      case 'battle': handleBattleOption(option as QuestBattleOption); break;
      case 'narrative': handleNarrativeOption(option as QuestNarrativeOption); break;
      default: console.warn('Unknown option type:', option);
    }
  };

  if (!currentQuestData || !currentNode) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading Quest Details...</Text>
      </View>
    );
  }
  
  if ((currentNode.nodeType === 'questComplete' || currentNode.nodeType === 'questFail') && currentNode.options.length === 0) {
    return (
      <Animated.View style={[styles.outerContainer, { opacity: animationOpacity }]}>
        <View style={styles.imageContainer}>
          <Image
            source={imageStringUri ? { uri: imageStringUri } : REQUIRED_PLACEHOLDER_IMG}
            style={styles.questImage}
            onError={() => setImageStringUri(undefined)}
          />
        </View>
        <ScrollView 
          style={styles.scrollableContentContainer} 
          contentContainerStyle={styles.scrollableContentInnerContainer}
        >
          <Text style={styles.title}>{currentQuestData.title}</Text>
          {currentNode.title && <Text style={styles.nodeTitle}>{currentNode.title}</Text>}
          <View style={styles.separator} />
          <Text style={styles.description}>{currentNode.description}</Text>
          {actionFeedback && <Text style={styles.feedbackText}>{actionFeedback}</Text>}
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>{currentNode.nodeType === 'questComplete' ? 'Complete Quest' : 'Acknowledge Failure'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    );
  } else if (currentNode.nodeType === 'linkToQuest') {
    return (
      <Animated.View style={[styles.outerContainer, { opacity: animationOpacity }]}>
        <View style={styles.imageContainer}>
          <Image
            source={imageStringUri ? { uri: imageStringUri } : REQUIRED_PLACEHOLDER_IMG}
            style={styles.questImage}
            onError={() => setImageStringUri(undefined)}
          />
        </View>
        <ScrollView 
          style={styles.scrollableContentContainer} 
          contentContainerStyle={styles.scrollableContentInnerContainer}
        >
          <Text style={styles.title}>{currentQuestData.title}</Text>
          {currentNode.title && <Text style={styles.nodeTitle}>{currentNode.title}</Text>}
          <View style={styles.separator} />
          <Text style={styles.description}>{currentNode.description}</Text>
          <TouchableOpacity style={styles.button} onPress={() => handleQuestLinkOption(currentNode)}>
            <Text style={styles.buttonText}>Continue to Next Quest</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.outerContainer, { opacity: animationOpacity }]}>
      <View style={styles.imageContainer}>
        <Image
          source={imageStringUri ? { uri: imageStringUri } : REQUIRED_PLACEHOLDER_IMG}
          style={styles.questImage}
          onError={() => setImageStringUri(undefined)}
        />
      </View>
      <ScrollView 
        style={styles.scrollableContentContainer}
        contentContainerStyle={styles.scrollableContentInnerContainer}
      >
        <Text style={styles.title}>{currentQuestData.title}</Text>
        {currentNode.title && <Text style={styles.nodeTitle}>{currentNode.title}</Text>}
        <View style={styles.separator} />
        <Text style={styles.description}>{currentNode.description}</Text>

        {actionFeedback && <Text style={styles.feedbackText}>{actionFeedback}</Text>}

        <View style={styles.optionsContainer}>
          {currentNode.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.button}
              onPress={() => handleOptionClick(option)}
              disabled={isTransitioning}
            >
              <Text style={styles.buttonText}>{option.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {isDiceRollerVisible && diceRollPayload && (
        <DiceRoller
          visible={isDiceRollerVisible}
          title={diceRollPayload.title}
          traitContributions={[
            { 
              name: diceRollPayload.option.skill.charAt(0).toUpperCase() + diceRollPayload.option.skill.slice(1), 
              value: playerTraits[diceRollPayload.option.skill] || 0 
            }
          ]}
          onComplete={handleDiceRollComplete}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // scrollContainer: { // REMOVED as unused
  //   flexGrow: 1,
  // },
  container: { // This style might be deprecated by outerContainer or need to be reviewed
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.obsidianBlack,
  },
  outerContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.obsidianBlack,
    // No padding here, padding will be in content part
  },
  imageContainer: {
    width: '35%', // Fixed width for image column
    height: '100%', // Full height
    backgroundColor: colors.steelGrey, // BG for the container itself
    justifyContent: 'center', // Center image if it's smaller, or for placeholder
    alignItems: 'center',
  },
  questImage: {
    width: '100%',
    height: '100%', // Image takes full height of its container
    resizeMode: 'cover',
    // No borderRadius here if we want edge-to-edge on its column
  },
  scrollableContentContainer: {
    flex: 1, // Takes remaining width
  },
  scrollableContentInnerContainer: {
    padding: spacing.md, // Add padding here now
    flexGrow: 1, // Ensure it can grow if content is short
  },
  contentContainer: { // This is now replaced by scrollableContentContainer and scrollableContentInnerContainer
    flex: 2, 
    flexDirection: 'column',
  },
  loadingText: {
    fontSize: 18,
    color: colors.ivoryWhite,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.accentGold,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  nodeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.ivoryWhite,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  separator: {
    height: 1,
    backgroundColor: colors.steelGrey,
    marginVertical: spacing.md,
  },
  description: {
    fontSize: 16,
    color: colors.fadedBeige,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  optionsContainer: {
    marginTop: spacing.md,
  },
  button: {
    backgroundColor: colors.bloodRed,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: spacing.sm,
    marginBottom: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accentGold,
  },
  buttonText: {
    color: colors.ivoryWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
  feedbackText: {
    color: colors.fadedBeige,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: spacing.md,
    fontStyle: 'italic',
  }
}); 
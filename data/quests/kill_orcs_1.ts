import { Quest } from '../../utils/questTypes';

const PLACEHOLDER_IMG = '../../assets/images/menu_background.png';

export const killOrcs1: Quest = {
  id: 'kill_orcs_1',
  title: 'Orc Troubles (Node-Based)',
  description: 'Orcs have established a camp nearby. Investigate and deal with the threat.',
  img: PLACEHOLDER_IMG,
  rarity: 1,
  targetTileType: 'plains',
  duration: 200,
  maxDistance: 10,
  reward: { gold: 100, xp: 75, reputationChange: 2 },
  entryNodeId: 'start_approach',
  nodes: {
    'start_approach': {
      id: 'start_approach',
      title: 'Approach the Orc Camp',
      description: 'You spot a crude orc encampment ahead, smoke curling from a central fire. Two brutish orc sentries guard the perimeter. How do you proceed?',
      img: PLACEHOLDER_IMG,
      options: [
        {
          type: 'check',
          description: 'Attempt to sneak past the sentries (Stealth DC 12)',
          skill: 'stealth',
          dc: 12,
          successOutcome: 'inside_camp_stealthy',
          failureOutcome: 'detected_by_sentries',
          failureConsequence: {
            description: 'One of the orcs spots a flicker of movement and barks an alarm!'
          }
        },
        {
          type: 'check',
          description: 'Try to create a diversion to draw them away (Intelligence DC 10)',
          skill: 'intelligence',
          dc: 10,
          successOutcome: 'diversion_successful',
          failureOutcome: 'diversion_failed',
        },
        {
          type: 'battle',
          description: 'Charge the sentries head-on!',
          enemyPartyId: 'orc_sentry_pair',
          playerAdvantage: 'none',
          outcome: 'post_sentry_battle_direct',
        },
        {
          type: 'narrative',
          description: 'Observe from a distance for a while longer (Perception DC 8 for more info)',
          outcome: 'observing_further',
        },
      ],
    },
    'observing_further': {
      id: 'observing_further',
      title: 'Extended Observation',
      description: 'After watching for a while, you notice a less-guarded path around the eastern flank. The orcs seem overconfident and poorly disciplined.',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 5 },
      options: [
        {
          type: 'check',
          description: 'Use the eastern flank (Stealth DC 10)',
          skill: 'stealth',
          dc: 10,
          successOutcome: 'inside_camp_stealthy',
          failureOutcome: 'detected_by_sentries',
        },
        {
          type: 'narrative',
          description: 'Return to previous options.',
          outcome: 'start_approach',
        }
      ]
    },
    'detected_by_sentries': {
      id: 'detected_by_sentries',
      title: 'Spotted!',
      description: 'The orcs roar and charge towards you, weapons raised! They seem to have caught you off guard.',
      img: PLACEHOLDER_IMG,
      options: [
        {
          type: 'battle',
          description: 'Defend yourself!',
          enemyPartyId: 'orc_sentry_pair_alerted',
          playerAdvantage: 'ambushed',
          outcome: 'post_sentry_battle_alarmed',
        },
      ],
    },
    'diversion_successful': {
      id: 'diversion_successful',
      title: 'Diversion Successful',
      description: 'Your clever diversion pulls the sentries away from their posts, investigating the disturbance! The way into the camp is momentarily clear.',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 10 },
      options: [
        {
          type: 'narrative',
          description: 'Quickly slip into the camp.',
          outcome: 'inside_camp_diversion',
        },
      ],
    },
    'diversion_failed': {
      id: 'diversion_failed',
      title: 'Diversion Failed',
      description: 'The orcs briefly look towards your diversion but quickly dismiss it, their attention returning to their posts. One of them seems to be looking your way with suspicion.',
      img: PLACEHOLDER_IMG,
      options: [
        {
          type: 'narrative',
          description: 'Re-evaluate your approach.',
          outcome: 'start_approach',
        },
         {
          type: 'check',
          description: 'Try to bluff your way through (Persuade DC 14)',
          skill: 'persuade',
          dc: 14,
          successOutcome: 'bluff_success_temp',
          failureOutcome: 'detected_by_sentries',
        },
      ],
    },
    'bluff_success_temp': {
      id: 'bluff_success_temp',
      title: 'Bluff Temporarily Succeeds',
      description: 'Amazingly, your fast talk seems to confuse the orcs for a moment, but they remain wary.',
      img: PLACEHOLDER_IMG,
      options: [
          {
              type: 'narrative',
              description: 'Press your advantage and enter the camp.',
              outcome: 'inside_camp_bluff',
          }
      ]
    },
    'post_sentry_battle_direct': {
      id: 'post_sentry_battle_direct',
      title: 'Sentries Defeated',
      description: 'The orc sentries lie defeated. The way is clear, though the sounds of battle might have alerted others.',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 20, gold: 10 },
      options: [
        {
          type: 'narrative',
          description: 'Enter the main camp.',
          outcome: 'main_camp_investigation', 
        },
      ],
    },
    'post_sentry_battle_alarmed': {
      id: 'post_sentry_battle_alarmed',
      title: 'Sentries Defeated (Alarm Raised)',
      description: 'You managed to defeat the alerted sentries, but the camp is now undoubtedly aware of your presence.',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 15, gold: 5 },
      options: [
        {
          type: 'narrative',
          description: 'Prepare for more resistance and enter the main camp.',
          outcome: 'main_camp_high_alert',
        },
      ],
    },
    'inside_camp_stealthy': {
      id: 'inside_camp_stealthy',
      title: 'Inside the Camp (Stealthy)',
      description: 'You are inside the orc camp, undetected. You can see the Chieftain near the central fire, and several other orcs milling about. What is your next move?',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 25 },
      options: [
        {
          type: 'check',
          description: 'Attempt to assassinate the Chieftain (Stealth DC 15 vs Chieftain Perception)',
          skill: 'stealth', 
          dc: 15, 
          successOutcome: 'chieftain_assassinated',
          failureOutcome: 'assassination_failed_detected',
        },
        {
          type: 'narrative',
          description: 'Sabotage their supplies.',
          outcome: 'sabotage_supplies_node',
        },
        {
          type: 'battle',
          description: 'Launch a surprise attack on the Chieftain and his guards!',
          enemyPartyId: 'orc_chieftain_group', 
          playerAdvantage: 'ambush',
          outcome: 'battle_won_camp_cleared',
        },
      ],
    },
    'inside_camp_diversion': {
      id: 'inside_camp_diversion',
      title: 'Inside the Camp (Diversion)',
      description: 'Thanks to your diversion, you slip into the camp. The atmosphere is a little chaotic. The Chieftain is near the fire.',
      img: PLACEHOLDER_IMG,
      options: [
         {
          type: 'check',
          description: 'Take advantage of the chaos to strike the Chieftain (Stealth DC 13)',
          skill: 'stealth', 
          dc: 13, 
          successOutcome: 'chieftain_assassinated',
          failureOutcome: 'assassination_failed_detected',
        },
        {
          type: 'battle',
          description: 'Attack the Chieftain now!',
          enemyPartyId: 'orc_chieftain_group_distracted', 
          playerAdvantage: 'none',
          outcome: 'battle_won_camp_cleared',
        },
      ]
    },
    'inside_camp_bluff': {
      id: 'inside_camp_bluff',
      title: 'Inside the Camp (Bluff)',
      description: 'You\'ve bluffed your way in, but the orcs are watching you. You need to act decisively.',
      img: PLACEHOLDER_IMG,
      options: [
           {
              type: 'narrative',
              description: 'Try to talk to the Chieftain (Persuade DC 16)',
              outcome: 'talk_to_chieftain_attempt',
           },
           {
              type: 'battle',
              description: 'No time for talk, attack!',
              enemyPartyId: 'orc_chieftain_group_suspicious',
              playerAdvantage: 'none',
              outcome: 'battle_won_camp_cleared',
           }
      ]
    },
    'main_camp_investigation': {
      id: 'main_camp_investigation',
      title: 'Main Camp Area',
      description: 'You enter the main area of the camp. The Chieftain glares at you. Other orcs look ready for a fight.',
      img: PLACEHOLDER_IMG,
      options: [
          {
              type: 'battle',
              description: 'Challenge the Chieftain!',
              enemyPartyId: 'orc_chieftain_group',
              playerAdvantage: 'none',
              outcome: 'battle_won_camp_cleared',
          }
      ]
    },
    'main_camp_high_alert': {
      id: 'main_camp_high_alert',
      title: 'Main Camp (High Alert)',
      description: 'The camp is in an uproar! Orcs are swarming, and the Chieftain bellows for your head.',
      img: PLACEHOLDER_IMG,
      options: [
          {
              type: 'battle',
              description: 'Fight your way through!',
              enemyPartyId: 'orc_chieftain_group_alerted',
              playerAdvantage: 'ambushed',
              outcome: 'battle_won_camp_cleared',
          }
      ]
    },
    'chieftain_assassinated': {
      id: 'chieftain_assassinated',
      title: 'Chieftain Slain!',
      description: 'You successfully eliminate the Orc Chieftain! The remaining orcs, leaderless, quickly scatter and flee.',
      img: PLACEHOLDER_IMG,
      nodeType: 'questComplete',
      rewards: { xp: 50, gold: 50, items: ['chieftains_axe_id'] },
      options: []
    },
    'assassination_failed_detected': {
      id: 'assassination_failed_detected',
      title: 'Assassination Failed!',
      description: 'Your attempt on the Chieftain fails! He roars in anger, and all eyes in the camp turn to you. Prepare for a tough fight!',
      img: PLACEHOLDER_IMG,
      options: [
        {
          type: 'battle',
          description: 'Fight for your life!',
          enemyPartyId: 'orc_chieftain_group_alerted_boss_focus', 
          playerAdvantage: 'ambushed',
          outcome: 'battle_won_camp_cleared',
        },
      ]
    },
     'sabotage_supplies_node': {
      id: 'sabotage_supplies_node',
      title: 'Sabotage Supplies',
      description: 'You find their meager supplies of food and weapons. You could poison the food or destroy the weapons.',
      img: PLACEHOLDER_IMG,
      options: [
          {
              type: 'check',
              description: 'Poison the food (Craft DC 12 with herbs, Intelligence DC 15 without)',
              skill: 'intelligence',
              dc: 15,
              successOutcome: 'food_poisoned',
              failureOutcome: 'poisoning_failed',
          },
          {
              type: 'check',
              description: 'Destroy the weapons (Strength DC 14)',
              skill: 'str',
              dc: 14,
              successOutcome: 'weapons_destroyed',
              failureOutcome: 'sabotage_detected',
          }
      ]
    },
    'food_poisoned': {
      id: 'food_poisoned',
      title: 'Supplies Poisoned',
      description: 'You successfully contaminate their food stores. This will weaken them considerably.',
      img: PLACEHOLDER_IMG,
      rewards: {xp: 30, reputationChange: -1},
      nodeType: 'questComplete',
      options: []
    },
    'poisoning_failed': {
      id: 'poisoning_failed',
      title: 'Poisoning Failed',
      description: 'Your attempt to poison the food stores failed. The orcs are still vulnerable.',
      img: PLACEHOLDER_IMG,
      options: [
        {
          type: 'narrative',
          description: 'Re-evaluate your approach.',
          outcome: 'start_approach',
        },
      ]
    },
    'weapons_destroyed': {
      id: 'weapons_destroyed',
      title: 'Weapons Destroyed',
      description: 'You manage to break many of their crude weapons. They will be less effective in a fight.',
      img: PLACEHOLDER_IMG,
      rewards: {xp: 30},
      nodeType: 'questComplete',
      options: []
    },
    'sabotage_detected': {
      id: 'sabotage_detected',
      title: 'Sabotage Detected!',
      description: 'An orc stumbles upon you as you meddle with their supplies!',
      img: PLACEHOLDER_IMG,
      options: [
        {
          type: 'battle',
          description: 'Fight!',
          enemyPartyId: 'orc_guard_pair_suspicious',
          playerAdvantage: 'ambushed',
          outcome: 'main_camp_high_alert',
        }
      ]
    },
    'talk_to_chieftain_attempt': {
      id: 'talk_to_chieftain_attempt',
      title: 'Audience with the Chieftain',
      description: 'The Orc Chieftain, a hulking brute with a scarred face, listens to you with a sneer. "State your business, smoothskin, before I lose my patience." ',
      img: PLACEHOLDER_IMG,
      options: [
          {
              type: 'narrative',
              description: '"I come to offer a trade." (Leads to further dialogue/checks)',
              outcome: 'negotiation_path_trade',
          },
          {
              type: 'narrative',
              description: '"Leave these lands, or face destruction!" (Intimidation - likely leads to fight)',
              outcome: 'negotiation_path_threaten',
          },
          {
              type: 'narrative',
              description: '"Nevermind." (Attempt to leave peacefully)',
              outcome: 'flee_encounter_fail_node',
          }
      ]
    },
    'negotiation_path_trade': {
      id: 'negotiation_path_trade',
      description: '"Trade? Orcs have little need for flimsy human trinkets!" the Chieftain scoffs. (Persuade DC 18 to convince him otherwise, or offer a valuable item).',
      img: PLACEHOLDER_IMG,
      options: [
          {
              type: 'check',
              skill: 'persuade',
              dc: 18,
              description: 'Attempt to persuade him of mutual benefit.',
              successOutcome: 'trade_successful_node',
              failureOutcome: 'negotiation_fails_fight_node'
          },
          {
              type: 'narrative',
              description: 'Offer a specific valuable item (if player has one - this needs inventory check logic).',
              outcome: 'offer_item_node'
          }
      ]
    },
    'negotiation_path_threaten': {
      id: 'negotiation_path_threaten',
      description: 'The Chieftain laughs, a harsh, grating sound. "You threaten ME? In MY camp? Bold. Foolish!" ',
      img: PLACEHOLDER_IMG,
      options: [
          {
              type: 'battle',
              description: 'So be it! (Fight the Chieftain and his guards)',
              enemyPartyId: 'orc_chieftain_group_provoked',
              playerAdvantage: 'none',
              outcome: 'battle_won_camp_cleared'
          }
      ]
    },
    'battle_won_camp_cleared': {
      id: 'battle_won_camp_cleared',
      title: 'Victory!',
      description: 'The Orc Chieftain and his main forces are defeated! The remaining few scatter into the wilderness. The camp is yours.',
      img: PLACEHOLDER_IMG,
      nodeType: 'questComplete',
      rewards: { xp: 40, gold: 30 },
      options: []
    },
    'flee_encounter_fail_node': {
      id: 'flee_encounter_fail_node',
      title: 'Failed Retreat',
      description: 'You tried to leave, but the orcs were not willing to let you go so easily.',
      img: PLACEHOLDER_IMG,
      nodeType: 'questFail',
      options: [] 
    },
     'trade_successful_node': {
      id: 'trade_successful_node',
      title: 'Trade Agreement',
      description: 'Against all odds, you manage to strike a bargain with the Orc Chieftain. He agrees to move his warband further into the mountains in exchange for your offered goods/promises.',
      img: PLACEHOLDER_IMG,
      nodeType: 'questComplete',
      rewards: { xp: 60, gold: -20, reputationChange: 1 },
      options: []
    },
    'negotiation_fails_fight_node': {
      id: 'negotiation_fails_fight_node',
      title: 'Negotiations Break Down',
      description: 'Your attempts at diplomacy fail. The Chieftain orders his warriors to attack!',
      img: PLACEHOLDER_IMG,
      options: [
           {
              type: 'battle',
              description: 'Defend yourself!',
              enemyPartyId: 'orc_chieftain_group_provoked',
              playerAdvantage: 'ambushed',
              outcome: 'battle_won_camp_cleared'
          }
      ]
    },
    'offer_item_node': {
        id: 'offer_item_node',
        title: 'Offer Item',
        description: 'You consider offering an item from your inventory... (This would need UI to select item and specific logic based on item value to orcs). For now, this path is a dead end in this example.',
        img: PLACEHOLDER_IMG,
        options: [
            {
                type: 'narrative',
                description: 'Decide against it and return to other negotiation tactics.',
                outcome: 'negotiation_path_trade'
            }
        ]
    }
  }
}; 
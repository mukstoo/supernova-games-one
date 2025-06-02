import { Quest } from '../../utils/questTypes';

const PLACEHOLDER_IMG = '../../assets/images/menu_background.png';

export const missingCaravan1: Quest = {
  id: 'missing_caravan_1',
  title: 'The Lost Merchants',
  description: 'A trading caravan has vanished in the mountain passes. Investigate their disappearance.',
  img: PLACEHOLDER_IMG,
  rarity: 3,
  targetTileType: 'mountains',
  duration: 180,
  maxDistance: 8,
  reward: { gold: 40, xp: 25, reputationChange: 2 },
  entryNodeId: 'start_missing_caravan',
  nodes: {
    'start_missing_caravan': {
      id: 'start_missing_caravan',
      title: 'The Worried Merchant Guild',
      description: 'Guild Master Elena approaches you with concern etched on her face. "A valuable caravan carrying rare silks and spices left for the mountain trading post five days ago. They should have returned by now, but there\'s been no word. The route is dangerous - bandits, wild animals, treacherous weather. Will you investigate?"',
      img: PLACEHOLDER_IMG,
      options: [
        {
          type: 'narrative',
          description: 'Accept the investigation immediately.',
          outcome: 'quick_investigation_start',
        },
        {
          type: 'narrative',
          description: 'Ask for details about the caravan and cargo.',
          outcome: 'caravan_details_inquiry',
        },
        {
          type: 'check',
          description: 'Assess the Guild Master\'s concern level (Perception DC 8).',
          skill: 'perception',
          dc: 8,
          successOutcome: 'notice_hidden_worry',
          failureOutcome: 'surface_level_concern',
        },
        {
          type: 'narrative',
          description: 'Ask about payment for the investigation.',
          outcome: 'negotiate_investigation_fee',
        },
        {
          type: 'check',
          description: 'Inquire about recent bandit activity (Smarts DC 10).',
          skill: 'smr',
          dc: 10,
          successOutcome: 'bandit_intelligence_gathered',
          failureOutcome: 'general_bandit_info',
        },
        {
          type: 'narrative',
          description: 'Ask to speak with other merchants who use that route.',
          outcome: 'merchant_interviews',
        },
        {
          type: 'narrative',
          description: 'Decline the investigation.',
          outcome: 'decline_caravan_mission',
        }
      ]
    },
    'caravan_details_inquiry': {
      id: 'caravan_details_inquiry',
      title: 'Gathering Intelligence',
      description: 'The Guild Master provides crucial details. "The caravan was led by Merchant Roderick, a veteran trader. They carried exotic silks worth a fortune, plus rare mountain spices. The route goes through Eagle\'s Pass - narrow, winding, with several spots perfect for ambushes."',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 5 },
      options: [
        {
          type: 'check',
          description: 'Ask about Roderick\'s experience and reputation (Persuade DC 8).',
          skill: 'persuade',
          dc: 8,
          successOutcome: 'roderick_background_revealed',
          failureOutcome: 'basic_roderick_info',
        },
        {
          type: 'narrative',
          description: 'Request a map of the route they took.',
          outcome: 'route_map_obtained',
        },
        {
          type: 'check',
          description: 'Inquire about the exact value of the cargo (Smarts DC 10).',
          skill: 'smr',
          dc: 10,
          successOutcome: 'cargo_value_learned',
          failureOutcome: 'general_cargo_info',
        },
        {
          type: 'narrative',
          description: 'Ask about other travelers who might have seen them.',
          outcome: 'witness_search_begins',
        }
      ]
    },
    'notice_hidden_worry': {
      id: 'notice_hidden_worry',
      title: 'Reading Between the Lines',
      description: 'Your perceptive eye catches subtle signs: the Guild Master\'s hands tremble slightly when mentioning the cargo, she avoids eye contact when discussing the route, and there are expense ledgers hastily shuffled aside. This isn\'t just about a missing caravan - there\'s something more at stake.',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 8 },
      options: [
        {
          type: 'check',
          description: 'Press gently about what she\'s not telling you (Persuade DC 12).',
          skill: 'persuade',
          dc: 12,
          successOutcome: 'guild_secret_revealed',
          failureOutcome: 'guild_deflection',
        },
        {
          type: 'narrative',
          description: 'Note the suspicious behavior but don\'t confront her yet.',
          outcome: 'mental_note_suspicion',
        },
        {
          type: 'check',
          description: 'Try to glimpse the hastily hidden documents (Perception DC 11).',
          skill: 'perception',
          dc: 11,
          successOutcome: 'financial_documents_spotted',
          failureOutcome: 'documents_too_well_hidden',
        }
      ]
    },
    'surface_level_concern': {
      id: 'surface_level_concern',
      title: 'Standard Worry',
      description: 'The Guild Master seems genuinely concerned about the missing merchants, but you don\'t pick up on any deeper nuances.',
      img: PLACEHOLDER_IMG,
      options: [
        {
          type: 'narrative',
          description: 'Ask for more details about the caravan.',
          outcome: 'caravan_details_inquiry',
        },
        {
          type: 'narrative',
          description: 'Begin the investigation immediately.',
          outcome: 'quick_investigation_start',
        }
      ]
    },
    'negotiate_investigation_fee': {
      id: 'negotiate_investigation_fee',
      title: 'Discussing Terms',
      description: 'The Guild Master nods. "Of course, this is business. The Guild can offer standard rates, plus a bonus if you recover the cargo intact. Or perhaps you\'d prefer a share of any recovered goods?"',
      img: PLACEHOLDER_IMG,
      options: [
        {
          type: 'check',
          description: 'Negotiate for a higher base fee (Persuade DC 10).',
          skill: 'persuade',
          dc: 10,
          successOutcome: 'higher_fee_secured',
          failureOutcome: 'standard_fee_offered',
        },
        {
          type: 'narrative',
          description: 'Accept a percentage of recovered goods instead.',
          outcome: 'percentage_deal_accepted',
        },
        {
          type: 'check',
          description: 'Ask for upfront payment plus recovery bonus (Persuade DC 14).',
          skill: 'persuade',
          dc: 14,
          successOutcome: 'premium_contract_secured',
          failureOutcome: 'negotiation_failed',
        },
        {
          type: 'narrative',
          description: 'Accept standard terms and begin investigation.',
          outcome: 'standard_contract_accepted',
        }
      ]
    },
    'bandit_intelligence_gathered': {
      id: 'bandit_intelligence_gathered',
      title: 'Bandit Activity Analysis',
      description: 'Your knowledge reveals important patterns. "The Iron Wolves have been increasingly active in that region. They\'re organized, well-armed, and led by someone called \'The Mountain Shadow.\' They prefer to strike at the narrowest part of Eagle\'s Pass."',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 10 },
      options: [
        {
          type: 'check',
          description: 'Ask about The Mountain Shadow\'s tactics (Smarts DC 12).',
          skill: 'smr',
          dc: 12,
          successOutcome: 'shadow_tactics_learned',
          failureOutcome: 'basic_shadow_info',
        },
        {
          type: 'narrative',
          description: 'Request information about Iron Wolves hideouts.',
          outcome: 'hideout_intelligence_search',
        },
        {
          type: 'narrative',
          description: 'Focus on investigating the specific route.',
          outcome: 'route_focused_investigation',
        }
      ]
    },
    'general_bandit_info': {
      id: 'general_bandit_info',
      title: 'Basic Bandit Knowledge',
      description: 'You know there have been some bandit attacks in the mountains, but don\'t have specific intelligence about current groups or their methods.',
      img: PLACEHOLDER_IMG,
      options: [
        {
          type: 'narrative',
          description: 'Proceed with the investigation anyway.',
          outcome: 'uninformed_investigation_start',
        },
        {
          type: 'narrative',
          description: 'Ask to speak with other merchants first.',
          outcome: 'merchant_interviews',
        }
      ]
    },
    'merchant_interviews': {
      id: 'merchant_interviews',
      title: 'Speaking with Fellow Traders',
      description: 'You\'re introduced to several merchants who regularly use the mountain routes. They gather around, eager to share information about their missing colleague.',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 3 },
      options: [
        {
          type: 'check',
          description: 'Ask about recent unusual activity on the routes (Persuade DC 7).',
          skill: 'persuade',
          dc: 7,
          successOutcome: 'unusual_activity_reported',
          failureOutcome: 'standard_route_reports',
        },
        {
          type: 'check',
          description: 'Inquire about Roderick\'s habits and schedule (Perception DC 9).',
          skill: 'perception',
          dc: 9,
          successOutcome: 'roderick_habits_revealed',
          failureOutcome: 'surface_roderick_info',
        },
        {
          type: 'narrative',
          description: 'Ask if anyone has traveled the route recently.',
          outcome: 'recent_traveler_search',
        }
      ]
    },
    'route_focused_investigation': {
      id: 'route_focused_investigation',
      title: 'To Eagle\'s Pass',
      description: 'Armed with intelligence about bandit activity, you set out for the mountain route. The path winds upward through rocky terrain, with several places where a caravan could be ambushed or hidden.',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 5 },
      options: [
        {
          type: 'check',
          description: 'Search for tracks or signs of passage (Survival DC 8).',
          skill: 'survival',
          dc: 8,
          successOutcome: 'caravan_tracks_found',
          failureOutcome: 'no_obvious_tracks',
        },
        {
          type: 'check',
          description: 'Look for signs of ambush or struggle (Perception DC 10).',
          skill: 'perception',
          dc: 10,
          successOutcome: 'ambush_evidence_discovered',
          failureOutcome: 'peaceful_route_appearance',
        },
        {
          type: 'narrative',
          description: 'Head directly to the narrowest part of the pass.',
          outcome: 'narrow_pass_investigation',
        },
        {
          type: 'check',
          description: 'Check for alternate routes or hidden paths (Survival DC 12).',
          skill: 'survival',
          dc: 12,
          successOutcome: 'hidden_path_discovered',
          failureOutcome: 'main_route_only',
        }
      ]
    },
    'caravan_tracks_found': {
      id: 'caravan_tracks_found',
      title: 'Trail Evidence',
      description: 'Your tracking skills reveal clear signs: wagon wheel ruts, horse hoofprints, and scattered droppings. The tracks head up the main path but seem to deviate near a rocky outcropping.',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 8 },
      options: [
        {
          type: 'check',
          description: 'Follow the deviation to see where it leads (Survival DC 9).',
          skill: 'survival',
          dc: 9,
          successOutcome: 'deviation_path_followed',
          failureOutcome: 'deviation_path_lost',
        },
        {
          type: 'check',
          description: 'Examine the tracks more closely for clues (Perception DC 10).',
          skill: 'perception',
          dc: 10,
          successOutcome: 'detailed_track_analysis',
          failureOutcome: 'basic_track_info',
        },
        {
          type: 'narrative',
          description: 'Continue following the main trail.',
          outcome: 'main_trail_continuation',
        }
      ]
    },
    'ambush_evidence_discovered': {
      id: 'ambush_evidence_discovered',
      title: 'Signs of Violence',
      description: 'Your keen eye spots disturbing evidence: scuffed ground suggesting a struggle, a few torn pieces of fabric caught on rocks, and what looks like dried blood on some stones. This was definitely not a peaceful disappearance.',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 12 },
      options: [
        {
          type: 'check',
          description: 'Analyze the blood stains to determine what happened (Smarts DC 11).',
          skill: 'smr',
          dc: 11,
          successOutcome: 'blood_analysis_success',
          failureOutcome: 'blood_analysis_unclear',
        },
        {
          type: 'check',
          description: 'Search for weapons or dropped items (Perception DC 9).',
          skill: 'perception',
          dc: 9,
          successOutcome: 'evidence_items_found',
          failureOutcome: 'no_items_found',
        },
        {
          type: 'narrative',
          description: 'Look for where the attackers might have taken the caravan.',
          outcome: 'attacker_trail_search',
        },
        {
          type: 'check',
          description: 'Try to count how many attackers were involved (Survival DC 10).',
          skill: 'survival',
          dc: 10,
          successOutcome: 'attacker_count_estimated',
          failureOutcome: 'attacker_count_unclear',
        }
      ]
    },
    'hidden_path_discovered': {
      id: 'hidden_path_discovered',
      title: 'Secret Route',
      description: 'Your survival instincts lead you to a concealed trail that branches off the main route. It\'s well-hidden but shows recent signs of use - wagon wheels have passed this way.',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 15 },
      options: [
        {
          type: 'check',
          description: 'Follow the hidden path carefully (Stealth DC 10).',
          skill: 'stealth',
          dc: 10,
          successOutcome: 'stealthy_path_following',
          failureOutcome: 'noisy_path_following',
        },
        {
          type: 'narrative',
          description: 'Mark the location and continue investigating the main route.',
          outcome: 'secret_path_marked',
        },
        {
          type: 'check',
          description: 'Examine the path for traps or guards (Perception DC 12).',
          skill: 'perception',
          dc: 12,
          successOutcome: 'path_hazards_detected',
          failureOutcome: 'path_appears_safe',
        }
      ]
    },
    'guild_secret_revealed': {
      id: 'guild_secret_revealed',
      title: 'The Hidden Truth',
      description: 'Under gentle pressure, the Guild Master breaks down. "The cargo... it wasn\'t just silks and spices. We were transporting a fortune in rare gems for a noble family. If word gets out that we lost them, it could ruin the Guild. Please, you must find them!"',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 15 },
      options: [
        {
          type: 'check',
          description: 'Ask who else knew about the gems (Persuade DC 10).',
          skill: 'persuade',
          dc: 10,
          successOutcome: 'insider_information_revealed',
          failureOutcome: 'limited_insider_info',
        },
        {
          type: 'narrative',
          description: 'Assure her of your discretion and begin investigation.',
          outcome: 'discreet_investigation_start',
        },
        {
          type: 'check',
          description: 'Demand higher payment for the increased risk (Persuade DC 12).',
          skill: 'persuade',
          dc: 12,
          successOutcome: 'danger_pay_secured',
          failureOutcome: 'payment_negotiation_rejected',
        }
      ]
    },
    'stealthy_path_following': {
      id: 'stealthy_path_following',
      title: 'Silent Approach',
      description: 'Moving carefully and quietly, you follow the hidden path deeper into the mountains. The trail leads to a concealed valley where you spot smoke rising from what appears to be a camp.',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 10 },
      options: [
        {
          type: 'check',
          description: 'Scout the camp from a distance (Perception DC 11).',
          skill: 'perception',
          dc: 11,
          successOutcome: 'camp_scouted_successfully',
          failureOutcome: 'limited_camp_visibility',
        },
        {
          type: 'check',
          description: 'Try to get closer for a better look (Stealth DC 12).',
          skill: 'stealth',
          dc: 12,
          successOutcome: 'close_camp_observation',
          failureOutcome: 'spotted_by_guards',
        },
        {
          type: 'narrative',
          description: 'Circle around to find another approach.',
          outcome: 'camp_flanking_attempt',
        }
      ]
    },
    'camp_scouted_successfully': {
      id: 'camp_scouted_successfully',
      title: 'Bandit Camp Identified',
      description: 'From your vantage point, you can see a well-organized bandit camp. There are several tents, guards on patrol, and most importantly - you spot the missing merchant wagons! The caravan is here, but you need to determine if the merchants are alive.',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 20 },
      options: [
        {
          type: 'check',
          description: 'Look for signs of the merchants among the camp (Perception DC 13).',
          skill: 'perception',
          dc: 13,
          successOutcome: 'merchants_spotted_alive',
          failureOutcome: 'merchants_status_unknown',
        },
        {
          type: 'narrative',
          description: 'Plan a rescue mission.',
          outcome: 'rescue_mission_planning',
        },
        {
          type: 'narrative',
          description: 'Return to town for reinforcements.',
          outcome: 'reinforcement_request',
        },
        {
          type: 'check',
          description: 'Count the bandits and assess their strength (Smarts DC 10).',
          skill: 'smr',
          dc: 10,
          successOutcome: 'bandit_force_assessed',
          failureOutcome: 'rough_bandit_estimate',
        }
      ]
    },
    'merchants_spotted_alive': {
      id: 'merchants_spotted_alive',
      title: 'Captives Confirmed',
      description: 'Relief floods through you as you spot Merchant Roderick and his two companions tied up near the center of the camp. They appear injured but alive. The bandits seem to be preparing to move out soon.',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 15 },
      options: [
        {
          type: 'narrative',
          description: 'Plan an immediate stealth rescue.',
          outcome: 'stealth_rescue_attempt',
        },
        {
          type: 'narrative',
          description: 'Create a diversion to draw guards away.',
          outcome: 'diversion_rescue_plan',
        },
        {
          type: 'check',
          description: 'Wait for the right moment to strike (Stealth DC 11).',
          skill: 'stealth',
          dc: 11,
          successOutcome: 'perfect_rescue_timing',
          failureOutcome: 'rescue_timing_off',
        },
        {
          type: 'narrative',
          description: 'Attempt to negotiate with the bandits.',
          outcome: 'bandit_negotiation_attempt',
        }
      ]
    },
    'rescue_mission_planning': {
      id: 'rescue_mission_planning',
      title: 'Strategic Approach',
      description: 'You carefully study the camp layout, guard patterns, and possible escape routes. A well-planned rescue has a much better chance of success.',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 8 },
      options: [
        {
          type: 'check',
          description: 'Identify the best entry and exit points (Smarts DC 10).',
          skill: 'smr',
          dc: 10,
          successOutcome: 'optimal_rescue_route',
          failureOutcome: 'basic_rescue_route',
        },
        {
          type: 'narrative',
          description: 'Focus on timing the guard patrols.',
          outcome: 'guard_pattern_study',
        },
        {
          type: 'check',
          description: 'Look for ways to create confusion in the camp (Perception DC 9).',
          skill: 'perception',
          dc: 9,
          successOutcome: 'distraction_opportunities_found',
          failureOutcome: 'limited_distraction_options',
        }
      ]
    },
    'stealth_rescue_attempt': {
      id: 'stealth_rescue_attempt',
      title: 'Silent Liberation',
      description: 'Under cover of darkness, you slip into the camp. Your heart pounds as you move between tents toward the captives.',
      img: PLACEHOLDER_IMG,
      options: [
        {
          type: 'check',
          description: 'Sneak to the captives undetected (Stealth DC 13).',
          skill: 'stealth',
          dc: 13,
          successOutcome: 'perfect_stealth_rescue',
          failureOutcome: 'stealth_rescue_detected',
        }
      ]
    },
    'perfect_stealth_rescue': {
      id: 'perfect_stealth_rescue',
      title: 'Master Infiltrator',
      description: 'Your stealth skills are flawless. You free the merchants without alerting a single guard and escape with both the people and most of the cargo. The Guild will be eternally grateful.',
      img: PLACEHOLDER_IMG,
      nodeType: 'questComplete',
      rewards: { xp: 35, gold: 25, reputationChange: 3 },
      options: []
    },
    'stealth_rescue_detected': {
      id: 'stealth_rescue_detected',
      title: 'Rescue Compromised',
      description: 'A guard spots you just as you\'re freeing the merchants! He shouts an alarm and the camp erupts into activity.',
      img: PLACEHOLDER_IMG,
      options: [
        {
          type: 'battle',
          description: 'Fight your way out with the merchants!',
          enemyPartyId: 'bandit_guard_response',
          playerAdvantage: 'none',
          outcome: 'fighting_retreat_successful',
        },
        {
          type: 'check',
          description: 'Try to bluff your way out (Persuade DC 14).',
          skill: 'persuade',
          dc: 14,
          successOutcome: 'bluff_escape_success',
          failureOutcome: 'bluff_escape_failed',
        }
      ]
    },
    'bandit_negotiation_attempt': {
      id: 'bandit_negotiation_attempt',
      title: 'Parley with Thieves',
      description: 'You approach the camp openly, hands visible, calling out for their leader. The bandits are surprised but curious about this bold approach.',
      img: PLACEHOLDER_IMG,
      options: [
        {
          type: 'check',
          description: 'Offer to buy the merchants\' freedom (Persuade DC 12).',
          skill: 'persuade',
          dc: 12,
          successOutcome: 'ransom_negotiation_success',
          failureOutcome: 'ransom_negotiation_failed',
        },
        {
          type: 'check',
          description: 'Try to convince them the heat is too much (Persuade DC 10).',
          skill: 'persuade',
          dc: 10,
          successOutcome: 'pressure_argument_works',
          failureOutcome: 'pressure_argument_fails',
        },
        {
          type: 'check',
          description: 'Challenge their leader to single combat (Athletics DC 11).',
          skill: 'athletics',
          dc: 11,
          successOutcome: 'combat_challenge_accepted',
          failureOutcome: 'combat_challenge_mocked',
        }
      ]
    },
    'ransom_negotiation_success': {
      id: 'ransom_negotiation_success',
      title: 'Deal Struck',
      description: 'The bandit leader, a grizzled woman with sharp eyes, considers your offer. "You\'ve got stones coming here alone. Fine - we\'ll take half the cargo value in coin for their lives. The gems stay with us."',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 20 },
      options: [
        {
          type: 'narrative',
          description: 'Accept the deal - lives matter most.',
          outcome: 'ransom_deal_accepted',
        },
        {
          type: 'check',
          description: 'Try to negotiate for the gems too (Persuade DC 15).',
          skill: 'persuade',
          dc: 15,
          successOutcome: 'full_cargo_negotiated',
          failureOutcome: 'negotiation_breaks_down',
        }
      ]
    },
    'combat_challenge_accepted': {
      id: 'combat_challenge_accepted',
      title: 'Trial by Combat',
      description: 'The bandit leader grins. "I like your style! Alright, stranger - you beat me, you get your merchants and half the cargo. I win, you join my crew or die."',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 10 },
      options: [
        {
          type: 'battle',
          description: 'Accept the challenge!',
          enemyPartyId: 'bandit_leader_duel',
          playerAdvantage: 'none',
          outcome: 'duel_victory',
        }
      ]
    },
    'duel_victory': {
      id: 'duel_victory',
      title: 'Champion\'s Honor',
      description: 'Your combat prowess wins the day! The bandit leader yields with respect, and true to her word, releases the merchants with a significant portion of the cargo. "You fight with honor, stranger."',
      img: PLACEHOLDER_IMG,
      nodeType: 'questComplete',
      rewards: { xp: 30, gold: 20, reputationChange: 2 },
      options: []
    },
    'ransom_deal_accepted': {
      id: 'ransom_deal_accepted',
      title: 'Lives Saved',
      description: 'You agree to the ransom terms. The merchants are freed, though some cargo is lost. Roderick thanks you profusely - he knows you chose their lives over profit.',
      img: PLACEHOLDER_IMG,
      nodeType: 'questComplete',
      rewards: { xp: 25, gold: 10, reputationChange: 2 },
      options: []
    },
    'fighting_retreat_successful': {
      id: 'fighting_retreat_successful',
      title: 'Battle-Won Freedom',
      description: 'Through skill and determination, you fight your way out of the bandit camp with the rescued merchants. Some cargo is lost in the chaos, but lives are saved.',
      img: PLACEHOLDER_IMG,
      nodeType: 'questComplete',
      rewards: { xp: 28, gold: 15, reputationChange: 1 },
      options: []
    },
    'reinforcement_request': {
      id: 'reinforcement_request',
      title: 'Return with Force',
      description: 'You return to town and organize a proper rescue force. When you return with guards and militia, you find the bandit camp abandoned - but you recover the merchants who were left tied up, and most of the cargo.',
      img: PLACEHOLDER_IMG,
      nodeType: 'questComplete',
      rewards: { xp: 22, gold: 18, reputationChange: 1 },
      options: []
    },
    'quick_investigation_start': {
      id: 'quick_investigation_start',
      title: 'Hasty Departure',
      description: 'You set out immediately for the mountain pass with minimal preparation. Sometimes speed matters more than planning.',
      img: PLACEHOLDER_IMG,
      options: [
        {
          type: 'narrative',
          description: 'Head directly to Eagle\'s Pass.',
          outcome: 'unprepared_route_investigation',
        }
      ]
    },
    'unprepared_route_investigation': {
      id: 'unprepared_route_investigation',
      title: 'Investigating Blindly',
      description: 'Without intelligence or preparation, you search the mountain route. Your investigation will be more difficult but still possible.',
      img: PLACEHOLDER_IMG,
      options: [
        {
          type: 'check',
          description: 'Search for any signs of the caravan (Perception DC 12).',
          skill: 'perception',
          dc: 12,
          successOutcome: 'lucky_discovery',
          failureOutcome: 'no_obvious_clues',
        }
      ]
    },
    'lucky_discovery': {
      id: 'lucky_discovery',
      title: 'Fortunate Find',
      description: 'Despite your lack of preparation, you stumble upon clear evidence of the caravan\'s passage and signs of struggle. Luck favors the bold!',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 15 },
      options: [
        {
          type: 'narrative',
          description: 'Follow the evidence.',
          outcome: 'route_focused_investigation',
        }
      ]
    },
    'decline_caravan_mission': {
      id: 'decline_caravan_mission',
      title: 'Mission Declined',
      description: 'You decide not to take on this dangerous investigation. The Guild Master looks disappointed but understands.',
      img: PLACEHOLDER_IMG,
      nodeType: 'questFail',
      options: []
    }
    // Quest complete - comprehensive missing caravan investigation
  }
}; 
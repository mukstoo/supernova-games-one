import { Quest } from '../../utils/questTypes';

const PLACEHOLDER_IMG = '../../assets/images/menu_background.png';

export const killBoars1: Quest = {
  id: 'kill_boars_1',
  title: 'Boar Hunt (Node-Based)',
  description: 'Wild boars are menacing the local farms. Hunt down a few of them.',
  img: PLACEHOLDER_IMG,
  rarity: 2,
  targetTileType: 'forest',
  duration: 150,
  maxDistance: 7,
  reward: { gold: 25, xp: 15 },
  entryNodeId: 'start_boar_hunt',
  nodes: {
    'start_boar_hunt': {
      id: 'start_boar_hunt',
      title: 'The Farmer\'s Plea',
      description: 'A local farmer flags you down, desperate. "Wild boars are ruining my crops and scaring my livestock! Can you deal with them? I\'ve seen at least three massive ones leading the pack."',
      img: PLACEHOLDER_IMG,
      options: [
        {
          type: 'narrative',
          description: 'Agree to hunt the boars immediately.',
          outcome: 'direct_forest_entry',
        },
        {
          type: 'narrative',
          description: 'Ask for more information about the boars.',
          outcome: 'ask_farmer_details',
        },
        {
          type: 'check',
          description: 'Examine the farm damage for clues (Perception DC 8).',
          skill: 'perception',
          dc: 8,
          successOutcome: 'examine_damage_success',
          failureOutcome: 'examine_damage_fail',
        },
        {
          type: 'narrative',
          description: 'Negotiate payment first.',
          outcome: 'negotiate_payment',
        },
        {
          type: 'narrative',
          description: 'Decline the hunt.',
          outcome: 'decline_boar_hunt',
        }
      ]
    },
    'ask_farmer_details': {
      id: 'ask_farmer_details',
      title: 'Gathering Information',
      description: 'The farmer explains the boars usually come from the dense part of the nearby woods. "They seem unnaturally aggressive lately. The lead boar is massive - easily twice the size of normal ones. Some say it\'s been touched by dark magic."',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 3 },
      options: [
        {
          type: 'check',
          description: 'Follow the tracks he points out (Survival DC 6).',
          skill: 'survival',
          dc: 6,
          successOutcome: 'tracks_found_easy',
          failureOutcome: 'tracks_lost',
        },
        {
          type: 'check',
          description: 'Ask about the "dark magic" (Intelligence DC 10).',
          skill: 'intelligence',
          dc: 10,
          successOutcome: 'dark_magic_info',
          failureOutcome: 'vague_magic_info',
        },
        {
          type: 'narrative',
          description: 'Head into the woods without tracking.',
          outcome: 'forest_exploration',
        }
      ]
    },
    'examine_damage_success': {
      id: 'examine_damage_success',
      title: 'Telltale Signs',
      description: 'Your keen eye spots several important clues: unusually large hoof prints, claw marks on trees at shoulder height, and scattered remnants of what looks like ritual herbs. These aren\'t ordinary boars.',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 5 },
      options: [
        {
          type: 'check',
          description: 'Analyze the ritual herbs (Survival DC 12).',
          skill: 'survival',
          dc: 12,
          successOutcome: 'herbs_analyzed_success',
          failureOutcome: 'herbs_analyzed_fail',
        },
        {
          type: 'narrative',
          description: 'Follow the clear trail into the forest.',
          outcome: 'enhanced_tracking',
        },
        {
          type: 'narrative',
          description: 'Prepare special equipment based on your findings.',
          outcome: 'equipment_preparation',
        }
      ]
    },
    'examine_damage_fail': {
      id: 'examine_damage_fail',
      title: 'Obvious Destruction',
      description: 'You see the obvious signs of boar damage, but nothing that gives you any special insight. The farmer watches you hopefully.',
      img: PLACEHOLDER_IMG,
      options: [
        {
          type: 'narrative',
          description: 'Head into the woods anyway.',
          outcome: 'forest_exploration',
        },
        {
          type: 'narrative',
          description: 'Ask the farmer for more details.',
          outcome: 'ask_farmer_details',
        }
      ]
    },
    'negotiate_payment': {
      id: 'negotiate_payment',
      title: 'Negotiating Terms',
      description: 'The farmer looks surprised. "Well, I suppose... these boars have cost me plenty. What did you have in mind?"',
      img: PLACEHOLDER_IMG,
      options: [
        {
          type: 'check',
          description: 'Persuade him to pay extra for the dangerous work (Persuade DC 12).',
          skill: 'persuade',
          dc: 12,
          successOutcome: 'payment_negotiated_success',
          failureOutcome: 'payment_negotiated_fail',
        },
        {
          type: 'narrative',
          description: 'Accept the standard payment and begin the hunt.',
          outcome: 'ask_farmer_details',
        }
      ]
    },
    'payment_negotiated_success': {
      id: 'payment_negotiated_success',
      title: 'Better Terms Secured',
      description: 'The farmer nods reluctantly. "Aye, you\'re right. If you can rid me of that monster boar, I\'ll pay you double what I planned."',
      img: PLACEHOLDER_IMG,
      rewards: { gold: 15 }, // Bonus payment upfront
      options: [
        {
          type: 'narrative',
          description: 'Now gather information about the boars.',
          outcome: 'ask_farmer_details',
        }
      ]
    },
    'payment_negotiated_fail': {
      id: 'payment_negotiated_fail',
      title: 'Stubborn Farmer',
      description: 'The farmer shakes his head. "Times are tough, friend. Standard rate or find someone else." He seems offended by your haggling.',
      img: PLACEHOLDER_IMG,
      rewards: { reputationChange: -1 },
      options: [
        {
          type: 'narrative',
          description: 'Accept the standard payment.',
          outcome: 'ask_farmer_details',
        },
        {
          type: 'narrative',
          description: 'Walk away from the ungrateful farmer.',
          outcome: 'decline_boar_hunt',
        }
      ]
    },
    'dark_magic_info': {
      id: 'dark_magic_info',
      title: 'Unnatural Origins',
      description: 'The farmer lowers his voice. "My grandmother always said strange things happen in the deep woods. Some old stones out there, covered in moss and old markings. The boars started acting up right after travelers camped near them last month."',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 8 },
      options: [
        {
          type: 'narrative',
          description: 'Head directly to these "old stones".',
          outcome: 'seek_ancient_stones',
        },
        {
          type: 'narrative',
          description: 'Track the boars normally first.',
          outcome: 'enhanced_tracking',
        },
        {
          type: 'check',
          description: 'Ask about the travelers (Persuade DC 8).',
          skill: 'persuade',
          dc: 8,
          successOutcome: 'traveler_info',
          failureOutcome: 'farmer_knows_nothing_more',
        }
      ]
    },
    'vague_magic_info': {
      id: 'vague_magic_info',
      title: 'Superstitious Talk',
      description: 'The farmer shrugs. "Just old wives\' tales, probably. But these boars... they\'re definitely not normal."',
      img: PLACEHOLDER_IMG,
      options: [
        {
          type: 'narrative',
          description: 'Begin tracking the boars.',
          outcome: 'enhanced_tracking',
        }
      ]
    },
    'herbs_analyzed_success': {
      id: 'herbs_analyzed_success',
      title: 'Disturbing Discovery',
      description: 'These herbs are used in old rituals to enhance animal aggression and size. Someone or something has been deliberately corrupting these boars. This explains their unusual behavior and the massive lead boar.',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 10 },
      options: [
        {
          type: 'narrative',
          description: 'Seek out the source of this corruption.',
          outcome: 'seek_corruption_source',
        },
        {
          type: 'narrative',
          description: 'Hunt the corrupted boars before they spread the taint.',
          outcome: 'urgent_hunt',
        },
        {
          type: 'check',
          description: 'Gather some herbs to use against the corruption (Survival DC 10).',
          skill: 'survival',
          dc: 10,
          successOutcome: 'counter_herbs_gathered',
          failureOutcome: 'no_suitable_herbs',
        }
      ]
    },
    'herbs_analyzed_fail': {
      id: 'herbs_analyzed_fail',
      title: 'Unknown Herbs',
      description: 'These herbs are unfamiliar to you, but they definitely don\'t belong in normal boar territory. Something strange is happening here.',
      img: PLACEHOLDER_IMG,
      options: [
        {
          type: 'narrative',
          description: 'Follow the trail carefully.',
          outcome: 'enhanced_tracking',
        }
      ]
    },
    'enhanced_tracking': {
      id: 'enhanced_tracking',
      title: 'Following the Trail',
      description: 'Armed with better knowledge, you follow the boar trail deeper into the forest. The tracks lead to a small clearing where several paths converge.',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 5 },
      options: [
        {
          type: 'check',
          description: 'Determine which path leads to the main lair (Survival DC 8).',
          skill: 'survival',
          dc: 8,
          successOutcome: 'main_lair_found',
          failureOutcome: 'wrong_path_taken',
        },
        {
          type: 'check',
          description: 'Set up an ambush in the clearing (Stealth DC 10).',
          skill: 'stealth',
          dc: 10,
          successOutcome: 'ambush_setup_success',
          failureOutcome: 'ambush_setup_fail',
        },
        {
          type: 'narrative',
          description: 'Follow the widest path (most likely main route).',
          outcome: 'main_path_followed',
        }
      ]
    },
    'equipment_preparation': {
      id: 'equipment_preparation',
      title: 'Tactical Preparation',
      description: 'Based on your observations, you spend time preparing for the hunt. You gather sturdy branches for spears and find defensive positions.',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 5 },
      options: [
        {
          type: 'check',
          description: 'Craft improvised traps (Craft DC 10).',
          skill: 'craft',
          dc: 10,
          successOutcome: 'traps_prepared',
          failureOutcome: 'trap_attempt_failed',
        },
        {
          type: 'narrative',
          description: 'Head into the forest well-prepared.',
          outcome: 'prepared_forest_entry',
        }
      ]
    },
    'tracks_found_easy': {
      id: 'tracks_found_easy',
      title: 'Clear Trail',
      description: 'The farmer was right - there\'s a clear trail leading into the woods.',
      img: PLACEHOLDER_IMG,
      options: [
        {
          type: 'narrative',
          description: 'Follow the trail.',
          outcome: 'enhanced_tracking',
        }
      ]
    },
    'tracks_lost': {
      id: 'tracks_lost',
      title: 'Trail Goes Cold',
      description: 'The tracks are too old or unclear. You\'ll have to rely on other methods.',
      img: PLACEHOLDER_IMG,
      options: [
        {
          type: 'narrative',
          description: 'Search the forest systematically.',
          outcome: 'forest_exploration',
        }
      ]
    },
    'seek_ancient_stones': {
      id: 'seek_ancient_stones',
      title: 'The Ancient Stones',
      description: 'You find the moss-covered stones deep in the forest. They pulse with a faint, unnatural energy, and the ground around them is torn up by massive hoofprints. Dark magic definitely flows through this place.',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 15 },
      options: [
        {
          type: 'check',
          description: 'Attempt to disrupt the magical flow (Intelligence DC 14).',
          skill: 'intelligence',
          dc: 14,
          successOutcome: 'magic_disrupted',
          failureOutcome: 'disruption_failed',
        },
        {
          type: 'check',
          description: 'Search for clues about who activated this (Perception DC 12).',
          skill: 'perception',
          dc: 12,
          successOutcome: 'cultist_clues_found',
          failureOutcome: 'no_clues_found',
        },
        {
          type: 'narrative',
          description: 'Wait in ambush for the boars to return.',
          outcome: 'stone_ambush',
        },
        {
          type: 'narrative',
          description: 'Leave this cursed place and hunt the boars normally.',
          outcome: 'normal_hunt_after_stones',
        }
      ]
    },
    'traveler_info': {
      id: 'traveler_info',
      title: 'Suspicious Travelers',
      description: 'The farmer recalls, "Odd bunch, they were. Carried strange trinkets and spoke in hushed tones about \'awakening the old ways.\' Left heading north after three days."',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 5 },
      options: [
        {
          type: 'narrative',
          description: 'Track north to find these travelers.',
          outcome: 'seek_travelers',
        },
        {
          type: 'narrative',
          description: 'Deal with the boars first, travelers later.',
          outcome: 'enhanced_tracking',
        }
      ]
    },
    'farmer_knows_nothing_more': {
      id: 'farmer_knows_nothing_more',
      title: 'Dead End',
      description: 'The farmer just shakes his head. "Can\'t tell you more than that, friend."',
      img: PLACEHOLDER_IMG,
      options: [
        {
          type: 'narrative',
          description: 'Begin the hunt.',
          outcome: 'enhanced_tracking',
        }
      ]
    },
    'seek_corruption_source': {
      id: 'seek_corruption_source',
      title: 'Tracking the Corruption',
      description: 'Following the traces of ritual herbs and corrupted vegetation, you track the source of the taint deeper into the ancient parts of the forest.',
      img: PLACEHOLDER_IMG,
      options: [
        {
          type: 'narrative',
          description: 'Continue tracking to its source.',
          outcome: 'seek_ancient_stones',
        }
      ]
    },
    'urgent_hunt': {
      id: 'urgent_hunt',
      title: 'Race Against Time',
      description: 'With corruption spreading, you must hunt these boars quickly before they affect other wildlife or threaten more farms.',
      img: PLACEHOLDER_IMG,
      options: [
        {
          type: 'narrative',
          description: 'Track them with urgency.',
          outcome: 'enhanced_tracking',
        }
      ]
    },
    'counter_herbs_gathered': {
      id: 'counter_herbs_gathered',
      title: 'Natural Remedies',
      description: 'You gather herbs known to counteract corruption. With these, you might be able to cure the affected boars rather than just killing them.',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 8 },
      options: [
        {
          type: 'narrative',
          description: 'Seek out the boars to attempt a cure.',
          outcome: 'curative_approach',
        },
        {
          type: 'narrative',
          description: 'Keep the herbs as backup and hunt normally.',
          outcome: 'enhanced_tracking',
        }
      ]
    },
    'no_suitable_herbs': {
      id: 'no_suitable_herbs',
      title: 'Limited Options',
      description: 'You can\'t find the right herbs to counter the corruption. You\'ll have to deal with this threat the hard way.',
      img: PLACEHOLDER_IMG,
      options: [
        {
          type: 'narrative',
          description: 'Hunt the corrupted boars.',
          outcome: 'urgent_hunt',
        }
      ]
    },
    'main_lair_found': {
      id: 'main_lair_found',
      title: 'The Boar Den',
      description: 'You discover the main boar lair - a large hollow beneath the roots of an ancient oak. The massive alpha boar is clearly visible, its size unnaturally enhanced. Two smaller but still dangerous boars guard the entrance.',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 10 },
      options: [
        {
          type: 'check',
          description: 'Attempt to sneak past the guards to the alpha (Stealth DC 13).',
          skill: 'stealth',
          dc: 13,
          successOutcome: 'alpha_ambush_setup',
          failureOutcome: 'guards_alerted',
        },
        {
          type: 'check',
          description: 'Create a distraction to lure guards away (Intelligence DC 10).',
          skill: 'intelligence',
          dc: 10,
          successOutcome: 'guards_distracted',
          failureOutcome: 'distraction_failed',
        },
        {
          type: 'battle',
          description: 'Charge directly at the guards!',
          enemyPartyId: 'boar_guard_pair',
          playerAdvantage: 'none',
          outcome: 'guards_defeated_loud',
        },
        {
          type: 'narrative',
          description: 'Retreat and try a different approach.',
          outcome: 'enhanced_tracking',
        }
      ]
    },
    'wrong_path_taken': {
      id: 'wrong_path_taken',
      title: 'False Trail',
      description: 'You follow the wrong path and find yourself in a dead end. Worse, you hear snorting and movement behind you - you\'ve walked into a trap!',
      img: PLACEHOLDER_IMG,
      options: [
        {
          type: 'check',
          description: 'Try to climb to safety (Athletics DC 10).',
          skill: 'athletics',
          dc: 10,
          successOutcome: 'escape_trap_success',
          failureOutcome: 'trapped_fight',
        },
        {
          type: 'battle',
          description: 'Stand and fight!',
          enemyPartyId: 'boar_group_ambush_player',
          playerAdvantage: 'ambushed',
          outcome: 'survived_ambush',
        }
      ]
    },
    'forest_exploration': {
      id: 'forest_exploration',
      title: 'Deep Woods Search',
      description: 'You search through the forest systematically, looking for signs of the boar pack.',
      img: PLACEHOLDER_IMG,
      options: [
        {
          type: 'check',
          description: 'Search carefully for signs (Perception DC 9).',
          skill: 'perception',
          dc: 9,
          successOutcome: 'boar_encounter_prepared',
          failureOutcome: 'boar_encounter_random',
        }
      ]
    },
    'direct_forest_entry': {
      id: 'direct_forest_entry',
      title: 'Into the Woods',
      description: 'You plunge directly into the forest without gathering information. The woods are dense and you hear the sounds of large animals moving through the underbrush.',
      img: PLACEHOLDER_IMG,
      options: [
        {
          type: 'check',
          description: 'Try to track the sounds (Perception DC 10).',
          skill: 'perception',
          dc: 10,
          successOutcome: 'random_encounter_prepared',
          failureOutcome: 'random_encounter_surprised',
        },
        {
          type: 'check',
          description: 'Move stealthily to avoid detection (Stealth DC 8).',
          skill: 'stealth',
          dc: 8,
          successOutcome: 'stealthy_approach',
          failureOutcome: 'loud_approach',
        }
      ]
    },
    'decline_boar_hunt': {
      id: 'decline_boar_hunt',
      title: 'Hunt Declined',
      description: 'You inform the farmer you can\'t help with the boars right now.',
      img: PLACEHOLDER_IMG,
      nodeType: 'questFail',
      options: []
    },
    'alpha_ambush_setup': {
      id: 'alpha_ambush_setup',
      title: 'Perfect Position',
      description: 'You manage to sneak past the guards and position yourself perfectly to strike at the massive alpha boar.',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 15 },
      options: [
        {
          type: 'battle',
          description: 'Launch your surprise attack!',
          enemyPartyId: 'alpha_boar_surprised',
          playerAdvantage: 'ambush',
          outcome: 'alpha_defeated_skillfully',
        }
      ]
    },
    'guards_alerted': {
      id: 'guards_alerted',
      title: 'Stealth Failed',
      description: 'A twig snaps under your foot! The guard boars turn toward you, snorting aggressively, and the alpha rises to its feet.',
      img: PLACEHOLDER_IMG,
      options: [
        {
          type: 'battle',
          description: 'Fight all three boars at once!',
          enemyPartyId: 'full_boar_pack_alerted',
          playerAdvantage: 'none',
          outcome: 'epic_boar_battle_won',
        }
      ]
    },
    'guards_distracted': {
      id: 'guards_distracted',
      title: 'Clever Diversion',
      description: 'Your distraction works perfectly. The guards move away to investigate, leaving the alpha temporarily alone.',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 10 },
      options: [
        {
          type: 'battle',
          description: 'Attack the isolated alpha!',
          enemyPartyId: 'alpha_boar_alone',
          playerAdvantage: 'ambush',
          outcome: 'alpha_defeated_tactically',
        }
      ]
    },
    'alpha_defeated_skillfully': {
      id: 'alpha_defeated_skillfully',
      title: 'Master Hunter',
      description: 'Your perfect ambush brings down the massive alpha boar in a single, decisive strike. The guards flee when their leader falls. The farmer will be impressed by your skill.',
      img: PLACEHOLDER_IMG,
      nodeType: 'questComplete',
      rewards: { xp: 25, gold: 15, reputationChange: 2 },
      options: []
    },
    'alpha_defeated_tactically': {
      id: 'alpha_defeated_tactically',
      title: 'Tactical Victory',
      description: 'Your clever tactics paid off. The alpha boar falls, and the remaining guards scatter. The farm is safe.',
      img: PLACEHOLDER_IMG,
      nodeType: 'questComplete',
      rewards: { xp: 20, gold: 10 },
      options: []
    },
    'epic_boar_battle_won': {
      id: 'epic_boar_battle_won',
      title: 'Against All Odds',
      description: 'Despite being outnumbered and caught off-guard, you managed to defeat all three massive boars in an epic battle that will be remembered for years.',
      img: PLACEHOLDER_IMG,
      nodeType: 'questComplete',
      rewards: { xp: 30, gold: 25, reputationChange: 3 },
      options: []
    },
    'magic_disrupted': {
      id: 'magic_disrupted',
      title: 'Corruption Cleansed',
      description: 'Your understanding of the magical energies allows you to disrupt the flow. The stones lose their dark glow, and you hear distant sounds of confusion from the forest - the boars are returning to normal!',
      img: PLACEHOLDER_IMG,
      nodeType: 'questComplete',
      rewards: { xp: 30, gold: 10, reputationChange: 2 },
      options: []
    },
    'disruption_failed': {
      id: 'disruption_failed',
      title: 'Dangerous Interference',
      description: 'Your attempt to disrupt the magic fails spectacularly. Dark energy lashes out, and the stones pulse brighter. You hear an enraged roar from deep in the forest - you\'ve made the alpha boar even more dangerous!',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 5 },
      options: [
        {
          type: 'narrative',
          description: 'Face the consequences of your actions.',
          outcome: 'enraged_alpha_hunt',
        }
      ]
    },
    'curative_approach': {
      id: 'curative_approach',
      title: 'The Healing Hunt',
      description: 'Instead of killing, you attempt to cure the corrupted boars. This is more dangerous but could save these noble beasts.',
      img: PLACEHOLDER_IMG,
      options: [
        {
          type: 'check',
          description: 'Approach the alpha boar peacefully (Animal Handling - Persuade DC 15).',
          skill: 'persuade',
          dc: 15,
          successOutcome: 'alpha_cured',
          failureOutcome: 'curative_attempt_failed',
        }
      ]
    },
    'alpha_cured': {
      id: 'alpha_cured',
      title: 'Beast Healer',
      description: 'Your herbs work! The massive boar\'s red eyes clear, and it snorts gratefully before leading its pack away from the farmlands. The farmer is amazed by your compassion and skill.',
      img: PLACEHOLDER_IMG,
      nodeType: 'questComplete',
      rewards: { xp: 35, gold: 20, reputationChange: 3 },
      options: []
    },
    'boar_encounter_prepared': {
      id: 'boar_encounter_prepared',
      title: 'Spotted Them First',
      description: 'Your careful searching pays off. You spot a group of boars before they notice you.',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 5 },
      options: [
        {
          type: 'battle',
          description: 'Attack with the advantage of surprise!',
          enemyPartyId: 'boar_group_standard',
          playerAdvantage: 'ambush',
          outcome: 'boar_battle_won',
        }
      ]
    },
    'boar_encounter_random': {
      id: 'boar_encounter_random',
      title: 'Boar Encounter!',
      description: 'You stumble into a group of aggressive boars!',
      img: PLACEHOLDER_IMG,
      options: [
        {
          type: 'battle',
          description: 'Fight them!',
          enemyPartyId: 'boar_group_standard',
          playerAdvantage: 'none',
          outcome: 'boar_battle_won',
        }
      ]
    },
    'boar_battle_won': {
      id: 'boar_battle_won',
      title: 'Boars Defeated',
      description: 'The boars have been dealt with. The farmer will be grateful.',
      img: PLACEHOLDER_IMG,
      nodeType: 'questComplete',
      rewards: { xp: 15 },
      options: []
    }
  }
}; 
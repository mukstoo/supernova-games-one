import { Quest } from '../../utils/questTypes';

const PLACEHOLDER_IMG = '../../assets/images/menu_background.png';

export const gatherHerbs1: Quest = {
  id: 'gather_herbs_1',
  title: 'Herbal Remedy',
  description: 'An old woman needs common herbs from the nearby plains to make a poultice.',
  img: PLACEHOLDER_IMG,
  rarity: 1,
  targetTileType: 'plains',
  duration: 100,
  maxDistance: 5,
  reward: { gold: 10, xp: 5, reputationChange: 1 },
  entryNodeId: 'start_gather_herbs',
  nodes: {
    'start_gather_herbs': {
      id: 'start_gather_herbs',
      title: 'Seek out the Wise Woman',
      description: 'You find the dwelling of an old woman known for her herbal remedies. She looks worried as she greets you. "Please, I need help! My usual herb gatherer fell ill, and I desperately need moonbell flowers and silverleaf for a critical remedy."',
      img: PLACEHOLDER_IMG,
      options: [
        {
          type: 'narrative',
          description: 'Agree to help her gather the herbs immediately.',
          outcome: 'quick_agreement',
        },
        {
          type: 'narrative',
          description: 'Ask what the remedy is for.',
          outcome: 'ask_about_remedy',
        },
        {
          type: 'check',
          description: 'Examine her for signs of what\'s wrong (Perception DC 8).',
          skill: 'perception',
          dc: 8,
          successOutcome: 'notice_desperation',
          failureOutcome: 'miss_subtle_clues',
        },
        {
          type: 'narrative',
          description: 'Ask about payment for the herbs.',
          outcome: 'negotiate_herb_payment',
        },
        {
          type: 'check',
          description: 'Ask about the herbs\' properties (Smarts DC 10).',
          skill: 'smr',
          dc: 10,
          successOutcome: 'herb_knowledge_gained',
          failureOutcome: 'basic_herb_info',
        },
        {
          type: 'narrative',
          description: 'Decline her request for now.',
          outcome: 'declined_herbs_quest',
        }
      ]
    },
    'gathering_herbs_plains': {
      id: 'gathering_herbs_plains',
      title: 'Searching the Plains',
      description: 'You venture into the plains. The herbs should be easy to spot if you look carefully.',
      img: PLACEHOLDER_IMG,
      options: [
        {
          type: 'check',
          description: 'Search carefully for the herbs (Perception DC 5)',
          skill: 'perception',
          dc: 5,
          successOutcome: 'herbs_found_success',
          failureOutcome: 'herbs_found_fail',
        },
        {
          type: 'narrative',
          description: 'Give up the search.',
          outcome: 'abandon_herbs_search',
        }
      ]
    },
    'herbs_found_success': {
      id: 'herbs_found_success',
      title: 'Herbs Gathered',
      description: 'You successfully gather the necessary herbs. The old woman will be pleased.',
      img: PLACEHOLDER_IMG,
      nodeType: 'questComplete',
      rewards: { xp: 5 }, // Node specific reward
      options: []
    },
    'herbs_found_fail': {
      id: 'herbs_found_fail',
      title: 'Search Unsuccessful',
      description: 'Despite your efforts, you couldn\'t find the right herbs. Perhaps another time.',
      img: PLACEHOLDER_IMG,
      nodeType: 'questFail',
      options: []
    },
    'declined_herbs_quest': {
      id: 'declined_herbs_quest',
      title: 'Request Declined',
      description: 'You decide not to help the old woman at this time.',
      img: PLACEHOLDER_IMG,
      nodeType: 'questFail', // Or could be a neutral outcome if preferred
      options: []
    },
    'abandon_herbs_search': {
      id: 'abandon_herbs_search',
      title: 'Search Abandoned',
      description: 'You decide to abandon the search for herbs.',
      img: PLACEHOLDER_IMG,
      nodeType: 'questFail',
      options: []
    },
    'ask_about_remedy': {
      id: 'ask_about_remedy',
      title: 'The Remedy\'s Purpose',
      description: 'The wise woman\'s face darkens. "My granddaughter... she was bitten by a venomous snake while playing near the old ruins. The bite is spreading, and only this specific remedy can counteract the poison."',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 3 },
      options: [
        {
          type: 'narrative',
          description: 'Offer to help immediately - this is urgent!',
          outcome: 'urgent_herb_mission',
        },
        {
          type: 'check',
          description: 'Ask about the snake and the ruins (Smarts DC 8).',
          skill: 'smr',
          dc: 8,
          successOutcome: 'dangerous_ruins_info',
          failureOutcome: 'limited_ruins_info',
        },
        {
          type: 'check',
          description: 'Offer to examine the granddaughter (Perception DC 12).',
          skill: 'perception',
          dc: 12,
          successOutcome: 'medical_assessment',
          failureOutcome: 'no_medical_insight',
        },
        {
          type: 'narrative',
          description: 'Ask where to find these specific herbs.',
          outcome: 'herb_location_details',
        }
      ]
    },
    'notice_desperation': {
      id: 'notice_desperation',
      title: 'Reading the Signs',
      description: 'Your keen eye notices several concerning details: the woman\'s hands shake slightly, there are children\'s toys scattered about but no child in sight, and medicinal supplies are hastily laid out on her table. Something serious is happening.',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 5 },
      options: [
        {
          type: 'narrative',
          description: 'Ask directly what\'s wrong.',
          outcome: 'direct_concern_inquiry',
        },
        {
          type: 'check',
          description: 'Examine the medicinal preparations (Smarts DC 10).',
          skill: 'smr',
          dc: 10,
          successOutcome: 'poison_treatment_identified',
          failureOutcome: 'general_medicine_noted',
        },
        {
          type: 'narrative',
          description: 'Offer to help without prying.',
          outcome: 'respectful_assistance',
        }
      ]
    },
    'miss_subtle_clues': {
      id: 'miss_subtle_clues',
      title: 'Surface Level',
      description: 'The woman seems worried, but you don\'t pick up on any specific details about her situation.',
      img: PLACEHOLDER_IMG,
      options: [
        {
          type: 'narrative',
          description: 'Ask what the herbs are for.',
          outcome: 'ask_about_remedy',
        },
        {
          type: 'narrative',
          description: 'Agree to help with the gathering.',
          outcome: 'standard_herb_agreement',
        }
      ]
    },
    'negotiate_herb_payment': {
      id: 'negotiate_herb_payment',
      title: 'Discussing Compensation',
      description: 'The wise woman looks surprised. "Well, I suppose... I don\'t have much coin, but I could offer some of my prepared remedies or share knowledge of rare herbs."',
      img: PLACEHOLDER_IMG,
      options: [
        {
          type: 'check',
          description: 'Ask for herbal knowledge instead of coin (Persuade DC 8).',
          skill: 'persuade',
          dc: 8,
          successOutcome: 'knowledge_payment_agreed',
          failureOutcome: 'knowledge_payment_declined',
        },
        {
          type: 'narrative',
          description: 'Accept her offer of prepared remedies.',
          outcome: 'remedy_payment_accepted',
        },
        {
          type: 'narrative',
          description: 'Agree to help for free - this seems urgent.',
          outcome: 'charitable_assistance',
        },
        {
          type: 'check',
          description: 'Press for coin payment (Persuade DC 12).',
          skill: 'persuade',
          dc: 12,
          successOutcome: 'coin_payment_secured',
          failureOutcome: 'payment_negotiation_failed',
        }
      ]
    },
    'herb_knowledge_gained': {
      id: 'herb_knowledge_gained',
      title: 'Herbal Expertise',
      description: 'Your knowledge impresses the wise woman. "Ah, you know herbs! Moonbell flowers bloom only at dawn and dusk, and silverleaf grows near water sources. But beware - there are dangerous mimics that look similar but are poisonous."',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 8 },
      options: [
        {
          type: 'narrative',
          description: 'Ask about the dangerous mimics.',
          outcome: 'mimic_plant_warning',
        },
        {
          type: 'narrative',
          description: 'Head out to gather the herbs with this knowledge.',
          outcome: 'informed_herb_gathering',
        },
        {
          type: 'check',
          description: 'Ask about other rare herbs in the area (Smarts DC 12).',
          skill: 'smr',
          dc: 12,
          successOutcome: 'rare_herb_locations',
          failureOutcome: 'basic_herb_locations',
        }
      ]
    },
    'basic_herb_info': {
      id: 'basic_herb_info',
      title: 'Standard Information',
      description: 'The wise woman provides basic directions. "Moonbell flowers can be found in the plains, and silverleaf grows near streams. That\'s all I can tell you."',
      img: PLACEHOLDER_IMG,
      options: [
        {
          type: 'narrative',
          description: 'Head out to search for the herbs.',
          outcome: 'standard_herb_search',
        }
      ]
    },
    'urgent_herb_mission': {
      id: 'urgent_herb_mission',
      title: 'Race Against Time',
      description: 'Understanding the urgency, you prepare to search for the herbs quickly. The wise woman gives you a small pouch. "Please hurry! Time is running short."',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 5 },
      options: [
        {
          type: 'narrative',
          description: 'Rush directly to the plains.',
          outcome: 'hurried_plains_search',
        },
        {
          type: 'check',
          description: 'Ask for quick directions to the best locations (Persuade DC 6).',
          skill: 'persuade',
          dc: 6,
          successOutcome: 'emergency_directions',
          failureOutcome: 'basic_directions_only',
        }
      ]
    },
    'dangerous_ruins_info': {
      id: 'dangerous_ruins_info',
      title: 'Knowledge of Danger',
      description: 'The wise woman nods grimly. "The old ruins are cursed, they say. Strange creatures nest there, and the vegetation grows twisted and poisonous. The snake that bit her was no ordinary serpent - it had an unnatural sheen to its scales."',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 8 },
      options: [
        {
          type: 'narrative',
          description: 'Offer to investigate the ruins after gathering herbs.',
          outcome: 'ruins_investigation_planned',
        },
        {
          type: 'narrative',
          description: 'Focus on the herbs first, ruins later.',
          outcome: 'herbs_priority_focus',
        },
        {
          type: 'check',
          description: 'Ask about protective measures against cursed creatures (Smarts DC 10).',
          skill: 'smr',
          dc: 10,
          successOutcome: 'protection_knowledge',
          failureOutcome: 'limited_protection_info',
        }
      ]
    },
    'medical_assessment': {
      id: 'medical_assessment',
      title: 'Examining the Patient',
      description: 'You examine the small girl lying on a cot. The bite mark on her leg is swollen and has dark veins spreading from it. Her breathing is shallow but steady. You recognize this as a slow-acting but lethal poison.',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 10 },
      options: [
        {
          type: 'check',
          description: 'Estimate how much time you have (Smarts DC 12).',
          skill: 'smr',
          dc: 12,
          successOutcome: 'precise_timeline',
          failureOutcome: 'rough_timeline',
        },
        {
          type: 'narrative',
          description: 'Immediately set out for the herbs.',
          outcome: 'urgent_herb_mission',
        },
        {
          type: 'check',
          description: 'Look for ways to slow the poison (Perception DC 10).',
          skill: 'perception',
          dc: 10,
          successOutcome: 'temporary_treatment',
          failureOutcome: 'no_immediate_help',
        }
      ]
    },
    'informed_herb_gathering': {
      id: 'informed_herb_gathering',
      title: 'Knowledgeable Search',
      description: 'Armed with detailed knowledge about the herbs and their dangerous mimics, you set out into the plains. Your expertise gives you a significant advantage.',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 5 },
      options: [
        {
          type: 'check',
          description: 'Search for moonbell flowers at dawn/dusk locations (Survival DC 6).',
          skill: 'survival',
          dc: 6,
          successOutcome: 'moonbell_found_easily',
          failureOutcome: 'moonbell_search_continues',
        },
        {
          type: 'check',
          description: 'Look for silverleaf near water sources (Perception DC 7).',
          skill: 'perception',
          dc: 7,
          successOutcome: 'silverleaf_located',
          failureOutcome: 'water_source_search',
        },
        {
          type: 'narrative',
          description: 'Search systematically for both herbs.',
          outcome: 'systematic_informed_search',
        }
      ]
    },
    'standard_herb_search': {
      id: 'standard_herb_search',
      title: 'Basic Herb Hunt',
      description: 'You head into the plains with only basic information about where to find the herbs. This will require more careful searching.',
      img: PLACEHOLDER_IMG,
      options: [
        {
          type: 'check',
          description: 'Search the plains carefully (Perception DC 10).',
          skill: 'perception',
          dc: 10,
          successOutcome: 'herbs_spotted',
          failureOutcome: 'difficult_search_continues',
        },
        {
          type: 'check',
          description: 'Use survival skills to track down plant habitats (Survival DC 8).',
          skill: 'survival',
          dc: 8,
          successOutcome: 'habitat_tracking_success',
          failureOutcome: 'habitat_tracking_fail',
        },
        {
          type: 'narrative',
          description: 'Search near water sources.',
          outcome: 'water_source_search',
        }
      ]
    },
    'mimic_plant_warning': {
      id: 'mimic_plant_warning',
      title: 'Dangerous Knowledge',
      description: 'The wise woman shows you dried samples. "Deathbell looks similar to moonbell but has tiny black spots on the petals. False silverleaf has a reddish tinge to its veins. Picking the wrong ones could be deadly."',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 12 },
      options: [
        {
          type: 'narrative',
          description: 'Memorize the differences and head out carefully.',
          outcome: 'expert_herb_identification',
        },
        {
          type: 'check',
          description: 'Ask to borrow the samples for reference (Persuade DC 8).',
          skill: 'persuade',
          dc: 8,
          successOutcome: 'reference_samples_obtained',
          failureOutcome: 'samples_too_precious',
        }
      ]
    },
    'quick_agreement': {
      id: 'quick_agreement',
      title: 'Immediate Assistance',
      description: 'You agree to help right away. The wise woman looks relieved but doesn\'t provide much detail in her haste.',
      img: PLACEHOLDER_IMG,
      options: [
        {
          type: 'narrative',
          description: 'Head out to search for herbs.',
          outcome: 'hasty_herb_search',
        }
      ]
    },
    'moonbell_found_easily': {
      id: 'moonbell_found_easily',
      title: 'Moonbell Discovery',
      description: 'Your knowledge pays off! You quickly locate a patch of moonbell flowers, their pale petals glowing softly in the light. Now you need silverleaf.',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 8 },
      options: [
        {
          type: 'narrative',
          description: 'Search for silverleaf near water.',
          outcome: 'silverleaf_hunt_with_moonbell',
        },
        {
          type: 'check',
          description: 'Look for more moonbell to gather extra (Survival DC 8).',
          skill: 'survival',
          dc: 8,
          successOutcome: 'extra_moonbell_gathered',
          failureOutcome: 'standard_moonbell_amount',
        }
      ]
    },
    'silverleaf_located': {
      id: 'silverleaf_located',
      title: 'Silverleaf Found',
      description: 'Near a small stream, you spot the distinctive silver-tinted leaves. The plant grows in a dense cluster by the water\'s edge.',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 8 },
      options: [
        {
          type: 'narrative',
          description: 'Carefully harvest the silverleaf.',
          outcome: 'silverleaf_harvested',
        },
        {
          type: 'check',
          description: 'Check for dangerous mimics before harvesting (Perception DC 10).',
          skill: 'perception',
          dc: 10,
          successOutcome: 'safe_silverleaf_harvest',
          failureOutcome: 'risky_silverleaf_harvest',
        }
      ]
    },
    'expert_herb_identification': {
      id: 'expert_herb_identification',
      title: 'Master Herbalist',
      description: 'With the wise woman\'s detailed warnings fresh in your mind, you venture out as a true expert. You can easily distinguish between the real herbs and their deadly mimics.',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 10 },
      options: [
        {
          type: 'check',
          description: 'Find both herbs efficiently (Survival DC 5).',
          skill: 'survival',
          dc: 5,
          successOutcome: 'perfect_herb_collection',
          failureOutcome: 'good_herb_collection',
        }
      ]
    },
    'hasty_herb_search': {
      id: 'hasty_herb_search',
      title: 'Rushed Gathering',
      description: 'Without much information, you rush into the plains searching for herbs. Your haste could lead to mistakes.',
      img: PLACEHOLDER_IMG,
      options: [
        {
          type: 'check',
          description: 'Search quickly but carefully (Perception DC 12).',
          skill: 'perception',
          dc: 12,
          successOutcome: 'hurried_success',
          failureOutcome: 'dangerous_mistake',
        },
        {
          type: 'narrative',
          description: 'Slow down and search more methodically.',
          outcome: 'methodical_search_delayed',
        }
      ]
    },
    'dangerous_mistake': {
      id: 'dangerous_mistake',
      title: 'Poisonous Error',
      description: 'In your haste, you accidentally pick deathbell flowers instead of moonbell! The toxic sap burns your fingers, and you realize your mistake.',
      img: PLACEHOLDER_IMG,
      options: [
        {
          type: 'check',
          description: 'Try to treat the poison burn quickly (Athletics DC 10).',
          skill: 'athletics',
          dc: 10,
          successOutcome: 'poison_burn_treated',
          failureOutcome: 'poison_burn_worsens',
          failureConsequence: {
            damage: 3,
            description: 'The poison burns deeper into your skin!'
          }
        },
        {
          type: 'narrative',
          description: 'Ignore the pain and continue searching more carefully.',
          outcome: 'continue_despite_injury',
        }
      ]
    },
    'perfect_herb_collection': {
      id: 'perfect_herb_collection',
      title: 'Herbalist Master',
      description: 'Your expertise allows you to gather the finest specimens of both moonbell and silverleaf. You even find some rare variants that will make the remedy extra potent.',
      img: PLACEHOLDER_IMG,
      nodeType: 'questComplete',
      rewards: { xp: 25, gold: 15, reputationChange: 2 },
      options: []
    },
    'safe_silverleaf_harvest': {
      id: 'safe_silverleaf_harvest',
      title: 'Careful Harvest',
      description: 'Your careful examination reveals these are indeed true silverleaf plants. You harvest them safely and have one herb secured.',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 5 },
      options: [
        {
          type: 'narrative',
          description: 'Now search for moonbell flowers.',
          outcome: 'moonbell_search_with_silverleaf',
        }
      ]
    },
    'herb_gathering_complete': {
      id: 'herb_gathering_complete',
      title: 'Mission Accomplished',
      description: 'You have successfully gathered both moonbell flowers and silverleaf. The wise woman can now prepare the antidote for her granddaughter.',
      img: PLACEHOLDER_IMG,
      nodeType: 'questComplete',
      rewards: { xp: 15, gold: 5, reputationChange: 1 },
      options: []
    },
    'poison_burn_treated': {
      id: 'poison_burn_treated',
      title: 'Quick Recovery',
      description: 'You manage to wash off most of the poison and bind the wound. It stings, but you can continue your search.',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 5 },
      options: [
        {
          type: 'narrative',
          description: 'Continue searching with more caution.',
          outcome: 'cautious_herb_restart',
        }
      ]
    },
    'risky_silverleaf_harvest': {
      id: 'risky_silverleaf_harvest',
      title: 'Uncertain Harvest',
      description: 'Without checking carefully, you harvest what appears to be silverleaf. The leaves look right, but you\'re not entirely certain.',
      img: PLACEHOLDER_IMG,
      options: [
        {
          type: 'check',
          description: 'Examine the harvested plants more closely (Perception DC 12).',
          skill: 'perception',
          dc: 12,
          successOutcome: 'confirmed_real_silverleaf',
          failureOutcome: 'uncertain_plant_quality',
        },
        {
          type: 'narrative',
          description: 'Trust your harvest and search for moonbell.',
          outcome: 'trust_questionable_harvest',
        }
      ]
    },
    'water_source_search': {
      id: 'water_source_search',
      title: 'Following Water',
      description: 'You head toward the sound of running water, hoping to find silverleaf along the stream banks.',
      img: PLACEHOLDER_IMG,
      options: [
        {
          type: 'check',
          description: 'Search along the stream carefully (Perception DC 8).',
          skill: 'perception',
          dc: 8,
          successOutcome: 'stream_silverleaf_found',
          failureOutcome: 'stream_search_continues',
        },
        {
          type: 'narrative',
          description: 'Follow the stream to look for other areas.',
          outcome: 'extended_stream_search',
        }
      ]
    },
    'confirmed_real_silverleaf': {
      id: 'confirmed_real_silverleaf',
      title: 'Genuine Silverleaf',
      description: 'Upon closer inspection, you confirm these are indeed real silverleaf plants. One herb down, one to go!',
      img: PLACEHOLDER_IMG,
      rewards: { xp: 3 },
      options: [
        {
          type: 'narrative',
          description: 'Search for moonbell flowers.',
          outcome: 'moonbell_search_with_silverleaf',
        }
      ]
    },
    'both_herbs_gathered': {
      id: 'both_herbs_gathered',
      title: 'Complete Collection',
      description: 'You have successfully gathered both required herbs. Time to return to the wise woman!',
      img: PLACEHOLDER_IMG,
      nodeType: 'questComplete',
      rewards: { xp: 20, reputationChange: 1 },
      options: []
    }
  }
}; 
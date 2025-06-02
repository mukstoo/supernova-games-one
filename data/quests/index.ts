import { Quest } from '../../utils/questTypes';
import { gatherHerbs1 } from './gather_herbs_1';
import { killBoars1 } from './kill_boars_1';
import { killOrcs1 } from './kill_orcs_1';
import { missingCaravan1 } from './missing_caravan_1';

// Export individual quests for direct imports if needed
export { gatherHerbs1, killBoars1, killOrcs1, missingCaravan1 };

// Master list of all possible quests in the game
export const allQuests: Quest[] = [
  gatherHerbs1,
  killBoars1,
  killOrcs1,
  missingCaravan1,
]; 
// utils/locationConfig.ts
import settlementBg from '../assets/images/menu_background.png';
import wildernessBg from '../assets/images/menu_background.png';
import questBg from '../assets/images/menu_background.png';

export type LocationType = 'settlement' | 'wilderness' | 'quest';

export interface LocationConfig {
  bg: any;
  title: string;
  actions: { key: string; label: string; route?: string }[];
}

export const locationConfig: Record<LocationType, LocationConfig> = {
  settlement: {
    bg: settlementBg,
    title: 'Settlement',
    actions: [
      { key: 'train', label: 'Train' },
      { key: 'gather', label: 'Gather Info' },
      { key: 'trade', label: 'Trade' },
      { key: 'rest', label: 'Rest' },
    ],
  },
  wilderness: {
    bg: wildernessBg,
    title: 'Wilderness',
    actions: [
      { key: 'fight', label: 'Fight' },
      { key: 'ambush', label: 'Ambush' },
      { key: 'flee', label: 'Flee' },
    ],
  },
  quest: {
    bg: questBg,
    title: 'Quest',
    actions: [
      { key: 'gather', label: 'Gather Info' },
      { key: 'fight', label: 'Fight' },
      { key: 'rest', label: 'Rest' },
    ],
  },
};

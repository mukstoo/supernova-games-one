import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import { audioManager } from './audioManager';

import logo1 from '../assets/images/logo1.png';
import logo2 from '../assets/images/logo2.png';

export async function preloadAssets(initialVolume?: number) {
  await Asset.loadAsync([logo1, logo2]);
  await Font.loadAsync({
    'RobotoSlab-Regular': require('../assets/fonts/RobotoSlab-Regular.ttf'),
  });

  // Sync volume if provided from Redux store
  if (initialVolume !== undefined) {
    audioManager.syncVolumeFromSettings(initialVolume);
  }

  await audioManager.loadIntroMusic();
  await audioManager.playIntroMusic();
}

export async function stopIntroMusic() {
  await audioManager.stopIntroMusic();
}

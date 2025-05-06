import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import { Audio } from 'expo-av';

import logo1 from '../assets/images/logo1.png';
import logo2 from '../assets/images/logo2.png';

let music: Audio.Sound | null = null;

export async function preloadAssets() {
  await Asset.loadAsync([logo1, logo2]);
  await Font.loadAsync({
    'RobotoSlab-Regular': require('../assets/fonts/RobotoSlab-Regular.ttf'),
  });

  music = new Audio.Sound();
  await music.loadAsync(require('../assets/audio/intro_theme.mp3'));
  await music.setIsLoopingAsync(true);
  await music.playAsync();
}

export async function stopIntroMusic() {
  if (!music) return;
  const status = await music.getStatusAsync();
  if ('isLoaded' in status && status.isLoaded) await music.stopAsync();
  await music.unloadAsync();
  music = null;
}

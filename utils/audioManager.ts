import { Audio } from 'expo-av';

class AudioManager {
  private static instance: AudioManager;
  private introMusic: Audio.Sound | null = null;
  private currentVolume: number = 0.75; // Default volume (75%)

  private constructor() {}

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  async loadIntroMusic() {
    if (this.introMusic) return;
    
    try {
      this.introMusic = new Audio.Sound();
      await this.introMusic.loadAsync(require('../assets/audio/intro_theme.mp3'));
      await this.introMusic.setIsLoopingAsync(true);
      await this.introMusic.setVolumeAsync(this.currentVolume);
    } catch (error) {
      console.warn('Failed to load intro music:', error);
      this.introMusic = null;
    }
  }

  async playIntroMusic() {
    try {
      if (!this.introMusic) {
        await this.loadIntroMusic();
      }
      if (this.introMusic) {
        const status = await this.introMusic.getStatusAsync();
        if ('isLoaded' in status && status.isLoaded && !status.isPlaying) {
          await this.introMusic.playAsync();
        }
      }
    } catch (error) {
      console.warn('Failed to play intro music:', error);
    }
  }

  async stopIntroMusic() {
    if (!this.introMusic) return;
    
    try {
      const status = await this.introMusic.getStatusAsync();
      if ('isLoaded' in status && status.isLoaded) {
        await this.introMusic.stopAsync();
        await this.introMusic.unloadAsync();
      }
    } catch (error) {
      console.warn('Failed to stop intro music:', error);
    } finally {
      this.introMusic = null;
    }
  }

  async setVolume(volume: number) {
    // Convert 0-100 to 0-1 for Audio API
    this.currentVolume = Math.max(0, Math.min(1, volume / 100));
    
    // Update intro music volume if it's loaded and playing
    if (this.introMusic) {
      try {
        const status = await this.introMusic.getStatusAsync();
        if ('isLoaded' in status && status.isLoaded) {
          await this.introMusic.setVolumeAsync(this.currentVolume);
        }
      } catch (error) {
        console.warn('Failed to set volume:', error);
        // Don't stop the music if volume setting fails
      }
    }
  }

  getVolume(): number {
    // Convert back to 0-100 scale
    return Math.round(this.currentVolume * 100);
  }

  // Add a method to sync volume from settings without async issues
  syncVolumeFromSettings(volume: number) {
    this.currentVolume = Math.max(0, Math.min(1, volume / 100));
    // Don't immediately apply to audio - let it be applied when volume actually changes
  }
}

export const audioManager = AudioManager.getInstance(); 
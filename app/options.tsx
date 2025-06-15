// app/options.tsx
import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setVolume, resetSettings } from '../store/slices/settingsSlice';
import { audioManager } from '../utils/audioManager';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export default function OptionsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const settings = useSelector((state: RootState) => state.settings);

  // Sync volume on mount without async call that might interrupt music
  useEffect(() => {
    audioManager.syncVolumeFromSettings(settings.volume);
  }, []); // Only run on mount

  const handleVolumeChange = (change: number) => {
    const newVolume = Math.max(0, Math.min(100, settings.volume + change));
    dispatch(setVolume(newVolume));
    // Apply volume change immediately when user interacts
    audioManager.setVolume(newVolume);
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => dispatch(resetSettings())
        }
      ]
    );
  };

  return (
    <>
      <Stack.Screen options={{ 
        title: 'Options', 
        headerStyle: { backgroundColor: colors.backgroundBase },
        headerTintColor: colors.ivoryWhite
      }} />
      
      <View style={styles.container}>
        <View style={styles.content}>
          
          {/* Volume Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Volume</Text>
            
            <View style={styles.volumeContainer}>
              <View style={styles.volumeControls}>
                <TouchableOpacity 
                  style={styles.volumeButton}
                  onPress={() => handleVolumeChange(-10)}
                >
                  <Text style={styles.volumeButtonText}>−</Text>
                </TouchableOpacity>
                
                <Text style={styles.volumeDisplay}>{settings.volume}%</Text>
                
                <TouchableOpacity 
                  style={styles.volumeButton}
                  onPress={() => handleVolumeChange(10)}
                >
                  <Text style={styles.volumeButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              
              {/* Volume Bar Visual */}
              <View style={styles.volumeBar}>
                <View 
                  style={[
                    styles.volumeFill, 
                    { width: `${settings.volume}%` }
                  ]} 
                />
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleResetSettings}
            >
              <Text style={styles.resetButtonText}>Reset Defaults</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundBase,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    maxHeight: '100%',
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.accentGold,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  volumeContainer: {
    alignItems: 'center',
    width: '100%',
  },
  volumeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  volumeButton: {
    backgroundColor: colors.accentGold,
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.md,
  },
  volumeButtonText: {
    color: colors.backgroundBase,
    fontSize: 20,
    fontWeight: '600',
  },
  volumeDisplay: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.accentGold,
    minWidth: 90,
    textAlign: 'center',
  },
  volumeBar: {
    width: '70%',
    height: 6,
    backgroundColor: colors.steelGrey,
    borderRadius: 3,
    overflow: 'hidden',
  },
  volumeFill: {
    height: '100%',
    backgroundColor: colors.accentGold,
    borderRadius: 3,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  resetButton: {
    flex: 1,
    backgroundColor: colors.bloodRed,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: colors.ivoryWhite,
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    flex: 1,
    backgroundColor: colors.accentGold,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: colors.backgroundBase,
    fontSize: 16,
    fontWeight: '600',
  },
});

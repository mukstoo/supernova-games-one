// app/main-menu.tsx
import React from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import menuBackground from '../assets/images/menu_background.png';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BUTTON_WIDTH = SCREEN_WIDTH * 0.4;

export default function MainMenu() {
  const router = useRouter();
  const hasSave = useSelector((s: RootState) => s.player.name.length > 0);

  return (
    <ImageBackground
      source={menuBackground}
      style={styles.background}
      resizeMode="contain"
    >
      <View style={styles.buttonContainer}>
        <MenuButton title="New Game" onPress={() => router.push('/character-creation')} />
        <MenuButton
          title="Continue"
          onPress={() => router.push('/map')}
          disabled={!hasSave}
        />
        <MenuButton title="Options" onPress={() => router.push('/options')} />
      </View>
    </ImageBackground>
  );
}

interface MenuButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

const MenuButton: React.FC<MenuButtonProps> = ({ title, onPress, disabled = false }) => (
  <TouchableOpacity
    style={[
      styles.button,
      disabled && styles.buttonDisabled,
    ]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text
      style={[
        styles.buttonText,
        disabled && styles.buttonTextDisabled,
      ]}
    >
      {title}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: colors.backgroundBase,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: spacing.md,
  },
  buttonContainer: {
    width: BUTTON_WIDTH,
    gap: spacing.lg, // increased spacing between buttons
  },
  button: {
    width: '100%',
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.surface, // darker button background
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.steelGrey,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.accentGold, // gold text for contrast
  },
  buttonTextDisabled: {
    color: colors.ashBlue,
  },
});

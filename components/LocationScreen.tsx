// components/LocationScreen.tsx
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
import { LocationConfig } from '../utils/locationConfig';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  config: LocationConfig;
}

export default function LocationScreen({ config }: Props) {
  const router = useRouter();

  const onAction = (key: string) => {
    if (key === 'fight') {
      router.push('/battle');
    } else {
      console.log(`Action: ${key}`);
    }
  };

  return (
    <ImageBackground
      source={config.bg}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>{config.title}</Text>
        <View style={styles.actions}>
          {config.actions.map((a) => (
            <TouchableOpacity
              key={a.key}
              style={styles.button}
              onPress={() => onAction(a.key)}
            >
              <Text style={styles.buttonText}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.ivoryWhite,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  actions: {
    gap: spacing.md,
  },
  button: {
    backgroundColor: colors.accentGold,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.obsidianBlack,
  },
});

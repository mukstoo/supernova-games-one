import React from 'react';
import { View, StyleSheet, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { colors } from '../theme/colors';

export default function MainMenu() {
  const router = useRouter();
  const hasSave = useSelector((s: RootState) => s.player.name.length > 0);

  return (
    <View style={styles.root}>
      <Button title="New Game" onPress={() => router.push('/character-creation')} />
      <Button title="Continue" disabled={!hasSave} onPress={() => router.push('/map')} />
      <Button title="Options" onPress={() => router.push('/options')} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.backgroundBase,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
});

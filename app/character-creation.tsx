import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { setName } from '../store/slices/playerSlice';
import {
  resetGameState,
  regenerateMap,
} from '../store/slices/gameSlice';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export default function CharacterCreation() {
  const [name, setLocalName] = useState('');
  const dispatch = useDispatch();
  const router = useRouter();

  const startGame = () => {
    const finalName = name.trim();
    if (!finalName) {
      Alert.alert('Name required', 'Please enter a character name.');
      return;
    }
    console.log('🚀 [CharacterCreation] startGame name=', finalName);
    dispatch(resetGameState());
    dispatch(setName(finalName));
    dispatch(regenerateMap());
    console.log('🚀 [CharacterCreation] navigate → /map');
    router.replace('/map');
  };

  return (
    <View style={styles.root}>
      <TextInput
        style={styles.input}
        placeholder="Enter hero name"
        placeholderTextColor={colors.fadedBeige}
        value={name}
        onChangeText={setLocalName}
        maxLength={20}
        onSubmitEditing={startGame}
      />
      <Button title="Start Adventure" onPress={startGame} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.backgroundBase,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  input: {
    width: 260,
    height: 42,
    borderWidth: 1,
    borderColor: colors.steelGrey,
    backgroundColor: colors.surface,
    color: colors.ivoryWhite,
    paddingHorizontal: spacing.sm,
  },
});

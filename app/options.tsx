// app/options.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export default function OptionsPage() {
  const router = useRouter();
  return (
    <>
      <Stack.Screen options={{ title: 'Options' }} />
      <View style={styles.root}>
        <Text style={styles.header}>Options</Text>
        {/* Add your real options here */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.backgroundBase,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.ivoryWhite,
    marginBottom: spacing.lg,
  },
  backBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.accentGold,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 6,
  },
  backText: {
    color: colors.backgroundBase,
    fontWeight: '600',
  },
});

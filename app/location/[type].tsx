// app/location/[type].tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import LocationScreen from '../../components/LocationScreen';
import { locationConfig, LocationType } from '../../utils/locationConfig';
import { colors } from '../../theme/colors';

export default function LocationPage() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const locationType = type as LocationType;
  const config = locationConfig[locationType];

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: !!config,
          title: config?.title ?? 'Unknown Location',
        }}
      />
      {config ? (
        <LocationScreen config={config} />
      ) : (
        <View style={styles.center}>
          <Text style={styles.text}>
            Unknown location type: {type}
          </Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: colors.ivoryWhite,
    fontSize: 18,
  },
});

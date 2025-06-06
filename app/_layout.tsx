// app/_layout.tsx
import React, { useEffect } from 'react';
import { BackHandler, Alert, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store, persistor } from '../store';
import { colors } from '../theme/colors';  // <-- Named import of the color object

export default function RootLayout() {
  useEffect(() => {
    (async () => {
      try {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        await NavigationBar.setVisibilityAsync('hidden');
      } catch (err) {
        // console.warn('Failed to lock orientation or hide nav bar', err); // Removed log
      }
    })();

    const handler = () => {
      Alert.alert('Quit game?', 'Do you really want to exit?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Quit', style: 'destructive', onPress: () => BackHandler.exitApp() },
      ]);
      return true;
    };
    BackHandler.addEventListener('hardwareBackPress', handler);
    return () => BackHandler.removeEventListener('hardwareBackPress', handler);
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <GestureHandlerRootView style={styles.root}>
            <StatusBar hidden />
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'fade',
                contentStyle: styles.root,
              }}
            />
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.backgroundBase,  // <-- Now resolves correctly
  },
});

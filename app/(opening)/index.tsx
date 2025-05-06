import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { preloadAssets } from '../../utils/preload';
import { colors } from '../../theme/colors';
import logo1 from '../../assets/images/logo1.png';
import logo2 from '../../assets/images/logo2.png';

const { width } = Dimensions.get('window');
const DISPLAY_TIME = 3000;

export default function Opening() {
  const router = useRouter();
  const [step, setStep] = useState<'loading' | 'logo1' | 'logo2'>('loading');
  const opacity = new Animated.Value(0);

  useEffect(() => {
    preloadAssets().then(() => setStep('logo1'));
  }, []);

  useEffect(() => {
    if (step === 'logo1' || step === 'logo2') {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 800,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();

      const t = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }).start(() => {
          if (step === 'logo1') setStep('logo2');
          else router.replace('/main-menu');
        });
      }, DISPLAY_TIME);

      return () => clearTimeout(t);
    }
  }, [step, router, opacity]);

  const source = step === 'logo1' ? logo1 : step === 'logo2' ? logo2 : null;

  return (
    <View style={styles.root}>
      {source && (
        <Animated.Image source={source} style={[styles.img, { opacity }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.backgroundBase,
    justifyContent: 'center',
    alignItems: 'center',
  },
  img: {
    width: width * 0.25,
    resizeMode: 'contain',
  },
});

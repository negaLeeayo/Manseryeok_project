import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  BackHandler,
  Easing,
  Image,
  PanResponder,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Splash1Graphic from './assets/visuals/splash-1-graphic.svg';
import Splash2Graphic from './assets/visuals/splash-2-graphic.svg';
import Splash3Graphic from './assets/visuals/splash-3-graphic.svg';
import Splash4Graphic from './assets/visuals/splash-4-graphic.svg';

type Screen = 'intro' | 'splash';

const splashPages = [
  {
    title: '태어난 순간에는 저마다\n다른 빛이 있습니다',
    description: '천간의 기운이 당신의 가장 깊은 곳에 새겨집니다.',
    Graphic: Splash1Graphic,
  },
  {
    title: '기운은 계절을 만나\n하나의 결이 됩니다',
    description: '지지의 흐름 속에서 당신만의 무늬가 피어납니다.',
    Graphic: Splash2Graphic,
  },
  {
    title: '어려운 사주를 나를\n닮은 장면으로',
    description: '한자 없이 자연의 언어로 당신을 표현합니다.',
    Graphic: Splash3Graphic,
  },
  {
    title: '당신만의 빛결을\n확인해보세요',
    description: '하늘의 빛이 땅의 결을 만나, 당신만의 장면이 됩니다.',
    Graphic: Splash4Graphic,
  },
];

export default function App() {
  const [screen, setScreen] = useState<Screen>('intro');
  const [splashIndex, setSplashIndex] = useState(0);
  const transition = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    transition.setValue(0);
    Animated.timing(transition, {
      toValue: 1,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [screen, splashIndex, transition]);

  const nextSplash = () => {
    if (splashIndex === splashPages.length - 1) {
      Alert.alert('온보딩 완료', '다음 화면은 사용자 플로우 브랜치에서 이어집니다.');
      return;
    }
    setSplashIndex((current) => current + 1);
  };

  const previousSplash = () => {
    if (splashIndex === 0) setScreen('intro');
    else setSplashIndex((current) => current - 1);
  };

  useEffect(() => {
    if (screen === 'intro') return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      previousSplash();
      return true;
    });
    return () => subscription.remove();
  }, [screen, splashIndex]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <Animated.View
        style={[
          styles.transition,
          {
            opacity: transition,
            transform: [{ translateX: transition.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
          },
        ]}
      >
        {screen === 'intro' ? (
          <IntroScreen onContinue={() => setScreen('splash')} />
        ) : (
          <SplashScreen
            index={splashIndex}
            onNext={nextSplash}
            onPrevious={previousSplash}
            onSkip={() => setSplashIndex(splashPages.length - 1)}
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

function IntroScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <Pressable
      style={styles.intro}
      onPress={onContinue}
      accessibilityLabel="온보딩 시작"
      accessibilityHint="화면을 터치하면 다음 화면으로 이동합니다"
    >
      <IntroArtwork />
      <Text style={styles.brand}>빛결</Text>
      <Text style={styles.brandLine}>하늘의 빛이 땅의 결을 만나,</Text>
      <Text style={styles.brandLine}>당신만의 장면이 됩니다.</Text>
    </Pressable>
  );
}

function IntroArtwork() {
  const motion = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const motionAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(motion, { toValue: 1, duration: 1900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(motion, { toValue: 0, duration: 1900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 950, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 950, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    motionAnimation.start();
    shimmerAnimation.start();
    return () => {
      motionAnimation.stop();
      shimmerAnimation.stop();
    };
  }, [motion, shimmer]);

  const sparkleStyle = {
    opacity: shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.25, 1] }),
    transform: [{ scale: shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.25] }) }],
  };

  return (
    <View style={styles.introArt} pointerEvents="none">
      <Animated.View
        style={[
          styles.introArtMotion,
          {
            opacity: motion.interpolate({ inputRange: [0, 1], outputRange: [0.84, 1] }),
            transform: [
              { translateY: motion.interpolate({ inputRange: [0, 1], outputRange: [4, -5] }) },
              { scale: motion.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1.035] }) },
            ],
          },
        ]}
      >
        <Image source={require('./assets/visuals/onboarding-source.png')} style={styles.introSourceImage} resizeMode="stretch" />
        <Animated.View
          style={[
            styles.introBeam,
            { opacity: shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.12, 0.72] }) },
          ]}
        >
          <LinearGradient
            colors={['transparent', '#f4d8ff', '#ffffff', '#b9efff', 'transparent']}
            locations={[0, 0.18, 0.48, 0.78, 1]}
            style={styles.introBeamGradient}
          />
        </Animated.View>
        <Animated.View style={[styles.introSparkle, styles.introSparkleTop, sparkleStyle]} />
        <Animated.View style={[styles.introSparkle, styles.introSparkleUpper, sparkleStyle]} />
        <Animated.View style={[styles.introSparkle, styles.introSparkleLower, sparkleStyle]} />
        <Animated.View style={[styles.introSparkle, styles.introSparkleBottom, sparkleStyle]} />
      </Animated.View>
    </View>
  );
}

function SplashScreen({ index, onNext, onPrevious, onSkip }: {
  index: number;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
}) {
  const page = splashPages[index];
  const Graphic = page.Graphic;
  const reveal = useRef(new Animated.Value(0)).current;
  const dragX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    reveal.setValue(0);
    Animated.timing(reveal, { toValue: 1, duration: 720, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [index, reveal]);

  const panResponder = useMemo(
    () => PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 10 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onMoveShouldSetPanResponderCapture: (_, gesture) => Math.abs(gesture.dx) > 14 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderMove: (_, gesture) => dragX.setValue(gesture.dx),
      onPanResponderRelease: (_, gesture) => {
        const navigate = gesture.dx < -56 ? onNext : gesture.dx > 56 ? onPrevious : undefined;
        if (!navigate) {
          Animated.spring(dragX, { toValue: 0, speed: 20, bounciness: 4, useNativeDriver: true }).start();
          return;
        }
        Animated.timing(dragX, { toValue: gesture.dx < 0 ? -42 : 42, duration: 100, useNativeDriver: true }).start(() => {
          dragX.setValue(0);
          navigate();
        });
      },
      onPanResponderTerminate: () => Animated.spring(dragX, { toValue: 0, useNativeDriver: true }).start(),
    }),
    [dragX, onNext, onPrevious],
  );

  return (
    <Animated.View
      style={[
        styles.page,
        {
          transform: [{
            translateX: dragX.interpolate({ inputRange: [-200, 0, 200], outputRange: [-48, 0, 48], extrapolate: 'clamp' }),
          }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <FloatingBackButton onPress={onPrevious} />
      <Pressable style={styles.skipButton} onPress={onSkip}><Text style={styles.skipText}>건너뛰기</Text></Pressable>
      <View style={styles.splashContent}>
        <Animated.View
          style={{
            opacity: reveal.interpolate({ inputRange: [0, 0.48, 1], outputRange: [0, 1, 1] }),
            transform: [{ translateY: reveal.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
          }}
        >
          <Graphic width={228} height={228} />
        </Animated.View>
        <Animated.Text
          style={[
            styles.splashTitle,
            {
              opacity: reveal.interpolate({ inputRange: [0, 0.28, 0.76, 1], outputRange: [0, 0, 1, 1] }),
              transform: [{ translateY: reveal.interpolate({ inputRange: [0, 0.35, 1], outputRange: [12, 12, 0] }) }],
            },
          ]}
        >
          {page.title}
        </Animated.Text>
        <Animated.Text style={[styles.description, { opacity: reveal.interpolate({ inputRange: [0, 0.58, 1], outputRange: [0, 0, 1] }) }]}>
          {page.description}
        </Animated.Text>
      </View>
      <View style={styles.bottomArea}>
        <View style={styles.dots}>
          {splashPages.map((_, dot) => <View key={dot} style={[styles.dot, dot === index && styles.activeDot]} />)}
        </View>
        <PrimaryButton label={index === splashPages.length - 1 ? '내 빛결 시작하기' : '다음'} onPress={onNext} />
      </View>
    </Animated.View>
  );
}

function FloatingBackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="이전 화면" style={({ pressed }) => [styles.floatingBackButton, pressed && styles.buttonPressed]} onPress={onPress}>
      <Text style={styles.floatingBackText}>‹</Text>
    </Pressable>
  );
}

function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.primaryPressable, pressed && styles.buttonPressed]}>
      <LinearGradient colors={['#8ba7ff', '#c4b5fd']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.primaryButton}>
        <Text style={styles.primaryText}>{label}　→</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#070a18' },
  transition: { flex: 1 },
  page: { flex: 1, backgroundColor: '#080b1a', paddingHorizontal: 24 },
  intro: { flex: 1, backgroundColor: '#07112c', alignItems: 'center', justifyContent: 'center', paddingBottom: 50 },
  introArt: { width: 275, height: 388, overflow: 'hidden', marginBottom: 10 },
  introArtMotion: { position: 'absolute', width: 275, height: 388 },
  introSourceImage: { position: 'absolute', left: 0, top: 0, width: 588, height: 388 },
  introBeam: { position: 'absolute', left: 135, top: 54, width: 4, height: 276, borderRadius: 4, shadowColor: '#fff', shadowOpacity: 0.9, shadowRadius: 10, elevation: 6 },
  introBeamGradient: { flex: 1, borderRadius: 4 },
  introSparkle: { position: 'absolute', left: 135, width: 7, height: 7, borderRadius: 4, backgroundColor: '#fff', shadowColor: '#fff', shadowOpacity: 1, shadowRadius: 7, elevation: 7 },
  introSparkleTop: { top: 19 },
  introSparkleUpper: { top: 51, width: 6, height: 6 },
  introSparkleLower: { top: 339, width: 6, height: 6 },
  introSparkleBottom: { top: 375, width: 4, height: 4 },
  brand: { color: '#ded4f4', fontSize: 48, fontWeight: '300', letterSpacing: 12, marginLeft: 12, marginBottom: 34 },
  brandLine: { color: '#8e94a8', fontSize: 17, lineHeight: 25, fontWeight: '300' },
  floatingBackButton: { position: 'absolute', zIndex: 12, top: 18, left: 18, width: 34, height: 34, borderRadius: 17, backgroundColor: '#171a27', alignItems: 'center', justifyContent: 'center' },
  floatingBackText: { color: '#a0a3ad', fontSize: 29, lineHeight: 31, marginTop: -2 },
  skipButton: { position: 'absolute', zIndex: 2, top: 18, right: 18, paddingVertical: 9, paddingHorizontal: 15, borderRadius: 20, backgroundColor: '#171a27' },
  skipText: { color: '#777b88', fontSize: 13 },
  splashContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 45 },
  splashTitle: { color: '#f8f8fb', textAlign: 'center', fontSize: 24, lineHeight: 34, fontWeight: '700', marginTop: 28 },
  description: { color: '#6c7080', textAlign: 'center', fontSize: 13, lineHeight: 20, marginTop: 16 },
  bottomArea: { marginTop: 'auto', paddingBottom: 18, gap: 22 },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  dot: { width: 6, height: 6, borderRadius: 4, backgroundColor: '#383b4d' },
  activeDot: { width: 20, backgroundColor: '#c4a8ff' },
  primaryPressable: { width: '100%' },
  primaryButton: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  buttonPressed: { opacity: 0.82 },
});

import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Easing,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  PanResponder,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import FemaleIcon from './assets/visuals/gender-female.svg';
import MaleIcon from './assets/visuals/gender-male.svg';
import LoginGraphic from './assets/visuals/login-graphic.svg';
import Splash1Graphic from './assets/visuals/splash-1-graphic.svg';
import Splash2Graphic from './assets/visuals/splash-2-graphic.svg';
import Splash3Graphic from './assets/visuals/splash-3-graphic.svg';
import Splash4Graphic from './assets/visuals/splash-4-graphic.svg';

type Screen =
  | 'intro'
  | 'splash'
  | 'consent'
  | 'login'
  | 'name'
  | 'birthDate'
  | 'birthTime'
  | 'gender'
  | 'review'
  | 'loading';
type Calendar = 'solar' | 'lunar';
type Gender = 'female' | 'male' | '';

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

const birthTimes = [
  '모름',
  '자시 (23:30~01:30)',
  '축시 (01:30~03:30)',
  '인시 (03:30~05:30)',
  '묘시 (05:30~07:30)',
  '진시 (07:30~09:30)',
  '사시 (09:30~11:30)',
  '오시 (11:30~13:30)',
  '미시 (13:30~15:30)',
  '신시 (15:30~17:30)',
  '유시 (17:30~19:30)',
  '술시 (19:30~21:30)',
  '해시 (21:30~23:00)',
];

export default function App() {
  const [screen, setScreen] = useState<Screen>('intro');
  const [splashIndex, setSplashIndex] = useState(0);
  const [terms, setTerms] = useState({ service: false, privacy: false, marketing: false });
  const [name, setName] = useState('');
  const [calendar, setCalendar] = useState<Calendar>('solar');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [gender, setGender] = useState<Gender>('');
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

  const dateValid = useMemo(() => {
    const y = Number(year);
    const m = Number(month);
    const d = Number(day);
    if (!/^\d{4}$/.test(year) || m < 1 || m > 12 || d < 1 || d > 31) return false;
    const date = new Date(y, m - 1, d);
    return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
  }, [year, month, day]);

  const allTerms = terms.service && terms.privacy && terms.marketing;
  const requiredTerms = terms.service && terms.privacy;

  const toggleAllTerms = () => {
    const next = !allTerms;
    setTerms({ service: next, privacy: next, marketing: next });
  };

  const nextSplash = () => {
    if (splashIndex === splashPages.length - 1) setScreen('consent');
    else setSplashIndex((current) => current + 1);
  };

  const previousSplash = () => {
    if (splashIndex === 0) setScreen('intro');
    else setSplashIndex((current) => current - 1);
  };

  const goBack = () => {
    const previous: Partial<Record<Screen, Screen>> = {
      consent: 'splash',
      login: 'consent',
      name: 'login',
      birthDate: 'name',
      birthTime: 'birthDate',
      gender: 'birthTime',
      review: 'gender',
      loading: 'review',
    };
    const destination = previous[screen];
    if (destination) setScreen(destination);
  };

  useEffect(() => {
    if (screen === 'intro') return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen === 'splash') previousSplash();
      else goBack();
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
        {screen === 'intro' && <IntroScreen onContinue={() => setScreen('splash')} />}
        {screen === 'splash' && (
          <SplashScreen
            index={splashIndex}
            onNext={nextSplash}
            onPrevious={previousSplash}
            onSkip={() => setScreen('consent')}
          />
        )}
        {screen === 'consent' && (
          <ConsentScreen
            terms={terms}
            allTerms={allTerms}
            requiredTerms={requiredTerms}
            onToggleAll={toggleAllTerms}
            onToggle={(key) => setTerms((current) => ({ ...current, [key]: !current[key] }))}
            onBack={goBack}
            onContinue={() => setScreen('login')}
          />
        )}
        {screen === 'login' && <LoginScreen onBack={goBack} onLogin={() => setScreen('name')} />}
        {screen === 'name' && (
          <NameScreen name={name} onChange={setName} onBack={goBack} onNext={() => setScreen('birthDate')} />
        )}
        {screen === 'birthDate' && (
          <BirthDateScreen
            calendar={calendar}
            year={year}
            month={month}
            day={day}
            valid={dateValid}
            onCalendar={setCalendar}
            onYear={setYear}
            onMonth={setMonth}
            onDay={setDay}
            onBack={goBack}
            onNext={() => setScreen('birthTime')}
          />
        )}
        {screen === 'birthTime' && (
          <BirthTimeScreen
            value={birthTime}
            onChange={setBirthTime}
            onBack={goBack}
            onNext={() => setScreen('gender')}
          />
        )}
        {screen === 'gender' && (
          <GenderScreen
            value={gender}
            onChange={setGender}
            onBack={goBack}
            onNext={() => setScreen('review')}
          />
        )}
        {screen === 'review' && (
          <ReviewScreen
            name={name.trim()}
            birthDate={`${year}.${month.padStart(2, '0')}.${day.padStart(2, '0')}`}
            calendar={calendar}
            birthTime={birthTime}
            gender={gender}
            onBack={goBack}
            onCalculate={() => setScreen('loading')}
          />
        )}
        {screen === 'loading' && <LoadingScreen onBack={goBack} />}
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
        Animated.timing(motion, {
          toValue: 1,
          duration: 1900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(motion, {
          toValue: 0,
          duration: 1900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 950,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 950,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
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
        <Image
          source={require('./assets/visuals/onboarding-source.png')}
          style={styles.introSourceImage}
          resizeMode="stretch"
        />
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

function SplashScreen({ index, onNext, onPrevious, onSkip }: { index: number; onNext: () => void; onPrevious: () => void; onSkip: () => void }) {
  const page = splashPages[index];
  const Graphic = page.Graphic;
  const reveal = useRef(new Animated.Value(0)).current;
  const dragX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    reveal.setValue(0);
    Animated.timing(reveal, {
      toValue: 1,
      duration: 720,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
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
        Animated.timing(dragX, {
          toValue: gesture.dx < 0 ? -42 : 42,
          duration: 100,
          useNativeDriver: true,
        }).start(() => {
          dragX.setValue(0);
          navigate();
        });
      },
      onPanResponderTerminate: () => {
        Animated.spring(dragX, { toValue: 0, useNativeDriver: true }).start();
      },
    }),
    [dragX, onNext, onPrevious],
  );

  return (
    <Animated.View
      style={[
        styles.page,
        {
          transform: [{
            translateX: dragX.interpolate({
              inputRange: [-200, 0, 200],
              outputRange: [-48, 0, 48],
              extrapolate: 'clamp',
            }),
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
        <Animated.Text
          style={[
            styles.description,
            { opacity: reveal.interpolate({ inputRange: [0, 0.58, 1], outputRange: [0, 0, 1] }) },
          ]}
        >
          {page.description}
        </Animated.Text>
      </View>
      <View style={styles.bottomArea}>
        <View style={styles.dots}>
          {splashPages.map((_, dot) => <View key={dot} style={[styles.dot, dot === index && styles.activeDot]} />)}
        </View>
        <PrimaryButton
          label={index === splashPages.length - 1 ? '내 빛결 시작하기' : '다음'}
          onPress={onNext}
          active
        />
      </View>
    </Animated.View>
  );
}

type ConsentKey = 'service' | 'privacy' | 'marketing';
function ConsentScreen({ terms, allTerms, requiredTerms, onToggleAll, onToggle, onBack, onContinue }: {
  terms: Record<ConsentKey, boolean>;
  allTerms: boolean;
  requiredTerms: boolean;
  onToggleAll: () => void;
  onToggle: (key: ConsentKey) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <View style={styles.page}>
      <FloatingBackButton onPress={onBack} />
      <View style={styles.sectionHeader}>
        <Text style={styles.heading}>서비스 이용 동의</Text>
        <Text style={styles.descriptionLeft}>빛결을 시작하기 전에 아래 내용을 확인해주세요.</Text>
      </View>
      <View style={styles.termsList}>
        <CheckRow checked={allTerms} label="전체 동의" strong onPress={onToggleAll} />
        <CheckRow checked={terms.service} label="[필수] 서비스 이용약관 동의" arrow onPress={() => onToggle('service')} />
        <CheckRow checked={terms.privacy} label="[필수] 개인정보 처리방침 동의" arrow onPress={() => onToggle('privacy')} />
        <CheckRow checked={terms.marketing} label="[선택] 마케팅 정보 수신 동의" onPress={() => onToggle('marketing')} />
      </View>
      <View style={styles.bottomArea}><PrimaryButton label="동의하고 계속하기" active={requiredTerms} onPress={onContinue} /></View>
    </View>
  );
}

function CheckRow({ checked, label, onPress, strong, arrow }: { checked: boolean; label: string; onPress: () => void; strong?: boolean; arrow?: boolean }) {
  return (
    <Pressable style={styles.checkRow} onPress={onPress}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}><Text style={styles.checkMark}>{checked ? '✓' : ''}</Text></View>
      <Text style={[styles.checkLabel, strong && styles.checkLabelStrong]}>{label}</Text>
      {arrow && <Text style={styles.rowArrow}>›</Text>}
    </Pressable>
  );
}

function LoginScreen({ onBack, onLogin }: { onBack: () => void; onLogin: () => void }) {
  return (
    <View style={styles.page}>
      <FloatingBackButton onPress={onBack} />
      <View style={styles.loginCenter}>
        <LoginGraphic width={150} height={150} />
        <Text style={styles.splashTitle}>태어난 날의 기운을{`\n`}만나러 갈까요?</Text>
        <Text style={styles.description}>로그인하고 나만의 빛결을 확인해보세요</Text>
      </View>
      <View style={styles.socialArea}>
        <Pressable style={[styles.socialButton, styles.kakao]} onPress={onLogin}><Text style={styles.kakaoText}>●　카카오로 계속하기</Text></Pressable>
        <Pressable style={[styles.socialButton, styles.google]} onPress={onLogin}><Text style={styles.googleText}><Text style={styles.googleG}>G</Text>　Google로 계속하기</Text></Pressable>
        <Text style={styles.legal}>계속 진행 시 이용약관 및 개인정보처리방침에 동의합니다</Text>
      </View>
    </View>
  );
}

function NameScreen({ name, onChange, onBack, onNext }: { name: string; onChange: (value: string) => void; onBack: () => void; onNext: () => void }) {
  const valid = name.trim().length > 0;
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <StepHeader step={1} onBack={onBack} />
        <View style={styles.formContent}>
          <Text style={styles.heading}>이름 또는 닉네임을 알려주세요</Text>
          <Text style={styles.descriptionLeft}>사주 결과에서 표시될 이름이에요</Text>
          <TextInput
            style={styles.nameInput}
            value={name}
            onChangeText={onChange}
            placeholder="닉네임 입력"
            placeholderTextColor="#414453"
            maxLength={20}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
          />
        </View>
        <View style={styles.bottomArea}><PrimaryButton label="다음" active={valid} onPress={onNext} /></View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

function BirthDateScreen(props: {
  calendar: Calendar; year: string; month: string; day: string; valid: boolean;
  onCalendar: (value: Calendar) => void; onYear: (value: string) => void; onMonth: (value: string) => void;
  onDay: (value: string) => void; onBack: () => void; onNext: () => void;
}) {
  const digits = (value: string, length: number) => value.replace(/\D/g, '').slice(0, length);
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <StepHeader step={2} onBack={props.onBack} />
        <View style={styles.formContent}>
          <Text style={styles.heading}>언제 태어나셨나요?</Text>
          <Text style={styles.descriptionLeft}>양력/음력을 선택하고 날짜를 입력해주세요</Text>
          <View style={styles.segment}>
            {(['solar', 'lunar'] as Calendar[]).map((value) => (
              <Pressable key={value} style={[styles.segmentItem, props.calendar === value && styles.segmentActive]} onPress={() => props.onCalendar(value)}>
                <Text style={[styles.segmentText, props.calendar === value && styles.segmentTextActive]}>{value === 'solar' ? '양력' : '음력'}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.dateRow}>
            <DateInput label="년도" placeholder="1998" value={props.year} maxLength={4} onChange={(v) => props.onYear(digits(v, 4))} />
            <DateInput label="월" placeholder="03" value={props.month} maxLength={2} onChange={(v) => props.onMonth(digits(v, 2))} />
            <DateInput label="일" placeholder="15" value={props.day} maxLength={2} onChange={(v) => props.onDay(digits(v, 2))} />
          </View>
        </View>
        <View style={styles.bottomArea}><PrimaryButton label="다음" active={props.valid} onPress={props.onNext} /></View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

function DateInput({ label, placeholder, value, maxLength, onChange }: { label: string; placeholder: string; value: string; maxLength: number; onChange: (value: string) => void }) {
  return (
    <View style={styles.dateField}>
      <Text style={styles.dateLabel}>{label}</Text>
      <TextInput style={styles.dateInput} value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor="#363946" keyboardType="number-pad" maxLength={maxLength} />
    </View>
  );
}

function BirthTimeScreen({ value, onChange, onBack, onNext }: { value: string; onChange: (value: string) => void; onBack: () => void; onNext: () => void }) {
  return (
    <View style={styles.page}>
      <StepHeader step={3} onBack={onBack} />
      <ScrollView contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>태어난 시간을 입력해주세요</Text>
        <Text style={styles.descriptionLeft}>모르시면 ‘모름’을 선택하셔도 괜찮아요</Text>
        <View style={styles.timeGrid}>
          {birthTimes.map((time) => (
            <Pressable key={time} style={[styles.timeOption, value === time && styles.timeOptionActive]} onPress={() => onChange(time)}>
              <Text style={[styles.timeText, value === time && styles.timeTextActive]}>{time}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <View style={styles.bottomArea}><PrimaryButton label="다음" active={Boolean(value)} onPress={onNext} /></View>
    </View>
  );
}

function GenderScreen({ value, onChange, onBack, onNext }: { value: Gender; onChange: (value: Gender) => void; onBack: () => void; onNext: () => void }) {
  return (
    <View style={styles.page}>
      <StepHeader step={4} onBack={onBack} />
      <View style={styles.formContent}>
        <Text style={styles.heading}>성별을 선택해주세요</Text>
        <Text style={styles.descriptionLeft}>오행 해석에 참고됩니다</Text>
        <View style={styles.genderRow}>
          <GenderCard label="여성" selected={value === 'female'} colors={['#ff9fc7', '#ff8b7e', '#f849b4']} onPress={() => onChange('female')}><FemaleIcon width={72} height={72} /></GenderCard>
          <GenderCard label="남성" selected={value === 'male'} colors={['#5982f5', '#8657db']} onPress={() => onChange('male')}><MaleIcon width={72} height={72} /></GenderCard>
        </View>
      </View>
      <View style={styles.bottomArea}><PrimaryButton label="다음" active={Boolean(value)} onPress={onNext} /></View>
    </View>
  );
}

function GenderCard({ label, selected, colors, onPress, children }: { label: string; selected: boolean; colors: [string, string, ...string[]]; onPress: () => void; children: React.ReactNode }) {
  const content = <><View style={styles.genderIcon}>{children}</View><Text style={[styles.genderLabel, selected && styles.genderLabelActive]}>{label}</Text></>;
  return (
    <Pressable style={styles.genderPressable} onPress={onPress}>
      {selected ? <LinearGradient colors={colors} style={styles.genderCard}>{content}</LinearGradient> : <View style={[styles.genderCard, styles.genderCardIdle]}>{content}</View>}
    </Pressable>
  );
}

function ReviewScreen({ name, birthDate, calendar, birthTime, gender, onBack, onCalculate }: { name: string; birthDate: string; calendar: Calendar; birthTime: string; gender: Gender; onBack: () => void; onCalculate: () => void }) {
  return (
    <View style={styles.page}>
      <StepHeader step={5} onBack={onBack} />
      <ScrollView contentContainerStyle={styles.formContent}>
        <Text style={styles.heading}>입력하신 정보를 확인해주세요</Text>
        <Text style={styles.descriptionLeft}>잘못된 정보는 수정 후 시작하세요</Text>
        <LinearGradient colors={['#27354e', '#252344']} style={styles.profileCard}>
          <View><Text style={styles.profileLabel}>이름</Text><Text style={styles.profileName}>{name}</Text></View>
          <LoginGraphic width={96} height={96} />
        </LinearGradient>
        <InfoRow label="생년월일" value={`${birthDate} (${calendar === 'solar' ? '양력' : '음력'})`} />
        <InfoRow label="태어난 시간" value={birthTime} />
        <InfoRow label="성별" value={gender === 'female' ? '여성' : '남성'} />
        <Text style={styles.reviewNote}>정보는 언제든 마이페이지에서 수정할 수 있어요</Text>
      </ScrollView>
      <View style={styles.bottomArea}><PrimaryButton label="빛결 계산하기" active onPress={onCalculate} /></View>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <View style={styles.infoRow}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View>;
}

function LoadingScreen({ onBack }: { onBack: () => void }) {
  const [dotCount, setDotCount] = useState(1);
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setInterval(() => setDotCount((current) => (current % 3) + 1), 450);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 850,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 850,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  return (
    <View style={styles.loading}>
      <FloatingBackButton onPress={onBack} />
      <Animated.View
        style={[
          styles.loadingGemGlow,
          {
            opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.62, 1] }),
            transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.1] }) }],
          },
        ]}
      >
        <LoginGraphic width={158} height={158} />
      </Animated.View>
      <Text style={styles.loadingText}>당신의 빛과 계절을 연결하고 있어요</Text>
      <Text style={styles.loadingDots}>{'.'.repeat(dotCount)}</Text>
    </View>
  );
}

function FloatingBackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="이전 화면"
      style={({ pressed }) => [styles.floatingBackButton, pressed && styles.buttonPressed]}
      onPress={onPress}
    >
      <Text style={styles.floatingBackText}>‹</Text>
    </Pressable>
  );
}

function StepHeader({ step, onBack }: { step: number; onBack?: () => void }) {
  return (
    <View style={styles.stepHeader}>
      <View style={styles.progressRow}>{[1, 2, 3, 4, 5].map((item) => <View key={item} style={[styles.progress, item <= step && styles.progressActive]} />)}</View>
      <View style={styles.stepMeta}>
        {onBack ? <Pressable style={styles.backButton} onPress={onBack}><Text style={styles.backText}>‹</Text></Pressable> : <View style={styles.backPlaceholder} />}
        <Text style={styles.stepText}>{step}/5</Text>
      </View>
    </View>
  );
}

function PrimaryButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const body = <Text style={[styles.primaryText, !active && styles.disabledText]}>{label}　→</Text>;
  if (active) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.primaryPressable, pressed && styles.buttonPressed]}
      >
        <LinearGradient
          colors={['#8ba7ff', '#c4b5fd']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.primaryButton}
        >
          {body}
        </LinearGradient>
      </Pressable>
    );
  }
  return <Pressable style={[styles.primaryButton, styles.primaryDisabled]} disabled onPress={onPress}>{body}</Pressable>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#070a18' },
  transition: { flex: 1 },
  page: { flex: 1, backgroundColor: '#080b1a', paddingHorizontal: 24 },
  intro: { flex: 1, backgroundColor: '#07112c', alignItems: 'center', justifyContent: 'center', paddingBottom: 50 },
  introArt: { width: 275, height: 388, overflow: 'hidden', marginBottom: 10 },
  introArtMotion: { position: 'absolute', width: 275, height: 388 },
  introSourceImage: { position: 'absolute', left: 0, top: 0, width: 588, height: 388 },
  introBeam: { position: 'absolute', left: 135, top: 54, width: 4, height: 276, borderRadius: 4, shadowColor: '#ffffff', shadowOpacity: 0.9, shadowRadius: 10, elevation: 6 },
  introBeamGradient: { flex: 1, borderRadius: 4 },
  introSparkle: { position: 'absolute', left: 135, width: 7, height: 7, borderRadius: 4, backgroundColor: '#ffffff', shadowColor: '#ffffff', shadowOpacity: 1, shadowRadius: 7, elevation: 7 },
  introSparkleTop: { top: 19 },
  introSparkleUpper: { top: 51, width: 6, height: 6 },
  introSparkleLower: { top: 339, width: 6, height: 6 },
  introSparkleBottom: { top: 375, width: 4, height: 4 },
  brand: { color: '#ded4f4', fontSize: 48, fontWeight: '300', letterSpacing: 12, marginLeft: 12, marginBottom: 34 },
  brandLine: { color: '#8e94a8', fontSize: 17, lineHeight: 25, fontWeight: '300' },
  skipButton: { position: 'absolute', zIndex: 2, top: 18, right: 18, paddingVertical: 9, paddingHorizontal: 15, borderRadius: 20, backgroundColor: '#171a27' },
  skipText: { color: '#777b88', fontSize: 13 },
  floatingBackButton: { position: 'absolute', zIndex: 12, top: 18, left: 18, width: 34, height: 34, borderRadius: 17, backgroundColor: '#171a27', alignItems: 'center', justifyContent: 'center' },
  floatingBackText: { color: '#a0a3ad', fontSize: 29, lineHeight: 31, marginTop: -2 },
  splashContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 45 },
  splashTitle: { color: '#f8f8fb', textAlign: 'center', fontSize: 24, lineHeight: 34, fontWeight: '700', marginTop: 28 },
  description: { color: '#6c7080', textAlign: 'center', fontSize: 13, lineHeight: 20, marginTop: 16 },
  descriptionLeft: { color: '#6c7080', fontSize: 13, lineHeight: 20, marginTop: 8 },
  bottomArea: { marginTop: 'auto', paddingBottom: 18, gap: 22 },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  dot: { width: 6, height: 6, borderRadius: 4, backgroundColor: '#383b4d' },
  activeDot: { width: 20, backgroundColor: '#c4a8ff' },
  primaryButton: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  primaryPressable: { width: '100%' },
  buttonPressed: { opacity: 0.82 },
  primaryDisabled: { backgroundColor: '#202434' },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  disabledText: { color: '#5f6372' },
  sectionHeader: { paddingTop: 68, marginBottom: 32 },
  heading: { color: '#f4f4f8', fontSize: 23, lineHeight: 31, fontWeight: '700' },
  termsList: { gap: 12 },
  checkRow: { height: 58, borderRadius: 28, borderWidth: 1, borderColor: '#262a3a', backgroundColor: '#151826', paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: '#6e7280', alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: '#b8a7ff', borderColor: '#b8a7ff' },
  checkMark: { color: '#1a1b28', fontSize: 15, fontWeight: '800' },
  checkLabel: { color: '#c7c8d0', fontSize: 14, marginLeft: 12 },
  checkLabelStrong: { color: '#fff', fontWeight: '700' },
  rowArrow: { color: '#616574', fontSize: 24, marginLeft: 'auto' },
  loginCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 55 },
  socialArea: { paddingBottom: 30, gap: 12 },
  socialButton: { height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  kakao: { backgroundColor: '#fee500' },
  google: { backgroundColor: '#f3f3f5' },
  kakaoText: { color: '#171717', fontSize: 15, fontWeight: '700' },
  googleText: { color: '#282830', fontSize: 15, fontWeight: '600' },
  googleG: { color: '#4285f4', fontSize: 20, fontWeight: '800' },
  legal: { textAlign: 'center', color: '#444857', fontSize: 10, marginTop: 6 },
  stepHeader: { paddingTop: 20 },
  progressRow: { flexDirection: 'row', gap: 6 },
  progress: { flex: 1, height: 4, borderRadius: 3, backgroundColor: '#292c38' },
  progressActive: { backgroundColor: '#c3a8ff' },
  stepMeta: { flexDirection: 'row', alignItems: 'center', height: 58 },
  backButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#181b29', alignItems: 'center', justifyContent: 'center' },
  backText: { color: '#a0a3ad', fontSize: 28, lineHeight: 29 },
  backPlaceholder: { width: 32 },
  stepText: { color: '#676b78', fontSize: 11, marginLeft: 8 },
  formContent: { paddingTop: 18, paddingBottom: 30 },
  nameInput: { marginTop: 28, height: 58, borderBottomWidth: 1, borderBottomColor: '#3d4054', color: '#f0f0f5', fontSize: 21, paddingHorizontal: 0 },
  segment: { height: 44, flexDirection: 'row', padding: 3, backgroundColor: '#171a29', borderRadius: 16, marginTop: 28 },
  segmentItem: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 14 },
  segmentActive: { backgroundColor: '#44415f' },
  segmentText: { color: '#686b78', fontSize: 13 },
  segmentTextActive: { color: '#c2afff', fontWeight: '700' },
  dateRow: { flexDirection: 'row', gap: 14, marginTop: 20 },
  dateField: { flex: 1 },
  dateLabel: { color: '#626675', fontSize: 11, marginBottom: 5 },
  dateInput: { height: 44, borderBottomWidth: 1, borderBottomColor: '#34384a', color: '#eeeef4', textAlign: 'center', fontSize: 18 },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 9, marginTop: 28 },
  timeOption: { width: '48.7%', height: 43, borderRadius: 14, borderWidth: 1, borderColor: '#262a3a', backgroundColor: '#151826', justifyContent: 'center', paddingHorizontal: 12 },
  timeOptionActive: { borderColor: '#a99aff', backgroundColor: '#37354e' },
  timeText: { color: '#b6b8c2', fontSize: 11 },
  timeTextActive: { color: '#fff' },
  genderRow: { flexDirection: 'row', gap: 12, marginTop: 30 },
  genderPressable: { flex: 1 },
  genderCard: { height: 154, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  genderCardIdle: { backgroundColor: '#141724', borderWidth: 1, borderColor: '#272b3b' },
  genderIcon: { height: 82, justifyContent: 'center' },
  genderLabel: { color: '#828591', fontSize: 14 },
  genderLabelActive: { color: '#fff', fontWeight: '700' },
  profileCard: { height: 106, borderRadius: 24, marginTop: 26, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  profileLabel: { color: '#8c92a5', fontSize: 12 },
  profileName: { color: '#fff', fontSize: 25, fontWeight: '700', marginTop: 5 },
  infoRow: { height: 50, borderRadius: 24, backgroundColor: '#151826', borderWidth: 1, borderColor: '#242838', marginTop: 10, paddingHorizontal: 17, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { color: '#686c7a', fontSize: 12 },
  infoValue: { color: '#e6e6ed', fontSize: 12, fontWeight: '600', maxWidth: '68%' },
  reviewNote: { color: '#444958', textAlign: 'center', fontSize: 10, marginTop: 20 },
  loading: { flex: 1, backgroundColor: '#080b1a', alignItems: 'center', justifyContent: 'center' },
  loadingGemGlow: { width: 174, height: 174, borderRadius: 87, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(126, 142, 235, 0.05)', shadowColor: '#9caaff', shadowOpacity: 0.7, shadowRadius: 28, elevation: 10 },
  loadingText: { color: '#d5d6de', fontSize: 14, marginTop: 15 },
  loadingDots: { width: 48, color: '#777c90', textAlign: 'center', fontSize: 18, letterSpacing: 4, marginTop: 8 },
});

import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  FadeInDown,
  FadeInUp,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { F } from '../lib/theme';

const { width: W } = Dimensions.get('window');

const ROTATING = ['announcements', 'exam alerts', 'event invites', 'match days', 'celebrations'];

const FEATURES = [
  {
    icon: 'shield-checkmark',
    grad: ['#F59E0B', '#D97706'] as [string, string],
    title: 'Role-based access',
    desc: 'Students read, teachers publish, admins govern the whole board.',
  },
  {
    icon: 'color-wand',
    grad: ['#8B5CF6', '#D946EF'] as [string, string],
    title: 'Pictorial Studio',
    desc: 'Turn plain text into designed poster notices with fonts & highlights.',
  },
  {
    icon: 'images',
    grad: ['#0EA5E9', '#2563EB'] as [string, string],
    title: 'Rich media notices',
    desc: 'Attach one photo or a whole gallery, with captions and priorities.',
  },
  {
    icon: 'documents',
    grad: ['#10B981', '#059669'] as [string, string],
    title: 'Multi-draft desk',
    desc: 'Keep several drafts warming up, publish the moment they are ready.',
  },
  {
    icon: 'pin',
    grad: ['#EF4444', '#F97316'] as [string, string],
    title: 'Pin & prioritise',
    desc: 'Urgent circulars ride on top with pins and priority badges.',
  },
  {
    icon: 'bookmark',
    grad: ['#EC4899', '#F43F5E'] as [string, string],
    title: 'Smart bookmarks',
    desc: 'Save what matters, search everything, never miss a notice.',
  },
];

const STEPS = [
  { n: '01', icon: 'person-add', title: 'Join with your role', desc: 'Sign in as a student, teacher or admin — the app shapes itself around you.' },
  { n: '02', icon: 'create', title: 'Compose or design', desc: 'Write rich notices, attach galleries, or craft poster-style cards in the Studio.' },
  { n: '03', icon: 'notifications', title: 'The school stays in sync', desc: 'Everyone sees pinned, prioritised, beautifully organised announcements.' },
];

function Orb({ size, color, top, left, delay, drift }: { size: number; color: string; top: number; left: number; delay: number; drift: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: 3600 + delay, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, []);
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(t.value, [0, 1], [0, drift]) },
      { translateX: interpolate(t.value, [0, 1], [0, -drift / 2]) },
      { scale: interpolate(t.value, [0, 1], [1, 1.12]) },
    ],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute', width: size, height: size, borderRadius: size / 2, backgroundColor: color, opacity: 0.22, top, left },
        style,
      ]}
    />
  );
}

export default function LandingScreen() {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [wordIdx, setWordIdx] = useState(0);

  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.quad) }), -1, true);
    const iv = setInterval(() => setWordIdx((i) => (i + 1) % ROTATING.length), 2200);
    return () => clearInterval(iv);
  }, []);
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.03]) }],
  }));

  return (
    <View style={{ flex: 1, backgroundColor: '#0B1120' }}>
      <LinearGradient colors={['#0B1120', '#1E1B4B', '#0B1120']} style={StyleSheet.absoluteFill} />
      <Orb size={260} color="#4F46E5" top={-60} left={-70} delay={0} drift={26} />
      <Orb size={180} color="#D946EF" top={140} left={W - 110} delay={600} drift={-22} />
      <Orb size={220} color="#0EA5E9" top={520} left={-90} delay={300} drift={20} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        {/* top bar */}
        <Animated.View entering={FadeInDown.duration(500)} style={[st.topBar, { paddingTop: insets.top + 18 }]}>
          <View style={st.logoRow}>
            <LinearGradient colors={['#4F46E5', '#7C3AED']} style={st.logoBox}>
              <Ionicons name="school" size={20} color="#fff" />
            </LinearGradient>
            <View>
              <Text style={st.logoTxt}>Crestwood Academy</Text>
              <Text style={st.logoSub}>EST. 1962 · NOTICE NETWORK</Text>
            </View>
          </View>
          <Pressable style={st.signInMini} onPress={() => nav.navigate('Auth', { mode: 'login' })}>
            <Text style={st.signInMiniTxt}>Sign in</Text>
          </Pressable>
        </Animated.View>

        {/* hero */}
        <View style={st.hero}>
          <Animated.View entering={FadeInDown.delay(120).duration(600)} style={st.heroPill}>
            <View style={st.liveDot} />
            <Text style={st.heroPillTxt}>THE OFFICIAL SCHOOL NOTICE BOARD</Text>
          </Animated.View>

          <Animated.Text entering={FadeInDown.delay(240).duration(600)} style={st.heroTitle}>
            Every notice,{'\n'}beautifully delivered.
          </Animated.Text>

          <Animated.View entering={FadeInDown.delay(340).duration(600)} style={st.rotateRow}>
            <Text style={st.rotateLabel}>Home for </Text>
            <Animated.Text key={wordIdx} entering={FadeInUp.duration(360)} style={st.rotateWord}>
              {ROTATING[wordIdx]}
            </Animated.Text>
          </Animated.View>

          <Animated.Text entering={FadeInDown.delay(420).duration(600)} style={st.heroSub}>
            One polished feed for the whole campus — pinned circulars, photo galleries,
            poster-style notices and drafts, tuned to every role in the school.
          </Animated.Text>

          <Animated.View entering={FadeInDown.delay(520).duration(600)} style={{ width: '100%', gap: 12 }}>
            <Animated.View style={pulseStyle}>
              <Pressable onPress={() => nav.navigate('Auth', { mode: 'register' })}>
                <LinearGradient colors={['#4F46E5', '#7C3AED']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={st.cta}>
                  <Text style={st.ctaTxt}>Get Started</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </LinearGradient>
              </Pressable>
            </Animated.View>
            <Pressable style={st.ghost} onPress={() => nav.navigate('Auth', { mode: 'login' })}>
              <Ionicons name="log-in-outline" size={18} color="#C7D2FE" />
              <Text style={st.ghostTxt}>I already have an account</Text>
            </Pressable>
          </Animated.View>

          {/* stats */}
          <View style={st.statsRow}>
            {[
              { v: '1,240+', l: 'Students' },
              { v: '86', l: 'Faculty' },
              { v: '24', l: 'Clubs & Houses' },
            ].map((s, i) => (
              <Animated.View key={s.l} entering={FadeInUp.delay(620 + i * 110).duration(500)} style={st.statBox}>
                <Text style={st.statV}>{s.v}</Text>
                <Text style={st.statL}>{s.l}</Text>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* features */}
        <Animated.Text entering={FadeInDown.delay(200).duration(500)} style={st.sectionKicker}>
          WHY CRESTWOOD NOTICES
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(260).duration(500)} style={st.sectionTitle}>
          Built for the whole campus
        </Animated.Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 14, paddingVertical: 8 }}
          snapToInterval={236}
          decelerationRate="fast"
        >
          {FEATURES.map((f, i) => (
            <Animated.View key={f.title} entering={FadeInUp.delay(150 + i * 90).duration(500)} style={st.featCard}>
              <LinearGradient colors={f.grad} style={st.featIcon}>
                <Ionicons name={f.icon as any} size={20} color="#fff" />
              </LinearGradient>
              <Text style={st.featTitle}>{f.title}</Text>
              <Text style={st.featDesc}>{f.desc}</Text>
            </Animated.View>
          ))}
        </ScrollView>

        {/* how it works */}
        <Animated.Text entering={FadeInDown.duration(500)} style={[st.sectionKicker, { marginTop: 40 }]}>
          HOW IT WORKS
        </Animated.Text>
        <Animated.Text entering={FadeInDown.duration(500)} style={st.sectionTitle}>
          From desk to every pocket
        </Animated.Text>

        <View style={{ paddingHorizontal: 24, gap: 14, marginTop: 8 }}>
          {STEPS.map((s, i) => (
            <Animated.View key={s.n} entering={FadeInUp.delay(i * 120).duration(500)} style={st.stepCard}>
              <Text style={st.stepNum}>{s.n}</Text>
              <View style={st.stepIcon}>
                <Ionicons name={s.icon as any} size={18} color="#A5B4FC" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={st.stepTitle}>{s.title}</Text>
                <Text style={st.stepDesc}>{s.desc}</Text>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* footer */}
        <Animated.View entering={FadeInUp.duration(600)} style={st.footer}>
          <Ionicons name="school" size={18} color="#6366F1" />
          <Text style={st.footerQuote}>“Knowledge grows when it is shared on time.”</Text>
          <Text style={st.footerSub}>Crestwood Academy · 14 Whitfield Lane · Since 1962</Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBox: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOpacity: 0.6,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  logoTxt: { fontFamily: F.bold, color: '#fff', fontSize: 15 },
  logoSub: { fontFamily: F.semibold, color: '#818CF8', fontSize: 8.5, letterSpacing: 1.6, marginTop: 2 },
  signInMini: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(165,180,252,0.35)',
  },
  signInMiniTxt: { fontFamily: F.semibold, color: '#C7D2FE', fontSize: 12.5 },
  hero: { paddingHorizontal: 24, paddingTop: 46, alignItems: 'flex-start' },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(79,70,229,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(129,140,248,0.35)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#34D399' },
  heroPillTxt: { fontFamily: F.semibold, color: '#A5B4FC', fontSize: 10, letterSpacing: 1.4 },
  heroTitle: {
    fontFamily: F.displayX,
    color: '#fff',
    fontSize: 40,
    lineHeight: 48,
    marginTop: 20,
  },
  rotateRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, height: 30 },
  rotateLabel: { fontFamily: F.medium, color: '#94A3B8', fontSize: 17 },
  rotateWord: { fontFamily: F.bold, color: '#FBBF24', fontSize: 17 },
  heroSub: {
    fontFamily: F.regular,
    color: '#94A3B8',
    fontSize: 14.5,
    lineHeight: 23,
    marginTop: 14,
    marginBottom: 28,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 17,
    borderRadius: 18,
    shadowColor: '#6D28D9',
    shadowOpacity: 0.55,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  ctaTxt: { fontFamily: F.bold, color: '#fff', fontSize: 16, letterSpacing: 0.3 },
  ghost: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(165,180,252,0.28)',
  },
  ghostTxt: { fontFamily: F.semibold, color: '#C7D2FE', fontSize: 14 },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 34, width: '100%' },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  statV: { fontFamily: F.extrabold, color: '#fff', fontSize: 19 },
  statL: { fontFamily: F.medium, color: '#818CF8', fontSize: 10.5, marginTop: 4 },
  sectionKicker: {
    fontFamily: F.semibold,
    color: '#818CF8',
    fontSize: 10.5,
    letterSpacing: 2.2,
    marginTop: 52,
    marginBottom: 6,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontFamily: F.display,
    color: '#fff',
    fontSize: 26,
    paddingHorizontal: 24,
    marginBottom: 14,
  },
  featCard: {
    width: 222,
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    borderRadius: 22,
    padding: 20,
  },
  featIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  featTitle: { fontFamily: F.bold, color: '#fff', fontSize: 15.5, marginBottom: 6 },
  featDesc: { fontFamily: F.regular, color: '#94A3B8', fontSize: 12.5, lineHeight: 19 },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: 18,
  },
  stepNum: { fontFamily: F.displayX, color: 'rgba(165,180,252,0.4)', fontSize: 24 },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: 'rgba(99,102,241,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTitle: { fontFamily: F.bold, color: '#fff', fontSize: 14.5 },
  stepDesc: { fontFamily: F.regular, color: '#94A3B8', fontSize: 12, lineHeight: 18, marginTop: 3 },
  footer: { alignItems: 'center', marginTop: 54, paddingHorizontal: 32, gap: 8 },
  footerQuote: { fontFamily: F.display, color: '#C7D2FE', fontSize: 16, textAlign: 'center' },
  footerSub: { fontFamily: F.regular, color: '#64748B', fontSize: 11.5 },
});

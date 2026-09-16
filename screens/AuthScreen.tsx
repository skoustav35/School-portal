import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useNavigation, useRoute } from '@react-navigation/native';
import { C, F, ROLE_META } from '../lib/theme';
import { useApp } from '../lib/store';
import { Role } from '../lib/types';

const ADMIN_CODE = 'CREST-2026';

const DEMOS: { role: Role; email: string; pass: string }[] = [
  { role: 'student', email: 'student@crestwood.edu', pass: 'stud123' },
  { role: 'teacher', email: 'teacher@crestwood.edu', pass: 'teach123' },
  { role: 'admin', email: 'admin@crestwood.edu', pass: 'admin123' },
];

export default function AuthScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { login, register } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>(route.params?.mode === 'register' ? 'register' : 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [subject, setSubject] = useState('');
  const [role, setRole] = useState<Role>('student');
  const [adminCode, setAdminCode] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const seg = useSharedValue(mode === 'login' ? 0 : 1);
  useEffect(() => {
    seg.value = withTiming(mode === 'login' ? 0 : 1, { duration: 240 });
  }, [mode]);
  const segStyle = useAnimatedStyle(() => ({ left: `${2 + seg.value * 48}%` }));

  const submit = async () => {
    setError(null);
    setBusy(true);
    let err: string | null = null;
    if (mode === 'login') {
      if (!email.trim() || !password) err = 'Please fill in your email and password.';
      else err = await login(email, password);
    } else {
      if (role === 'admin' && adminCode.trim().toUpperCase() !== ADMIN_CODE) {
        err = `Admin accounts require the invite code (hint: ${ADMIN_CODE}).`;
      } else {
        err = await register({ name, email, password, role, subject });
      }
    }
    setBusy(false);
    if (err) setError(err);
  };

  const quick = async (d: (typeof DEMOS)[number]) => {
    setBusy(true);
    await login(d.email, d.pass);
    setBusy(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* header */}
      <LinearGradient colors={['#0B1120', '#312E81']} style={[st.header, { paddingTop: insets.top + 14 }]}>
        <Pressable style={st.back} onPress={() => nav.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#C7D2FE" />
        </Pressable>
        <Animated.View entering={FadeInDown.duration(500)} style={{ alignItems: 'center' }}>
          <LinearGradient colors={['#4F46E5', '#7C3AED']} style={st.logo}>
            <Ionicons name="school" size={26} color="#fff" />
          </LinearGradient>
          <Text style={st.hTitle}>{mode === 'login' ? 'Welcome back' : 'Join Crestwood'}</Text>
          <Text style={st.hSub}>
            {mode === 'login' ? 'Sign in to your campus notice board' : 'Create your campus account in seconds'}
          </Text>
        </Animated.View>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeInDown.delay(120).duration(500)} style={st.card}>
            {/* segmented */}
            <View style={st.segWrap}>
              <Animated.View style={[st.segThumb, segStyle]} />
              <Pressable style={st.segBtn} onPress={() => { setMode('login'); setError(null); }}>
                <Text style={[st.segTxt, mode === 'login' && st.segTxtOn]}>Sign In</Text>
              </Pressable>
              <Pressable style={st.segBtn} onPress={() => { setMode('register'); setError(null); }}>
                <Text style={[st.segTxt, mode === 'register' && st.segTxtOn]}>Register</Text>
              </Pressable>
            </View>

            {error ? (
              <Animated.View entering={FadeIn.duration(250)} style={st.errBox}>
                <Ionicons name="alert-circle" size={16} color={C.danger} />
                <Text style={st.errTxt}>{error}</Text>
              </Animated.View>
            ) : null}

            {mode === 'register' ? (
              <View style={st.inputWrap}>
                <Ionicons name="person-outline" size={17} color={C.faint} />
                <TextInput
                  style={st.input}
                  placeholder="Full name"
                  placeholderTextColor={C.faint}
                  value={name}
                  onChangeText={setName}
                  returnKeyType="next"
                />
              </View>
            ) : null}

            <View style={st.inputWrap}>
              <Ionicons name="mail-outline" size={17} color={C.faint} />
              <TextInput
                style={st.input}
                placeholder="Email address"
                placeholderTextColor={C.faint}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            <View style={st.inputWrap}>
              <Ionicons name="lock-closed-outline" size={17} color={C.faint} />
              <TextInput
                style={st.input}
                placeholder="Password"
                placeholderTextColor={C.faint}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                returnKeyType={mode === 'login' ? 'done' : 'next'}
                onSubmitEditing={mode === 'login' ? submit : undefined}
              />
              <Pressable hitSlop={8} onPress={() => setShowPass((v) => !v)}>
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={C.faint} />
              </Pressable>
            </View>

            {mode === 'register' ? (
              <>
                <Text style={st.label}>I am a…</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {(['student', 'teacher', 'admin'] as Role[]).map((r) => {
                    const m = ROLE_META[r];
                    const on = role === r;
                    return (
                      <Pressable
                        key={r}
                        onPress={() => setRole(r)}
                        style={[st.roleChip, on && { backgroundColor: m.soft, borderColor: m.color }]}
                      >
                        <Ionicons name={m.icon as any} size={16} color={on ? m.color : C.faint} />
                        <Text style={[st.roleTxt, on && { color: m.color }]}>{m.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                {role === 'admin' ? (
                  <Animated.View entering={FadeIn.duration(250)} style={[st.inputWrap, { marginTop: 12 }]}>
                    <Ionicons name="key-outline" size={17} color={C.accent} />
                    <TextInput
                      style={st.input}
                      placeholder="Admin invite code"
                      placeholderTextColor={C.faint}
                      value={adminCode}
                      onChangeText={setAdminCode}
                      autoCapitalize="characters"
                    />
                  </Animated.View>
                ) : (
                  <View style={[st.inputWrap, { marginTop: 12 }]}>
                    <Ionicons name="ribbon-outline" size={17} color={C.faint} />
                    <TextInput
                      style={st.input}
                      placeholder={role === 'teacher' ? 'Subject you teach (e.g. History)' : 'Grade & house (e.g. Grade 10 · Cedar)'}
                      placeholderTextColor={C.faint}
                      value={subject}
                      onChangeText={setSubject}
                    />
                  </View>
                )}
              </>
            ) : null}

            <Pressable onPress={submit} disabled={busy} style={{ marginTop: 18 }}>
              <LinearGradient colors={['#4F46E5', '#7C3AED']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={st.submit}>
                <Text style={st.submitTxt}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}</Text>
                {!busy && <Ionicons name="arrow-forward" size={17} color="#fff" />}
              </LinearGradient>
            </Pressable>
          </Animated.View>

          {/* demo access */}
          <Animated.View entering={FadeInDown.delay(260).duration(500)}>
            <View style={st.divRow}>
              <View style={st.divLine} />
              <Text style={st.divTxt}>QUICK DEMO ACCESS</Text>
              <View style={st.divLine} />
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {DEMOS.map((d) => {
                const m = ROLE_META[d.role];
                return (
                  <Pressable key={d.role} style={st.demoBtn} onPress={() => quick(d)}>
                    <View style={[st.demoIcon, { backgroundColor: m.soft }]}>
                      <Ionicons name={m.icon as any} size={18} color={m.color} />
                    </View>
                    <Text style={st.demoTxt}>{m.label}</Text>
                    <Text style={st.demoSub}>1-tap sign in</Text>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const st = StyleSheet.create({
  header: {
    paddingBottom: 34,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 22,
  },
  back: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 58,
    height: 58,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#4F46E5',
    shadowOpacity: 0.6,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  hTitle: { fontFamily: F.displayX, color: '#fff', fontSize: 26 },
  hSub: { fontFamily: F.regular, color: '#A5B4FC', fontSize: 13, marginTop: 6 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 26,
    padding: 20,
    marginTop: -18,
    shadowColor: '#1E1B4B',
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  segWrap: {
    flexDirection: 'row',
    backgroundColor: C.bg,
    borderRadius: 15,
    padding: 4,
    marginBottom: 18,
    position: 'relative',
  },
  segThumb: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#1E1B4B',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  segBtn: { flex: 1, paddingVertical: 11, alignItems: 'center' },
  segTxt: { fontFamily: F.semibold, fontSize: 13.5, color: C.faint },
  segTxtOn: { color: C.primary },
  errBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.dangerSoft,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  errTxt: { fontFamily: F.medium, fontSize: 12.5, color: C.danger, flex: 1 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: C.bg,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.line,
  },
  input: { flex: 1, paddingVertical: 14, fontFamily: F.medium, fontSize: 14, color: C.ink },
  label: { fontFamily: F.semibold, fontSize: 12, color: C.sub, marginBottom: 8, marginTop: 4 },
  roleChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: C.line,
    backgroundColor: '#fff',
  },
  roleTxt: { fontFamily: F.semibold, fontSize: 12.5, color: C.faint },
  submit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#4F46E5',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  submitTxt: { fontFamily: F.bold, color: '#fff', fontSize: 15.5 },
  divRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 22 },
  divLine: { flex: 1, height: 1, backgroundColor: C.line },
  divTxt: { fontFamily: F.semibold, fontSize: 10, color: C.faint, letterSpacing: 1.5 },
  demoBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.line,
  },
  demoIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  demoTxt: { fontFamily: F.bold, fontSize: 12.5, color: C.ink },
  demoSub: { fontFamily: F.regular, fontSize: 10, color: C.faint, marginTop: 2 },
});

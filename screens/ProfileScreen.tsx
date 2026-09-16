import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { C, F, ROLE_META } from '../lib/theme';
import { useApp } from '../lib/store';
import { Avatar, ConfirmModal, RolePill } from '../components/ui';

function Row({
  icon,
  color,
  soft,
  title,
  sub,
  onPress,
  danger,
}: {
  icon: string;
  color: string;
  soft: string;
  title: string;
  sub: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable style={({ pressed }) => [st.row, pressed && { backgroundColor: C.bg }]} onPress={onPress}>
      <View style={[st.rowIcon, { backgroundColor: soft }]}>
        <Ionicons name={icon as any} size={18} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[st.rowTitle, danger && { color: C.danger }]}>{title}</Text>
        <Text style={st.rowSub}>{sub}</Text>
      </View>
      <Ionicons name="chevron-forward" size={17} color={C.faint} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { user, notices, bookmarks, logout } = useApp();
  const [confirmOut, setConfirmOut] = useState(false);

  if (!user) return null;
  const roleM = ROLE_META[user.role];

  const mine = notices.filter((n) => n.authorId === user.id);
  const likesReceived = mine.reduce((s, n) => s + n.likes.length, 0);
  const isStaff = user.role !== 'student';

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* hero */}
        <LinearGradient colors={['#0B1120', '#312E81']} style={[st.hero, { paddingTop: insets.top + 26 }]}>
          <Animated.View entering={FadeInDown.duration(450)} style={{ alignItems: 'center' }}>
            <View style={st.avatarRing}>
              <Avatar name={user.name} color={user.color} size={84} />
            </View>
            <Text style={st.name}>{user.name}</Text>
            <Text style={st.email}>{user.email}</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, alignItems: 'center' }}>
              <RolePill role={user.role} />
              {user.subject ? (
                <View style={st.subjectPill}>
                  <Ionicons name="ribbon-outline" size={11} color="#C7D2FE" />
                  <Text style={st.subjectTxt}>{user.subject}</Text>
                </View>
              ) : null}
            </View>
          </Animated.View>
        </LinearGradient>

        {/* stats */}
        <Animated.View entering={FadeInDown.delay(100).duration(450)} style={st.statsCard}>
          {[
            { v: isStaff ? mine.length : notices.length, l: isStaff ? 'Published' : 'On the board', icon: 'newspaper', c: C.primary },
            { v: likesReceived, l: isStaff ? 'Likes received' : 'Likes given', icon: 'heart', c: C.danger },
            { v: bookmarks.length, l: 'Bookmarked', icon: 'bookmark', c: C.accent },
          ].map((s, i) => (
            <View key={s.l} style={[st.statBox, i === 1 && st.statMid]}>
              <Ionicons name={s.icon as any} size={16} color={s.c} />
              <Text style={st.statV}>{user.role === 'student' && s.l === 'Likes received' ? likesReceived : s.v}</Text>
              <Text style={st.statL}>{s.l}</Text>
            </View>
          ))}
        </Animated.View>

        {/* role explainer */}
        <Animated.View entering={FadeInDown.delay(160).duration(450)} style={st.roleCard}>
          <View style={[st.rowIcon, { backgroundColor: roleM.soft }]}>
            <Ionicons name={roleM.icon as any} size={18} color={roleM.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={st.roleTitle}>Signed in as {roleM.label}</Text>
            <Text style={st.roleSub}>
              {user.role === 'student'
                ? 'You can read, like, search and bookmark every notice on the board.'
                : user.role === 'teacher'
                ? 'You can publish notices, manage your own posts, keep drafts and design posters.'
                : 'Full control: publish, pin, moderate every notice and manage the community.'}
            </Text>
          </View>
        </Animated.View>

        {/* menu */}
        <Animated.View entering={FadeInDown.delay(220).duration(450)} style={st.menu}>
          {user.role === 'admin' ? (
            <Row
              icon="stats-chart"
              color="#F59E0B"
              soft={C.accentSoft}
              title="Admin Dashboard"
              sub="Board analytics, members & moderation"
              onPress={() => nav.navigate('Admin')}
            />
          ) : null}
          {isStaff ? (
            <Row
              icon="newspaper"
              color={C.primary}
              soft={C.primarySoft}
              title="My Notices"
              sub={`${mine.length} published — edit or remove them`}
              onPress={() => nav.navigate('MyNotices')}
            />
          ) : null}
          {isStaff ? (
            <Row
              icon="color-wand"
              color="#8B5CF6"
              soft="#F3EDFE"
              title="Pictorial Studio"
              sub="Design a poster-style notice from scratch"
              onPress={() => nav.navigate('Studio', {})}
            />
          ) : null}
          <Row
            icon="bookmark"
            color={C.accent}
            soft={C.accentSoft}
            title="Saved notices"
            sub={`${bookmarks.length} on your personal pinboard`}
            onPress={() => nav.navigate('Tabs', { screen: 'Saved' })}
          />
        </Animated.View>

        {/* about school */}
        <Animated.View entering={FadeInDown.delay(280).duration(450)} style={st.about}>
          <Text style={st.aboutKicker}>ABOUT THE SCHOOL</Text>
          <Text style={st.aboutTitle}>Crestwood Academy</Text>
          <Text style={st.aboutDesc}>
            Founded in 1962, Crestwood Academy is a community of 1,240 students, 86 faculty and 24 clubs &
            houses, committed to curiosity, character and craft.
          </Text>
          <View style={st.aboutRow}>
            <Ionicons name="location-outline" size={14} color={C.sub} />
            <Text style={st.aboutMeta}>14 Whitfield Lane, Crestwood</Text>
          </View>
          <View style={st.aboutRow}>
            <Ionicons name="call-outline" size={14} color={C.sub} />
            <Text style={st.aboutMeta}>(555) 014-1962 · office@crestwood.edu</Text>
          </View>
          <View style={st.aboutRow}>
            <Ionicons name="time-outline" size={14} color={C.sub} />
            <Text style={st.aboutMeta}>Mon–Fri 8:00 AM – 4:30 PM</Text>
          </View>
        </Animated.View>

        {/* logout */}
        <Animated.View entering={FadeInDown.delay(340).duration(450)} style={{ paddingHorizontal: 20, marginTop: 18 }}>
          <Pressable style={st.logout} onPress={() => setConfirmOut(true)}>
            <Ionicons name="log-out-outline" size={18} color={C.danger} />
            <Text style={st.logoutTxt}>Sign out</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>

      <ConfirmModal
        visible={confirmOut}
        title="Sign out?"
        message="You'll return to the landing page. Your drafts and bookmarks stay safe on this device."
        confirmLabel="Sign out"
        onConfirm={logout}
        onClose={() => setConfirmOut(false)}
      />
    </View>
  );
}

const st = StyleSheet.create({
  hero: {
    paddingBottom: 56,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    alignItems: 'center',
  },
  avatarRing: {
    padding: 5,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'rgba(165,180,252,0.4)',
    marginBottom: 14,
  },
  name: { fontFamily: F.displayX, fontSize: 24, color: '#fff' },
  email: { fontFamily: F.regular, fontSize: 12.5, color: '#A5B4FC', marginTop: 4 },
  subjectPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  subjectTxt: { fontFamily: F.medium, fontSize: 11, color: '#C7D2FE' },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: -34,
    borderRadius: 22,
    paddingVertical: 18,
    shadowColor: '#1E1B4B',
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  statBox: { flex: 1, alignItems: 'center', gap: 4 },
  statMid: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: C.line },
  statV: { fontFamily: F.extrabold, fontSize: 19, color: C.ink },
  statL: { fontFamily: F.medium, fontSize: 10.5, color: C.faint },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: C.line,
  },
  roleTitle: { fontFamily: F.bold, fontSize: 13.5, color: C.ink },
  roleSub: { fontFamily: F.regular, fontSize: 11.5, color: C.sub, marginTop: 3, lineHeight: 17 },
  menu: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#1E1B4B',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { fontFamily: F.semibold, fontSize: 14, color: C.ink },
  rowSub: { fontFamily: F.regular, fontSize: 11.5, color: C.faint, marginTop: 2 },
  about: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: C.line,
  },
  aboutKicker: { fontFamily: F.semibold, fontSize: 9.5, letterSpacing: 1.8, color: C.faint },
  aboutTitle: { fontFamily: F.display, fontSize: 20, color: C.ink, marginTop: 6 },
  aboutDesc: { fontFamily: F.regular, fontSize: 12.5, color: C.sub, lineHeight: 19, marginTop: 8, marginBottom: 12 },
  aboutRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  aboutMeta: { fontFamily: F.medium, fontSize: 12, color: C.sub },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.dangerSoft,
    borderRadius: 16,
    paddingVertical: 15,
  },
  logoutTxt: { fontFamily: F.bold, fontSize: 14, color: C.danger },
});

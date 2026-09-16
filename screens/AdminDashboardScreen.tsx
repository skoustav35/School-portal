import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { C, CATEGORIES, F, ROLE_META, timeAgo } from '../lib/theme';
import { useApp } from '../lib/store';
import { Avatar, ConfirmModal } from '../components/ui';
import { Role, User } from '../lib/types';

export default function AdminDashboardScreen() {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { user, users, notices, setUserRole, removeUser, togglePin, toast } = useApp();
  const [toRemove, setToRemove] = useState<User | null>(null);

  const totalLikes = notices.reduce((s, n) => s + n.likes.length, 0);
  const totalViews = notices.reduce((s, n) => s + n.views.length, 0);
  const pinned = notices.filter((n) => n.pinned);

  const catCounts = useMemo(
    () =>
      CATEGORIES.map((c) => ({
        ...c,
        count: notices.filter((n) => n.category === c.key).length,
      })),
    [notices]
  );
  const maxCat = Math.max(1, ...catCounts.map((c) => c.count));

  const roleCounts: Record<Role, number> = {
    student: users.filter((u) => u.role === 'student').length,
    teacher: users.filter((u) => u.role === 'teacher').length,
    admin: users.filter((u) => u.role === 'admin').length,
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* header */}
      <LinearGradient colors={['#0B1120', '#312E81']} style={[st.header, { paddingTop: insets.top + 12 }]}>
        <Pressable style={st.back} onPress={() => nav.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#C7D2FE" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={st.hTitle}>Admin Dashboard</Text>
          <Text style={st.hSub}>Board health, members & moderation</Text>
        </View>
        <View style={st.shield}>
          <Ionicons name="shield-checkmark" size={18} color="#FBBF24" />
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        {/* stat grid */}
        <View style={st.grid}>
          {[
            { icon: 'newspaper', label: 'Notices live', value: notices.length, c: C.primary, soft: C.primarySoft },
            { icon: 'people', label: 'Members', value: users.length, c: '#0EA5E9', soft: '#E6F5FE' },
            { icon: 'heart', label: 'Total likes', value: totalLikes, c: C.danger, soft: C.dangerSoft },
            { icon: 'eye', label: 'Total views', value: totalViews, c: '#10B981', soft: C.successSoft },
          ].map((s, i) => (
            <Animated.View key={s.label} entering={FadeInDown.delay(i * 70).duration(400)} style={st.statCard}>
              <View style={[st.statIcon, { backgroundColor: s.soft }]}>
                <Ionicons name={s.icon as any} size={17} color={s.c} />
              </View>
              <Text style={st.statV}>{s.value}</Text>
              <Text style={st.statL}>{s.label}</Text>
            </Animated.View>
          ))}
        </View>

        {/* category chart */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)} style={st.card}>
          <Text style={st.cardTitle}>Notices by category</Text>
          {catCounts.map((c) => (
            <View key={c.key} style={st.barRow}>
              <View style={st.barLabelRow}>
                <Ionicons name={c.icon as any} size={12} color={c.color} />
                <Text style={st.barLabel}>{c.key}</Text>
                <Text style={st.barCount}>{c.count}</Text>
              </View>
              <View style={st.barTrack}>
                <View style={[st.barFill, { width: `${(c.count / maxCat) * 100}%`, backgroundColor: c.color }]} />
              </View>
            </View>
          ))}
        </Animated.View>

        {/* role distribution */}
        <Animated.View entering={FadeInDown.delay(220).duration(400)} style={st.card}>
          <Text style={st.cardTitle}>Community roles</Text>
          <View style={st.roleBar}>
            {(['student', 'teacher', 'admin'] as Role[]).map((r) =>
              roleCounts[r] > 0 ? (
                <View key={r} style={{ flex: roleCounts[r], backgroundColor: ROLE_META[r].color }} />
              ) : null
            )}
          </View>
          <View style={{ flexDirection: 'row', gap: 16, marginTop: 12 }}>
            {(['student', 'teacher', 'admin'] as Role[]).map((r) => (
              <View key={r} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <View style={[st.legendDot, { backgroundColor: ROLE_META[r].color }]} />
                <Text style={st.legendTxt}>
                  {roleCounts[r]} {ROLE_META[r].label.toLowerCase()}{roleCounts[r] !== 1 ? 's' : ''}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* pinned management */}
        <Animated.View entering={FadeInDown.delay(280).duration(400)} style={st.card}>
          <Text style={st.cardTitle}>Pinned spotlight ({pinned.length})</Text>
          {pinned.length === 0 ? (
            <Text style={st.emptyTxt}>Nothing pinned. Open any notice and tap Pin to spotlight it.</Text>
          ) : (
            pinned.map((n) => (
              <View key={n.id} style={st.pinRow}>
                <Ionicons name="pin" size={14} color={C.accent} />
                <Pressable style={{ flex: 1 }} onPress={() => nav.navigate('Detail', { id: n.id })}>
                  <Text style={st.pinTitle} numberOfLines={1}>{n.title}</Text>
                  <Text style={st.pinMeta}>{n.authorName} · {timeAgo(n.createdAt)}</Text>
                </Pressable>
                <Pressable
                  style={st.unpinBtn}
                  onPress={() => {
                    togglePin(n.id);
                    toast('Unpinned');
                  }}
                >
                  <Text style={st.unpinTxt}>Unpin</Text>
                </Pressable>
              </View>
            ))
          )}
        </Animated.View>

        {/* members */}
        <Animated.View entering={FadeInDown.delay(340).duration(400)} style={st.card}>
          <Text style={st.cardTitle}>Manage members</Text>
          <Text style={st.cardSub}>Tap a role to reassign it. Removing a member also removes their notices.</Text>
          {users.map((u) => (
            <View key={u.id} style={st.memberRow}>
              <Avatar name={u.name} color={u.color} size={40} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={st.memberName} numberOfLines={1}>
                  {u.name} {u.id === user?.id ? '(you)' : ''}
                </Text>
                <Text style={st.memberEmail} numberOfLines={1}>{u.email}</Text>
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 7 }}>
                  {(['student', 'teacher', 'admin'] as Role[]).map((r) => {
                    const m = ROLE_META[r];
                    const on = u.role === r;
                    return (
                      <Pressable
                        key={r}
                        disabled={u.id === user?.id}
                        onPress={() => {
                          setUserRole(u.id, r);
                          toast(`${u.name.split(' ')[0]} is now a ${m.label.toLowerCase()}`);
                        }}
                        style={[
                          st.roleChip,
                          on && { backgroundColor: m.soft, borderColor: m.color },
                          u.id === user?.id && !on && { opacity: 0.4 },
                        ]}
                      >
                        <Text style={[st.roleChipTxt, on && { color: m.color }]}>{m.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
              {u.id !== user?.id ? (
                <Pressable style={st.removeBtn} onPress={() => setToRemove(u)}>
                  <Ionicons name="person-remove-outline" size={16} color={C.danger} />
                </Pressable>
              ) : null}
            </View>
          ))}
        </Animated.View>
      </ScrollView>

      <ConfirmModal
        visible={!!toRemove}
        title={`Remove ${toRemove?.name.split(' ')[0]}?`}
        message="Their account and every notice they published will be removed from the board."
        confirmLabel="Remove"
        onConfirm={() => {
          if (toRemove) {
            removeUser(toRemove.id);
            toast('Member removed');
          }
        }}
        onClose={() => setToRemove(null)}
      />
    </View>
  );
}

const st = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingBottom: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  back: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hTitle: { fontFamily: F.displayX, fontSize: 20, color: '#fff' },
  hSub: { fontFamily: F.regular, fontSize: 11.5, color: '#A5B4FC', marginTop: 2 },
  shield: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(251,191,36,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    width: '47.8%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#1E1B4B',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    flexGrow: 1,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statV: { fontFamily: F.extrabold, fontSize: 24, color: C.ink },
  statL: { fontFamily: F.medium, fontSize: 11, color: C.faint, marginTop: 2 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 18,
    marginTop: 16,
    shadowColor: '#1E1B4B',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardTitle: { fontFamily: F.bold, fontSize: 15.5, color: C.ink, marginBottom: 6 },
  cardSub: { fontFamily: F.regular, fontSize: 11.5, color: C.faint, marginBottom: 10, lineHeight: 17 },
  barRow: { marginTop: 10 },
  barLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 },
  barLabel: { fontFamily: F.semibold, fontSize: 12, color: C.sub, flex: 1 },
  barCount: { fontFamily: F.bold, fontSize: 12, color: C.ink },
  barTrack: { height: 8, borderRadius: 4, backgroundColor: C.bg, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4, minWidth: 4 },
  roleBar: {
    flexDirection: 'row',
    height: 14,
    borderRadius: 7,
    overflow: 'hidden',
    backgroundColor: C.bg,
    marginTop: 6,
  },
  legendDot: { width: 9, height: 9, borderRadius: 5 },
  legendTxt: { fontFamily: F.medium, fontSize: 11, color: C.sub },
  emptyTxt: { fontFamily: F.regular, fontSize: 12.5, color: C.faint, lineHeight: 18 },
  pinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  pinTitle: { fontFamily: F.semibold, fontSize: 13, color: C.ink },
  pinMeta: { fontFamily: F.regular, fontSize: 10.5, color: C.faint, marginTop: 2 },
  unpinBtn: {
    backgroundColor: C.accentSoft,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  unpinTxt: { fontFamily: F.semibold, fontSize: 11.5, color: C.accent },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  memberName: { fontFamily: F.bold, fontSize: 13.5, color: C.ink },
  memberEmail: { fontFamily: F.regular, fontSize: 11, color: C.faint, marginTop: 1 },
  roleChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1.2,
    borderColor: C.line,
  },
  roleChipTxt: { fontFamily: F.semibold, fontSize: 10.5, color: C.faint },
  removeBtn: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: C.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});

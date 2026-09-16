import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { C, CATEGORIES, F, catMeta, GRADIENTS, timeAgo } from '../lib/theme';
import { useApp } from '../lib/store';
import NoticeCard from '../components/NoticeCard';
import { Avatar, EmptyState, RolePill } from '../components/ui';
import { Notice } from '../lib/types';

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

function PinnedCard({ notice, onPress }: { notice: Notice; onPress: () => void }) {
  const m = catMeta(notice.category);
  const grad = notice.design ? GRADIENTS[notice.design.bg] ?? GRADIENTS.indigo : null;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [st.pinCard, pressed && { opacity: 0.92 }]}>
      {notice.images.length > 0 ? (
        <Image source={{ uri: notice.images[0] }} style={StyleSheet.absoluteFill} contentFit="cover" transition={300} />
      ) : (
        <LinearGradient
          colors={grad ?? [m.color, '#312E81']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      <LinearGradient colors={['transparent', 'rgba(7,10,25,0.92)']} style={st.pinShade} />
      <View style={st.pinTag}>
        <Ionicons name="pin" size={10} color="#fff" />
        <Text style={st.pinTagTxt}>PINNED</Text>
      </View>
      <View style={st.pinBody}>
        <View style={[st.pinCat, { backgroundColor: m.color }]}>
          <Ionicons name={m.icon as any} size={10} color="#fff" />
          <Text style={st.pinCatTxt}>{notice.category}</Text>
        </View>
        <Text style={st.pinTitle} numberOfLines={2}>
          {notice.title}
        </Text>
        <Text style={st.pinMeta}>
          {notice.authorName} · {timeAgo(notice.createdAt)}
        </Text>
      </View>
    </Pressable>
  );
}

export default function FeedScreen() {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { user, notices, unreadCount, reload } = useApp();
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<string>('All');
  const [refreshing, setRefreshing] = useState(false);

  const pinned = useMemo(() => notices.filter((n) => n.pinned), [notices]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...notices]
      .sort((a, b) => b.createdAt - a.createdAt)
      .filter((n) => (cat === 'All' ? true : n.category === cat))
      .filter((n) =>
        !q
          ? true
          : n.title.toLowerCase().includes(q) ||
            n.body.toLowerCase().includes(q) ||
            n.authorName.toLowerCase().includes(q)
      );
  }, [notices, query, cat]);

  const onRefresh = async () => {
    setRefreshing(true);
    await reload();
    setTimeout(() => setRefreshing(false), 500);
  };

  const isStaff = user && user.role !== 'student';

  const Header = (
    <View>
      {/* gradient header */}
      <LinearGradient colors={['#312E81', '#4F46E5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[st.header, { paddingTop: insets.top + 16 }]}>
        <View style={st.headTop}>
          <View style={{ flex: 1 }}>
            <Text style={st.greet}>{greeting()},</Text>
            <Text style={st.name}>{user?.name.split(' ')[0]} 👋</Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 6 }}>
            <Pressable onPress={() => nav.navigate('Tabs', { screen: 'Profile' })}>
              <Avatar name={user?.name ?? 'U'} color={user?.color ?? C.primary} size={44} />
            </Pressable>
          </View>
        </View>

        <View style={st.unreadRow}>
          <View style={st.unreadPill}>
            <Ionicons name="notifications" size={12} color="#FBBF24" />
            <Text style={st.unreadTxt}>
              {unreadCount > 0 ? `${unreadCount} unread notice${unreadCount > 1 ? 's' : ''}` : 'All caught up ✨'}
            </Text>
          </View>
          {user ? <RolePill role={user.role} small /> : null}
        </View>

        {/* search */}
        <View style={st.search}>
          <Ionicons name="search" size={17} color="rgba(255,255,255,0.7)" />
          <TextInput
            style={st.searchInput}
            placeholder="Search notices, authors…"
            placeholderTextColor="rgba(255,255,255,0.55)"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query ? (
            <Pressable hitSlop={8} onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={17} color="rgba(255,255,255,0.7)" />
            </Pressable>
          ) : null}
        </View>
      </LinearGradient>

      {/* category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingVertical: 16 }}
      >
        {['All', ...CATEGORIES.map((c) => c.key)].map((k, i) => {
          const on = cat === k;
          const m = k === 'All' ? null : catMeta(k);
          return (
            <Animated.View key={k} entering={FadeInRight.delay(i * 40).duration(350)}>
              <Pressable
                onPress={() => setCat(k)}
                style={[st.chip, on && { backgroundColor: m ? m.color : C.ink, borderColor: 'transparent' }]}
              >
                {m ? <Ionicons name={m.icon as any} size={13} color={on ? '#fff' : m.color} /> : <Ionicons name="grid" size={13} color={on ? '#fff' : C.sub} />}
                <Text style={[st.chipTxt, on && { color: '#fff' }]}>{k}</Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </ScrollView>

      {/* pinned carousel */}
      {pinned.length > 0 && cat === 'All' && !query ? (
        <View>
          <View style={st.secRow}>
            <Ionicons name="pin" size={15} color={C.accent} />
            <Text style={st.secTitle}>Pinned by the office</Text>
          </View>
          <FlatList
            horizontal
            data={pinned}
            keyExtractor={(n) => n.id}
            showsHorizontalScrollIndicator={false}
            snapToInterval={296}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: 20, gap: 14, paddingBottom: 6 }}
            renderItem={({ item }) => (
              <PinnedCard notice={item} onPress={() => nav.navigate('Detail', { id: item.id })} />
            )}
          />
        </View>
      ) : null}

      <View style={[st.secRow, { marginTop: 18 }]}>
        <Ionicons name="newspaper" size={15} color={C.primary} />
        <Text style={st.secTitle}>
          {query ? `Results for “${query}”` : cat === 'All' ? 'Latest notices' : `${cat} notices`}
        </Text>
        <Text style={st.secCount}>{filtered.length}</Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <FlatList
        data={filtered}
        keyExtractor={(n) => n.id}
        ListHeaderComponent={Header}
        renderItem={({ item, index }) => (
          <NoticeCard notice={item} index={index} onPress={() => nav.navigate('Detail', { id: item.id })} />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="file-tray-outline"
            title="No notices found"
            message={query ? 'Try a different search term or category.' : 'Nothing has been posted in this category yet.'}
          />
        }
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
      />

      {isStaff ? (
        <Animated.View entering={FadeInDown.delay(400)} style={[st.fabWrap, { bottom: 24 + insets.bottom }]}>
          <Pressable onPress={() => nav.navigate('Compose', {})}>
            <LinearGradient colors={['#4F46E5', '#7C3AED']} style={st.fab}>
              <Ionicons name="add" size={28} color="#fff" />
            </LinearGradient>
          </Pressable>
        </Animated.View>
      ) : null}
    </View>
  );
}

const st = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headTop: { flexDirection: 'row', alignItems: 'center' },
  greet: { fontFamily: F.medium, fontSize: 13.5, color: '#C7D2FE' },
  name: { fontFamily: F.displayX, fontSize: 26, color: '#fff', marginTop: 2 },
  unreadRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 },
  unreadPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
  },
  unreadTxt: { fontFamily: F.semibold, fontSize: 11, color: '#E0E7FF' },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 15,
    paddingHorizontal: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  searchInput: { flex: 1, paddingVertical: 12, fontFamily: F.medium, fontSize: 13.5, color: '#fff' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: C.line,
  },
  chipTxt: { fontFamily: F.semibold, fontSize: 12.5, color: C.sub },
  secRow: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 22, marginBottom: 12 },
  secTitle: { fontFamily: F.bold, fontSize: 16, color: C.ink, flex: 1 },
  secCount: {
    fontFamily: F.bold,
    fontSize: 11,
    color: C.primary,
    backgroundColor: C.primarySoft,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: 'hidden',
  },
  pinCard: {
    width: 282,
    height: 170,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: C.navy,
  },
  pinShade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 120 },
  pinTag: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  pinTagTxt: { fontFamily: F.bold, fontSize: 8.5, color: '#fff', letterSpacing: 0.8 },
  pinBody: { position: 'absolute', left: 14, right: 14, bottom: 12 },
  pinCat: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginBottom: 7,
  },
  pinCatTxt: { fontFamily: F.semibold, fontSize: 9.5, color: '#fff' },
  pinTitle: { fontFamily: F.bold, fontSize: 15.5, color: '#fff', lineHeight: 20 },
  pinMeta: { fontFamily: F.medium, fontSize: 10.5, color: 'rgba(255,255,255,0.75)', marginTop: 5 },
  fabWrap: {
    position: 'absolute',
    right: 20,
    shadowColor: '#4F46E5',
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  fab: { width: 58, height: 58, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});

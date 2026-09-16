import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Notice } from '../lib/types';
import { C, F, timeAgo } from '../lib/theme';
import { useApp } from '../lib/store';
import { Avatar, CatChip, PriorityPill, RolePill } from './ui';
import DesignCard from './DesignCard';

export default function NoticeCard({
  notice,
  onPress,
  index = 0,
}: {
  notice: Notice;
  onPress: () => void;
  index?: number;
}) {
  const { user, users, bookmarks, toggleBookmark, reads } = useApp();
  const author = users.find((u) => u.id === notice.authorId);
  const bookmarked = bookmarks.includes(notice.id);
  const unread = !reads.includes(notice.id);

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 60).duration(420)}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [st.card, pressed && { transform: [{ scale: 0.985 }], opacity: 0.95 }]}
      >
        {notice.design ? (
          <View style={{ padding: 10, paddingBottom: 0 }}>
            <DesignCard title={notice.title} body={notice.body} design={notice.design} compact radius={16} />
          </View>
        ) : notice.images.length > 0 ? (
          <View style={st.coverWrap}>
            <Image source={{ uri: notice.images[0] }} style={st.cover} contentFit="cover" transition={300} />
            {notice.images.length > 1 ? (
              <View style={st.multiBadge}>
                <Ionicons name="images" size={11} color="#fff" />
                <Text style={st.multiTxt}>{notice.images.length}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {notice.pinned ? (
          <View style={st.pinBadge}>
            <Ionicons name="pin" size={10} color="#fff" />
            <Text style={st.pinTxt}>PINNED</Text>
          </View>
        ) : null}

        <View style={st.body}>
          <View style={st.metaRow}>
            <CatChip cat={notice.category} small />
            <PriorityPill priority={notice.priority} small />
            <View style={{ flex: 1 }} />
            {unread ? <View style={st.unreadDot} /> : null}
            <Text style={st.time}>{timeAgo(notice.createdAt)}</Text>
          </View>

          <Text style={st.title} numberOfLines={2}>
            {notice.title}
          </Text>
          {notice.body ? (
            <Text style={st.snippet} numberOfLines={2}>
              {notice.body.replace(/\n+/g, ' ')}
            </Text>
          ) : null}

          <View style={st.footer}>
            <Avatar name={notice.authorName} color={author?.color ?? '#4F46E5'} size={30} />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={st.author} numberOfLines={1}>
                {notice.authorName}
              </Text>
              <RolePill role={notice.authorRole} small />
            </View>
            <View style={st.stat}>
              <Ionicons
                name={user && notice.likes.includes(user.id) ? 'heart' : 'heart-outline'}
                size={15}
                color={user && notice.likes.includes(user.id) ? C.danger : C.faint}
              />
              <Text style={st.statTxt}>{notice.likes.length}</Text>
            </View>
            <View style={st.stat}>
              <Ionicons name="eye-outline" size={15} color={C.faint} />
              <Text style={st.statTxt}>{notice.views.length}</Text>
            </View>
            <Pressable hitSlop={10} onPress={() => toggleBookmark(notice.id)} style={{ marginLeft: 6 }}>
              <Ionicons
                name={bookmarked ? 'bookmark' : 'bookmark-outline'}
                size={17}
                color={bookmarked ? C.accent : C.faint}
              />
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const st = StyleSheet.create({
  card: {
    backgroundColor: C.card,
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 14,
    shadowColor: '#1E1B4B',
    shadowOpacity: 0.07,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    overflow: 'hidden',
  },
  coverWrap: { height: 165 },
  cover: { flex: 1 },
  multiBadge: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(11,17,32,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  multiTxt: { fontFamily: F.semibold, fontSize: 10, color: '#fff' },
  pinBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  pinTxt: { fontFamily: F.bold, fontSize: 9, color: '#fff', letterSpacing: 0.8 },
  body: { padding: 14, paddingTop: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.primary, marginRight: 4 },
  time: { fontFamily: F.medium, fontSize: 11, color: C.faint },
  title: { fontFamily: F.bold, fontSize: 16, color: C.ink, lineHeight: 22 },
  snippet: { fontFamily: F.regular, fontSize: 13, color: C.sub, lineHeight: 19, marginTop: 4 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
  author: { fontFamily: F.semibold, fontSize: 12.5, color: C.ink, marginBottom: 2 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 3, marginLeft: 10 },
  statTxt: { fontFamily: F.medium, fontSize: 12, color: C.faint },
});

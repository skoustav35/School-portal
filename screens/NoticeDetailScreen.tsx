import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import { useNavigation, useRoute } from '@react-navigation/native';
import { C, F, fullDate, GRADIENTS, catMeta, timeAgo } from '../lib/theme';
import { useApp } from '../lib/store';
import { Avatar, CatChip, ConfirmModal, PriorityPill, RolePill } from '../components/ui';
import DesignCard from '../components/DesignCard';

export default function NoticeDetailScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { width: W } = useWindowDimensions();
  const {
    user, users, notices, toggleLike, markViewed, toggleBookmark, bookmarks,
    deleteNotice, togglePin, canDelete, canEdit, toast,
  } = useApp();

  const id: string = route.params?.id;
  const notice = notices.find((n) => n.id === id);
  const [imgIdx, setImgIdx] = useState(0);
  const [confirmDel, setConfirmDel] = useState(false);
  const viewedRef = useRef(false);

  const heart = useSharedValue(1);
  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: heart.value }] }));

  useEffect(() => {
    if (notice && !viewedRef.current) {
      viewedRef.current = true;
      markViewed(notice.id);
    }
  }, [notice?.id]);

  const related = useMemo(
    () => (notice ? notices.filter((n) => n.category === notice.category && n.id !== notice.id).slice(0, 5) : []),
    [notices, notice?.id, notice?.category]
  );

  if (!notice) {
    return (
      <View style={[st.gone, { paddingTop: insets.top + 40 }]}>
        <Ionicons name="trash-bin-outline" size={40} color={C.faint} />
        <Text style={st.goneTitle}>This notice was removed</Text>
        <Pressable style={st.goneBtn} onPress={() => nav.goBack()}>
          <Text style={st.goneBtnTxt}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const liked = !!user && notice.likes.includes(user.id);
  const bookmarked = bookmarks.includes(notice.id);
  const author = users.find((u) => u.id === notice.authorId);
  const m = catMeta(notice.category);

  const onLike = () => {
    heart.value = withSequence(withSpring(1.45, { damping: 6 }), withSpring(1));
    toggleLike(notice.id);
  };

  const onShare = async () => {
    try {
      await Share.share({
        message: `📢 ${notice.title}\n\n${notice.body}\n\n— ${notice.authorName}, Crestwood Academy`,
      });
    } catch {
      toast('Sharing is unavailable here');
    }
  };

  const heroH = 320;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        {/* hero */}
        {notice.design ? (
          <View style={{ paddingTop: insets.top + 56, paddingHorizontal: 16 }}>
            <DesignCard title={notice.title} body={notice.body} design={notice.design} radius={24} />
          </View>
        ) : notice.images.length > 0 ? (
          <View style={{ height: heroH }}>
            <FlatList
              horizontal
              pagingEnabled
              data={notice.images}
              keyExtractor={(u, i) => `${u}_${i}`}
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => setImgIdx(Math.round(e.nativeEvent.contentOffset.x / W))}
              renderItem={({ item }) => (
                <Image source={{ uri: item }} style={{ width: W, height: heroH }} contentFit="cover" transition={300} />
              )}
            />
            <LinearGradient colors={['rgba(7,10,25,0.55)', 'transparent']} style={st.heroTopShade} />
            {notice.images.length > 1 ? (
              <View style={st.dots}>
                {notice.images.map((_, i) => (
                  <View key={i} style={[st.dot, i === imgIdx && st.dotOn]} />
                ))}
              </View>
            ) : null}
          </View>
        ) : (
          <LinearGradient
            colors={GRADIENTS.night}
            style={{ height: 140 + insets.top }}
          />
        )}

        {/* floating nav buttons */}
        <View style={[st.navRow, { top: insets.top + 8 }]}>
          <Pressable style={st.navBtn} onPress={() => nav.goBack()}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </Pressable>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable style={st.navBtn} onPress={onShare}>
              <Ionicons name="share-social-outline" size={18} color="#fff" />
            </Pressable>
            <Pressable style={st.navBtn} onPress={() => toggleBookmark(notice.id)}>
              <Ionicons name={bookmarked ? 'bookmark' : 'bookmark-outline'} size={18} color={bookmarked ? '#FBBF24' : '#fff'} />
            </Pressable>
          </View>
        </View>

        {/* content card */}
        <Animated.View entering={FadeInDown.duration(450)} style={[st.content, notice.design ? { marginTop: 16 } : { marginTop: -26 }]}>
          <View style={st.chipRow}>
            <CatChip cat={notice.category} />
            <PriorityPill priority={notice.priority} />
            {notice.pinned ? (
              <View style={st.pinnedChip}>
                <Ionicons name="pin" size={11} color={C.accent} />
                <Text style={st.pinnedChipTxt}>Pinned</Text>
              </View>
            ) : null}
          </View>

          <Text style={st.title}>{notice.title}</Text>
          <Text style={st.date}>{fullDate(notice.createdAt)}</Text>

          {/* author */}
          <View style={st.authorCard}>
            <Avatar name={notice.authorName} color={author?.color ?? m.color} size={44} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={st.authorName}>{notice.authorName}</Text>
              <Text style={st.authorSub}>{author?.subject ?? 'Faculty'}</Text>
            </View>
            <RolePill role={notice.authorRole} />
          </View>

          {notice.body ? <Text style={st.body}>{notice.body}</Text> : null}

          {/* engagement */}
          <View style={st.engageRow}>
            <Pressable style={[st.engageBtn, liked && { backgroundColor: C.dangerSoft }]} onPress={onLike}>
              <Animated.View style={heartStyle}>
                <Ionicons name={liked ? 'heart' : 'heart-outline'} size={20} color={liked ? C.danger : C.sub} />
              </Animated.View>
              <Text style={[st.engageTxt, liked && { color: C.danger }]}>{notice.likes.length}</Text>
            </Pressable>
            <View style={st.engageBtn}>
              <Ionicons name="eye-outline" size={20} color={C.sub} />
              <Text style={st.engageTxt}>{notice.views.length} views</Text>
            </View>
            <Pressable style={[st.engageBtn, bookmarked && { backgroundColor: C.accentSoft }]} onPress={() => toggleBookmark(notice.id)}>
              <Ionicons name={bookmarked ? 'bookmark' : 'bookmark-outline'} size={18} color={bookmarked ? C.accent : C.sub} />
              <Text style={[st.engageTxt, bookmarked && { color: C.accent }]}>{bookmarked ? 'Saved' : 'Save'}</Text>
            </Pressable>
          </View>

          {/* management */}
          {(canEdit(notice) || canDelete(notice) || user?.role === 'admin') && (
            <View style={st.manageCard}>
              <Text style={st.manageTitle}>MANAGE THIS NOTICE</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {canEdit(notice) ? (
                  <Pressable style={st.manageBtn} onPress={() => nav.navigate('Compose', { noticeId: notice.id })}>
                    <Ionicons name="create-outline" size={17} color={C.primary} />
                    <Text style={[st.manageBtnTxt, { color: C.primary }]}>Edit</Text>
                  </Pressable>
                ) : null}
                {user?.role === 'admin' ? (
                  <Pressable
                    style={st.manageBtn}
                    onPress={() => {
                      togglePin(notice.id);
                      toast(notice.pinned ? 'Unpinned from top' : 'Pinned to top');
                    }}
                  >
                    <Ionicons name={notice.pinned ? 'pin' : 'pin-outline'} size={17} color={C.accent} />
                    <Text style={[st.manageBtnTxt, { color: C.accent }]}>{notice.pinned ? 'Unpin' : 'Pin'}</Text>
                  </Pressable>
                ) : null}
                {canDelete(notice) ? (
                  <Pressable style={[st.manageBtn, { backgroundColor: C.dangerSoft }]} onPress={() => setConfirmDel(true)}>
                    <Ionicons name="trash-outline" size={17} color={C.danger} />
                    <Text style={[st.manageBtnTxt, { color: C.danger }]}>Delete</Text>
                  </Pressable>
                ) : null}
              </View>
              {user?.role === 'admin' && notice.authorId !== user.id ? (
                <Text style={st.adminNote}>You are moderating another author's notice as admin.</Text>
              ) : null}
            </View>
          )}

          {/* related */}
          {related.length > 0 ? (
            <View style={{ marginTop: 26 }}>
              <Text style={st.relTitle}>More in {notice.category}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 8 }}>
                {related.map((r) => (
                  <Pressable key={r.id} style={st.relCard} onPress={() => nav.push('Detail', { id: r.id })}>
                    {r.images.length > 0 ? (
                      <Image source={{ uri: r.images[0] }} style={st.relImg} contentFit="cover" transition={200} />
                    ) : (
                      <LinearGradient
                        colors={r.design ? GRADIENTS[r.design.bg] ?? GRADIENTS.indigo : [m.color, '#312E81']}
                        style={st.relImg}
                      >
                        <Ionicons name={m.icon as any} size={22} color="rgba(255,255,255,0.85)" style={{ alignSelf: 'center', marginTop: 26 }} />
                      </LinearGradient>
                    )}
                    <Text style={st.relCardTitle} numberOfLines={2}>{r.title}</Text>
                    <Text style={st.relCardMeta}>{timeAgo(r.createdAt)}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}
        </Animated.View>
      </ScrollView>

      <ConfirmModal
        visible={confirmDel}
        title="Delete this notice?"
        message={`“${notice.title}” will be permanently removed from the board for everyone.`}
        confirmLabel="Delete"
        onConfirm={() => {
          deleteNotice(notice.id);
          toast('Notice deleted');
          nav.goBack();
        }}
        onClose={() => setConfirmDel(false)}
      />
    </View>
  );
}

const st = StyleSheet.create({
  gone: { flex: 1, alignItems: 'center', backgroundColor: C.bg, gap: 12 },
  goneTitle: { fontFamily: F.bold, fontSize: 16, color: C.sub },
  goneBtn: { backgroundColor: C.primary, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14 },
  goneBtnTxt: { fontFamily: F.bold, color: '#fff' },
  heroTopShade: { position: 'absolute', top: 0, left: 0, right: 0, height: 110 },
  dots: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    backgroundColor: 'rgba(7,10,25,0.45)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.45)' },
  dotOn: { backgroundColor: '#fff', width: 16 },
  navRow: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 20,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: 'rgba(11,17,32,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 28,
    marginHorizontal: 12,
    padding: 22,
    shadowColor: '#1E1B4B',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  pinnedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.accentSoft,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  pinnedChipTxt: { fontFamily: F.semibold, fontSize: 11, color: C.accent },
  title: { fontFamily: F.display, fontSize: 24, color: C.ink, lineHeight: 32, marginTop: 14 },
  date: { fontFamily: F.medium, fontSize: 12, color: C.faint, marginTop: 8 },
  authorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.bg,
    borderRadius: 18,
    padding: 14,
    marginTop: 18,
  },
  authorName: { fontFamily: F.bold, fontSize: 14.5, color: C.ink },
  authorSub: { fontFamily: F.regular, fontSize: 12, color: C.sub, marginTop: 2 },
  body: { fontFamily: F.regular, fontSize: 15, color: '#374151', lineHeight: 26, marginTop: 18 },
  engageRow: { flexDirection: 'row', gap: 10, marginTop: 22 },
  engageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: C.bg,
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 14,
  },
  engageTxt: { fontFamily: F.semibold, fontSize: 13, color: C.sub },
  manageCard: {
    marginTop: 24,
    backgroundColor: C.bg,
    borderRadius: 18,
    padding: 16,
  },
  manageTitle: { fontFamily: F.semibold, fontSize: 10, letterSpacing: 1.5, color: C.faint, marginBottom: 12 },
  manageBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: C.line,
  },
  manageBtnTxt: { fontFamily: F.semibold, fontSize: 13 },
  adminNote: { fontFamily: F.regular, fontSize: 11, color: C.faint, marginTop: 10, fontStyle: 'italic' },
  relTitle: { fontFamily: F.bold, fontSize: 15.5, color: C.ink, marginBottom: 12 },
  relCard: { width: 150 },
  relImg: { width: 150, height: 80, borderRadius: 14, backgroundColor: C.line },
  relCardTitle: { fontFamily: F.semibold, fontSize: 12.5, color: C.ink, marginTop: 8, lineHeight: 17 },
  relCardMeta: { fontFamily: F.regular, fontSize: 10.5, color: C.faint, marginTop: 3 },
});

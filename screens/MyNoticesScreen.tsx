import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { C, F } from '../lib/theme';
import { useApp } from '../lib/store';
import NoticeCard from '../components/NoticeCard';
import { ConfirmModal, EmptyState } from '../components/ui';
import { Notice } from '../lib/types';

export default function MyNoticesScreen() {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { user, notices, deleteNotice, toast } = useApp();
  const [toDelete, setToDelete] = useState<Notice | null>(null);

  const mine = useMemo(
    () => notices.filter((n) => n.authorId === user?.id).sort((a, b) => b.createdAt - a.createdAt),
    [notices, user?.id]
  );

  const likes = mine.reduce((s, n) => s + n.likes.length, 0);
  const views = mine.reduce((s, n) => s + n.views.length, 0);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={[st.header, { paddingTop: insets.top + 12 }]}>
        <Pressable style={st.back} onPress={() => nav.goBack()}>
          <Ionicons name="arrow-back" size={20} color={C.ink} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={st.hTitle}>My Notices</Text>
          <Text style={st.hSub}>{mine.length} published · {likes} likes · {views} views</Text>
        </View>
        <Pressable style={st.newBtn} onPress={() => nav.navigate('Compose', {})}>
          <Ionicons name="add" size={20} color="#fff" />
        </Pressable>
      </View>

      <FlatList
        data={mine}
        keyExtractor={(n) => n.id}
        contentContainerStyle={{ paddingTop: 18, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <View>
            <NoticeCard notice={item} index={index} onPress={() => nav.navigate('Detail', { id: item.id })} />
            <View style={st.quickRow}>
              <Pressable style={st.quickBtn} onPress={() => nav.navigate('Compose', { noticeId: item.id })}>
                <Ionicons name="create-outline" size={14} color={C.primary} />
                <Text style={[st.quickTxt, { color: C.primary }]}>Edit</Text>
              </Pressable>
              <Pressable style={st.quickBtn} onPress={() => setToDelete(item)}>
                <Ionicons name="trash-outline" size={14} color={C.danger} />
                <Text style={[st.quickTxt, { color: C.danger }]}>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="newspaper-outline"
            title="You haven't published yet"
            message="Compose your first notice or design one in the Pictorial Studio."
          />
        }
      />

      <ConfirmModal
        visible={!!toDelete}
        title="Delete this notice?"
        message={`“${toDelete?.title}” will be removed from the board for everyone.`}
        onConfirm={() => {
          if (toDelete) deleteNotice(toDelete.id);
          toast('Notice deleted');
        }}
        onClose={() => setToDelete(null)}
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
    paddingBottom: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  back: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hTitle: { fontFamily: F.displayX, fontSize: 20, color: C.ink },
  hSub: { fontFamily: F.regular, fontSize: 11.5, color: C.sub, marginTop: 2 },
  newBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickRow: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 20,
    marginTop: -6,
    marginBottom: 16,
  },
  quickBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.line,
  },
  quickTxt: { fontFamily: F.semibold, fontSize: 12 },
});

import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { C, F, timeAgo, catMeta } from '../lib/theme';
import { useApp } from '../lib/store';
import { ConfirmModal, EmptyState, CatChip } from '../components/ui';
import DesignCard from '../components/DesignCard';
import { Draft } from '../lib/types';

export default function DraftsScreen() {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { drafts, deleteDraft, createNotice, toast } = useApp();
  const [toDelete, setToDelete] = useState<Draft | null>(null);

  const publish = (d: Draft) => {
    if (!d.title.trim()) {
      toast('Add a title before publishing — tap Edit');
      return;
    }
    createNotice({
      title: d.title,
      body: d.body,
      category: d.category,
      priority: d.priority,
      images: d.images,
      design: d.design,
      pinned: false,
    });
    deleteDraft(d.id);
    toast('Draft published to the board 🎉');
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={[st.header, { paddingTop: insets.top + 16 }]}>
        <View style={{ flex: 1 }}>
          <Text style={st.hTitle}>Draft Desk</Text>
          <Text style={st.hSub}>
            {drafts.length > 0 ? `${drafts.length} draft${drafts.length > 1 ? 's' : ''} in progress` : 'Prepare notices before publishing'}
          </Text>
        </View>
        <Pressable style={st.newBtn} onPress={() => nav.navigate('Compose', {})}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={st.newBtnTxt}>New</Text>
        </Pressable>
      </View>

      <FlatList
        data={[...drafts].sort((a, b) => b.updatedAt - a.updatedAt)}
        keyExtractor={(d) => d.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="documents-outline"
            title="No drafts yet"
            message="Start a notice and save it here. You can keep several drafts warming up and publish when ready."
          />
        }
        renderItem={({ item, index }) => {
          const m = catMeta(item.category);
          return (
            <Animated.View entering={FadeInDown.delay(Math.min(index, 6) * 70).duration(400)} style={st.card}>
              {item.design ? (
                <DesignCard title={item.title} body={item.body} design={item.design} compact radius={16} />
              ) : item.images.length > 0 ? (
                <View style={st.imgRow}>
                  {item.images.slice(0, 3).map((u, i) => (
                    <Image key={`${u}_${i}`} source={{ uri: u }} style={st.imgThumb} contentFit="cover" transition={200} />
                  ))}
                  {item.images.length > 3 ? (
                    <View style={[st.imgThumb, st.imgMore]}>
                      <Text style={st.imgMoreTxt}>+{item.images.length - 3}</Text>
                    </View>
                  ) : null}
                </View>
              ) : null}

              <View style={{ paddingTop: item.design || item.images.length ? 12 : 0 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <CatChip cat={item.category} small />
                  {item.design ? (
                    <View style={st.designTag}>
                      <Ionicons name="color-wand" size={10} color="#8B5CF6" />
                      <Text style={st.designTagTxt}>Designed</Text>
                    </View>
                  ) : null}
                  <View style={{ flex: 1 }} />
                  <Text style={st.time}>edited {timeAgo(item.updatedAt)}</Text>
                </View>
                <Text style={st.title} numberOfLines={2}>
                  {item.title || 'Untitled draft'}
                </Text>
                {item.body ? (
                  <Text style={st.snippet} numberOfLines={2}>
                    {item.body.replace(/\n+/g, ' ')}
                  </Text>
                ) : null}

                <View style={st.actions}>
                  <Pressable style={st.actBtn} onPress={() => nav.navigate('Compose', { draftId: item.id })}>
                    <Ionicons name="create-outline" size={15} color={C.primary} />
                    <Text style={[st.actTxt, { color: C.primary }]}>Edit</Text>
                  </Pressable>
                  <Pressable style={st.actBtn} onPress={() => nav.navigate('Studio', { draftId: item.id })}>
                    <Ionicons name="color-wand-outline" size={15} color="#8B5CF6" />
                    <Text style={[st.actTxt, { color: '#8B5CF6' }]}>Studio</Text>
                  </Pressable>
                  <Pressable style={st.actBtn} onPress={() => setToDelete(item)}>
                    <Ionicons name="trash-outline" size={15} color={C.danger} />
                    <Text style={[st.actTxt, { color: C.danger }]}>Delete</Text>
                  </Pressable>
                  <Pressable style={{ flex: 1 }} onPress={() => publish(item)}>
                    <LinearGradient colors={[m.color, '#312E81']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={st.pubBtn}>
                      <Ionicons name="send" size={13} color="#fff" />
                      <Text style={st.pubTxt}>Publish</Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              </View>
            </Animated.View>
          );
        }}
      />

      <ConfirmModal
        visible={!!toDelete}
        title="Discard this draft?"
        message={`“${toDelete?.title || 'Untitled draft'}” will be removed from your draft desk.`}
        confirmLabel="Discard"
        onConfirm={() => {
          if (toDelete) deleteDraft(toDelete.id);
          toast('Draft discarded');
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
    paddingHorizontal: 22,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  hTitle: { fontFamily: F.displayX, fontSize: 24, color: C.ink },
  hSub: { fontFamily: F.regular, fontSize: 12.5, color: C.sub, marginTop: 3 },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: C.primary,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 13,
  },
  newBtnTxt: { fontFamily: F.bold, fontSize: 13, color: '#fff' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#1E1B4B',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  imgRow: { flexDirection: 'row', gap: 8 },
  imgThumb: { flex: 1, height: 84, borderRadius: 12, backgroundColor: C.line },
  imgMore: { alignItems: 'center', justifyContent: 'center', backgroundColor: C.primarySoft },
  imgMoreTxt: { fontFamily: F.bold, color: C.primary, fontSize: 14 },
  designTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3EDFE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  designTagTxt: { fontFamily: F.semibold, fontSize: 10, color: '#8B5CF6' },
  time: { fontFamily: F.medium, fontSize: 10.5, color: C.faint },
  title: { fontFamily: F.bold, fontSize: 15.5, color: C.ink, marginTop: 8, lineHeight: 21 },
  snippet: { fontFamily: F.regular, fontSize: 12.5, color: C.sub, marginTop: 4, lineHeight: 18 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 },
  actBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 11,
    backgroundColor: C.bg,
  },
  actTxt: { fontFamily: F.semibold, fontSize: 11.5 },
  pubBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    borderRadius: 11,
  },
  pubTxt: { fontFamily: F.bold, fontSize: 11.5, color: '#fff' },
});

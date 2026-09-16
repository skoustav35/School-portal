import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useNavigation, useRoute } from '@react-navigation/native';
import { C, CATEGORIES, F, PRIORITY_META, STOCK_IMAGES, catMeta } from '../lib/theme';
import { uid, useApp } from '../lib/store';
import { Category, Draft, Priority } from '../lib/types';

export default function ComposeScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { user, notices, drafts, createNotice, updateNotice, saveDraft, deleteDraft, toast } = useApp();

  const editingNotice = useMemo(
    () => (route.params?.noticeId ? notices.find((n) => n.id === route.params.noticeId) : undefined),
    [route.params?.noticeId, notices]
  );
  const sourceDraft = useMemo(
    () => (route.params?.draftId ? drafts.find((d) => d.id === route.params.draftId) : undefined),
    [route.params?.draftId, drafts]
  );
  const base = editingNotice ?? sourceDraft;

  const [title, setTitle] = useState(base?.title ?? '');
  const [body, setBody] = useState(base?.body ?? '');
  const [category, setCategory] = useState<Category>(base?.category ?? 'General');
  const [priority, setPriority] = useState<Priority>(base?.priority ?? 'normal');
  const [images, setImages] = useState<string[]>(base?.images ?? []);
  const [pinned, setPinned] = useState(editingNotice?.pinned ?? false);
  const [stockOpen, setStockOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const design = base?.design ?? null;
  const isAdmin = user?.role === 'admin';

  const pickImage = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.5,
        selectionLimit: 4,
      });
      if (!res.canceled) {
        setImages((p) => [...p, ...res.assets.map((a) => a.uri)].slice(0, 6));
      }
    } catch {
      toast('Could not open the photo library');
    }
  };

  const addLink = () => {
    const u = linkUrl.trim();
    if (/^https?:\/\/.+/.test(u)) {
      setImages((p) => [...p, u].slice(0, 6));
      setLinkUrl('');
      setLinkOpen(false);
    } else {
      toast('Enter a valid image URL (https://…)');
    }
  };

  const validate = () => {
    if (!title.trim()) {
      setError('Give your notice a clear title.');
      return false;
    }
    if (!body.trim() && images.length === 0) {
      setError('Add some text or at least one picture.');
      return false;
    }
    setError(null);
    return true;
  };

  const publish = () => {
    if (!validate()) return;
    if (editingNotice) {
      updateNotice(editingNotice.id, {
        title: title.trim(),
        body: body.trim(),
        category,
        priority,
        images,
        pinned: isAdmin ? pinned : editingNotice.pinned,
      });
      toast('Notice updated');
    } else {
      createNotice({ title, body, category, priority, images, design, pinned });
      if (sourceDraft) deleteDraft(sourceDraft.id);
      toast('Notice published to the board 🎉');
    }
    nav.goBack();
  };

  const saveAsDraft = () => {
    if (!title.trim() && !body.trim() && images.length === 0) {
      setError('Nothing to save yet — write something first.');
      return;
    }
    const d: Draft = {
      id: sourceDraft?.id ?? uid('d'),
      title: title.trim(),
      body: body.trim(),
      category,
      priority,
      images,
      design,
      updatedAt: Date.now(),
    };
    saveDraft(d);
    toast('Saved to your drafts');
    nav.goBack();
  };

  const openStudio = () => {
    const d: Draft = {
      id: sourceDraft?.id ?? uid('d'),
      title: title.trim(),
      body: body.trim(),
      category,
      priority,
      images,
      design,
      updatedAt: Date.now(),
    };
    saveDraft(d);
    nav.replace('Studio', { draftId: d.id });
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* header */}
      <View style={[st.header, { paddingTop: insets.top + 10 }]}>
        <Pressable style={st.hBtn} onPress={() => nav.goBack()}>
          <Ionicons name="close" size={22} color={C.ink} />
        </Pressable>
        <Text style={st.hTitle}>{editingNotice ? 'Edit Notice' : sourceDraft ? 'Finish Draft' : 'New Notice'}</Text>
        <Pressable style={[st.hBtn, { backgroundColor: C.primarySoft }]} onPress={saveAsDraft}>
          <Ionicons name="save-outline" size={19} color={C.primary} />
        </Pressable>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
          keyboardShouldPersistTaps="handled"
        >
          {error ? (
            <Animated.View entering={FadeIn.duration(250)} style={st.errBox}>
              <Ionicons name="alert-circle" size={16} color={C.danger} />
              <Text style={st.errTxt}>{error}</Text>
            </Animated.View>
          ) : null}

          <Animated.View entering={FadeInDown.duration(400)} style={st.card}>
            <TextInput
              style={st.titleInput}
              placeholder="Notice title…"
              placeholderTextColor={C.faint}
              value={title}
              onChangeText={setTitle}
              multiline
              maxLength={90}
            />
            <View style={st.charRow}>
              <Text style={st.charTxt}>{title.length}/90</Text>
            </View>
            <View style={st.divider} />
            <TextInput
              style={st.bodyInput}
              placeholder="Write the announcement, add details, schedules, instructions…"
              placeholderTextColor={C.faint}
              value={body}
              onChangeText={setBody}
              multiline
              textAlignVertical="top"
            />
          </Animated.View>

          {/* images */}
          <Animated.View entering={FadeInDown.delay(80).duration(400)}>
            <Text style={st.secLabel}>PICTURES ({images.length}/6)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              {images.map((u, i) => (
                <View key={`${u}_${i}`} style={st.thumbWrap}>
                  <Image source={{ uri: u }} style={st.thumb} contentFit="cover" transition={200} />
                  <Pressable style={st.thumbX} onPress={() => setImages((p) => p.filter((_, j) => j !== i))}>
                    <Ionicons name="close" size={13} color="#fff" />
                  </Pressable>
                </View>
              ))}
              {images.length < 6 ? (
                <>
                  <Pressable style={st.addTile} onPress={pickImage}>
                    <Ionicons name="image-outline" size={22} color={C.primary} />
                    <Text style={st.addTileTxt}>Device</Text>
                  </Pressable>
                  <Pressable style={st.addTile} onPress={() => setStockOpen(true)}>
                    <Ionicons name="albums-outline" size={22} color={C.primary} />
                    <Text style={st.addTileTxt}>Stock</Text>
                  </Pressable>
                  <Pressable style={st.addTile} onPress={() => setLinkOpen(true)}>
                    <Ionicons name="link-outline" size={22} color={C.primary} />
                    <Text style={st.addTileTxt}>Link</Text>
                  </Pressable>
                </>
              ) : null}
            </ScrollView>
          </Animated.View>

          {/* category */}
          <Animated.View entering={FadeInDown.delay(140).duration(400)}>
            <Text style={st.secLabel}>CATEGORY</Text>
            <View style={st.catGrid}>
              {CATEGORIES.map((c) => {
                const on = category === c.key;
                return (
                  <Pressable
                    key={c.key}
                    onPress={() => setCategory(c.key as Category)}
                    style={[st.catBtn, on && { backgroundColor: c.soft, borderColor: c.color }]}
                  >
                    <Ionicons name={c.icon as any} size={15} color={on ? c.color : C.faint} />
                    <Text style={[st.catBtnTxt, on && { color: c.color }]}>{c.key}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>

          {/* priority */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Text style={st.secLabel}>PRIORITY</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {(['normal', 'important', 'urgent'] as Priority[]).map((p) => {
                const m = PRIORITY_META[p];
                const on = priority === p;
                return (
                  <Pressable
                    key={p}
                    onPress={() => setPriority(p)}
                    style={[st.priBtn, on && { backgroundColor: m.soft, borderColor: m.color }]}
                  >
                    <Ionicons name={m.icon as any} size={16} color={on ? m.color : C.faint} />
                    <Text style={[st.priTxt, on && { color: m.color }]}>{m.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>

          {/* admin pin */}
          {isAdmin ? (
            <Animated.View entering={FadeInDown.delay(260).duration(400)} style={st.pinRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                <View style={st.pinIcon}>
                  <Ionicons name="pin" size={16} color={C.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={st.pinTitle}>Pin to top of the board</Text>
                  <Text style={st.pinSub}>Pinned notices appear in the spotlight carousel</Text>
                </View>
              </View>
              <Switch value={pinned} onValueChange={setPinned} trackColor={{ true: C.accent, false: C.line }} thumbColor="#fff" />
            </Animated.View>
          ) : null}

          {/* studio hook */}
          {!editingNotice ? (
            <Animated.View entering={FadeInDown.delay(300).duration(400)}>
              <Pressable onPress={openStudio}>
                <LinearGradient colors={['#8B5CF6', '#D946EF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={st.studioBtn}>
                  <Ionicons name="color-wand" size={20} color="#fff" />
                  <View style={{ flex: 1 }}>
                    <Text style={st.studioTitle}>Design in Pictorial Studio</Text>
                    <Text style={st.studioSub}>Turn this into a poster-style notice with fonts & highlights</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.8)" />
                </LinearGradient>
              </Pressable>
            </Animated.View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* footer actions */}
      <View style={[st.footer, { paddingBottom: insets.bottom + 14 }]}>
        <Pressable style={st.draftBtn} onPress={saveAsDraft}>
          <Ionicons name="file-tray-full-outline" size={17} color={C.primary} />
          <Text style={st.draftBtnTxt}>Save Draft</Text>
        </Pressable>
        <Pressable style={{ flex: 1.4 }} onPress={publish}>
          <LinearGradient colors={['#4F46E5', '#7C3AED']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={st.pubBtn}>
            <Ionicons name="send" size={16} color="#fff" />
            <Text style={st.pubBtnTxt}>{editingNotice ? 'Save Changes' : 'Publish Notice'}</Text>
          </LinearGradient>
        </Pressable>
      </View>

      {/* stock gallery modal */}
      <Modal visible={stockOpen} transparent animationType="slide" onRequestClose={() => setStockOpen(false)}>
        <View style={st.modalBack}>
          <View style={[st.modalSheet, { paddingBottom: insets.bottom + 20 }]}>
            <View style={st.modalHandle} />
            <Text style={st.modalTitle}>School photo library</Text>
            <Text style={st.modalSub}>Tap a photo to attach it to your notice</Text>
            <ScrollView contentContainerStyle={st.stockGrid} showsVerticalScrollIndicator={false}>
              {STOCK_IMAGES.map((u) => {
                const on = images.includes(u);
                return (
                  <Pressable
                    key={u}
                    style={st.stockItem}
                    onPress={() =>
                      on ? setImages((p) => p.filter((x) => x !== u)) : setImages((p) => [...p, u].slice(0, 6))
                    }
                  >
                    <Image source={{ uri: u }} style={st.stockImg} contentFit="cover" transition={200} />
                    {on ? (
                      <View style={st.stockCheck}>
                        <Ionicons name="checkmark-circle" size={22} color={C.primary} />
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
            <Pressable style={st.modalDone} onPress={() => setStockOpen(false)}>
              <Text style={st.modalDoneTxt}>Done ({images.length} attached)</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* link modal */}
      <Modal visible={linkOpen} transparent animationType="fade" onRequestClose={() => setLinkOpen(false)}>
        <Pressable style={st.linkBack} onPress={() => setLinkOpen(false)}>
          <Pressable onPress={() => {}} style={st.linkCard}>
            <Text style={st.modalTitle}>Add image by URL</Text>
            <View style={st.linkInputWrap}>
              <Ionicons name="link" size={16} color={C.faint} />
              <TextInput
                style={st.linkInput}
                placeholder="https://example.com/photo.jpg"
                placeholderTextColor={C.faint}
                value={linkUrl}
                onChangeText={setLinkUrl}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                onSubmitEditing={addLink}
              />
            </View>
            <Pressable style={st.modalDone} onPress={addLink}>
              <Text style={st.modalDoneTxt}>Attach image</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const st = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  hBtn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hTitle: { fontFamily: F.bold, fontSize: 16.5, color: C.ink },
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#1E1B4B',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  titleInput: { fontFamily: F.bold, fontSize: 20, color: C.ink, lineHeight: 28, padding: 0 },
  charRow: { alignItems: 'flex-end', marginTop: 4 },
  charTxt: { fontFamily: F.medium, fontSize: 10.5, color: C.faint },
  divider: { height: 1, backgroundColor: C.line, marginVertical: 12 },
  bodyInput: { fontFamily: F.regular, fontSize: 14.5, color: '#374151', lineHeight: 23, minHeight: 130, padding: 0 },
  secLabel: { fontFamily: F.semibold, fontSize: 10.5, letterSpacing: 1.5, color: C.faint, marginTop: 24, marginBottom: 10 },
  thumbWrap: { position: 'relative' },
  thumb: { width: 86, height: 86, borderRadius: 16, backgroundColor: C.line },
  thumbX: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: C.danger,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: C.bg,
  },
  addTile: {
    width: 86,
    height: 86,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.primary,
    borderStyle: 'dashed',
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addTileTxt: { fontFamily: F.semibold, fontSize: 10.5, color: C.primary },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: C.line,
    backgroundColor: '#fff',
  },
  catBtnTxt: { fontFamily: F.semibold, fontSize: 12.5, color: C.faint },
  priBtn: {
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
  priTxt: { fontFamily: F.semibold, fontSize: 12.5, color: C.faint },
  pinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: C.line,
  },
  pinIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: C.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinTitle: { fontFamily: F.semibold, fontSize: 13.5, color: C.ink },
  pinSub: { fontFamily: F.regular, fontSize: 11, color: C.faint, marginTop: 2 },
  studioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    padding: 16,
    marginTop: 24,
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  studioTitle: { fontFamily: F.bold, fontSize: 14.5, color: '#fff' },
  studioSub: { fontFamily: F.regular, fontSize: 11.5, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
  draftBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: C.primary,
    paddingVertical: 14,
  },
  draftBtnTxt: { fontFamily: F.semibold, fontSize: 13.5, color: C.primary },
  pubBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 15,
    paddingVertical: 15,
  },
  pubBtnTxt: { fontFamily: F.bold, fontSize: 14.5, color: '#fff' },
  modalBack: { flex: 1, backgroundColor: 'rgba(11,17,32,0.55)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    maxHeight: '82%',
  },
  modalHandle: { width: 44, height: 5, borderRadius: 3, backgroundColor: C.line, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontFamily: F.bold, fontSize: 17, color: C.ink },
  modalSub: { fontFamily: F.regular, fontSize: 12.5, color: C.sub, marginTop: 4, marginBottom: 14 },
  stockGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  stockItem: { width: '31%', aspectRatio: 1, borderRadius: 14, overflow: 'hidden' },
  stockImg: { flex: 1, backgroundColor: C.line },
  stockCheck: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(79,70,229,0.25)',
    alignItems: 'flex-end',
    padding: 6,
  },
  modalDone: {
    backgroundColor: C.primary,
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 16,
  },
  modalDoneTxt: { fontFamily: F.bold, fontSize: 14, color: '#fff' },
  linkBack: {
    flex: 1,
    backgroundColor: 'rgba(11,17,32,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  linkCard: { backgroundColor: '#fff', borderRadius: 22, padding: 22, width: '100%', maxWidth: 400 },
  linkInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: C.bg,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: C.line,
  },
  linkInput: { flex: 1, paddingVertical: 13, fontFamily: F.medium, fontSize: 13.5, color: C.ink },
});

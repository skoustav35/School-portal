import React, { useMemo, useState } from 'react';
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
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation, useRoute } from '@react-navigation/native';
import { C, CATEGORIES, F, GRADIENTS, GRADIENT_KEYS } from '../lib/theme';
import { uid, useApp } from '../lib/store';
import { Category, DEFAULT_DESIGN, DesignSpec, Draft, Priority } from '../lib/types';
import DesignCard from '../components/DesignCard';

const TITLE_COLORS = ['#FFFFFF', '#0F172A', '#FDE68A', '#A7F3D0', '#FBCFE8', '#BAE6FD'];
const HIGHLIGHTS: (string | null)[] = [null, '#B45309', '#BE123C', '#047857', '#1D4ED8', '#111827'];
const STICKERS: (string | null)[] = [null, '📌', '📣', '🎉', '🏆', '⚠️', '📚', '🎭', '⚽', '🧪', '🎵'];

export default function StudioScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { drafts, saveDraft, deleteDraft, createNotice, user, toast } = useApp();

  const sourceDraft = useMemo(
    () => (route.params?.draftId ? drafts.find((d) => d.id === route.params.draftId) : undefined),
    [route.params?.draftId]
  );

  const [title, setTitle] = useState(sourceDraft?.title ?? '');
  const [body, setBody] = useState(sourceDraft?.body ?? '');
  const [category, setCategory] = useState<Category>(sourceDraft?.category ?? 'General');
  const [design, setDesign] = useState<DesignSpec>(sourceDraft?.design ?? { ...DEFAULT_DESIGN });

  const set = (patch: Partial<DesignSpec>) => setDesign((d) => ({ ...d, ...patch }));

  const buildDraft = (): Draft => ({
    id: sourceDraft?.id ?? uid('d'),
    title: title.trim(),
    body: body.trim(),
    category,
    priority: (sourceDraft?.priority ?? 'normal') as Priority,
    images: sourceDraft?.images ?? [],
    design,
    updatedAt: Date.now(),
  });

  const onSaveDraft = () => {
    if (!title.trim() && !body.trim()) {
      toast('Write a title or message first');
      return;
    }
    saveDraft(buildDraft());
    toast('Design saved to drafts');
    nav.goBack();
  };

  const onPublish = () => {
    if (!title.trim()) {
      toast('A title is required to publish');
      return;
    }
    const d = buildDraft();
    createNotice({
      title: d.title,
      body: d.body,
      category: d.category,
      priority: d.priority,
      images: [],
      design: d.design,
      pinned: false,
    });
    if (sourceDraft) deleteDraft(sourceDraft.id);
    toast('Pictorial notice published 🎨');
    nav.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0F1226' }}>
      {/* header */}
      <View style={[st.header, { paddingTop: insets.top + 10 }]}>
        <Pressable style={st.hBtn} onPress={() => nav.goBack()}>
          <Ionicons name="close" size={22} color="#E0E7FF" />
        </Pressable>
        <View style={{ alignItems: 'center' }}>
          <Text style={st.hTitle}>Pictorial Studio</Text>
          <Text style={st.hSub}>Design a poster-style notice</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 130 }} keyboardShouldPersistTaps="handled">
          {/* live preview */}
          <Animated.View entering={FadeInDown.duration(400)}>
            <Text style={st.label}>LIVE PREVIEW</Text>
            <DesignCard title={title} body={body} design={design} radius={24} />
          </Animated.View>

          {/* text */}
          <Text style={st.label}>NOTICE TEXT</Text>
          <View style={st.inputCard}>
            <TextInput
              style={st.titleInput}
              placeholder="Headline…"
              placeholderTextColor="#64748B"
              value={title}
              onChangeText={setTitle}
              maxLength={70}
            />
            <View style={st.inputDiv} />
            <TextInput
              style={st.bodyInput}
              placeholder="Short message under the headline…"
              placeholderTextColor="#64748B"
              value={body}
              onChangeText={setBody}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* background */}
          <Text style={st.label}>BACKGROUND</Text>
          <View style={st.rowWrap}>
            {GRADIENT_KEYS.map((k) => (
              <Pressable key={k} onPress={() => set({ bg: k })} style={[st.swatchRing, design.bg === k && st.swatchRingOn]}>
                <LinearGradient colors={GRADIENTS[k]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={st.swatch} />
              </Pressable>
            ))}
          </View>

          {/* font */}
          <Text style={st.label}>TYPEFACE</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {([
              { k: 'sans', label: 'Modern', family: F.extrabold },
              { k: 'serif', label: 'Classic', family: F.display },
              { k: 'mono', label: 'Typewriter', family: F.mono },
            ] as const).map((f) => (
              <Pressable
                key={f.k}
                onPress={() => set({ font: f.k })}
                style={[st.fontBtn, design.font === f.k && st.fontBtnOn]}
              >
                <Text style={[st.fontAa, { fontFamily: f.family }, design.font === f.k && { color: '#fff' }]}>Aa</Text>
                <Text style={[st.fontLabel, design.font === f.k && { color: '#C7D2FE' }]}>{f.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* size + align */}
          <View style={{ flexDirection: 'row', gap: 20 }}>
            <View style={{ flex: 1 }}>
              <Text style={st.label}>TEXT SIZE</Text>
              <View style={st.segRow}>
                {(['S', 'M', 'L'] as const).map((s) => (
                  <Pressable key={s} onPress={() => set({ size: s })} style={[st.segBtn, design.size === s && st.segBtnOn]}>
                    <Text style={[st.segTxt, design.size === s && { color: '#fff' }]}>{s}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={st.label}>ALIGNMENT</Text>
              <View style={st.segRow}>
                {([
                  { k: 'left', icon: 'reorder-three-outline' },
                  { k: 'center', icon: 'menu-outline' },
                ] as const).map((a) => (
                  <Pressable key={a.k} onPress={() => set({ align: a.k })} style={[st.segBtn, design.align === a.k && st.segBtnOn]}>
                    <Ionicons name={a.k === 'left' ? 'text-outline' : 'ellipsis-horizontal'} size={16} color={design.align === a.k ? '#fff' : '#94A3B8'} />
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          {/* title color */}
          <Text style={st.label}>HEADLINE COLOUR</Text>
          <View style={st.rowWrap}>
            {TITLE_COLORS.map((c) => (
              <Pressable
                key={c}
                onPress={() => set({ titleColor: c })}
                style={[st.colorDotRing, design.titleColor === c && st.swatchRingOn]}
              >
                <View style={[st.colorDot, { backgroundColor: c }]} />
              </Pressable>
            ))}
          </View>

          {/* highlight */}
          <Text style={st.label}>HEADLINE HIGHLIGHT</Text>
          <View style={st.rowWrap}>
            {HIGHLIGHTS.map((h, i) => (
              <Pressable
                key={`${h}_${i}`}
                onPress={() => set({ highlight: h })}
                style={[st.colorDotRing, design.highlight === h && st.swatchRingOn]}
              >
                {h ? (
                  <View style={[st.colorDot, { backgroundColor: h }]} />
                ) : (
                  <View style={[st.colorDot, st.noneDot]}>
                    <Ionicons name="ban" size={14} color="#94A3B8" />
                  </View>
                )}
              </Pressable>
            ))}
          </View>

          {/* sticker */}
          <Text style={st.label}>STICKER</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {STICKERS.map((s, i) => (
              <Pressable
                key={`${s}_${i}`}
                onPress={() => set({ sticker: s })}
                style={[st.stickerBtn, design.sticker === s && st.stickerBtnOn]}
              >
                {s ? <Text style={{ fontSize: 20 }}>{s}</Text> : <Ionicons name="ban" size={18} color="#94A3B8" />}
              </Pressable>
            ))}
          </ScrollView>

          {/* category */}
          <Text style={st.label}>CATEGORY</Text>
          <View style={st.rowWrap}>
            {CATEGORIES.map((c) => {
              const on = category === c.key;
              return (
                <Pressable
                  key={c.key}
                  onPress={() => setCategory(c.key as Category)}
                  style={[st.catBtn, on && { backgroundColor: 'rgba(99,102,241,0.25)', borderColor: '#818CF8' }]}
                >
                  <Ionicons name={c.icon as any} size={13} color={on ? '#C7D2FE' : '#64748B'} />
                  <Text style={[st.catTxt, on && { color: '#C7D2FE' }]}>{c.key}</Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* footer */}
      <View style={[st.footer, { paddingBottom: insets.bottom + 14 }]}>
        <Pressable style={st.saveBtn} onPress={onSaveDraft}>
          <Ionicons name="file-tray-full-outline" size={16} color="#C7D2FE" />
          <Text style={st.saveBtnTxt}>Save Draft</Text>
        </Pressable>
        {user && user.role !== 'student' ? (
          <Pressable style={{ flex: 1.4 }} onPress={onPublish}>
            <LinearGradient colors={['#8B5CF6', '#D946EF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={st.pubBtn}>
              <Ionicons name="send" size={15} color="#fff" />
              <Text style={st.pubBtnTxt}>Publish Poster</Text>
            </LinearGradient>
          </Pressable>
        ) : null}
      </View>
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  hBtn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hTitle: { fontFamily: F.bold, fontSize: 16, color: '#fff' },
  hSub: { fontFamily: F.regular, fontSize: 10.5, color: '#818CF8', marginTop: 2 },
  label: {
    fontFamily: F.semibold,
    fontSize: 10.5,
    letterSpacing: 1.6,
    color: '#818CF8',
    marginTop: 24,
    marginBottom: 10,
  },
  inputCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18,
    padding: 16,
  },
  titleInput: { fontFamily: F.bold, fontSize: 17, color: '#fff', padding: 0 },
  inputDiv: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 12 },
  bodyInput: { fontFamily: F.regular, fontSize: 13.5, color: '#CBD5E1', minHeight: 60, padding: 0, lineHeight: 20 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatchRing: { padding: 3, borderRadius: 16, borderWidth: 2, borderColor: 'transparent' },
  swatchRingOn: { borderColor: '#A5B4FC' },
  swatch: { width: 46, height: 46, borderRadius: 12 },
  fontBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  fontBtnOn: { borderColor: '#A5B4FC', backgroundColor: 'rgba(99,102,241,0.22)' },
  fontAa: { fontSize: 22, color: '#94A3B8' },
  fontLabel: { fontFamily: F.medium, fontSize: 10.5, color: '#64748B', marginTop: 4 },
  segRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  segBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10 },
  segBtnOn: { backgroundColor: '#6366F1' },
  segTxt: { fontFamily: F.bold, fontSize: 13, color: '#94A3B8' },
  colorDotRing: { padding: 3, borderRadius: 999, borderWidth: 2, borderColor: 'transparent' },
  colorDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noneDot: { backgroundColor: 'rgba(255,255,255,0.06)' },
  stickerBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickerBtnOn: { borderColor: '#A5B4FC', backgroundColor: 'rgba(99,102,241,0.22)' },
  catBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  catTxt: { fontFamily: F.semibold, fontSize: 11.5, color: '#64748B' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    backgroundColor: 'rgba(15,18,38,0.97)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: 'rgba(165,180,252,0.4)',
    paddingVertical: 14,
  },
  saveBtnTxt: { fontFamily: F.semibold, fontSize: 13, color: '#C7D2FE' },
  pubBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 15,
    paddingVertical: 15,
  },
  pubBtnTxt: { fontFamily: F.bold, fontSize: 14, color: '#fff' },
});

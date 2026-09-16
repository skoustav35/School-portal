import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { C, F, catMeta, initials, PRIORITY_META, ROLE_META } from '../lib/theme';
import { useApp } from '../lib/store';

/* ---------------------------------- Avatar --------------------------------- */
export function Avatar({ name, color, size = 40 }: { name: string; color: string; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2.6,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontFamily: F.bold, color: '#fff', fontSize: size * 0.38 }}>{initials(name)}</Text>
    </View>
  );
}

/* --------------------------------- RolePill -------------------------------- */
export function RolePill({ role, small }: { role: string; small?: boolean }) {
  const m = ROLE_META[role] ?? ROLE_META.student;
  return (
    <View style={[st.pill, { backgroundColor: m.soft, paddingVertical: small ? 2 : 4 }]}>
      <Ionicons name={m.icon as any} size={small ? 10 : 12} color={m.color} />
      <Text style={[st.pillTxt, { color: m.color, fontSize: small ? 10 : 11 }]}>{m.label}</Text>
    </View>
  );
}

/* ------------------------------- PriorityPill ------------------------------ */
export function PriorityPill({ priority, small }: { priority: string; small?: boolean }) {
  if (priority === 'normal') return null;
  const m = PRIORITY_META[priority];
  return (
    <View style={[st.pill, { backgroundColor: m.soft, paddingVertical: small ? 2 : 4 }]}>
      <Ionicons name={m.icon as any} size={small ? 10 : 12} color={m.color} />
      <Text style={[st.pillTxt, { color: m.color, fontSize: small ? 10 : 11 }]}>{m.label}</Text>
    </View>
  );
}

/* --------------------------------- CatChip --------------------------------- */
export function CatChip({ cat, small }: { cat: string; small?: boolean }) {
  const m = catMeta(cat);
  return (
    <View style={[st.pill, { backgroundColor: m.soft, paddingVertical: small ? 2 : 4 }]}>
      <Ionicons name={m.icon as any} size={small ? 10 : 12} color={m.color} />
      <Text style={[st.pillTxt, { color: m.color, fontSize: small ? 10 : 11 }]}>{cat}</Text>
    </View>
  );
}

/* ------------------------------ GradientButton ------------------------------ */
export function GradientButton({
  title,
  onPress,
  icon,
  colors = ['#4F46E5', '#7C3AED'],
  style,
  loading,
  small,
}: {
  title: string;
  onPress: () => void;
  icon?: string;
  colors?: [string, string];
  style?: ViewStyle;
  loading?: boolean;
  small?: boolean;
}) {
  return (
    <Pressable onPress={onPress} disabled={loading} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }, style]}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[st.gbtn, small && { paddingVertical: 10, borderRadius: 13 }]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            {icon ? <Ionicons name={icon as any} size={small ? 15 : 18} color="#fff" /> : null}
            <Text style={[st.gbtnTxt, small && { fontSize: 13 }]}>{title}</Text>
          </>
        )}
      </LinearGradient>
    </Pressable>
  );
}

/* -------------------------------- EmptyState -------------------------------- */
export function EmptyState({ icon, title, message }: { icon: string; title: string; message: string }) {
  return (
    <Animated.View entering={FadeInDown.duration(400)} style={st.empty}>
      <View style={st.emptyIcon}>
        <Ionicons name={icon as any} size={34} color={C.primary} />
      </View>
      <Text style={st.emptyTitle}>{title}</Text>
      <Text style={st.emptyMsg}>{message}</Text>
    </Animated.View>
  );
}

/* ------------------------------- ConfirmModal ------------------------------- */
export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = 'Delete',
  destructive = true,
  onConfirm,
  onClose,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={st.backdrop} onPress={onClose}>
        <Pressable onPress={() => {}} style={{ width: '100%', maxWidth: 380 }}>
          <Animated.View entering={ZoomIn.duration(220)} style={st.sheet}>
            <View style={[st.sheetIcon, { backgroundColor: destructive ? C.dangerSoft : C.primarySoft }]}>
              <Ionicons
                name={destructive ? 'trash' : 'help-circle'}
                size={26}
                color={destructive ? C.danger : C.primary}
              />
            </View>
            <Text style={st.sheetTitle}>{title}</Text>
            <Text style={st.sheetMsg}>{message}</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
              <Pressable style={st.sheetCancel} onPress={onClose}>
                <Text style={st.sheetCancelTxt}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[st.sheetConfirm, { backgroundColor: destructive ? C.danger : C.primary }]}
                onPress={() => {
                  onConfirm();
                  onClose();
                }}
              >
                <Text style={st.sheetConfirmTxt}>{confirmLabel}</Text>
              </Pressable>
            </View>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* --------------------------------- ToastHost -------------------------------- */
export function ToastHost() {
  const { toastMsg } = useApp();
  if (!toastMsg) return null;
  return (
    <Animated.View entering={FadeInUp.duration(260)} style={st.toast} pointerEvents="none">
      <Ionicons name="checkmark-circle" size={18} color="#34D399" />
      <Text style={st.toastTxt}>{toastMsg}</Text>
    </Animated.View>
  );
}

/* ------------------------------- SectionTitle ------------------------------- */
export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={st.secRow}>
      <Text style={st.secTitle}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction}>
          <Text style={st.secAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const st = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    borderRadius: 999,
  },
  pillTxt: { fontFamily: F.semibold },
  gbtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
    shadowColor: '#4F46E5',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  gbtnTxt: { fontFamily: F.bold, color: '#fff', fontSize: 15.5, letterSpacing: 0.2 },
  empty: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 40 },
  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: 26,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontFamily: F.bold, fontSize: 17, color: C.ink, marginBottom: 6 },
  emptyMsg: { fontFamily: F.regular, fontSize: 13.5, color: C.sub, textAlign: 'center', lineHeight: 20 },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(11,17,32,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  sheetIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  sheetTitle: { fontFamily: F.bold, fontSize: 18, color: C.ink, textAlign: 'center' },
  sheetMsg: { fontFamily: F.regular, fontSize: 13.5, color: C.sub, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  sheetCancel: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: C.bg,
    alignItems: 'center',
  },
  sheetCancelTxt: { fontFamily: F.semibold, color: C.ink, fontSize: 14 },
  sheetConfirm: { flex: 1, paddingVertical: 13, borderRadius: 14, alignItems: 'center' },
  sheetConfirmTxt: { fontFamily: F.bold, color: '#fff', fontSize: 14 },
  toast: {
    position: 'absolute',
    bottom: 96,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#111827',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
    zIndex: 999,
  },
  toastTxt: { fontFamily: F.semibold, color: '#fff', fontSize: 13.5 },
  secRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 22,
    marginBottom: 12,
  },
  secTitle: { fontFamily: F.bold, fontSize: 17, color: C.ink },
  secAction: { fontFamily: F.semibold, fontSize: 13, color: C.primary },
});

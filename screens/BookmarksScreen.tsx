import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { C, F } from '../lib/theme';
import { useApp } from '../lib/store';
import NoticeCard from '../components/NoticeCard';
import { EmptyState } from '../components/ui';

export default function BookmarksScreen() {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { notices, bookmarks } = useApp();

  const saved = useMemo(
    () => bookmarks.map((id) => notices.find((n) => n.id === id)).filter(Boolean) as typeof notices,
    [bookmarks, notices]
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={[st.header, { paddingTop: insets.top + 16 }]}>
        <View style={st.iconBox}>
          <Ionicons name="bookmark" size={18} color={C.accent} />
        </View>
        <View>
          <Text style={st.hTitle}>Saved Notices</Text>
          <Text style={st.hSub}>{saved.length > 0 ? `${saved.length} bookmarked` : 'Your personal pinboard'}</Text>
        </View>
      </View>

      <FlatList
        data={saved}
        keyExtractor={(n) => n.id}
        contentContainerStyle={{ paddingTop: 18, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <NoticeCard notice={item} index={index} onPress={() => nav.navigate('Detail', { id: item.id })} />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="bookmark-outline"
            title="Nothing saved yet"
            message="Tap the bookmark icon on any notice to keep it here for quick access."
          />
        }
      />
    </View>
  );
}

const st = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 22,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: C.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hTitle: { fontFamily: F.displayX, fontSize: 22, color: C.ink },
  hSub: { fontFamily: F.regular, fontSize: 12, color: C.sub, marginTop: 2 },
});

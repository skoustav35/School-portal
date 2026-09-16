import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DesignSpec } from '../lib/types';
import { F, GRADIENTS } from '../lib/theme';

const fontFor = (font: DesignSpec['font'], bold: boolean) => {
  if (font === 'serif') return bold ? F.displayX : F.display;
  if (font === 'mono') return F.mono;
  return bold ? F.extrabold : F.medium;
};

const titleSize = { S: 19, M: 24, L: 30 };
const bodySize = { S: 12.5, M: 13.5, L: 15 };

export default function DesignCard({
  title,
  body,
  design,
  compact = false,
  radius = 20,
}: {
  title: string;
  body: string;
  design: DesignSpec;
  compact?: boolean;
  radius?: number;
}) {
  const grad = GRADIENTS[design.bg] ?? GRADIENTS.indigo;
  const scale = compact ? 0.82 : 1;
  const alignItems = design.align === 'center' ? 'center' : 'flex-start';
  const textAlign = design.align === 'center' ? 'center' : 'left';

  return (
    <LinearGradient
      colors={grad}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        st.card,
        { borderRadius: radius, alignItems, minHeight: compact ? 150 : 230, padding: compact ? 18 : 26 },
      ]}
    >
      {/* decorative rings */}
      <View style={[st.ring, { top: -40, right: -40, width: 140, height: 140, borderRadius: 70 }]} />
      <View style={[st.ring, { bottom: -50, left: -30, width: 160, height: 160, borderRadius: 80 }]} />

      {design.sticker ? (
        <Text style={[st.sticker, { fontSize: compact ? 24 : 32 }]}>{design.sticker}</Text>
      ) : null}

      <View style={{ alignItems, maxWidth: '100%' }}>
        <Text
          numberOfLines={compact ? 2 : 4}
          style={{
            fontFamily: fontFor(design.font, true),
            fontWeight: design.font === 'mono' ? ('700' as const) : undefined,
            fontSize: titleSize[design.size] * scale,
            color: design.titleColor,
            textAlign,
            backgroundColor: design.highlight ?? 'transparent',
            paddingHorizontal: design.highlight ? 8 : 0,
            paddingVertical: design.highlight ? 2 : 0,
            borderRadius: design.highlight ? 6 : 0,
            overflow: 'hidden',
            lineHeight: titleSize[design.size] * scale * 1.3,
          }}
        >
          {title || 'Untitled notice'}
        </Text>
        {body ? (
          <Text
            numberOfLines={compact ? 3 : 8}
            style={{
              fontFamily: fontFor(design.font, false),
              fontSize: bodySize[design.size] * scale,
              color: design.bodyColor,
              textAlign,
              marginTop: 10,
              lineHeight: bodySize[design.size] * scale * 1.6,
              maxWidth: 320,
            }}
          >
            {body}
          </Text>
        ) : null}
      </View>

      <View style={[st.brand, design.align === 'center' ? { alignSelf: 'center' } : { alignSelf: 'flex-start' }]}>
        <Text style={st.brandTxt}>✦ CRESTWOOD ACADEMY</Text>
      </View>
    </LinearGradient>
  );
}

const st = StyleSheet.create({
  card: { justifyContent: 'center', overflow: 'hidden' },
  ring: {
    position: 'absolute',
    borderWidth: 22,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  sticker: { position: 'absolute', top: 12, right: 14 },
  brand: { marginTop: 14 },
  brandTxt: {
    fontFamily: F.semibold,
    fontSize: 9,
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.75)',
  },
});

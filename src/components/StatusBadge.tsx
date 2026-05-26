import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const COLORS: Record<string, { bg: string; text: string }> = {
  ACTIVE:       { bg: '#1a4731', text: '#4ade80' },
  INACTIVE:     { bg: '#2d2d2d', text: '#9ca3af' },
  FAULT:        { bg: '#4a1a1a', text: '#f87171' },
  LOW:          { bg: '#1a3a4a', text: '#38bdf8' },
  MEDIUM:       { bg: '#3a3010', text: '#facc15' },
  HIGH:         { bg: '#4a2510', text: '#fb923c' },
  CRITICAL:     { bg: '#4a1a1a', text: '#f87171' },
  OPEN:         { bg: '#4a1a1a', text: '#f87171' },
  ACKNOWLEDGED: { bg: '#3a3010', text: '#facc15' },
  RESOLVED:     { bg: '#1a4731', text: '#4ade80' },
};

interface Props {
  value: string;
}

export default function StatusBadge({ value }: Props) {
  const color = COLORS[value] ?? { bg: '#1e293b', text: '#94a3b8' };
  return (
    <View style={[styles.badge, { backgroundColor: color.bg }]}>
      <Text style={[styles.text, { color: color.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

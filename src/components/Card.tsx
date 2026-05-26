import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

interface Props extends ViewProps {
  children: React.ReactNode;
}

export default function Card({ children, style, ...rest }: Props) {
  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
});

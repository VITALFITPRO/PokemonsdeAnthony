import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatBarProps {
  label: string;
  value: number;
  color: string;
}

const StatBar: React.FC<StatBarProps> = ({ label, value, color }) => {
  const percentage = Math.min((value / 255) * 100, 100);
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <Text style={styles.value}>{value}</Text>
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  label: { width: 80, fontSize: 12, fontWeight: 'bold', color: '#555' },
  value: { width: 30, fontSize: 12, textAlign: 'right', marginRight: 10, color: '#333' },
  barBackground: { flex: 1, height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
});

export default StatBar;
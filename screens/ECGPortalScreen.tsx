/**
 * Author: Emmanuel Owusu
 * Project: Public Utility Platform
 * Date: Jan 2025
 * Contact: emmanuel.owusu@levincore.cloud
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ECGPortalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🔌 ECG Portal will be available here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20, fontWeight: 'bold' },
});

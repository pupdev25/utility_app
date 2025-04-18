/**
 * Author: Emmanuel Owusu
 * Project: Public Utility Platform
 * Date: Jan 2025
 * Contact: emmanuel.owusu@levincore.cloud
 */
import React, { useEffect, useState } from 'react';
import {
  View, Text, Button, StyleSheet, ActivityIndicator, TouchableOpacity, Alert
} from 'react-native';
import * as SecureStore from 'expo-secure-store';

export default function ElectricityScreen({ navigation }: any) {
  const [arrears, setArrears] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [overdueMonths, setOverdueMonths] = useState<string[]>([]);

  useEffect(() => {
    const checkArrears = async () => {
      try {
        const phone = await SecureStore.getItemAsync('phone_number');
        const res = await fetch(`https://pup.levincore.cloud/api/v1/district-arrears-check?phone=${phone}`);
        
        if (!res.ok) throw new Error('Failed to fetch arrears');
        
        const data = await res.json();
        setArrears(data.arrears || 0);
        setOverdueMonths(data.overdue_months || []);
      } catch (error) {
        Alert.alert('Error', 'Unable to fetch arrears. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    checkArrears();
  }, []);

  const handlePayArrears = () => {
    navigation.navigate('ECGPortal', {
      focusArrears: true
    });
  };

  const handleAccess = () => {
    navigation.navigate('ECGPortal');
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4e73df" />
        <Text style={{ marginTop: 10 }}>Checking arrears from district invoices...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
       <Text style={styles.header}>My ECG PORTAL</Text>
      {arrears > 0 && (
        <View style={styles.reminderCard}>
          <Text style={styles.warningText}>
            ⚠️ You have GHS {arrears.toFixed(2)} in unpaid property rate invoices
          </Text>
          {overdueMonths.map((month, i) => (
            <Text key={i} style={styles.monthBullet}>• {month}</Text>
          ))}
          <TouchableOpacity style={styles.arrearsButton} onPress={handlePayArrears}>
            <Text style={styles.arrearsButtonText}>Pay Arrears Now</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.accessCard}>
        <Text style={styles.okText}>🔌 Access the ECG Portal</Text>
        <Button title="Proceed to ECG Portal" onPress={handleAccess} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9fc',
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1E2A38',
    marginBottom: 25,
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reminderCard: {
    backgroundColor: '#fff3cd',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffeeba',
    elevation: 2,
    marginBottom: 20,
  },
  warningText: {
    color: '#856404',
    fontSize: 18,
    fontWeight: 'bold',
  },
  instructionText: {
    marginTop: 10,
    color: '#856404',
    fontSize: 16,
  },
  accessCard: {
    backgroundColor: '#d4edda',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c3e6cb',
    elevation: 2,
  },
  okText: {
    color: '#155724',
    fontSize: 18,
    marginBottom: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  arrearsButton: {
    marginTop: 20,
    backgroundColor: '#4e73df',
    paddingVertical: 14,
    borderRadius: 8,
  },
  arrearsButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  monthBullet: {
    fontSize: 14,
    color: '#856404',
    marginLeft: 8,
    marginTop: 4,
  },
});

/**
 * Author: Emmanuel Owusu
 * Project: Public Utility Platform
 * Date: Jan 2025
 * Contact: emmanuel.owusu@levincore.cloud
 */
// screens/PaymentHistoryScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';

export default function TbPaymentHistoryScreen() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const phone = await SecureStore.getItemAsync('phone_number');
      const res = await fetch(`https://pup.levincore.cloud/api/v1/tv-payments?phone_number=${phone}`);
      const data = await res.json();
      setPayments(data.payments || []);
    } catch (error) {
      console.error('Failed to load payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTableHeader = () => (
    <View style={[styles.row, styles.headerRow]}>
      {/* <Text style={[styles.cell, styles.headerText]}>Invoice ID</Text> */}
      <Text style={[styles.cell, styles.headerText]}> Amount Paid</Text>
      <Text style={[styles.cell, styles.headerText]}> Date Paid</Text>
    </View>
  );

  const renderTableRow = (payment: any, i: number) => {
    
    return (
      <View key={i} style={styles.row}>
        {/* <Text style={styles.cell}>{payment.id || '—'}</Text> */}
        <Text style={styles.cell}>GHS {parseFloat(payment.amount).toFixed(2)}</Text>
        <Text style={styles.cell}>{payment.payment_date || '—'}</Text>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>TV Payments History</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#4e73df" />
      ) : payments.length === 0 ? (
        <Text style={styles.noPayments}>No payments found.</Text>
      ) : (
        <>
          {renderTableHeader()}
          {payments.map((payment, index) => renderTableRow(payment, index))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f8f9fc', flexGrow: 1, marginTop:50 },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4e73df',
    marginBottom: 20,
    textAlign: 'center',
  },
  noPayments: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginTop: 40,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 6,
    marginBottom: 8,
    elevation: 2,
  },
  headerRow: {
    backgroundColor: '#eaf0fb',
  },
  headerText: {
    fontWeight: 'bold',
    color: '#4e73df',
  },
  cell: {
    flex: 1,
    fontSize: 14,
    textAlign: 'center',
  },
});

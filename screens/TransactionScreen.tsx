/**
 * Author: Emmanuel Owusu
 * Project: Public Utility Platform
 * Date: Jan 2025
 * Contact: emmanuel.owusu@levincore.cloud
 */

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { getTransactionList } from '../api/api'; // Define this in your api.ts
import * as SecureStore from 'expo-secure-store';

export default function TransactionScreen() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransactions = async () => {
      const phone = await SecureStore.getItemAsync('phone_number');
      if (!phone) return;
      try {
        const res = await getTransactionList(phone);
        setTransactions(res.transactions || []);
      } catch (err) {
        console.error('Failed to load transactions:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <Text style={styles.id}>#{item.invoice_id}</Text>
      <Text style={styles.amount}>GHS {item.amount_paid}</Text>
      <Text style={styles.method}>{item.payment_method}</Text>
      <Text style={styles.date}>{item.payment_date}</Text>
      <Text style={[styles.status, item.status === 'paid' ? styles.statusPaid : styles.statusPending]}>
        {item.status.toUpperCase()}
      </Text>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#4e73df" style={{ marginTop: 50 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Transaction History</Text>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.invoice_id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No transactions yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fc', padding: 20, marginTop:40},
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
  },
  id: { fontSize: 16, fontWeight: 'bold', color: '#4e73df' },
  amount: { fontSize: 16, color: '#000', marginVertical: 2 },
  method: { fontSize: 14, color: '#888' },
  date: { fontSize: 14, color: '#999' },
  status: { marginTop: 6, fontWeight: 'bold' },
  statusPaid: { color: '#1cc88a' },
  statusPending: { color: '#e74a3b' },
  empty: { textAlign: 'center', marginTop: 50, color: '#999' },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { getPaymentHistory } from '../api/api';

const PaymentHistoryScreen = () => {
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        const phoneNumber = await SecureStore.getItemAsync('phone_number');
        if (!phoneNumber) throw new Error('Phone number not found');

        const data = await getPaymentHistory(phoneNumber);
        console.log('📄 Payment data:', data);

        setPaymentHistory(Array.isArray(data) ? data : (data.payments || []));
      } catch (err: any) {
        console.error('Error fetching payment history:', err);
        setErrorMessage('Failed to fetch payment history.');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentHistory();
  }, []);

  const renderItem = ({ item }: any) => {
    const isPaid = item.status === 'paid';
    const statusBadgeStyle = isPaid ? styles.statusPaid : styles.statusPending;
    const statusText = isPaid ? '✅ Paid' : '❌ Pending';
  
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.invoiceId}>🧾 Invoice #{item.invoice_id}</Text>
          <Text style={[styles.statusBadge, statusBadgeStyle]}>{statusText}</Text>
        </View>
  
        <View style={styles.cardRow}>
          <Text style={styles.label}>💰 Amount:</Text>
          <Text style={styles.value}>GHS {item.amount_paid}</Text>
        </View>
  
        <View style={styles.cardRow}>
          <Text style={styles.label}>📅 Date:</Text>
          <Text style={styles.value}>{item.payment_date}</Text>
        </View>
  
        <View style={styles.cardRow}>
          <Text style={styles.label}>🏷️ Method:</Text>
          <Text style={styles.value}>{item.payment_method}</Text>
        </View>
  
        <View style={styles.cardRow}>
          <Text style={styles.label}>📍 Due Date:</Text>
          <Text style={styles.value}>{item.due_date || 'N/A'}</Text>
        </View>
      </View>
    );
  };
  
  

  if (loading) {
    return <ActivityIndicator size="large" color="#4e73df" style={{ marginTop: 60 }} />;
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>📄 Payment History</Text>

      <FlatList
        data={paymentHistory}
        keyExtractor={(item) => item.invoice_id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No payment records found.</Text>}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef1f8',
    paddingHorizontal: 16,
    paddingTop: 20,
    marginTop:40
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4e73df',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'center',
  },
  invoiceId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
    overflow: 'hidden',
    color: '#fff',
  },
  badgePaid: {
    backgroundColor: '#1cc88a',
  },
  badgePending: {
    backgroundColor: '#e74a3b',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  label: {
    color: '#666',
    fontSize: 14,
  },
  value: {
    fontWeight: '600',
    color: '#222',
    fontSize: 14,
  },
  arrearsRed: {
    color: '#e74a3b',
  },
  arrearsGreen: {
    color: '#1cc88a',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
  },
  errorText: {
    color: '#e74a3b',
    fontSize: 16,
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrearsCredit: {
    color: '#1cc88a', // Green for overpayment/credit
  },
  arrearsSettled: {
    color: '#4e73df', // Blue for settled exactly
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  
  statusPaid: {
    backgroundColor: '#e6f6f0',
    color: '#1cc88a',
  },
  
  statusPending: {
    backgroundColor: '#fbeaea',
    color: '#e74a3b',
  },
  
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  
  
  
});

export default PaymentHistoryScreen;

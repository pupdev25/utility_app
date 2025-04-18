/**
 * Author: Emmanuel Owusu
 * Project: Public Utility Platform
 * Date: Jan 2025
 * Contact: emmanuel.owusu@levincore.cloud
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, Animated, Easing
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';

export default function TvLicenseScreen({ navigation }: any) {
  const [paymentPlan, setPaymentPlan] = useState('monthly');
  const [paymentMode, setPaymentMode] = useState('mobile_money');
  const [modalVisible, setModalVisible] = useState(false);
  const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);
  const [tvData, setTvData] = useState<any>({ no_of_tv: 0, platform_account: 'N/A', payment_plan: 'Not Set' });
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [paidInvoiceIds, setPaidInvoiceIds] = useState<Set<number>>(new Set());

  const cardAnim = new Animated.Value(0);

  useEffect(() => {
    fetchTvDetails();
    fetchPaymentHistory();
    animateCards();
  }, []);

  const animateCards = () => {
    Animated.timing(cardAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease)
    }).start();
  };

  const fetchTvDetails = async () => {
    try {
      const phoneNumber = await SecureStore.getItemAsync('phone_number');
      if (!phoneNumber) throw new Error('Phone number not found.');

      const res = await fetch(`https://pup.levincore.cloud/api/v1/user-details?phone=${phoneNumber}`);
      const data = await res.json();

      const profile = data?.profile;
      if (profile) {
        setTvData({
          no_of_tv: profile.no_of_tv || 0,
          platform_account: profile.platform_account || 'N/A',
          payment_plan: profile.payment_plan || 'Not Set',
        });
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch TV data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const phoneNumber = await SecureStore.getItemAsync('phone_number');
      const res = await fetch(`https://pup.levincore.cloud/api/v1/tv-invoices?phone_number=${phoneNumber}`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setInvoices(data);
      } else {
        setInvoices([]);
        Toast.show({ type: 'info', text1: data.message || 'No invoices available' });
      }

      setInvoiceModalVisible(true);
    } catch (error) {
      setInvoices([]);
      Alert.alert('Error', 'Could not load invoices.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const phoneNumber = await SecureStore.getItemAsync('phone_number');
      const res = await fetch(`https://pup.levincore.cloud/api/v1/tv-payments?phone_number=${phoneNumber}`);
      const data = await res.json();
      setPayments(data.payments || []);

      // ✅ Properly cast Set<number>
      const paidIds = new Set<number>(data.payments.map((p: any) => Number(p.invoice_id)));
      setPaidInvoiceIds(paidIds);
    } catch (error) {
      console.error('Error loading payment history:', error);
    }
  };
  const handlePayInvoice = async (invoiceId: number) => {
    try {
      const phone = await SecureStore.getItemAsync('phone_number');
      const invoice = invoices.find((inv) => inv.id === invoiceId);
      if (!invoice) return Toast.show({ type: 'error', text1: 'Invoice not found' });

      const res = await fetch('https://pup.levincore.cloud/api/v1/pay-tv-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: invoice.user_id,
          invoice_id: invoiceId,
          amount: invoice.amount,
          payment_method: paymentMode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return Toast.show({ type: 'error', text1: data.message || 'Payment failed' });
      }

      Toast.show({ type: 'success', text1: data.message || 'Payment complete' });
      fetchInvoices(); // Refresh invoices
      fetchPaymentHistory(); // Refresh payment status
    } catch (e) {
      console.error('🚨 Payment exception:', e);
      Toast.show({ type: 'error', text1: 'Unexpected error during payment' });
    }
  };
  const generateInvoices = async () => {
    setLoading(true);
    try {
      const phoneNumber = await SecureStore.getItemAsync('phone_number');
      const res = await fetch('https://pup.levincore.cloud/api/v1/generate-tv-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phoneNumber, payment_plan: paymentPlan, payment_method: paymentMode })
      });
      const data = await res.json();
      Toast.show({ type: 'success', text1: data.message || 'Invoices generated.' });
      fetchInvoices();
    } catch (err) {
      Alert.alert('Error', 'Failed to generate invoices.');
    } finally {
      setLoading(false);
    }
  };


  const handleSavePreferences = async () => {
    await SecureStore.setItemAsync('payment_plan', paymentPlan);
    await SecureStore.setItemAsync('payment_method', paymentMode);
    Toast.show({ type: 'success', text1: 'Preferences saved successfully' });
    setModalVisible(false);
    generateInvoices();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>TV License</Text>

      {loading ? <ActivityIndicator size="large" color="#4e73df" /> : (
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>Platform Account No: TV1234567</Text>
          <Text style={styles.infoText}>Number of TVs: {tvData.no_of_tv}</Text>
          {/* <Text style={styles.infoText}>Payment Plan: {tvData.payment_plan}</Text> */}
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Set Payment Preferences</Text>
      </TouchableOpacity>

      <View>
        <TouchableOpacity style={styles.card} onPress={fetchInvoices}>
          <Text style={styles.cardTitle}>📄 View Invoices</Text>
          <Text style={styles.linkText}>Tap to view invoices based on plan</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('TvPaymentHistory')}>
  <Text style={styles.cardTitle}>💰 Payment History</Text>
  <Text style={styles.linkText}>Tap to view all previous payments</Text>
</TouchableOpacity>

              <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('HelpCenter')}>
          <Text style={styles.cardTitle}>🆘 Help Center</Text>
          <Text style={styles.linkText}>Tap to submit a complaint or request</Text>
        </TouchableOpacity>
      </View>

      {/* Invoice Modal */}
      <Modal visible={invoiceModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>📄 Invoices ({paymentPlan})</Text>
            <ScrollView>
              {invoices.length === 0 ? (
                <Text style={styles.infoText}>No invoices available.</Text>
              ) : (
                invoices.map((inv, i) => (
                  <View key={i} style={styles.card}>
                    <Text style={styles.cardTitle}>{`Invoice #${inv.id}`}</Text>
                    <Text>💵 Amount: GHS {inv.amount}</Text>
                    <Text>📆 Due Date: {inv.due_date}</Text>
                    <Text>📌 Status: {inv.status}</Text>

                    {paidInvoiceIds.has(inv.id) ? (
                      <View style={[styles.disabledBtn, { marginTop: 10 }]}>
                        <Text style={styles.disabledBtnText}>✅ Already Paid</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[styles.saveBtn, { marginTop: 10 }]}
                        onPress={() => handlePayInvoice(inv.id)}
                      >
                        <Text style={styles.saveBtnText}>💳 Pay Now</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              )}
            </ScrollView>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setInvoiceModalVisible(false)}>
              <Text style={styles.closeBtnText}>❌ Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={modalVisible} animationType="slide" transparent>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <Text style={styles.modalHeader}>🛠️ Payment Preferences</Text>

      <View style={styles.modalSection}>
        <Text style={styles.sectionLabel}>📅 Select a Payment Plan</Text>
        <View style={styles.pickerCard}>
          <Picker
            selectedValue={paymentPlan}
            onValueChange={setPaymentPlan}
            style={styles.picker}
          >
            <Picker.Item label="Monthly" value="monthly" />
            <Picker.Item label="Quarterly" value="quarterly" />
            <Picker.Item label="Yearly" value="yearly" />
          </Picker>
        </View>
      </View>

      <View style={styles.modalSection}>
        <Text style={styles.sectionLabel}>💳 Select a Payment Method</Text>
        <View style={styles.pickerCard}>
          <Picker
            selectedValue={paymentMode}
            onValueChange={setPaymentMode}
            style={styles.picker}
          >
            <Picker.Item label="Mobile Money" value="mobile_money" />
            <Picker.Item label="Credit Card" value="credit_card" />
          </Picker>
        </View>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSavePreferences}>
        <Text style={styles.saveBtnText}>💾 Save & Continue</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
        <Text style={styles.closeBtnText}>X Cancel</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

    </ScrollView>
  );
}

// Styles remain unchanged or slightly tuned. Let me know if
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F2F5F9',
    flexGrow: 1,
    paddingBottom: 60,
    marginTop:50
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1E2A38',
    marginBottom: 25,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  infoText: {
    fontSize: 16,
    color: '#444',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
  },
  modalSection: {
    marginBottom: 18,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
  },
  pickerCard: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 6,
  },
  linkText: {
    fontSize: 14,
    color: '#6C757D',
  },
  button: {
    backgroundColor: '#4e73df',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 25,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxHeight: '90%',
    elevation: 4,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    color: '#34495E',
    marginBottom: 20,
  },
  picker: {
    backgroundColor: '#c10c10',
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  saveBtn: {
    backgroundColor: '#2ECC71',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  closeBtn: {
    alignItems: 'center',
    marginTop: 15,
  },
  closeBtnText: {
    color: '#c10c10',
    fontSize: 15,
    fontWeight: '500',
  },
  disabledBtn: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledBtnText: {
    color: '#6B7280',
    fontWeight: '500',
    fontSize: 15,
  },
});

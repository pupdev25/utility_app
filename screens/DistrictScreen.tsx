// screens/DistrictScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getDistrictDetails , getInvoices, generateInvoice} from '../api/api';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';



const DistrictScreen = () => {
  const [district, setDistrict] = useState<any>(null);
  const [paymentPlan, setPaymentPlan] = useState('monthly');
  const [paymentMethod, setPaymentMethod] = useState('mobile_money');
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);
  const [districtList, setDistrictList] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [invoiceId, setInvoiceId] = useState<number | null>(null);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const navigation = useNavigation();


  useEffect(() => {
    loadDistrict();
  }, []);

  const loadDistrict = async () => {
    try {
      const data = await getDistrictDetails();
      setDistrict(data);
      setError(null);
    } catch (e) {
      console.log('Failed to fetch district info:', e);
      setError('Unable to load district info. Please check your internet or try again.');
    }
  };

  const handleChangeDistrict = () => {
    setModalVisible(true);
  };

  const handleSelectDistrict = (selected: any) => {
    // Replace with API call or SecureStore update logic
    Alert.alert('District changed to', selected.district_name);
    setDistrict(selected);
    setModalVisible(false);
  };
  const openPaymentPreferences = () => {
    setPaymentModalVisible(true);
  };


  const handleSavePaymentPreferences = async () => {
    const phoneNumber = await SecureStore.getItemAsync('userPhone');
    if (!phoneNumber) return Alert.alert('Error', 'Phone number not found');

    try {
      await generateInvoice(phoneNumber.trim(), paymentPlan, paymentMethod);
      Alert.alert('Success', 'Invoice generated based on your preferences');
      setPaymentModalVisible(false);
    } catch (error: any) {
      console.error('Generate invoice error:', error?.response?.data || error.message);
      Alert.alert('Error', 'Failed to generate invoice');
    }
  };

  const openInvoiceModal = async () => {
    setIsLoadingInvoices(true);
    setInvoiceModalVisible(true);
    try {
      const data = await getInvoices();
      setInvoices(data);
    } catch (err) {
      console.log('Failed to load invoices:', err);
      Alert.alert('Error', 'Unable to fetch invoices.');
    } finally {
      setIsLoadingInvoices(false);
    }
  };


  const openPaymentModal = () => {
    setPaymentModalVisible(true);
  };

  const closePaymentModal = () => {
    setPaymentModalVisible(false);
  };

  // Function to navigate to InvoiceDetail and close the modal
  const openInvoiceDetail = (selectedInvoiceId: number) => {
    setInvoiceId(selectedInvoiceId); // Save selected invoice ID
    closePaymentModal(); // Close the modal before navigating
    navigation.navigate('InvoiceDetail', {
      invoiceId: selectedInvoiceId,
      closeModal: closePaymentModal, // Pass close modal function to InvoiceDetailScreen
    });
  };

  
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatAmount = (amount: any) => `GHS ${(Number(amount) || 0).toFixed(2)}`;

  const handlePayNow = (invoiceId: number) => {
    Alert.alert('Pay Now', `Initiate payment for Invoice #${invoiceId}`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>My District Portal</Text>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* 🏛 District Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🏛 District Information</Text>
        {district ? (
          <>
            <Text style={styles.text}>Name: {district.district_name}</Text>
            <Text style={styles.text}>Location: {district.location}</Text>
            <Text style={styles.text}>Email: {district.email}</Text>
            <Text style={styles.text}>Phone: {district.phone}</Text>
            <TouchableOpacity onPress={handleChangeDistrict}>
              <Text style={styles.linkText}>Change District</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text>Loading...</Text>
        )}
      </View>

       {/* 💳 Payment Preferences as Modal */}
       <TouchableOpacity style={styles.card} onPress={openPaymentPreferences}>
        <Text style={styles.cardTitle}>💳 Payment Preferences</Text>
        <Text style={styles.text}>Plan: {paymentPlan}</Text>
        <Text style={styles.text}>Method: {paymentMethod === 'mobile_money' ? 'Mobile Money' : 'Credit Card'}</Text>
        <Text style={styles.linkText}>Tap to change preferences</Text>
      </TouchableOpacity>

      {/* 📄 Invoices */}
      <TouchableOpacity style={styles.card} onPress={openInvoiceModal}>
  <Text style={styles.cardTitle}>📄 View Invoices</Text>
  <Text style={styles.linkText}>Tap to view invoices based on plan</Text>
</TouchableOpacity>

      {/* 💰 Payment History */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('PaymentHistory')} // Navigate to PaymentHistory screen
      >
        <Text style={styles.cardTitle}>💰 Payment History</Text>
        <Text style={styles.linkText}>Tap to view all previous payments</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('HelpCenter')}>
  <Text style={styles.cardTitle}>🆘 Help Center</Text>
  <Text style={styles.linkText}>Tap to submit a complaint or request</Text>
</TouchableOpacity>

      {/* 🔁 Modal to switch districts */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.cardTitle}>Select a District</Text>
            <FlatList
              data={districtList}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSelectDistrict(item)}>
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={[styles.linkText, { textAlign: 'center', marginTop: 10 }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
       {/* 💳 Payment Preferences Modal */}
       <Modal
  visible={paymentModalVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setPaymentModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContainer}>

      {/* Close Button (Top Right) */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => setPaymentModalVisible(false)}
      >
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity>

      <Text style={styles.modalTitle}>Payment Plan</Text>
      <Picker
        selectedValue={paymentPlan}
        onValueChange={(itemValue) => setPaymentPlan(itemValue)}
        style={styles.modalPicker}
      >
        <Picker.Item label="Monthly" value="monthly" />
        <Picker.Item label="Quarterly" value="quarterly" />
        <Picker.Item label="Yearly" value="yearly" />
      </Picker>

      <Text style={styles.modalTitle}>Payment Method</Text>
      <Picker
        selectedValue={paymentMethod}
        onValueChange={(itemValue) => setPaymentMethod(itemValue)}
        style={styles.modalPicker}
      >
        <Picker.Item label="Mobile Money" value="mobile_money" />
        <Picker.Item label="Credit Card" value="credit_card" />
      </Picker>

      <TouchableOpacity onPress={handleSavePaymentPreferences}>
        <Text style={[styles.linkText, { textAlign: 'center', marginTop: 20 }]}>
          Save Preferences
        </Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

{/* 📄 Invoice Modal */}
<Modal
        visible={invoiceModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setInvoiceModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Invoice List</Text>
            {isLoadingInvoices ? (
              <ActivityIndicator size="large" color="#4e73df" style={{ marginTop: 20 }} />
            ) : invoices.length === 0 ? (
              <Text style={{ textAlign: 'center', marginVertical: 20, color: '#666' }}>
                No invoices found for your account.
              </Text>
            ) : (
              <FlatList
                data={invoices}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.invoiceItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.text}>{formatDate(item.due_date || item.period)} - {formatAmount(item.amount)}</Text>
                      <Text style={[styles.text, { fontSize: 13, color: '#888' }]}>Plan: {item.plan}</Text>
                      <Text style={[styles.text, { fontSize: 13, color: item.status === 'paid' ? 'green' : 'red' }]}>Status: {item.status}</Text>
                    </View>
                    {item.status !== 'Paid' && (
                   <TouchableOpacity onPress={() => openInvoiceDetail(item.id)}>
                      <Text style={[styles.linkText, { color: '#007bff' }]}>View Invoice</Text>
                    </TouchableOpacity>
                    )}
                  </View>
                )}
              />
            )}
            <TouchableOpacity onPress={() => setInvoiceModalVisible(false)}>
              <Text style={[styles.linkText, { textAlign: 'center', marginTop: 10 }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
  
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f8f9fc', marginTop:45 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#4e73df',
  },
  label: { fontSize: 14, marginTop: 10 },
  picker: { height: 50, width: '100%' },
  text: { fontSize: 14, marginVertical: 2 },
  linkText: { fontSize: 14, color: '#007bff', marginTop: 5 },
  errorBox: {
    backgroundColor: '#fdecea',
    padding: 10,
    marginBottom: 15,
    borderRadius: 6,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#aeb6bf',
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomColor: '#17202a',
    borderBottomWidth: 1,
  },
  
  modalLabel: {
    fontSize: 16,
    color: '#17202a',
    marginTop: 10,
  },
  
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#17202a', // 💡 Dark text for visibility
    marginBottom: 10,
    marginTop: 10,
  },
  
  modalPicker: {
    color: '#17202a', // ensures Picker items are visible
  },
  invoiceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 8,
  },
  
  closeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  
});
export default DistrictScreen;

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, Image } from 'react-native';
import { fetchInvoiceDetails } from '../api/api'; // Assuming your API function is already set up
import { formatAmount } from '../utils/formatters'; // Helper function for formatting amounts
import { payInvoice } from '../api/api'; // Import the payInvoice function
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';



const InvoiceDetailScreen = ({ route, navigation }: any) => {
    const { invoiceId, closeModal } = route.params; // Get invoiceId and closeModal from params

    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [paymentModalVisible, setPaymentModalVisible] = useState<boolean>(false); // Modal visibility
    const [amount, setAmount] = useState<string>(''); // Payment amount
    const [paymentMethod, setPaymentMethod] = useState<string>('mobile_money'); // Payment method
    const [paying, setPaying] = useState<boolean>(false); // Payment status
    const [successMessage, setSuccessMessage] = useState<string | null>(null); // Success message state



    useEffect(() => {
        const fetchDetails = async () => {
          try {
            const data = await fetchInvoiceDetails(invoiceId);
            setInvoice(data);
          } catch (err) {
            setErrorMessage("Failed to load invoice.");
          } finally {
            setLoading(false);
          }
        };
    
        fetchDetails();
    
        // Close the modal when navigating to this screen
        if (closeModal) {
          closeModal();
        }
      }, [invoiceId, closeModal]);
    
      if (loading) {
        return <ActivityIndicator size="large" color="#4e73df" />;
      }
    
      if (errorMessage) {
        return (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        );
      }
    
      // Handle payment
      const handlePayInvoice = async () => {
        setPaying(true); // Set paying state to true to show loading indicator
        try {
          // Retrieve the phone number from SecureStore
          const phoneNumber = await SecureStore.getItemAsync('phone_number');
      
          if (!phoneNumber) {
            console.error('Phone number not found in SecureStore'); // Log the error for debugging
            throw new Error('Phone number not found');
          }
      
          console.log('Phone number retrieved:', phoneNumber); // Debugging statement
      
          // Proceed with payment
          const result = await payInvoice(invoiceId, parseFloat(amount), paymentMethod, phoneNumber); // Call the payInvoice function from api.ts
          setSuccessMessage("Payment successful!");
          setInvoice({ ...invoice, status: result.arrears === 0 ? 'paid' : 'pending' });
          setPaymentModalVisible(false); // Close modal on success
      
        } catch (err) {
          console.error("🚨 Payment error:", err);
          setErrorMessage(err.message || 'Payment failed. Try again.');
        } finally {
          setPaying(false); // Reset the paying state (hide loading indicator)
        }
      };
      
  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Company Logo and Details */}
      <View style={styles.companyInfoContainer}>
        <Image source={require('../assets/ayawaso-west.png')} style={styles.invoiceLogo} />
        <Text style={styles.companyDetails}>
          AYAWASO WEST MUNICIPAL ASSEMBLY{'\n'}
          P.O.Box YK 1484, KANDA, DZORWULU{'\n'}
          0302-961448 | GPS: GA-160-8880
        </Text>
      </View>

      <Text style={styles.title}>Invoice Details</Text>

      {/* User Info */}
      <View style={styles.userInfoContainer}>
        <Text style={styles.text}><Text style={styles.boldText}>To: </Text>{invoice.user_name}</Text>
        <Text style={styles.text}><Text style={styles.boldText}>Address: </Text>{invoice.digital_address || 'N/A'}</Text>
        <Text style={styles.text}><Text style={styles.boldText}>Region: </Text>{invoice.region || 'N/A'}</Text>
        <Text style={styles.text}><Text style={styles.boldText}>District: </Text>{invoice.district || 'N/A'}</Text>
        <Text style={styles.text}><Text style={styles.boldText}>Due Date: </Text>{formatDate(invoice.due_date)}</Text>
      </View>

      {/* Invoice Breakdown Table with Header Row */}
      <View style={styles.invoiceTable}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <Text style={styles.headerText}>Invoice Type</Text>
          <Text style={styles.headerText}>Rateable Value</Text>
          <Text style={styles.headerText}>Rate Impost</Text>
          <Text style={styles.headerText}>Amount</Text>
        </View>

        {/* Invoice Data Rows */}
        <View style={styles.dataRows}>
          <View style={styles.invoiceRow}>
            <Text style={styles.invoiceLabel}>Property Rate</Text>
            <Text style={styles.invoiceValue}>{String(invoice.rateable_value)}</Text>
            <Text style={styles.invoiceValue}>{String(invoice.rate_impost)}</Text>
            <Text style={styles.invoiceValue}>{String(invoice.amount)}</Text> 
          </View>
        </View>
      </View>

      {/* Total Outstanding */}
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Subtotal</Text>
        <Text style={styles.totalValue}>{formatAmount(invoice.amount + (invoice.arrears || 0) - (invoice.payment || 0))}</Text>
      </View>
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Special Levy</Text>
        <Text style={styles.totalValue}>{formatAmount(invoice.arrears || 0)}</Text>
      </View>
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Arrears</Text>
        <Text style={styles.totalValue}>{formatAmount(invoice.arrears || 0)}</Text>
      </View>
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Payment</Text>
        <Text style={styles.totalValue}>{formatAmount(invoice.payment || 0)}</Text>
      </View>
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total Outstanding:</Text>
        <Text style={styles.totalValue}>{formatAmount(invoice.amount + (invoice.arrears || 0) - (invoice.payment || 0))}</Text>
      </View>

      {/* Pay Now Button */}
      <TouchableOpacity style={styles.payButton} onPress={() => setPaymentModalVisible(true)}>
        <Text style={styles.payButtonText}>Pay Now</Text>
      </TouchableOpacity>
      {/* Payment Modal */}
      <Modal
        visible={paymentModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPaymentModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Payment</Text>

            {/* Payment Method Input */}
            <Text style={styles.inputLabel}>Amount</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Payment Method</Text>
            <View style={styles.paymentMethodContainer}>
              <TouchableOpacity
                style={paymentMethod === 'mobile_money' ? styles.selectedMethod : styles.unselectedMethod}
                onPress={() => setPaymentMethod('mobile_money')}>
                <Text style={styles.methodText}>Mobile Money</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={paymentMethod === 'bank_transfer' ? styles.selectedMethod : styles.unselectedMethod}
                onPress={() => setPaymentMethod('bank_transfer')}>
                <Text style={styles.methodText}>Bank Transfer</Text>
              </TouchableOpacity>
            </View>

            {/* Payment Button */}
            <TouchableOpacity
              style={styles.payButtonModal}
              onPress={handlePayInvoice}
              disabled={paying}>
              <Text style={styles.payButtonText}>{paying ? "Processing..." : "Make Payment"}</Text>
            </TouchableOpacity>

            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setPaymentModalVisible(false)}>
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

// Helper to format the date
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 13,
    marginBottom: 5,
  },
  boldText: {
    fontWeight: 'bold',
  },
  companyInfoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  invoiceLogo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  companyDetails: {
    textAlign: 'center',
    fontSize: 12,
    color: '#555',
  },
  userInfoContainer: {
    marginBottom: 20,
  },
  invoiceTable: {
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 30,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 5,
    marginBottom: 10,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  dataRows: {
    marginBottom: 10,
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  selectedMethod: {
    backgroundColor: '#4e73df',
    padding: 10,
    borderRadius: 5,
  },
  unselectedMethod: {
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 5,
  },
  methodText: {
    color: '#fff',
  },
  invoiceLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  invoiceValue: {
    fontSize: 12,
    textAlign: 'center',
  },
  totalContainer: {
    marginTop: 20,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 13,
    color: '#4e73df',
  },
  payButton: {
    backgroundColor: '#4e73df',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  payButtonModal: {
    backgroundColor: '#4e73df',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeModalButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
    alignItems: 'center',
  },
  closeModalButtonText: {
    color: '#fff',
  },
  successMessageContainer: {
    padding: 15,
    backgroundColor: '#4e73df',
    borderRadius: 5,
    marginTop: 20,
  },
  successMessage: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default InvoiceDetailScreen;

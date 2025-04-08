import axios from 'axios';
import * as SecureStore from 'expo-secure-store';


const BASE_URL = 'https://pup.levincore.cloud/api/v1';

export const sendOtp = async (phone: string) => {
    try {
      const response = await axios.post(`${BASE_URL}/send-otp`, {
        phone_number: phone, // Laravel expects this key
      });
      return {
        success: true,
        ...response.data,
      };
    } catch (error: any) {
      console.error('sendOtp error:', error?.response?.data || error.message);
  
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          'Network error. Please check your connection or try again later.',
      };
    }
  };
  
  
  export const verifyOtp = async (phone: string, otp: string) => {
    try {
      const response = await axios.post(`${BASE_URL}/verify-otp`, {
        phone_number: phone,
        otp: otp,
      });
  
      return {
        success: true,
        ...response.data, // e.g. { new_user: true }
      };
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error || // 👈 fallback to 'error' key
        'OTP verification failed.';
  
      console.error('verifyOtp error:', error.response?.data || error.message);
  
      return {
        success: false,
        message,
      };
    }
  };
  
  export const getDistrictDetails = async () => {
    const phone = await SecureStore.getItemAsync('userPhone');
    if (!phone) throw new Error('Phone number not found');
  
    const cache = await SecureStore.getItemAsync('cachedDistrict');
  
    if (cache) {
      try {
        return JSON.parse(cache); // Return cached result first
      } catch {
        // continue to fetch fresh
      }
    }
  
    const res = await axios.get(`${BASE_URL}/user-district`, {
      params: { phone },
    });
  
    await SecureStore.setItemAsync('cachedDistrict', JSON.stringify(res.data)); // Cache it
    return res.data;
  };
  export const getInvoices = async () => {
    const phone = await SecureStore.getItemAsync('userPhone');
  
    if (!phone) {
      console.warn('🚫 No phone number found in SecureStore');
      throw new Error('Phone number is missing');
    }
  
    try {
      const response = await axios.get(`${BASE_URL}/invoices`, {
        params: { phone },
      });
  
      console.log('✅ Invoice response:', response.data);
      return response.data.invoices || [];
    } catch (error: any) {
      console.error('❌ Failed to fetch invoices:', error?.response?.data || error.message);
      throw new Error(error?.response?.data?.message || 'Failed to fetch invoices');
    }
  };
  
  export const generateInvoice = async (
    phoneNumber: string,
    paymentPlan: string,
    paymentMethod: string
  ) => {
    const response = await axios.post(`${BASE_URL}/generate-invoice`, {
      phone_number: phoneNumber,
      payment_plan: paymentPlan,
      payment_method: paymentMethod,
    });
  
    return response.data;
  };

  export const fetchInvoiceDetails = async (invoiceId: number) => {
    try {
      const response = await axios.get(`${BASE_URL}/invoices/${invoiceId}`, {
        headers: { 'Content-Type': 'application/json' },
      });
  
      return response.data; // Assuming this is the invoice data you're looking for
    } catch (error) {
      console.error('🚨 Error fetching invoice:', error);
      throw new Error('Failed to load invoice.');
    }
  };
  export const payInvoice = async (invoiceId: string, amount: number, paymentMethod: string, phoneNumber: string) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/pay-invoice`,
        {
          phone_number: phoneNumber,
          invoice_id: invoiceId,
          amount,
          payment_method: paymentMethod,
        },
        {
          headers: { 'Content-Type': 'application/json' } // Correct way to add headers
        }
      );
  
      const result = response.data;
      return result;
    } catch (error) {
      console.error('🚨 Payment error:', error);
      throw new Error('Payment failed. Please try again.');
    }
  };
  export const getPaymentHistory = async (phoneNumber: string) => {
    try {
      console.log('📞 Fetching payment history for phone:', phoneNumber);
  
      const response = await axios.get(`${BASE_URL}/payment-history`, {
        params: { phone_number: phoneNumber }, // ✅ Corrected key here
      });
  
      console.log('📦 Payment history response:', response.data);
  
      return response.data.payments || []; // Assuming data is { payments: [...] }
  
    } catch (error: any) {
      console.error('❌ Error fetching payment history:', error.response || error.message);
  
      if (error.response) {
        const status = error.response.status;
        if (status === 404) {
          throw new Error('No payment history found for this phone number.');
        } else if (status === 400) {
          throw new Error('Bad request. Please check the input.');
        } else {
          throw new Error('Failed to fetch payment history.');
        }
      } else {
        throw new Error('An unknown error occurred while fetching payment history.');
      }
    }
  };
  
  export const getDistrictInfo = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/district/info`);
      return res.data.district;
    } catch (e) {
      return null;
    }
  };
  
  export const getTransactionList = async (phoneNumber: string) => {
    try {
      const response = await fetch(`https://pup.levincore.cloud/api/v1/transactions?phone=${phoneNumber}`);
      
      if (!response.ok) {
        const errorText = await response.text(); // this is likely HTML
        console.error('💥 Server Error Response:', errorText);
        throw new Error(`Server responded with status ${response.status}`);
      }
  
      const data = await response.json();
      return data.transactions || []; // Adjust based on actual backend response
    } catch (error) {
      console.error('❌ Error fetching transactions:', error);
      throw new Error('Failed to fetch transaction list.');
    }
  };
  
  
  export const getTvLicenseInfo = async (phoneNumber: string) => {
    try {
      const response = await axios.get(`${BASE_URL}/user-details`, {
        params: { phone: phoneNumber },  // Ensure phone number is passed as a query parameter
      });
  
      return response.data;
    } catch (error) {
      console.error('Error fetching TV license info:', error);
      throw error;  // Re-throw the error to be handled in the component
    }
  };
  
  export const getIncomingInvoice = async (phone: string) => {
    const res = await axios.get(`${BASE_URL}/incoming-invoice`, {
      params: { phone },
    });
    return res.data;
  };
  
  export const getTvPaymentHistory = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/tv-license/payments`);
      return res.data.history;
    } catch (e) {
      return [];
    }
  };

  export const checkArrears = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/arrears/check`);
      return res.data; // { total: 0 } or { total: 150.00 }
    } catch (e) {
      console.error('Arrears check error:', e);
      return { total: 0 };
    }
  };

  export const getDistrictList = async () => {
    const res = await axios.get(`${BASE_URL}/districts`);
    return res.data.districts; // Assumes API returns { districts: [...] }
  };
  
  export const getProfile = async () => {
    const phone = await SecureStore.getItemAsync('userPhone');
  
    if (!phone) {
      throw new Error('Phone number not found in secure storage.');
    }
  
    const res = await axios.get(`${BASE_URL}/user-details`, {
      params: { phone }, // ✅ Laravel expects ?phone=...
    });
  
    // Return full object with user + profile
    return res.data;
  };
  
  export const updateProfile = async (profile: any) => {
    const res = await axios.post(`${BASE_URL}/user/update-profile`, profile);
    return res.data;
  };
  
  export const logoutUser = async () => {
    try {
      await axios.post(`${BASE_URL}/logout`);
    } catch (e) {
      console.warn('Logout error', e);
    }
  };
  export const completeProfile = async (data: any) => {
    return await axios.post(`${BASE_URL}/complete-profile`, data);
  };
  export const getRegions = async () => {
    const res = await axios.get(`${BASE_URL}/regions`);
    return res.data.regions; // assume { regions: [ { name: 'Ashanti' }, ... ] }
  };
  
  export const getSelectedDistrict = async () => {
    const id = await SecureStore.getItemAsync('districtId'); // or 'districtSlug'
    const res = await axios.get(`${BASE_URL}/districts/${id}`);
    return res.data;
  };
  
  export const getUserArrears = async (phoneNumber: string) => {
    try {
      const response = await axios.get(`${BASE_URL}/user-arrears`, {
        params: { phone_number: phoneNumber },
      });
      return response.data.arrears; // Return the arrears amount
    } catch (error) {
      console.error('Error fetching arrears:', error);
      throw new Error('Unable to fetch arrears');
    }
  };
  export const getTvLicenseInvoices = async (paymentPlan: string) => {
    try {
      const phoneNumber = await SecureStore.getItemAsync('phone_number');
      if (!phoneNumber) {
        throw new Error('Phone number not found');
      }
  
      // Make an API call to fetch invoices based on the payment plan
      const response = await axios.get(`${BASE_URL}/tv-license-invoices`, {
        params: {
          phone: phoneNumber,
          payment_plan: paymentPlan,
        },
      });
  
      return response.data.invoices || []; // Return the invoices, or an empty array if not found
    } catch (error) {
      console.error('Error fetching TV license invoices:', error);
      throw error;
    }
  };
  
  
  
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Keyboard,
  Pressable,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';
import { Image } from 'react-native';


import { verifyOtp, sendOtp, getProfile } from '../api/api';

export default function OtpScreen({ route, navigation }: any) {
  const { phone } = route.params;
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [resending, setResending] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (text: string, index: number) => {
    const clean = text.replace(/\D/g, '');
    const newOtp = [...otp];

    if (clean.length > 1) {
      const digits = clean.split('').slice(0, 4);
      setOtp(digits);
      inputs.current[digits.length - 1]?.focus();
      return;
    }

    newOtp[index] = clean;
    setOtp(newOtp);

    if (clean && index < 3) inputs.current[index + 1]?.focus();
    if (!clean && index > 0) inputs.current[index - 1]?.focus();
  };

  const handlePaste = async () => {
    const clipboardContent = await Clipboard.getStringAsync();
    const digits = clipboardContent.replace(/\D/g, '').split('').slice(0, 4);
    if (digits.length === 4) {
      setOtp(digits);
      inputs.current[3]?.focus();
    } else {
      Alert.alert('Invalid Paste', 'Clipboard does not contain a valid 4-digit OTP.');
    }
  };

  const handleVerifyOtp = async () => {
    const fullOtp = otp.join('').trim();
    if (!/^\d{4}$/.test(fullOtp)) {
      return Alert.alert('Invalid OTP', 'Enter a valid 4-digit code.');
    }

    const trimmedPhone = phone?.trim();
    if (!trimmedPhone) {
      return Alert.alert('Missing Info', 'Phone number not found.');
    }

    try {
      setLoading(true);

      const res = await verifyOtp(trimmedPhone, fullOtp);
      if (!res.success) {
        return Alert.alert('OTP Failed', res.message || 'Incorrect OTP');
      }

      await SecureStore.setItemAsync('userPhone', trimmedPhone);

      const userRes = await getProfile();
      const profile = userRes?.data?.profile;

      Keyboard.dismiss();

      setTimeout(async () => {
        if (res.profile?.is_updated === 1) {
          await SecureStore.setItemAsync('is_updated', '1');
          navigation.replace('MainTabs', { screen: 'Home' });
        } else {
          await SecureStore.setItemAsync('is_updated', '0');
          navigation.replace('ProfileCompletion');
        }
      }, 300);

    } catch (err) {
      console.error("🚨 OTP verification error:", err);
      Alert.alert('Error', 'OTP verification failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setResending(true);
      const res = await sendOtp(phone);
      if (res.success) {
        Toast.show({ type: 'success', text1: 'OTP resent successfully' });
        setTimer(60);
        setOtp(['', '', '', '']);
        inputs.current[0]?.focus();
      } else {
        Alert.alert('Failed to resend OTP', res.message || 'Try again later');
      }
    } catch (err) {
      Alert.alert('Error', 'Could not resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Enter the OTP sent to</Text>
      <Text style={styles.phone}>{phone}</Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputs.current[index] = ref)}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            keyboardType="numeric"
            maxLength={1}
            style={styles.otpBox}
            returnKeyType="next"
            autoFocus={index === 0}
          />
        ))}
      </View>

      {/* <Pressable onPress={handlePaste} style={styles.pasteBtn}>
        <Text style={styles.pasteText}>Paste from Clipboard</Text>
      </Pressable> */}

      <TouchableOpacity
        style={[styles.verifyBtn, loading && { backgroundColor: '#999' }]}
        onPress={handleVerifyOtp}
        disabled={loading}
      >
        <Text style={styles.verifyText}>{loading ? 'Verifying...' : 'Verify OTP'}</Text>
      </TouchableOpacity>

      <View style={styles.resendWrapper}>
        {timer > 0 ? (
          <Text style={styles.timerText}>Resend available in {timer}s</Text>
        ) : (
          <TouchableOpacity onPress={handleResendOtp} disabled={resending}>
            <Text style={styles.resendText}>
              {resending ? 'Resending...' : 'Resend OTP'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f8f9fc' },
  title: { fontSize: 18, textAlign: 'center', marginBottom: 5 },
  phone: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },

  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 20,
  },
  otpBox: {
    width: 50,
    height: 55,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 24,
    backgroundColor: '#fff',
  },

  pasteBtn: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pasteText: {
    color: '#4e73df',
    fontSize: 14,
    fontWeight: 'bold',
  },

  verifyBtn: {
    backgroundColor: '#4e73df',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  verifyText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  resendWrapper: {
    marginTop: 20,
    alignItems: 'center',
  },
  resendText: {
    color: '#4e73df',
    fontWeight: 'bold',
    fontSize: 16,
  },
  timerText: {
    color: '#999',
    fontSize: 14,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 30,
  },
  
});

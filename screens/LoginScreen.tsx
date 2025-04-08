import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { sendOtp } from '../api/api';
import * as SecureStore from 'expo-secure-store';
import { Image } from 'react-native';


// Store phone number securely in SecureStore
const storePhoneNumber = async (phoneNumber: string) => {
  await SecureStore.setItemAsync('phone_number', phoneNumber);
  console.log('Phone number saved:', phoneNumber); // Verify if it's stored
};

export default function LoginScreen({ navigation }: any) {
  const [phone, setPhone] = useState('');

  const handleSendOtp = async () => {
    const cleanedPhone = phone.trim().replace(/\s+/g, '');
  
    if (!cleanedPhone || cleanedPhone.length !== 10 || !/^\d+$/.test(cleanedPhone)) {
      return Alert.alert('Invalid Phone', 'Enter a valid 10-digit phone number');
    }
  
    try {
      // Store phone number in SecureStore
      await storePhoneNumber(cleanedPhone); // Save the phone number securely
      
      const res = await sendOtp(cleanedPhone);
  
      if (res.success) {
        Alert.alert('Success', 'OTP sent successfully');
        navigation.navigate('OTP', { phone: cleanedPhone });
      } else {
        Alert.alert('Failed to send OTP', res.message || 'Try again later');
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong. Try again later.');
    }
  };

  return (
    <View style={styles.container}>
          <Image source={require('../assets/logo.png')} style={styles.logo} />

      <Text style={styles.label}>Enter Phone Number</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="e.g. 0241234567"
        keyboardType="phone-pad"
        maxLength={10}
      />
      <Button title="Send OTP" onPress={handleSendOtp} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  label: { fontSize: 18, marginBottom: 5 },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  logo: {
    width: 150,
    height: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 1,
  },
  
});

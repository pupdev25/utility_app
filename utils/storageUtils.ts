/**
 * Author: Emmanuel Owusu
 * Project: Public Utility Platform
 * Date: Jan 2025
 * Contact: emmanuel.owusu@levincore.cloud
 */
// utils/storageUtils.ts

import * as SecureStore from 'expo-secure-store';

// Function to store the phone number in SecureStore
export const storePhoneNumber = async (phoneNumber: string) => {
  await SecureStore.setItemAsync('phone_number', phoneNumber);
  console.log('Phone number saved:', phoneNumber); // Verify if it's stored
};

// Function to retrieve the phone number from SecureStore
export const getPhoneNumber = async () => {
  const phoneNumber = await SecureStore.getItemAsync('phone_number');
  console.log('Phone number retrieved:', phoneNumber);
  return phoneNumber;
};

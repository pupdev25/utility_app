/**
 * Author: Emmanuel Owusu
 * Project: Public Utility Platform
 * Date: Jan 2025
 * Contact: emmanuel.owusu@levincore.cloud
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { getProfile, logoutUser } from '../api/api';
import * as SecureStore from 'expo-secure-store';

export default function HomeScreen({ navigation }: any) {
  const [name, setName] = useState<string>('User');
  const [photo, setPhoto] = useState<string | null>(null);
  const [greeting, setGreeting] = useState<string>('Hello');
  const [nextInvoice, setNextInvoice] = useState<any>(null);

  useEffect(() => {
    loadUser();
    fetchNextInvoice();
  }, []);

  const loadUser = async () => {
    try {
      const { profile } = await getProfile();
  
      const fullName = `${profile.first_name || ''} `.trim();
      setName(fullName || 'User');
      setGreeting(getGreeting());
      // photo will remain null unless you want to handle it from somewhere else
    } catch (e) {
      console.log('❌ Failed to load profile:', e);
      setName('User');
      setGreeting(getGreeting());
    }
  };
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  const fetchNextInvoice = async () => {
    try {
      const phone = await SecureStore.getItemAsync('phone_number');
      const res = await fetch(`https://pup.levincore.cloud/api/v1/next-invoice?phone=${phone}`);
      const data = await res.json();
      console.log('📦 Next Invoice Response:', data);
  
      if (res.ok && data.invoice_id) {
        setNextInvoice(data);
      } else {
        setNextInvoice(null);
        console.log('📭 No upcoming invoice found or data is malformed');
      }
    } catch (err) {
      console.log('❌ Error fetching next invoice:', err);
    }
  };
  
  
  const handleLogout = async () => {
    await logoutUser();
    await SecureStore.deleteItemAsync('userPhone');
    navigation.replace('Login');
  };

  const confirmLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: handleLogout },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>{greeting}, {name} </Text>

        <TouchableOpacity onPress={confirmLogout}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.avatar} />
          ) : (
            <Ionicons name="person-circle" size={42} color="#4e73df" />
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('District')}>
        <Image source={require('../assets/home/district.png')} style={styles.cardImage} />
        <Text style={styles.cardText}>District</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('TVLicense')}>
        <Image source={require('../assets/home/tv.png')} style={styles.cardImage} />
        <Text style={styles.cardText}>TV License</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Electricity')}>
        <Image source={require('../assets/home/electricity.png')} style={styles.cardImage} />
        <Text style={styles.cardText}>Electricity</Text>
      </TouchableOpacity>

      {nextInvoice && (
  <View style={styles.invoiceCard}>
    <Text style={styles.invoiceTitle}>📅 Upcoming Invoice</Text>
    <View style={styles.invoiceRow}>
      <Text style={styles.label}>Amount:</Text>
      <Text style={styles.value}>GHS {nextInvoice.amount}</Text>
    </View>
    <View style={styles.invoiceRow}>
      <Text style={styles.label}>Due Date:</Text>
      <Text style={styles.value}>{nextInvoice.due_date}</Text>
    </View>
    <View style={styles.invoiceRow}>
      <Text style={styles.label}>Invoice Type:</Text>
      <Text style={styles.value}>Property Rate</Text>
    </View>
    <View>

</View>
  </View>
)}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f8f9fc' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    marginTop:50
  },
  header: { fontSize: 24, fontWeight: 'bold', flex: 1 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: '#4e73df',
    marginLeft: 10,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 20,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  cardText: { marginTop: 10, fontSize: 18, fontWeight: '600' },
  invoiceCard: {
    backgroundColor: '#e2eafc',
    padding: 16,
    marginBottom: 20,
    borderRadius: 12,
  },
  invoiceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#4e73df',
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    color: '#555',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  cardImage: {
    width: 60,
    height: 50,
    resizeMode: 'contain',
    marginBottom: 12,
  },
  
});

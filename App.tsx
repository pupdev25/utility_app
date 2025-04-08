// App.tsx
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Platform,
  ToastAndroid,
  Alert,
  Animated,
} from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

// Screens
import LoginScreen from './screens/LoginScreen';
import OtpScreen from './screens/0tpScreen';
import ProfileCompletionScreen from './screens/ProfileCompletionScreen';
import DistrictScreen from './screens/DistrictScreen';
import InvoiceDetailScreen from './screens/InvoiceDetailScreen';
import TvLicenseScreen from './screens/TvLicenseScreen';
import ElectricityScreen from './screens/ElectricityScreen';
import ECGPortalScreen from './screens/ECGPortalScreen';
import TvPaymentHistoryScreen from './screens/TvPaymentHistoryScreen';
import ProfileScreen from './screens/ProfileScreen';
import HomeScreen from './screens/HomeScreen';
import PaymentHistoryScreen from './screens/PaymentHistoryScreen';
import HelpCenterScreen from './screens/HelpCenterScreen';

import { getProfile } from './api/api';
import TransactionScreen from './screens/TransactionScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#4e73df',
        tabBarInactiveTintColor: '#ccc',
        tabBarIcon: ({ color, size }) => {
          let iconName = 'home';
          if (route.name === 'Home') iconName = 'home';
          if (route.name === 'Transactions') iconName = 'receipt';
          if (route.name === 'Profile') iconName = 'person';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Transactions" component={TransactionScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    SplashScreen.preventAutoHideAsync();
    checkProfileStatus();
  }, []);

  const checkProfileStatus = async () => {
    try {
      const phone = await SecureStore.getItemAsync('userPhone');
      if (!phone) {
        setInitialRoute('Login');
        return;
      }

      const cachedStatus = (await SecureStore.getItemAsync('is_updated'))?.trim();
      if (cachedStatus === '1') {
        setInitialRoute('MainTabs');
        return;
      }

      const { profile } = await getProfile();
      if (profile?.is_updated === 1) {
        await SecureStore.setItemAsync('is_updated', '1');
        setInitialRoute('MainTabs');
      } else {
        await SecureStore.setItemAsync('is_updated', '0');
        setInitialRoute('ProfileCompletion');
      }
    } catch (err) {
      console.log('❌ Error loading profile status:', err);
      setInitialRoute('Login');
    } finally {
      fadeIn();
      SplashScreen.hideAsync();
    }
  };

  const fadeIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.LONG);
    } else {
      Alert.alert('Info', message);
    }
  };

  if (!initialRoute) {
    return (
      <View style={styles.splashContainer}>
        <Animated.Image
          source={require('./assets/splash-icon.png')}
          style={[styles.logo, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
          resizeMode="contain"
        />
        <Animated.Text style={[styles.tagline, { opacity: fadeAnim }]}>
          Empowering Utility Access
        </Animated.Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="OTP" component={OtpScreen} />
        <Stack.Screen name="ProfileCompletion" component={ProfileCompletionScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />

        {/* Other pages not in tabs */}
        <Stack.Screen name="District" component={DistrictScreen} />
        <Stack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} />
        <Stack.Screen name="TVLicense" component={TvLicenseScreen} />
        <Stack.Screen name="Electricity" component={ElectricityScreen} />
        <Stack.Screen name="ECGPortal" component={ECGPortalScreen} />
        <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} />
        <Stack.Screen name="TvPaymentHistory" component={TvPaymentHistoryScreen} />
        <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />

        
      </Stack.Navigator>

      <Toast />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 20,
    shadowColor: '#4e73df',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  tagline: {
    fontSize: 16,
    color: '#4e73df',
    fontWeight: 'bold',
  },
});

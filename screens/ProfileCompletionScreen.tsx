/**
 * Author: Emmanuel Owusu
 * Project: Public Utility Platform
 * Date: Jan 2025
 * Contact: emmanuel.owusu@levincore.cloud
 */
import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet,
  Button, Alert, Animated, TouchableOpacity, Image
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as SecureStore from 'expo-secure-store';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { completeProfile, getDistrictList, getRegions } from '../api/api';

const STORAGE_KEY = 'profile_draft';

export default function ProfileCompletionScreen({ navigation }: any) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    business_name: '',
    registration_no: '',
    email: '',
    digital_address: '',
    ghana_card_id: '',
    region: '',
    district: '',
    type_of_premise: '',
    no_of_tv: '',
    ecg_meter_number: '',
    property_user_type: '',
    business_type: '',
    individual_type: '',
    exemption: '',
    meter_image: '',
    location: '',
    property_account_number: '',
  });

  const [districts, setDistricts] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    (async () => {
      await loadSelectOptions();
      const saved = await SecureStore.getItemAsync(STORAGE_KEY);
      if (saved) setForm(JSON.parse(saved));
    })();
  }, []);

  const loadSelectOptions = async () => {
    const distList = await getDistrictList();
    const regionList = await getRegions();
    setDistricts(distList);
    setRegions(regionList);
  };

  const updateForm = (key: string, value: string) => {
    const updated = { ...form, [key]: value };
    setForm(updated);
    SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(updated));
  };

  const takeMeterPhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Permission denied', 'Camera access is needed to take meter photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.6,
      base64: false,
    });

    if (!result.cancelled) {
      updateForm('meter_image', result.uri);
    }
  };

  const pickLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Location access is required.');
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});
    const coords = `${loc.coords.latitude},${loc.coords.longitude}`;
    updateForm('location', coords);
  };

  const handleSubmit = async () => {
    try {
      const phone_number = await SecureStore.getItemAsync('userPhone');

      if (!phone_number) {
        Alert.alert('Error', 'Phone number not found.');
        return;
      }

      const payload = { ...form, phone_number };

      await completeProfile(payload);
      await SecureStore.deleteItemAsync(STORAGE_KEY);
      Alert.alert('Success', 'Profile completed');
      navigation.replace('MainTabs', { screen: 'Home' });
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not complete profile');
    }
  };

  const transitionToStep = (targetStep: number) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setStep(targetStep);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const renderInput = (key: string, label: string) => (
    <View key={key}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={(form as any)[key]}
        onChangeText={(text) => updateForm(key, text)}
      />
    </View>
  );

  const renderStep1 = () => (
    <>
      <Text style={styles.stepTitle}>Step 1: Personal Info</Text>
      {renderInput("first_name", "First Name")}
      {renderInput("last_name", "Last Name")}
      {renderInput("business_name", "Business Name")}
      {renderInput("registration_no", "Company Reg. No.")}

      <Text style={styles.label}>Property User Type</Text>
      <View style={styles.radioGroup}>
        {["business", "individual"].map((value) => (
          <TouchableOpacity
            key={value}
            style={styles.radioOption}
            onPress={() => updateForm("property_user_type", value)}
          >
            <View style={styles.radioCircle}>
              {form.property_user_type === value && <View style={styles.radioSelected} />}
            </View>
            <Text>{value.charAt(0).toUpperCase() + value.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {form.property_user_type === "business" && (
        <>
          <Text style={styles.label}>Business Type</Text>
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={form.business_type}
              onValueChange={(val) => updateForm("business_type", val)}
            >
              <Picker.Item label="Select Type" value="" />
              <Picker.Item label="Owned / Occupier" value="Owned / Occupier" />
              <Picker.Item label="Rent / Tenant" value="Rent / Tenant" />
            </Picker>
          </View>
        </>
      )}

      {form.property_user_type === "individual" && (
        <>
          <Text style={styles.label}>Individual Type</Text>
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={form.individual_type}
              onValueChange={(val) => updateForm("individual_type", val)}
            >
              <Picker.Item label="Select Type" value="" />
              <Picker.Item label="Owned / Occupier" value="Owned / Occupier" />
              <Picker.Item label="Rent / Tenant" value="Rent / Tenant" />
            </Picker>
          </View>
        </>
      )}
    </>
  );

  const renderStep2 = () => (
    <>
      <Text style={styles.stepTitle}>Step 2: Address & Utility Info</Text>
      {renderInput("digital_address", "Digital Address")}
      {renderInput("ghana_card_id", "Ghana Card Number")}
      {renderInput("property_account_number", "Property Rate Account Number")}

      <Text style={styles.label}>Region</Text>
      <View style={styles.pickerWrap}>
        <Picker
          selectedValue={form.region}
          onValueChange={(val) => updateForm("region", val)}
        >
          <Picker.Item label="Select Region" value="" />
          {regions.map((region) => (
            <Picker.Item label={region.name} value={region.name} key={region.id} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>District</Text>
      <View style={styles.pickerWrap}>
        <Picker
          selectedValue={form.district}
          onValueChange={(val) => updateForm("district", val)}
        >
          <Picker.Item label="Select District" value="" />
          {districts.map((district) => (
            <Picker.Item label={district.name} value={district.name} key={district.id} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Type of Premise</Text>
      <View style={styles.pickerWrap}>
        <Picker
          selectedValue={form.type_of_premise}
          onValueChange={(val) => updateForm("type_of_premise", val)}
        >
          <Picker.Item label="Select Premise Type" value="" />
          {[
            "Flat", "Penthouse", "Apartment", "Bungalow", "Townhouse",
            "Duplex", "Hostel", "Studio Apartment"
          ].map((type) => (
            <Picker.Item label={type} value={type} key={type} />
          ))}
        </Picker>
      </View>

      {renderInput("no_of_tv", "Number of TV Sets")}
      {renderInput("ecg_meter_number", "ECG Meter Number")}

      <TouchableOpacity style={styles.button} onPress={takeMeterPhoto}>
        <Text style={styles.buttonText}>
          {form.meter_image ? 'Retake Meter Photo' : 'Take Meter Photo'}
        </Text>
      </TouchableOpacity>

      {form.meter_image !== '' && (
        <Text style={{ marginTop: 6, color: 'green' }}>✅ Meter photo captured</Text>
      )}

      <TouchableOpacity style={styles.button} onPress={pickLocation}>
        <Text style={styles.buttonText}>
          {form.location ? 'Update Location' : 'Use My Location'}
        </Text>
      </TouchableOpacity>

      {form.location && <Text style={{ marginTop: 6, color: 'green' }}>📍 Location set</Text>}

      <Text style={styles.label}>Exemption</Text>
      <View style={styles.pickerWrap}>
        <Picker
          selectedValue={form.exemption}
          onValueChange={(val) => updateForm("exemption", val)}
        >
          <Picker.Item label="Select Exemption" value="" />
          {[
            "None", "Hospitals", "Church", "Diplomatic Missions", "Cemetary",
            "NGO", "Over 70 years", "Students"
          ].map((type) => (
            <Picker.Item label={type} value={type} key={type} />
          ))}
        </Picker>
      </View>
    </>
  );

  const renderStep3 = () => (
    <>
      <Text style={styles.stepTitle}>Step 3: Review & Confirm</Text>

      <View style={styles.reviewCard}>
        <View style={styles.reviewCardHeader}>
          <Text style={styles.reviewCardTitle}>👤 Personal Info</Text>
          <TouchableOpacity onPress={() => transitionToStep(1)}>
            <Text style={styles.editBtn}>Edit</Text>
          </TouchableOpacity>
        </View>
        {[
          ["first_name", "First Name"],
          ["last_name", "Last Name"],
          ["business_name", "Business Name"],
          ["registration_no", "Company Reg. No."],
          ["property_user_type", "Property User Type"],
          ["business_type", "Business Type"],
          ["individual_type", "Individual Type"],
        ].map(([key, label]) => (
          <View key={key} style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>{label}</Text>
            <Text style={styles.reviewValue}>{form[key] || "-"}</Text>
          </View>
        ))}
      </View>

      <View style={styles.reviewCard}>
        <View style={styles.reviewCardHeader}>
          <Text style={styles.reviewCardTitle}>🏠 Address & Utility</Text>
          <TouchableOpacity onPress={() => transitionToStep(2)}>
            <Text style={styles.editBtn}>Edit</Text>
          </TouchableOpacity>
        </View>
        {[
          ["digital_address", "Digital Address"],
          ["ghana_card_id", "Ghana Card Number"],
          ["property_account_number", "Property Rate Account No."],
          ["region", "Region"],
          ["district", "District"],
          ["type_of_premise", "Type of Premise"],
          ["no_of_tv", "Number of TV Sets"],
          ["ecg_meter_number", "ECG Meter Number"],
          ["exemption", "Exemption"],
          ["location", "Location Coordinates"],
        ].map(([key, label]) => (
          <View key={key} style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>{label}</Text>
            <Text style={styles.reviewValue}>{form[key] || "-"}</Text>
          </View>
        ))}
      </View>
    </>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Complete Your Profile</Text>
      <Text style={styles.progress}>Step {step} of 3</Text>

      <View style={styles.stepper}>
        {[1, 2, 3].map((s) => (
          <View
            key={s}
            style={[
              styles.stepDot,
              step === s ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>

      <Animated.View style={{ opacity: fadeAnim }}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </Animated.View>

      <View style={{ marginVertical: 20 }}>
        {step > 1 && <Button title="Back" onPress={() => transitionToStep(step - 1)} />}
        <View style={{ height: 10 }} />
        {step < 3 && <Button title="Next" onPress={() => transitionToStep(step + 1)} />}
        {step === 3 && (
          <>
            <View style={{ height: 10 }} />
            <Button title="Submit Profile" onPress={handleSubmit} />
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9fc',
    flexGrow: 1,
    marginTop: 50
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  progress: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 10,
    color: '#666',
  },
  stepper: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#4e73df',
  },
  inactiveDot: {
    backgroundColor: '#ccc',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#4e73df',
  },
  label: {
    marginTop: 12,
    fontSize: 15,
  },
  input: {
    backgroundColor: '#fff',
    height: 45,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 5,
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  radioGroup: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4e73df',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4e73df',
  },
  button: {
    backgroundColor: '#4e73df',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  reviewRow: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  reviewLabel: {
    fontWeight: 'bold',
    color: '#444',
  },
  reviewValue: {
    color: '#222',
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  reviewCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4e73df',
  },
  editBtn: {
    color: '#4e73df',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

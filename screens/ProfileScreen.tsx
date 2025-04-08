import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, Alert,
  ScrollView, TouchableOpacity, Image, ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { Picker } from '@react-native-picker/picker';
import { getProfile, updateProfile, logoutUser, getDistrictList } from '../api/api';

export default function ProfileScreen({ navigation }: any) {
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    district_id: '',
    photo: '',
  });
  const [districts, setDistricts] = useState<any[]>([]);
  const [photoPreview, setPhotoPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await getProfile();
      console.log('📦 Profile data:', res);
  
      const profileData = res?.profile;
  
      setProfile({
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        phone: res?.user?.phone || '',
        district_id: profileData.district || '',
        photo: '',
      });
  
      setPhotoPreview('');
    } catch (e) {
      console.log('❌ Error loading profile:', e);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };
  
  
  

  const handleImagePick = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return Alert.alert('Permission required', 'Allow access to camera roll');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.6,
      base64: true,
    });

    if (!result.canceled) {
      const image = result.assets[0];
      setPhotoPreview(image.uri);
      setProfile({ ...profile, photo: `data:image/jpeg;base64,${image.base64}` });
    }
  };

  const handleSave = async () => {
    if (!profile.first_name || !profile.last_name || !profile.district_id) {
      return Alert.alert('Incomplete', 'Please fill in all required fields');
    }

    try {
      setSaving(true);
      await updateProfile(profile);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (e) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('userPhone');
    logoutUser();
    navigation.replace('Login');
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4e73df" />
        <Text style={{ marginTop: 10 }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>👤 My Profile</Text>

      <View style={styles.card}>
        <TouchableOpacity onPress={handleImagePick}>
          <Image
            source={
              photoPreview
                ? { uri: photoPreview }
                : require('../assets/profile_pic.png')
            }
            style={styles.profilePic}
          />
          <Text style={styles.uploadText}>Tap to change profile picture</Text>
        </TouchableOpacity>

        <Text style={styles.label}>First Name *</Text>
        <TextInput
          style={styles.input}
          value={profile.first_name}
          onChangeText={(text) => setProfile({ ...profile, first_name: text })}
        />

        <Text style={styles.label}>Last Name *</Text>
        <TextInput
          style={styles.input}
          value={profile.last_name}
          onChangeText={(text) => setProfile({ ...profile, last_name: text })}
        />

        <Text style={styles.label}>Phone</Text>
        <TextInput style={styles.input} value={profile.phone} editable={false} />

        <Text style={styles.label}>District</Text>
<View style={[styles.input, { backgroundColor: '#f0f0f0' }]}>
  <Text style={{ color: '#555' }}>{profile.district_id}</Text>
</View>

        <TouchableOpacity
          style={[styles.saveBtn, saving && { backgroundColor: '#ccc' }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>{saving ? 'Saving...' : '💾 Save Changes'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
        <Text style={styles.logoutText}>🚪 Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f8f9fc', flexGrow: 1 , marginTop:50},
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
  },
  label: { fontSize: 14, marginTop: 10, color: '#444' },
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  pickerWrapper: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0', // light gray to indicate it's disabled
  },
  
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 10,
    backgroundColor: '#eee',
  },
  uploadText: {
    textAlign: 'center',
    color: '#4e73df',
    marginBottom: 20,
  },
  saveBtn: {
    backgroundColor: '#4e73df',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 10,
  },
  saveBtnText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutBtn: {
    marginTop: 30,
    padding: 12,
    backgroundColor: '#f8d7da',
    borderRadius: 8,
  },
  logoutText: {
    color: '#721c24',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

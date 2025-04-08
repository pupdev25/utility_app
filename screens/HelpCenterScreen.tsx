import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';

export default function HelpCenterScreen() {
  const [type, setType] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!type || !message) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      // Make your API call here (e.g., POST to /submit-complaint)
      Alert.alert('✅ Submitted', 'Your request has been sent!');
      setType('');
      setMessage('');
    } catch (e) {
      Alert.alert('Error', 'Failed to send your request. Try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Help Center</Text>

      <Text style={styles.label}>Type of Request</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Complaint, Enquiry"
        value={type}
        onChangeText={setType}
      />

      <Text style={styles.label}>Message</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Describe your issue or request..."
        value={message}
        onChangeText={setMessage}
        multiline
      />

      <View style={{ marginTop: 20 }}>
        <Button title="Submit" onPress={handleSubmit} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f8f9fc', flexGrow: 1 , marginTop:50},
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 16, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 15,
  },
});

import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function OnboardingScreen({ navigation }) {
  const { token, updateOnboarding } = useAuth();
  
  const [role, setRole] = useState('retailer');
  const [companyName, setCompanyName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Morbi');
  const [state, setState] = useState('Gujarat');
  const [pincode, setPincode] = useState('');
  
  const [gstNumber, setGstNumber] = useState('');
  const [mappedTraderCode, setMappedTraderCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!companyName || !ownerName || !phone || !street || !city || !state || !pincode) {
      Alert.alert('Error', 'Please fill in all general profile fields');
      return;
    }

    if (role === 'trader' && !gstNumber) {
      Alert.alert('Error', 'GST Number is required for Traders');
      return;
    }

    if (role === 'retailer' && !mappedTraderCode) {
      Alert.alert('Error', 'Trader Code is required for Retailers');
      return;
    }

    setLoading(false);
    const payload = {
      role,
      companyName,
      ownerName,
      phone,
      street,
      city,
      state,
      pincode,
      ...(role === 'trader' ? { gstNumber } : { mappedTraderCode }),
    };

    setLoading(true);
    try {
      const response = await fetch('http://10.0.2.2:5000/api/auth/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.status === 'success') {
        updateOnboarding(data.user.role, data.user.status);
        Alert.alert('Success', 'Profile completed successfully!', [
          { text: 'OK', onPress: () => navigation.navigate('HomeTabs') },
        ]);
      } else {
        Alert.alert('Error', data.message || 'Onboarding failed');
      }
    } catch (error) {
      // Bypassing try block for simulator default localhost mapping
      try {
        const response = await fetch('http://localhost:5000/api/auth/onboarding', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (data.status === 'success') {
          updateOnboarding(data.user.role, data.user.status);
          Alert.alert('Success', 'Profile completed successfully!', [
            { text: 'OK', onPress: () => navigation.navigate('HomeTabs') },
          ]);
        } else {
          Alert.alert('Error', data.message || 'Onboarding failed');
        }
      } catch (err) {
        Alert.alert('Connection Error', 'Failed to submit onboarding details to server.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Complete Partner Profile</Text>
      <Text style={styles.subtitle}>Enter your business profile details</Text>

      {/* Role Picker */}
      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[styles.roleBox, role === 'retailer' && styles.roleBoxActive]}
          onPress={() => setRole('retailer')}
        >
          <Text style={[styles.roleTitle, role === 'retailer' && styles.roleTextActive]}>Retailer</Text>
          <Text style={styles.roleDesc}>Inquiries Cart Access</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleBox, role === 'trader' && styles.roleBoxActive]}
          onPress={() => setRole('trader')}
        >
          <Text style={[styles.roleTitle, role === 'trader' && styles.roleTextActive]}>Trader</Text>
          <Text style={styles.roleDesc}>Distributor Network Access</Text>
        </TouchableOpacity>
      </View>

      {/* Form Fields */}
      <Text style={styles.label}>Company / Shop Name</Text>
      <TextInput
        value={companyName}
        onChangeText={setCompanyName}
        placeholder="Morbi Ceramic Gallery"
        placeholderTextColor="#64748b"
        style={styles.input}
      />

      <Text style={styles.label}>Owner Full Name</Text>
      <TextInput
        value={ownerName}
        onChangeText={setOwnerName}
        placeholder="Dipak Patel"
        placeholderTextColor="#64748b"
        style={styles.input}
      />

      <Text style={styles.label}>Contact Phone</Text>
      <TextInput
        value={phone}
        onChangeText={setPhone}
        placeholder="+91 98765 43210"
        placeholderTextColor="#64748b"
        keyboardType="phone-pad"
        style={styles.input}
      />

      {/* Address */}
      <View style={styles.divider} />
      <Text style={styles.sectionHeader}>Business Address</Text>

      <Text style={styles.label}>Street Address</Text>
      <TextInput
        value={street}
        onChangeText={setStreet}
        placeholder="GIDC Industrial Area"
        placeholderTextColor="#64748b"
        style={styles.input}
      />

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>City</Text>
          <TextInput value={city} onChangeText={setCity} style={styles.input} />
        </View>
        <View style={{ flex: 1, marginHorizontal: 8 }}>
          <Text style={styles.label}>State</Text>
          <TextInput value={state} onChangeText={setState} style={styles.input} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Pincode</Text>
          <TextInput
            value={pincode}
            onChangeText={setPincode}
            placeholder="363641"
            placeholderTextColor="#64748b"
            keyboardType="number-pad"
            style={styles.input}
          />
        </View>
      </View>

      <View style={styles.divider} />

      {/* Dynamic Fields */}
      {role === 'trader' ? (
        <View>
          <Text style={styles.label}>GSTIN Number (15-chars)</Text>
          <TextInput
            value={gstNumber}
            onChangeText={setGstNumber}
            placeholder="24AAAAP1234A1Z1"
            placeholderTextColor="#64748b"
            autoCapitalize="characters"
            style={styles.input}
          />
        </View>
      ) : (
        <View>
          <Text style={styles.label}>Trader Referral Code</Text>
          <TextInput
            value={mappedTraderCode}
            onChangeText={setMappedTraderCode}
            placeholder="TRD-1001"
            placeholderTextColor="#64748b"
            autoCapitalize="characters"
            style={styles.input}
          />
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#06b6d4" style={{ marginTop: 20 }} />
      ) : (
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>Complete Onboarding</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080d1a',
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 20,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 24,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  roleBox: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: '#0f172a',
  },
  roleBoxActive: {
    borderColor: '#06b6d4',
    backgroundColor: 'rgba(6, 182, 212, 0.05)',
  },
  roleTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#94a3b8',
    marginBottom: 2,
  },
  roleTextActive: {
    color: '#06b6d4',
  },
  roleDesc: {
    fontSize: 10,
    color: '#64748b',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94a3b8',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    padding: 12,
    color: '#ffffff',
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 20,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  submitBtn: {
    backgroundColor: '#06b6d4',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});

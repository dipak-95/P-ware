import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleMockLogin = async (roleType, email, name) => {
    setLoading(true);
    try {
      // Connects to local backend (using 10.0.2.2 for Android emulator default localhost mapping)
      const response = await fetch('http://10.0.2.2:5000/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken: `mock_${roleType}_google_token`,
          email,
          name,
        }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        login(data.user, data.token);
        if (!data.user.onboardingComplete) {
          navigation.navigate('Onboarding');
        }
      } else {
        Alert.alert('Error', data.message || 'Login failed');
      }
    } catch (error) {
      // Fallback if emulator is not on Android or network fails
      // Attempt localhost
      try {
        const response = await fetch('http://localhost:5000/api/auth/google-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idToken: `mock_${roleType}_google_token`,
            email,
            name,
          }),
        });
        const data = await response.json();
        if (data.status === 'success') {
          login(data.user, data.token);
          if (!data.user.onboardingComplete) {
            navigation.navigate('Onboarding');
          }
        } else {
          Alert.alert('Error', data.message || 'Login failed');
        }
      } catch (err) {
        Alert.alert('Connection Failed', 'Could not connect to the backend server. Make sure the API server is running on port 5000.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.brandContainer}>
        <View style={styles.logoIcon}>
          <Text style={styles.logoLetter}>P</Text>
        </View>
        <Text style={styles.brandName}>P-Ware B2B</Text>
        <Text style={styles.tagline}>Sanitaryware Partner Portal</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#06b6d4" />
      ) : (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.loginBtn, styles.primaryBtn]}
            onPress={() => handleMockLogin('trader', 'trader100@pware.com', 'Rajesh Traders')}
          >
            <Text style={styles.primaryBtnText}>Sign In with Google (Trader)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginBtn, styles.secondaryBtn]}
            onPress={() => handleMockLogin('retailer', 'retailer50@pware.com', 'Sagar Ceramic Shop')}
          >
            <Text style={styles.secondaryBtnText}>Sign In with Google (Retailer)</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.footer}>Morbi Sanitary Products Manufacturing Unit</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080d1a',
    justifyContent: 'center',
    padding: 30,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#06b6d4',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoLetter: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
  },
  brandName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: '#94a3b8',
  },
  buttonContainer: {
    gap: 15,
  },
  loginBtn: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtn: {
    backgroundColor: '#06b6d4',
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryBtn: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  secondaryBtnText: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 11,
    color: '#64748b',
  },
});
